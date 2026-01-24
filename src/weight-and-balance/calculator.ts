import {
    AircraftConfiguration,
    BallastBlockCapacity,
    SeatingConfiguration,
    TailBallastType,
    UndercarriageConfiguration,
} from "../configuration/aircraft-configuration";

import { WeightAndBalanceDatum } from "../datum/datum";
import { WeightAndBalanceMeasurement, WeightAndBalanceComponentChange } from "./measurements";
import {
    FittedBallastBlock,
    SingleSeaterWeightAndBalanceResult,
    TwoSeaterPilotWeightTailBallastAdjustment,
    TwoSeaterWeightAndBalanceResult,
    TwoSeatWeightRange,
    WeightAndBalanceBallastAmount,
    WeightAndBalanceCockpitBallast,
    WeightAndBalanceResult,
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
    placardWeightIncremments?: number;

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
}

const DEFAULT_OPTIONS: WeightAndBalanceOptions = {
    useGFAMinBuffer: false,
    minAllowedWeightDifference: 10,
    placardWeightIncremments: 10,

    // p1ArmRangePercentage: Do not set this to allow for the conservative calculation basis if a range is provided.
};

/**
 * From a pre-calculated empty weight, arm and Non-Lifting Parts weight, create the W&B
 * table that would be used for placards.
 *
 * @param datum Datum details for the requested type certificate
 * @param config Configuration of this aircraft of this type certificate
 * @param aircraftArm Xe - The arm for the empty aircraft
 * @param aircraftEmptyWeight Ge - The total weight of the empty aircraft
 * @param nonLiftingPartsWeight The measured weight of all non-lifting parts of the aircraft
 * @param options A list of options for calculating the weight and balance results
 * @returns A full calculated list of weight and balance placard details, if the input
 *    measurements permit a safe aircraft to fly.
 */
export function generateWeightAndBalancePlacardData(
    datum: WeightAndBalanceDatum,
    config: AircraftConfiguration,
    aircraftEmptyWeight: number,
    aircraftArm: number,
    nonLiftingPartsWeight: number,
    options?: WeightAndBalanceOptions,
): WeightAndBalanceResult {
    const real_options = { ...DEFAULT_OPTIONS, ...options };

    const xsafe_aft = datum.aftCGLimit - 0.05 * (datum.aftCGLimit - datum.forwardCGLimit);
    const xaft = real_options.useGFAMinBuffer ? xsafe_aft : datum.aftCGLimit;

    let retval: WeightAndBalanceResult = null;

    if (config.seatingType == SeatingConfiguration.TANDEM) {
        retval = calculateTwoSeater(
            datum,
            config,
            aircraftEmptyWeight,
            aircraftArm,
            xaft,
            nonLiftingPartsWeight,
            real_options,
        );
    } else {
        retval = calculateSingleSeater(
            datum,
            config,
            aircraftEmptyWeight,
            aircraftArm,
            xaft,
            nonLiftingPartsWeight,
            real_options,
        );
    }

    return retval;
}

/**
 * Using an existing measurement, and a single component change detail, update the weight and balance of
 * this aircraft. Since the item change values could be undefined in the changes parameter, this can act
 * identically to the {@link generateWeightAndBalancePlacardData} method.
 *
 * @param datum Datum details for the requested type certificate
 * @param config Configuration of this aircraft of this type certificate
 * @param change
 * @param options A list of options for calculating the weight and balance results
 * @returns A full calculated list of weight and balance placard details, if the input
 *    measurements permit a safe aircraft to fly.
 */
