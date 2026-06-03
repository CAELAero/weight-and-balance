import { AircraftConfiguration, BallastBlockCapacity } from "../configuration/aircraft-configuration";
import { UndercarriageConfiguration } from "../configuration/types";

import { WeightAndBalanceDatum } from "../datum/datum";
import { WeightAndBalanceMeasurement } from "./measurements";
import {
    FittedBallastBlock,
    WeightAndBalanceBallastAmount,
    WeightAndBalanceCockpitBallast,
    WingBallastCompensation,
} from "./result-types";

export interface WeightAndBalanceOptions {
    /** If true, use the GFA 5% after GC Limit safety option. By default this is ignored and the true aft limit is used */
    useGFAMinBuffer?: boolean;

    /**
     * Minimum different allowed between min and max pilot weights before the system refuses to give
     * an answer. Typically this is used in 2 seater configuration where the P2 will want to have a
     * reasonable range. By default, this is 10.
     */
    minAllowedWeightDifference?: number;

    /**
     * Increments in pilot weight to calculate the weight charts. Used for two seater P2 weights
     * based on P1 weight increment, and anywhere tail ballast could be used to adjust CG. By default
     * uses increments of 10.
     */
    placardCockpitWeightIncremments?: number;

    /**
     * Increments in the water ballast placards for the wing ballast amounts. By default uses
     * increments of 20.
     */
    placardWingBallastWeightIncrememnts?: number;

    /**
     * If the datum has a min and max range for the P1 arm, then this can be used to select a percentage
     * of that arm difference as the calculated option. If there is no range provided, this option is
     * ignored. If this option is not provided, and there is a range specified, then it will use a
     * conservative option of lightest weight at the smallest arm, and heaviest weight at the longest
     * arm. This will result in min and max pilot weights that are probably well within what could actually
     * be flown.
     *
     * Percentage should be a number between 0 and 100. Anything else will result in an error.
     */
    p1ArmRangePercentage?: number;

    /**
     * If there are more than one wingspan option in the aircraft configuration, use this index in the
     * list. If not provided, calculation will default to index zero.
     */
    wingspanSelected?: number;

    /**
     * if the aircraft can have a tail battery fitted, do we assume the weighing data provided has the
     * battery fitted, or do we assume it is not fitted. This influences the variation output that is
     * generated, and thus placarding. If not provided, assumes the battery is fitted by default (true).
     */
    defaultWithBatteryFitted?: boolean;
}

/**
 * Internal data transfer object to help calcuations.
 */
interface FuelMoments {
    fuselageWeight: number;
    fuselageMoment: number;
    wingWeight: number;
    wingMoment: number;
}

export interface BaseCGData {
    maxFuselageLoad: number;
    /** Minimum pilot weight assuming no ballast blocks are fitted */
    minPilotWeight: number;

    /** Maximum pilot weight, not including baggage weights */
    maxPilotWeight: number;

    /**
     * If the calculation used the min-max method for a P1 arm, this will be set to true. If so,
     * then pilot1ArmUsed will reference the arm length closest to the datum.
     */
    pilotArmMinMaxUsed: boolean;

    /**
     * The selected arm distance used for P1 calculation. This can vary if a range is defined in
     * aircraft datum, and the user has selected a percentage range.
     */
    pilot1ArmUsed: number;
}

export function calculateG1(config: AircraftConfiguration, measurements: WeightAndBalanceMeasurement): number {
    let retval: number = NaN;

    switch (config.undercarriageType) {
        case UndercarriageConfiguration.INLINE:
            retval = measurements.undercarriage1Weight;
            break;

        case UndercarriageConfiguration.TRIKE_NOSEWHEEL:
            retval = measurements.undercarriage1Weight;
            break;

        case UndercarriageConfiguration.TRIKE_TAILDRAGGER:
            retval = measurements.undercarriage1Weight + measurements.undercarriage2Weight;
            break;

        default:
            // Technically can't happen if coding in TS since we don't allow for optional null values.
            // However compiled JS can provide a null here, so this is just safety and logging that it happened
            console.log("Invalid aircraft configuration provided to calculate G1");
    }

    return retval;
}

export function calculateG2(config: AircraftConfiguration, measurements: WeightAndBalanceMeasurement): number {
    let retval: number = NaN;

    switch (config.undercarriageType) {
        case UndercarriageConfiguration.INLINE:
            retval = measurements.undercarriage2Weight;
            break;

        case UndercarriageConfiguration.TRIKE_NOSEWHEEL:
            retval = measurements.undercarriage2Weight + measurements.undercarriage3Weight;
            break;

        case UndercarriageConfiguration.TRIKE_TAILDRAGGER:
            retval = measurements.undercarriage3Weight;
            break;

        default:
            // Technically can't happen if coding in TS since we don't allow for optional null values.
            // However compiled JS can provide a null here, so this is just safety and logging that it happened
            console.log("Invalid aircraft configuration provided to calculate G2");
    }

    return retval;
}

/**
 * Calculate the total weight of the wings, based on how many panels are defined. It is tolerant of the measurements
 * and measurer being lazy, for example where there's a 2 piece wing, but the weighing has a total value in just one
 * entry for that side.
 *
 * @param config Configuration of this aircraft of this type certificate
 * @param measurements Values as measured on this instance of the aircraft
 * @param calculatePrimary When the aircraft has multiple wingspans, should this calculate based
 * @returns The total weight of the wings summed based on the configuration and/or primary length.
 */
export function calculateWingWeights(config: AircraftConfiguration, measurements: WeightAndBalanceMeasurement): number {
    // always start with left wing. We store data here even if it's a one-piece wing like many old vintage gliders;

    let weight = 0;
    switch (config.wingPanelCount) {
        case 1:
            weight = measurements.wing1Weight;
            break;
        case 2:
            weight = measurements.wing1Weight + measurements.wing2Weight;
            break;

        case 3:
            weight = measurements.wing1Weight + measurements.wing2Weight + measurements.wing3Weight;
            break;

        case 4:
            weight = measurements.wing1Weight + measurements.wing2Weight;
            weight += (measurements.wing3Weight || 0) + (measurements.wing4Weight || 0);
            break;

        case 6:
            weight =
                measurements.wing1Weight +
                measurements.wing2Weight +
                (measurements.wing3Weight || 0) +
                (measurements.wing4Weight || 0) +
                (measurements.wing5Weight || 0) +
                (measurements.wing6Weight || 0);
            break;

        default:
            console.error("Unsupported wing panel count number, returning 0 weight: " + config.wingPanelCount);
    }

    return weight;
}

/**
 * Raw single pilot calculation. Uses CG calculations only. Does not include aircraft
 * certification limits for min and max seat weigth.
 */
export function calculateBaseCGLimits(
    datum: WeightAndBalanceDatum,
    ge: number,
    xe: number,
    xaft: number,
    nlpWeight: number,
    p1ArmRangePercentage?: number,
): BaseCGData {
    let min_arm = datum.pilot1Arm;
    let max_arm = datum.pilot1Arm;

    // Do we have a range specified? If so, work out what set of options are applied
    if (datum.pilot1ArmMax) {
        if (p1ArmRangePercentage) {
            let arm_range = datum.pilot1ArmMax - datum.pilot1Arm;
            arm_range *= convertP1ArmPercentage(p1ArmRangePercentage);
            min_arm += arm_range;
            max_arm = min_arm;
        } else {
            max_arm = datum.pilot1ArmMax;
        }
    }

    const min_weight = (ge * (xe - xaft)) / (xaft - min_arm);

    const max_auw = datum.maxAllUpWeight - ge;
    const max_dry = datum.maxDryWeight - ge;
    const max_nlp = datum.maxNonLiftingPartsWeight - nlpWeight;
    const max_cg = (ge * (xe - datum.forwardCGLimit)) / (datum.forwardCGLimit - max_arm);

    //console.log(`Min weight ${min_weight}`);
    //console.log(`P1 auw: ${max_auw}\nP1 Dry: ${max_dry}\n P1 NLP: ${max_nlp}\nP1 CG: ${max_cg}`);
    const max_weight = Math.min(max_auw, max_dry, max_nlp, max_cg);

    const retval: BaseCGData = {
        minPilotWeight: min_weight,
        maxPilotWeight: max_weight,
        maxFuselageLoad: Math.floor(Math.min(max_auw, max_dry, max_nlp)),
        pilotArmMinMaxUsed: !p1ArmRangePercentage,
        pilot1ArmUsed: min_arm,
    };

    return retval;
}