export function updateWeightAndBalance(
    datum: WeightAndBalanceDatum,
    config: AircraftConfiguration,
    change: WeightAndBalanceComponentChange,
    options?: WeightAndBalanceOptions,
): WeightAndBalanceResult {
    let ge_new = change.aircraftWeight;
    let xe_new = change.aircraftArm;
    let gwft_new = change.nonLiftingPartsWeight;

    if (change.itemWeightChange) {
        ge_new += change.itemWeightChange;
        gwft_new += (change.weightChangeInFuselage ?? true) ? change.itemWeightChange : 0;

        xe_new = (change.itemWeightChange * change.itemArm + change.aircraftWeight * change.aircraftArm) / ge_new;
    }

    const retval: WeightAndBalanceResult = generateWeightAndBalancePlacardData(
        datum,
        config,
        ge_new,
        xe_new,
        gwft_new,
        options,
    );

    return retval;
}

/**
 * Entry point function to calculate the weight and balance details about the aircraft and
 * generate a placard.
 *
 * @param datum Datum details for the requested type certificate
 * @param config Configuration of this aircraft of this type certificate
 * @param measurements Values as measured on this instance of the aircraft
 * @param options A list of options for calculating the weight and balance results
 * @returns A full calculated list of weight and balance placard details, if the input
 *    measurements permit a safe aircraft to fly.
 */
export function calculateWeightAndBalance(
    datum: WeightAndBalanceDatum,
    config: AircraftConfiguration,
    measurements: WeightAndBalanceMeasurement,
    options?: WeightAndBalanceOptions,
): WeightAndBalanceResult {
    //console.log("datum:\n" + JSON.stringify(datum, null, 2) );
    //console.log("config:\n" + JSON.stringify(config, null, 2) );
    //console.log("measurements:\n" + JSON.stringify(measurements, null, 2) );
    const real_options = { ...DEFAULT_OPTIONS, ...options };

    // The variable names here correspond to those in the GFA PDF calculator, rather than being normal
    // english readable versions. This helps with double-checking against hand calculations.
    const g1 = calculateG1(config, measurements);
    const g2 = calculateG2(config, measurements);
    const g_wing = calculateWingWeights(config, measurements);

    // Total empty weight
    const ge = g1 + g2;

    // Weight of non-lifting parts.
    const gwft = ge - g_wing;

    // empty cg = ((g2 * b) / ge) + a;
    const xe = (g2 * datum.distanceFrontWheelToRearWheel) / ge + datum.distanceFrontWheelToDatum;

    //console.log(`G1: ${g1}\nG2: ${g2}\nWings: ${g_wing}\nGe: ${ge}\nX: ${xe}\nGwft: ${gwft}`);

    // checksums:
    const checksum1 =
        g1 * datum.distanceFrontWheelToDatum +
        g2 * (datum.distanceFrontWheelToDatum + datum.distanceFrontWheelToRearWheel);
    const checksum2 = ge * xe;

    if (checksum1 - checksum2 > 0.2) {
        console.error(`Checksums of weight and balance don't agree. ${checksum1} vs ${checksum2}`);
        return null;
    }

    const retval: WeightAndBalanceResult = generateWeightAndBalancePlacardData(datum, config, ge, xe, gwft, options);

    return retval;
}

function calculateG1(config: AircraftConfiguration, measurements: WeightAndBalanceMeasurement): number {
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
            console.log("Invalid aircraft configuration provided to calculate G1");
    }

    return retval;
}