function calculateFuelMoment(
    datum: WeightAndBalanceDatum,
    config: AircraftConfiguration,
    options: WeightAndBalanceOptions,
): FuelMoments {
    let total_moment = 0;
    let total_weight = 0;

    let total = datum.fuselageFuelArms?.length || 0;

    for (let i = 0; i < total; i++) {
        total_moment += datum.fuselageFuelArms[i] * config.fuselageFuelAmount[i];
        total_weight += config.fuselageFuelAmount[i];
    }

    let wing_moment = 0;
    let wing_weight = 0;

    if (datum.wingFuelArm) {
        wing_moment = datum.wingFuelArm * (config.wingspanOptions[options.wingspanSelected].fuelAmount || 0);
        wing_weight = config.wingspanOptions[options.wingspanSelected].fuelAmount || 0;
    }

    const retval: FuelMoments = {
        fuselageMoment: total_moment,
        fuselageWeight: total_weight,
        wingMoment: wing_moment,
        wingWeight: wing_weight,
    };

    return retval;
}

/**
 * Builds the table for the water ballast setup. This calculates both wing ballast amount
 * and tail ballast to compensate using the datum.tailBallastCompensationArm values.
 * It does not use the CG values.
 */
export function calculateWingWaterBallast(
    datum: WeightAndBalanceDatum,
    minPilotWeight: number,
    maxPilotWeight: number,
    emptyWeight: number,
    maxWingBallastAmount: number,
    options: WeightAndBalanceOptions,
): WeightAndBalanceBallastAmount[] {
    let pilot_weight = Math.ceil(minPilotWeight);

    // calculate it for every pilot weight at 5kg intervals.
    let ballast_amount = Math.min(datum.maxAllUpWeight - pilot_weight - emptyWeight, maxWingBallastAmount);

    const weight_chart: WeightAndBalanceBallastAmount[] = [
        {
            pilotWeight: pilot_weight,
            maxWingBallast: ballast_amount,
        },
    ];

    pilot_weight =
        pilot_weight -
        (pilot_weight % options.placardCockpitWeightIncremments) +
        options.placardCockpitWeightIncremments;

    do {
        ballast_amount = Math.min(datum.maxAllUpWeight - pilot_weight - emptyWeight, maxWingBallastAmount);
        ballast_amount = Math.floor(ballast_amount);

        weight_chart.push({ pilotWeight: pilot_weight, maxWingBallast: ballast_amount });

        pilot_weight += options.placardCockpitWeightIncremments || 10;
    } while (pilot_weight <= maxPilotWeight);

    // If we bounce over the maxPilotWeight, make up for that here to put it on the exact limit
    if (pilot_weight > maxPilotWeight) {
        const max_pilot = Math.floor(maxPilotWeight);
        ballast_amount = Math.min(datum.maxAllUpWeight - max_pilot - emptyWeight, maxWingBallastAmount);
        ballast_amount = Math.floor(ballast_amount);

        weight_chart.push({ pilotWeight: max_pilot, maxWingBallast: ballast_amount });
    }

    // Now come back and calculate the tail ballast amounts for each of the entries

    //console.log("Weight chart: " + JSON.stringify(weight_chart, null, 2));

    return weight_chart;
}

/**
 * For a given wing ballast amount, calculate the amount of tail ballast that would result in a zero
 * offset to the CG.
 *
 * @param datum
 * @param maxTailBallastAmount
 * @param maxWingBallastAmount
 * @param options
 */
export function calculateTailWingCompensationBallast(
    datum: WeightAndBalanceDatum,
    maxWingBallastAmount?: number,
    maxTailBallastAmount?: number,
    options?: WeightAndBalanceOptions,
): WingBallastCompensation[] {
    if (!datum.wingBallastArm) {
        console.log("Missing wing ballast arm to calculate tail ballast");
        return undefined;
    }

    if (!datum.tailWingBallastCompensationArm) {
        console.log("Missing tail ballast arm to calculate tail ballast");
        return undefined;
    }

    if (!maxTailBallastAmount) {
        console.log("Missing max tail ballast amount");
        return undefined;
    }

    if (!maxWingBallastAmount) {
        console.log("Missing max wing ballast amount");
        return undefined;
    }

    const ballast_inc = options?.placardWingBallastWeightIncrememnts || 20;

    const retval: WingBallastCompensation[] = [];

    let wing_ballast = ballast_inc;
    do {
        let tail_ballast = (datum.wingBallastArm * wing_ballast) / datum.tailWingBallastCompensationArm;

        // if we have run out of tail ballast volume, then cap it. Only impact will be the CG moving
        // forward due to missing compensation.
        if (tail_ballast > maxTailBallastAmount) {
            tail_ballast = maxTailBallastAmount;
        }

        // Hacky way of rounding the numbers.
        retval.push({ wingBallastAmount: wing_ballast, tailBallastAmount: parseFloat(tail_ballast.toPrecision(2)) });

        wing_ballast += ballast_inc;
    } while (wing_ballast <= maxWingBallastAmount);

    return retval;
}

export function calculateCockpitBallast(
    datum: WeightAndBalanceDatum,
    emptyWeight: number,
    emptyCGArm: number,
    xaft: number,
    p1ArmUsed: number,
    blocks: BallastBlockCapacity[],
): WeightAndBalanceCockpitBallast[] {
    if (!datum.cockpitBallastBlockArms) {
        console.error("No ballast block arms defined");
        return undefined;
    }

    if (datum.cockpitBallastBlockArms.length != blocks.length) {
        console.error(
            `Number of cockpit ballast arms ${datum.cockpitBallastBlockArms.length} does not equal the number of block definitions ${blocks.length}`,
        );
        return undefined;
    }

    const weight_chart: WeightAndBalanceCockpitBallast[] = [];

    //console.log("Calc: " + emptyWeight + " " + emptyCGArm + " " + xaft + " " + blockWeight + " " + p1ArmUsed);
    // Iterate over the combinations.So far this can be a linear set of all blocks in group 1, followed by
    // all blocks in group 2 etc, since the various maintenance manuals for aircraft like this say that's
    // how they should be installed. Examples of these aircraft are Arcus, DG500 and DuoDiscus. Complext blocks
    // setup of the DG1000 does not get used for the cockbit ballast, so we don't have to worry about the big
    // + small block combos.
    let base_weight = 0;
    let cumulative_block_count = 0;

    for (let j = 0; j < datum.cockpitBallastBlockArms.length; j++) {
        for (let i = 1; i <= blocks[j].maxBlockCount; i++) {
            cumulative_block_count++;

            const p1_min =
                (emptyWeight * (emptyCGArm - xaft) -
                    (base_weight + i * blocks[j].weightPerBlock) * (xaft - datum.cockpitBallastBlockArms[0])) /
                (xaft - p1ArmUsed);

            weight_chart.push({ blockCount: cumulative_block_count, minPilotWeight: Math.ceil(p1_min) });
        }

        base_weight += blocks[j].maxBlockCount * blocks[j].weightPerBlock;
    }

    //console.log("Weight chart: " + JSON.stringify(weight_chart, null, 2));

    return weight_chart;
}

/**
 * Internal function for calculating the combinations of ballast blocks. Exported so that we can
 * separately test it's functionality. This is not particularly optimal. We don't expect there
 * to be a lot of combinations, so brute forcing it is ok.
 */