function calculateG2(config: AircraftConfiguration, measurements: WeightAndBalanceMeasurement): number {
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
function calculateWingWeights( config: AircraftConfiguration, measurements: WeightAndBalanceMeasurement ): number {
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
function calculateBaseCGLimits(
    datum: WeightAndBalanceDatum,
    ge: number,
    xe: number,
    xaft: number,
    nlpWeight: number,
    p1ArmRangePercentage?: number,
): SingleSeaterWeightAndBalanceResult {
    let min_arm = datum.pilot1Arm;
    let max_arm = datum.pilot1Arm;

    // Do we have a range specified? If so, work out what set of options are applied
    if (datum.pilot1ArmMax) {
        if (p1ArmRangePercentage) {
            let arm_range = datum.pilot1Arm - datum.pilot1ArmMax;
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

    // console.log(`Min weight ${min_weight}`);
    // console.log(`P1 auw: ${max_auw}\nP1 Dry: ${max_dry}\n P1 NLP: ${max_nlp}\nP1 CG: ${max_cg}`);
    const max_weight = Math.min(max_auw, max_dry, max_nlp, max_cg);

    const retval: SingleSeaterWeightAndBalanceResult = {
        maxAllUpWeight: datum.maxAllUpWeight,
        minPilotWeight: min_weight,
        maxPilotWeight: max_weight,
        emptyCGArm: xe,
        emptyWeight: ge,
        nonLiftingPartsWeight: nlpWeight,
        pilot1ArmUsed: min_arm,
        pilotArmMinMaxUsed: !p1ArmRangePercentage,
        maxFuselageLoad: Math.floor(Math.min(max_auw, max_dry, max_nlp)),
        calculationInputOptions: {
            useGFAMinBuffer: false,
            p1ArmRangePercentage: p1ArmRangePercentage,
        },
    };

    return retval;
}

function calculateSingleSeater(
    datum: WeightAndBalanceDatum,
    config: AircraftConfiguration,
    ge: number,
    xe: number,
    xaft: number,
    nlpWeight: number,
    options: WeightAndBalanceOptions,
): SingleSeaterWeightAndBalanceResult {
    const retval = calculateBaseCGLimits(datum, ge, xe, xaft, nlpWeight, options.p1ArmRangePercentage);

    // clean up the numbers to whole numbers here.
    retval.minPilotWeight = Math.ceil(Math.max(retval.minPilotWeight, datum.minAllowedPilotWeight));
    retval.maxPilotWeight = Math.floor(Math.min(retval.maxPilotWeight, datum.maxSeatWeight));
    retval.emptyCGArm = Math.round(retval.emptyCGArm);

    if ((config.wingMaxBallastAmount || 0) > 0) {
        retval.allowedWingBallast = calculateWaterBallast(
            datum,
            retval.minPilotWeight,
            retval.maxPilotWeight,
            ge,
            config.wingMaxBallastAmount || 0,
            options,
        );
    }

    if (config.cockpitBallastBlockCount > 0) {
        retval.cockpitBallast = calculateCockpitBallast(
            datum,
            ge,
            retval.emptyCGArm,
            xaft,
            retval.pilot1ArmUsed,
            config.cockpitBallastBlockCount,
            config.cockpitBallastWeightPerBlock || 0,
        );
    }

    // Update the options selected here
    retval.calculationInputOptions.useGFAMinBuffer = options.useGFAMinBuffer || false;

    return retval;
}

function calculateTwoSeater(
    datum: WeightAndBalanceDatum,
    config: AircraftConfiguration,
    ge: number,
    xe: number,
    xaft: number,
    nlpWeight: number,
    options: WeightAndBalanceOptions,
): TwoSeaterWeightAndBalanceResult {
    if (!datum.pilot2Arm) {
        console.error("No P2 arm defined. Cannot calculate loading chart");
        return null;
    }

    const base_pilot = calculateBaseCGLimits(datum, ge, xe, xaft, nlpWeight, options.p1ArmRangePercentage);
    const dual_range = calculateTwoSeaterP2(datum, ge, xe, xaft, nlpWeight, options);

    const retval: TwoSeaterWeightAndBalanceResult = {
        maxAllUpWeight: datum.maxAllUpWeight,
        emptyCGArm: Math.round(base_pilot.emptyCGArm),
        emptyWeight: ge,
        nonLiftingPartsWeight: nlpWeight,
        pilot1ArmUsed: base_pilot.pilot1ArmUsed,
        pilotArmMinMaxUsed: base_pilot.pilotArmMinMaxUsed,
        soloMinPilotWeight: Math.ceil(Math.max(base_pilot.minPilotWeight, datum.minAllowedPilotWeight)),
        soloMaxPilotWeight: Math.floor(Math.min(base_pilot.maxPilotWeight, datum.maxSeatWeight)),
        dualPilotWeightRanges: dual_range,
        maxFuselageLoad: Math.floor(base_pilot.maxFuselageLoad),
        calculationInputOptions: {
            useGFAMinBuffer: options.useGFAMinBuffer,
            p1ArmRangePercentage: options.p1ArmRangePercentage,
        },
    };

    if (dual_range.length == 0) {
        console.log("Zero range for " + ge + " xe " + xe);
    }
    if (dual_range.length > 0 && (config.wingMaxBallastAmount || 0) > 0) {
        // Set max pilot weight here to be the sum of both pilots when maxed out
        const last = dual_range.length - 1;
        const total_max_pilot = dual_range[last].maxPilot2Weight + dual_range[last].pilot1Weight;
        retval.allowedWingBallast = calculateWaterBallast(
            datum,
            retval.soloMinPilotWeight,
            total_max_pilot,
            ge,
            config.wingMaxBallastAmount || 0,
            options,
        );
    }

    if (config.cockpitBallastBlockCount > 0) {
        retval.cockpitBallast = calculateCockpitBallast(
            datum,
            ge,
            retval.emptyCGArm,
            xaft,
            base_pilot.pilot1ArmUsed,
            config.cockpitBallastBlockCount,
            config.cockpitBallastWeightPerBlock || 0,
        );
    }

    // If we have tail ballast that can be used for CG adjustment, then recalculate at each of the tail amounts the
    // pilot weight ranges. To do this, just adjust the main weight and CG location, then set up the P1 and P2 values
    // again. NLP Weight also needs to be adjusted by the ballast amount at each step since the tail ballast will be
    // in the fuselage - ie a bit of non-lifting parts weight.

    switch (config.tailCGAdjustBallastType) {
        case TailBallastType.WATER:
            const water_increments: number[] = [];
            let current_water = 1;
            do {
                water_increments.push(current_water);
                current_water += 1;
            } while (current_water < (config.tailCGAdjustBallastCapacity as number));

            water_increments.push(config.tailCGAdjustBallastCapacity as number);

            const water_map = calculateTwoSeaterAdjustedWeights(
                datum,
                ge,
                xe,
                xaft,
                nlpWeight,
                water_increments,
                options,
            );
            if (water_map) {
                retval.tailBallastAdjustedPilotWeights = [...water_map.values()];
            }
            break;

        case TailBallastType.BLOCKS:
            const block_list = calculateBlockCombos(config.tailCGAdjustBallastCapacity as BallastBlockCapacity[]);
            const block_increments: number[] = [];
            const block_map: Map<number, FittedBallastBlock[]> = new Map();

            block_list.forEach((block_combo) => {
                let weight = 0;
                block_combo.forEach((block) => {
                    weight += block.blockCount * block.weightPerBlock;
                });

                block_increments.push(weight);
                block_map.set(weight, block_combo);
            });

            const adjust_map = calculateTwoSeaterAdjustedWeights(
                datum,
                ge,
                xe,
                xaft,
                nlpWeight,
                block_increments,
                options,
            );

            // Need to map this back to block combinations now. The original results come with the ballast
            // amount as the number, so we replace that with the map to block combo
            if (adjust_map) {
                retval.tailBallastAdjustedPilotWeights = [...adjust_map.values()];

                retval.tailBallastAdjustedPilotWeights.forEach((weight) => {
                    const w = weight.ballastAmount as number;
                    weight.ballastAmount = block_map.get(w);
                });
            }

            break;

        case TailBallastType.NONE:
        default:
        // do nothing.
    }

    // Update the options selected here
    retval.calculationInputOptions.useGFAMinBuffer = options.useGFAMinBuffer || false;

    //console.log(JSON.stringify(retval, null, 2));
    return retval;
}

function calculateTwoSeaterAdjustedWeights(
    datum: WeightAndBalanceDatum,
    ge: number,
    xe: number,
    xaft: number,
    nlpWeight: number,
    tailWeights: number[],
    options: WeightAndBalanceOptions,
): Map<number, TwoSeaterPilotWeightTailBallastAdjustment> {
    if (!datum.tailBallastArm) {
        console.log("No tail ballast arm provided, ignoring");
        return null;
    }

    const retval: Map<number, TwoSeaterPilotWeightTailBallastAdjustment> = new Map();
    //console.log("Tail weight list " + JSON.stringify(tailWeights));
    //console.log(`Base values: ge ${ge} Xe ${xe} NLP ${nlpWeight}`);

    tailWeights.forEach((ballast) => {
        const adjusted_ge = ge + ballast;
        const adjusted_xe = (ballast * datum.tailBallastArm + ge * xe) / adjusted_ge;
        const adjusted_nlp_weight = nlpWeight + ballast;

        //console.log(`Adjusted values for ballast ${ballast}: ge ${adjusted_ge} Xe ${adjusted_xe} NLP ${adjusted_nlp_weight}`);
        const base_pilot = calculateBaseCGLimits(
            datum,
            adjusted_ge,
            adjusted_xe,
            xaft,
            adjusted_nlp_weight,
            options.p1ArmRangePercentage,
        );
        const dual_range = calculateTwoSeaterP2(datum, adjusted_ge, adjusted_xe, xaft, adjusted_nlp_weight, options);

        const data: TwoSeaterPilotWeightTailBallastAdjustment = {
            ballastAmount: ballast,
            soloMinPilotWeight: Math.ceil(Math.max(base_pilot.minPilotWeight, datum.minAllowedPilotWeight)),
            soloMaxPilotWeight: Math.floor(Math.min(base_pilot.maxPilotWeight, datum.maxSeatWeight)),
            dualPilotWeightRanges: dual_range,
        };

        retval.set(ballast, data);
    });

    return retval;
}

function calculateWaterBallast(
    datum: WeightAndBalanceDatum,
    minPilotWeight: number,
    maxPilotWeight: number,
    emptyWeight: number,
    maxBallastAmount: number,
    options: WeightAndBalanceOptions,
): WeightAndBalanceBallastAmount[] {
    let pilot_weight = minPilotWeight;

    // calculate it for every pilot weight at 5kg intervals.
    let ballast_amount = Math.min(datum.maxAllUpWeight - pilot_weight - emptyWeight, maxBallastAmount);

    const weight_chart: WeightAndBalanceBallastAmount[] = [
        {
            pilotWeight: pilot_weight,
            maxBallast: ballast_amount,
        },
    ];

    pilot_weight =
        minPilotWeight - (minPilotWeight % options.placardWeightIncremments) + options.placardWeightIncremments;

    do {
        ballast_amount = Math.min(datum.maxAllUpWeight - pilot_weight - emptyWeight, maxBallastAmount);
        ballast_amount = Math.floor(ballast_amount);

        weight_chart.push({ pilotWeight: pilot_weight, maxBallast: ballast_amount });

        pilot_weight += options.placardWeightIncremments;
    } while (pilot_weight <= maxPilotWeight);

    // If we bounce over the maxPilotWeight, make up for that here to put it on the exact limit
    if (pilot_weight > maxPilotWeight) {
        ballast_amount = Math.min(datum.maxAllUpWeight - maxPilotWeight - emptyWeight, maxBallastAmount);
        ballast_amount = Math.floor(ballast_amount);

        weight_chart.push({ pilotWeight: maxPilotWeight, maxBallast: ballast_amount });
    }

    //console.log("Weight chart: " + JSON.stringify(weight_chart, null, 2));

    return weight_chart;
}

function calculateCockpitBallast(
    datum: WeightAndBalanceDatum,
    emptyWeight: number,
    emptyCGArm: number,
    xaft: number,
    p1ArmUsed: number,
    blockCount: number,
    blockWeight: number,
): WeightAndBalanceCockpitBallast[] {
    if (!datum.cockpitBallastBlockArm) {
        console.error("No ballast block arm defined");
        return null;
    }

    if (blockWeight <= 0) {
        console.error("Invalid ballast block weight provided: " + blockWeight);
        return null;
    }

    if (blockCount <= 0) {
        console.error("Invalid number of ballast blocks: " + blockCount);
        return null;
    }

    const weight_chart: WeightAndBalanceCockpitBallast[] = [];

    //console.log("Calc: " + emptyWeight + " " + emptyCGArm + " " + xaft + " " + blockWeight + " " + p1ArmUsed);
    for (let i = 1; i <= blockCount; i++) {
        const p1_min =
            (emptyWeight * (emptyCGArm - xaft) - i * blockWeight * (xaft - datum.cockpitBallastBlockArm)) /
            (xaft - p1ArmUsed);

        weight_chart.push({ blockCount: i, minPilotWeight: Math.ceil(p1_min) });
    }

    //console.log("Weight chart: " + JSON.stringify(weight_chart, null, 2));

    return weight_chart;
}

function calculateTwoSeaterP2(
    datum: WeightAndBalanceDatum,
    ge: number,
    xe: number,
    xaft: number,
    nlpWeight: number,
    options: WeightAndBalanceOptions,
): TwoSeatWeightRange[] {
    const dual_range: TwoSeatWeightRange[] = [];

    // Min seat range is calculated for solo pilot above, but with a sufficiently heavy pilot
    // and the P2 seat in front of the datum we can possibly drop below that. Let's go find it.
    // Start at zero and work our way up until we hit the max seat weight. Ignore any results
    // where P2 min weight is greater than the max seat weight.
    //
    // When the P1 location has a range of arms provided, need to go conservative. If the flag is
    // set to use a percentage of range, use that, otherwise assume the smallest arm value so that
    // we end up with the lightest pilot on the shortest arm.
    let abs_min_p1 = 0;
    let min_arm = datum.pilot1Arm;
    let max_arm = datum.pilot1Arm;

    // Do we have a range specified? If so, work out what set of options are applied
    if (datum.pilot1ArmMax) {
        if (options.p1ArmRangePercentage) {
            let arm_range = datum.pilot1Arm - datum.pilot1ArmMax;
            arm_range *= convertP1ArmPercentage(options.p1ArmRangePercentage);
            min_arm += arm_range;
            max_arm = min_arm;
        } else {
            max_arm = datum.pilot1ArmMax;
        }
    }

    do {
        const p2_min = (ge * (xe - xaft) - abs_min_p1 * (xaft - min_arm)) / (xaft - datum.pilot2Arm);

        // Only bother calculating if the P2 weight is within sane bounds.
        if (p2_min <= datum.maxSeatWeight) {
            const max_auw = datum.maxAllUpWeight - ge - abs_min_p1;
            const max_dry = datum.maxDryWeight - ge - abs_min_p1;
            const max_nlp = datum.maxNonLiftingPartsWeight - nlpWeight - abs_min_p1;
            // Since this is possible to be all the way forward with heavy pilot at the forward seat setting, use the max arm here, not min arm.
            const max_cg =
                (ge * (xe - datum.forwardCGLimit) - abs_min_p1 * (datum.forwardCGLimit - max_arm)) /
                (datum.forwardCGLimit - datum.pilot2Arm);

            const max_weight = Math.min(max_auw, max_dry, max_nlp, max_cg);

            const range: TwoSeatWeightRange = {
                pilot1Weight: abs_min_p1,
                minPilot2Weight: Math.ceil(Math.max(p2_min, 0)),
                maxPilot2Weight: Math.floor(Math.min(max_weight, datum.maxSeatWeight)),
            };

            dual_range.push(range);
        }

        abs_min_p1 += options.placardWeightIncremments;
    } while (abs_min_p1 <= datum.maxSeatWeight);

    return dual_range;
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

function convertP1ArmPercentage(value: number): number {
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