export function calculateBlockCombos(blocks: BallastBlockCapacity[]): FittedBallastBlock[][] {
    // sort the array in place, sorted largest to smallest
    blocks.sort((a, b) => b.weightPerBlock - a.weightPerBlock);

    const weight_to_blocks: Map<number, FittedBallastBlock[]> = new Map();

    for (let i = 0; i < blocks.length; i++) {
        for (let j = 1; j <= blocks[i].maxBlockCount; j++) {
            const base_weight = blocks[i].weightPerBlock * j;

            const item = weight_to_blocks.get(base_weight);

            if (!item) {
                const b: FittedBallastBlock = {
                    label: blocks[i].label,
                    weightPerBlock: blocks[i].weightPerBlock,
                    blockCount: j,
                };
                weight_to_blocks.set(base_weight, [b]);
            } else {
                // only update the entry if the total block count is lower with the
                // new combo.
                let total_blocks = 0;
                item.forEach((b) => {
                    total_blocks += b.blockCount;
                });

                if (total_blocks > j) {
                    const b: FittedBallastBlock = {
                        label: blocks[i].label,
                        weightPerBlock: blocks[i].weightPerBlock,
                        blockCount: j,
                    };
                    weight_to_blocks.set(base_weight, [b]);
                }
            }

            // now add in the base weights.
            for (let k = i + 1; k < blocks.length; k++) {
                for (let l = 1; l <= blocks[k].maxBlockCount; l++) {
                    const combo_weight = base_weight + blocks[k].weightPerBlock * l;

                    const item = weight_to_blocks.get(combo_weight);

                    if (!item) {
                        const b1: FittedBallastBlock = {
                            label: blocks[i].label,
                            weightPerBlock: blocks[i].weightPerBlock,
                            blockCount: j,
                        };
                        const b2: FittedBallastBlock = {
                            label: blocks[k].label,
                            weightPerBlock: blocks[k].weightPerBlock,
                            blockCount: l,
                        };

                        weight_to_blocks.set(combo_weight, [b1, b2]);
                    } else {
                        // only update the entry if the total block count is lower with the
                        // new combo.
                        let total_blocks = 0;
                        item.forEach((b) => {
                            total_blocks += b.blockCount;
                        });

                        if (total_blocks > j + l) {
                            const b1: FittedBallastBlock = {
                                label: blocks[i].label,
                                weightPerBlock: blocks[i].weightPerBlock,
                                blockCount: j,
                            };
                            const b2: FittedBallastBlock = {
                                label: blocks[k].label,
                                weightPerBlock: blocks[k].weightPerBlock,
                                blockCount: l,
                            };

                            weight_to_blocks.set(combo_weight, [b1, b2]);
                        }
                    }
                }
            }
        }
    }

    // Now we have the completed map of weights to block combo, dump it into the
    // final output double array. First need to sort based on weight - lowest to
    // highest.
    const sorted = [...weight_to_blocks.keys()].sort((a, b) => a - b);

    const retval: FittedBallastBlock[][] = [];

    sorted.forEach((key) => {
        retval.push(weight_to_blocks.get(key));
    });

    return retval;
}

export function calculateMaxWingBallast(config: AircraftConfiguration, options: WeightAndBalanceOptions): number {
    let retval = 0;

    if (config.wingspanOptions.length > 1 && options.wingspanSelected) {
        retval = config.wingspanOptions[options.wingspanSelected]?.maxBallastAmount;
    } else {
        retval = config.wingspanOptions[0].maxBallastAmount;
    }

    return retval;
}

export function convertP1ArmPercentage(value: number): number {
    if (value < 0) {
        throw new Error("P1 Arm percentage cannot be less than zero");
    }

    if (value > 100) {
        throw new Error("P1 Arm percentage cannot be greater than one hundred");
    }

    // Just in case they use fractional numbers to represent a percentage, rather
    // than whole numbers
    return value > 1 ? value / 100 : value;
}
