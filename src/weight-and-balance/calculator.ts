import {
    AircraftConfiguration,
    BallastBlockCapacity,
    SeatingConfiguration,
    TailBallastType,
} from "../configuration/aircraft-configuration";

import { WeightAndBalanceDatum } from "../datum/datum";
import { CertificationCategory } from "../util/certifcation-category";
import { calculateBaseCGLimits, calculateBlockCombos, calculateCockpitBallast, calculateG1, calculateG2, calculateMaxWingBallast, calculateWingWaterBallast, calculateWingWeights, convertP1ArmPercentage, WeightAndBalanceOptions } from "./calculator-common";
import { WeightAndBalanceMeasurement, WeightAndBalanceComponentChange } from "./measurements";
import {
    FittedBallastBlock,
    SingleSeaterPlacardData,
    SingleSeaterWeightAndBalanceResult,
    TwoSeaterPilotWeightTailBallastAdjustment,
    TwoSeaterWeightAndBalanceResult,
    TwoSeatWeightRange,
    WeightAndBalanceResult,
} from "./result-types";

const DEFAULT_OPTIONS: WeightAndBalanceOptions = {
    useGFAMinBuffer: false,
    minAllowedWeightDifference: 10,
    placardCockpitWeightIncremments: 10,
    placardWingBallastWeightIncrememnts: 20,
    wingspanSelected: 0,
    defaultWithBatteryFitted: true,
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
        retval = calculateSingleSeaterResult(
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
 * @param changen Details of what changed
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

function calculateSingleSeaterResult(
    datum: WeightAndBalanceDatum,
    config: AircraftConfiguration,
    ge: number,
    xe: number,
    xaft: number,
    nlpWeight: number,
    options: WeightAndBalanceOptions,
): SingleSeaterWeightAndBalanceResult {
    const base_result = calculateSingleSeaterPlacardDataVariation(datum, config, ge, xe, xaft, nlpWeight, options);

    // clean up the numbers to whole numbers here.
    const retval: SingleSeaterWeightAndBalanceResult = {
        minPilotWeight: Math.ceil(Math.max(base_result.minPilotWeight, datum.minAllowedPilotWeight)),
        maxPilotWeight: Math.floor(Math.min(base_result.maxPilotWeight, datum.maxSeatWeight)),
        emptyCGArm: Math.round(xe),
        emptyWeight: ge,
        category: CertificationCategory.UTILITY,
        wingspan: 0,
        calculationInputOptions: {
            useGFAMinBuffer: false,
            p1ArmRangePercentage: options.p1ArmRangePercentage,
            defaultWithBatteryFitted: options.defaultWithBatteryFitted,
        },
        maxAllUpWeight: datum.maxAllUpWeight,
        nonLiftingPartsWeight: nlpWeight,
        pilotArmMinMaxUsed: false,
        pilot1ArmUsed: 0,
        maxFuselageLoad: base_result.maxFuselageLoad,
        allowedWingBallast: base_result.allowedWingBallast,
        allowedTailBallast: base_result.allowedTailBallast,
        allowedFuelLoad: base_result.allowedFuelLoad,
        cockpitBallast: base_result.cockpitBallast,
    };

    // For now assume simple setup - either we have big batteries in the rear
    // of the fuselage, or we have smaller battery setup in the fin. No evidence
    // yet of aircraft having both at the same time.
    if (datum.tailBatteryArm) {
        // adjust the Xe and Ge and recalculate the core CG requirements.
        const new_weight = options.defaultWithBatteryFitted
            ? ge - config.tailBatteryWeight
            : ge + config.tailBatteryWeight;
        const new_arm = (xe * ge + datum.tailBatteryArm * config.tailBatteryWeight) / new_weight;
        const new_nlp = options.defaultWithBatteryFitted
            ? nlpWeight - config.tailBatteryWeight
            : nlpWeight + config.tailBatteryWeight;

        retval.variations = [
            calculateSingleSeaterPlacardDataVariation(datum, config, new_weight, new_arm, xaft, new_nlp, options),
        ];
        retval.variations[0].label = options.defaultWithBatteryFitted
            ? "Without Tail Battery Fitted"
            : "With Tail Battery Fitted";
    } else if (datum.fuselageBatteryArm) {
        let total_weight = 0;
        let total_moment = 0;
        retval.variations = [];

        for (let i = 0; i < config.fuselageBatteryWeights.length; i++) {
            total_weight += config.fuselageBatteryWeights[i];
            total_moment += datum.fuselageBatteryArm * config.fuselageBatteryWeights[i];

            const new_weight = ge - total_weight;
            const new_arm = (xe * ge + total_moment) / new_weight;
            const new_nlp = nlpWeight - total_weight;

            retval.variations.push(
                calculateSingleSeaterPlacardDataVariation(datum, config, new_weight, new_arm, xaft, new_nlp, options),
            );
            retval.variations[i].label = i > 0 ? `${i + 1} Batteries Removed` : "1 Battery Removed";
        }
    }

    // Update the options selected here
    retval.calculationInputOptions.useGFAMinBuffer = options.useGFAMinBuffer || false;

    return retval;
}

function calculateSingleSeaterPlacardDataVariation(
    datum: WeightAndBalanceDatum,
    config: AircraftConfiguration,
    ge: number,
    xe: number,
    xaft: number,
    nlpWeight: number,
    options: WeightAndBalanceOptions,
): SingleSeaterPlacardData {
    const base_result = calculateBaseCGLimits(datum, ge, xe, xaft, nlpWeight, options.p1ArmRangePercentage);

    // clean up the numbers to whole numbers here.
    const retval: SingleSeaterPlacardData = {
        minPilotWeight: Math.ceil(Math.max(base_result.minPilotWeight, datum.minAllowedPilotWeight)),
        maxPilotWeight: Math.floor(Math.min(base_result.maxPilotWeight, datum.maxSeatWeight)),
        maxFuselageLoad: base_result.maxFuselageLoad,
    };

    const max_wing_ballast = calculateMaxWingBallast(config, options);

    if (max_wing_ballast > 0) {
        retval.allowedWingBallast = calculateWingWaterBallast(
            datum,
            base_result.minPilotWeight,
            base_result.maxPilotWeight,
            ge,
            max_wing_ballast,
            options,
        );
    }

    if (config.cockpitBallast) {
        retval.cockpitBallast = calculateCockpitBallast(
            datum,
            ge,
            xe,
            xaft,
            base_result.pilot1ArmUsed,
            config.cockpitBallast,
        );
    }

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

    const max_cockpit_weight = datum.maxCockpitWeight || datum.maxSeatWeight * 2;

    const base_pilot = calculateBaseCGLimits(datum, ge, xe, xaft, nlpWeight, options.p1ArmRangePercentage);
    const dual_range = calculateTwoSeaterP2(
        datum,
        ge,
        xe,
        xaft,
        nlpWeight,
        base_pilot.minPilotWeight,
        max_cockpit_weight,
        options,
    );

    const retval: TwoSeaterWeightAndBalanceResult = {
        maxAllUpWeight: datum.maxAllUpWeight,
        emptyCGArm: Math.round(xe),
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
        category: CertificationCategory.UTILITY,
        wingspan: 0,
    };

    if (dual_range.length == 0) {
        console.info("Zero range for " + ge + " xe " + xe);
    }

    const max_wing_ballast = calculateMaxWingBallast(config, options);
    if (dual_range.length > 0 && max_wing_ballast > 0) {
        // Set max pilot weight here to be the sum of both pilots when maxed out
        const last = dual_range.length - 1;
        const total_max_pilot = dual_range[last].maxPilot2Weight + dual_range[last].pilot1Weight;
        retval.allowedWingBallast = calculateWingWaterBallast(
            datum,
            retval.soloMinPilotWeight,
            total_max_pilot,
            ge,
            max_wing_ballast,
            options,
        );
    }

    if (config.cockpitBallast) {
        retval.cockpitBallast = calculateCockpitBallast(
            datum,
            ge,
            retval.emptyCGArm,
            xaft,
            base_pilot.pilot1ArmUsed,
            config.cockpitBallast,
        );
    }

    // If we have tail ballast that can be used for CG adjustment, then recalculate at each of the tail amounts the
    // pilot weight ranges. To do this, just adjust the main weight and CG location, then set up the P1 and P2 values
    // again. NLP Weight also needs to be adjusted by the ballast amount at each step since the tail ballast will be
    // in the fuselage - ie a bit of non-lifting parts weight.

    switch (config.tailCGAdjustBallastType) {
        case TailBallastType.WATER:
            // Arm:weight pairs for the complex aircraft.
            const tank_capacities: number[] = config.tailCGAdjustBallastCapacity as number[];
            const water_increments: number[][] = [];
            let total_water = 1;

            for (let i = 0; i < tank_capacities.length; i++) {
                let current_water = 1;
                for (; current_water < tank_capacities[i]; current_water += 1) {
                    water_increments.push([datum.tailCGAdjustBallastArm[i], total_water + current_water]);
                }

                // Since this stops before the final increment, do the final item here since the
                // tanks are often no whole litres.
                water_increments.push([datum.tailCGAdjustBallastArm[i], tank_capacities[i]]);
                total_water += tank_capacities[i];
            }

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
            const block_increments: number[][] = [];
            const block_map: Map<number, FittedBallastBlock[]> = new Map();

            block_list.forEach((block_combo) => {
                let weight = 0;
                block_combo.forEach((block) => {
                    weight += block.blockCount * block.weightPerBlock;
                });

                block_increments.push([datum.tailCGAdjustBallastArm[0], weight]);
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
    tailWeights: number[][],
    options: WeightAndBalanceOptions,
): Map<number, TwoSeaterPilotWeightTailBallastAdjustment> {
    if (!datum.tailCGAdjustBallastArm || datum.tailCGAdjustBallastArm.length == 0) {
        console.log("No tail ballast arm provided, ignoring");
        return null;
    }

    const retval: Map<number, TwoSeaterPilotWeightTailBallastAdjustment> = new Map();
    //console.log("Tail weight list " + JSON.stringify(tailWeights));
    //console.log(`Base values: ge ${ge} Xe ${xe} NLP ${nlpWeight}`);
    const max_cockpit_weight = datum.maxCockpitWeight || datum.maxSeatWeight * 2;

    tailWeights.forEach((ballast_data) => {
        const adjusted_ge = ge + ballast_data[1];
        const adjusted_xe = (ballast_data[1] * ballast_data[0] + ge * xe) / adjusted_ge;
        const adjusted_nlp_weight = nlpWeight + ballast_data[1];

        //console.log(`Adjusted values for ballast ${ballast}: ge ${adjusted_ge} Xe ${adjusted_xe} NLP ${adjusted_nlp_weight}`);
        const base_pilot = calculateBaseCGLimits(
            datum,
            adjusted_ge,
            adjusted_xe,
            xaft,
            adjusted_nlp_weight,
            options.p1ArmRangePercentage,
        );
        const dual_range = calculateTwoSeaterP2(
            datum,
            adjusted_ge,
            adjusted_xe,
            xaft,
            adjusted_nlp_weight,
            base_pilot.minPilotWeight,
            max_cockpit_weight,
            options,
        );

        const data: TwoSeaterPilotWeightTailBallastAdjustment = {
            ballastAmount: ballast_data[1],
            soloMinPilotWeight: Math.ceil(Math.max(base_pilot.minPilotWeight, datum.minAllowedPilotWeight)),
            soloMaxPilotWeight: Math.floor(Math.min(base_pilot.maxPilotWeight, datum.maxSeatWeight)),
            dualPilotWeightRanges: dual_range,
        };

        retval.set(ballast_data[1], data);
    });

    return retval;
}

function calculateTwoSeaterP2(
    datum: WeightAndBalanceDatum,
    ge: number,
    xe: number,
    xaft: number,
    nlpWeight: number,
    minSoloPilotWeight: number,
    maxCockpitWeight: number,
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

    if (xaft >= datum.pilot2Arm) {
        do {
            const p2_min = (ge * (xe - xaft) - abs_min_p1 * (xaft - min_arm)) / (xaft - datum.pilot2Arm);

            // Only bother calculating if the P2 weight is within sane bounds.
            if (p2_min >= 0 && p2_min <= datum.maxSeatWeight) {
                const max_auw = datum.maxAllUpWeight - ge - abs_min_p1;
                const max_dry = datum.maxDryWeight - ge - abs_min_p1;
                const max_nlp = datum.maxNonLiftingPartsWeight - nlpWeight - abs_min_p1;
                // Since this is possible to be all the way forward with heavy pilot at the forward seat setting, use the max arm here, not min arm.
                const max_cg =
                    (ge * (xe - datum.forwardCGLimit) - abs_min_p1 * (datum.forwardCGLimit - max_arm)) /
                    (datum.forwardCGLimit - datum.pilot2Arm);

                const max_weight = Math.min(max_auw, max_dry, max_nlp, max_cg);

                // We do this eval here because in the P2 behind the aft CG limit, the min and
                // max values end up being reversed by the calculations above, so we want them
                // to look like actual min and max.
                const range: TwoSeatWeightRange = {
                    pilot1Weight: abs_min_p1,
                    minPilot2Weight: Math.ceil(Math.max(p2_min, 0)),
                    maxPilot2Weight: Math.floor(Math.min(max_weight, datum.maxSeatWeight)),
                };

                // Only add this if the total cockpit weight doesn't breach the limits.
                if (abs_min_p1 + range.maxPilot2Weight <= maxCockpitWeight) {
                    dual_range.push(range);
                }
            }

            abs_min_p1 += options.placardCockpitWeightIncremments;
        } while (abs_min_p1 <= datum.maxSeatWeight);
    } else {
        do {
            // In the 2 seater case, if the P2 arm is behind the aft CG limit, we use Xfwd rather than Xaft
            // See GFA section 6.4.1
            const p2_min =
                (ge * (xe - datum.forwardCGLimit) - abs_min_p1 * (datum.forwardCGLimit - max_arm)) /
                (datum.forwardCGLimit - datum.pilot2Arm);

            // console.log("evaluating P1 at " + Math.round(abs_min_p1) + " P2 min " + Math.round(p2_min));

            // Only bother calculating if the P2 weight is within sane bounds.
            if (abs_min_p1 >= minSoloPilotWeight && p2_min <= datum.maxSeatWeight) {
                const max_auw = datum.maxAllUpWeight - ge - abs_min_p1;
                const max_dry = datum.maxDryWeight - ge - abs_min_p1;
                const max_nlp = datum.maxNonLiftingPartsWeight - nlpWeight - abs_min_p1;
                let max_cg = (ge * (xe - xaft) - abs_min_p1 * (xaft - min_arm)) / (xaft - datum.pilot2Arm);
                max_cg = Math.max(max_cg, 0);

                const max_weight = Math.min(max_auw, max_dry, max_nlp, max_cg);

                // console.log(`P2 weight is: auw ${max_auw}, dry ${max_dry}, NLP ${max_nlp} and cg ${max_cg}. Selected ${max_weight}` );

                // We do this eval here because in the P2 behind the aft CG limit, the min and
                // max values end up being reversed by the calculations above, so we want them
                // to look like actual min and max.
                const nom_min = Math.max(p2_min, 0);
                const nom_max = Math.min(max_weight, datum.maxSeatWeight);

                // We can get range inversion, so stop doing more calcs, even if the
                // weights seem to allow it.
                if (nom_max < nom_min) {
                    break;
                }

                const range: TwoSeatWeightRange = {
                    pilot1Weight: abs_min_p1,
                    minPilot2Weight: Math.ceil(nom_min),
                    maxPilot2Weight: Math.floor(nom_max),
                    // minPilot2Weight: Math.ceil(Math.min(nom_min, nom_max)),
                    // maxPilot2Weight: Math.floor(Math.max(nom_min, nom_max))
                };

                // Only add this if the total cockpit weight doesn't breach the limits.
                if (abs_min_p1 + range.maxPilot2Weight <= maxCockpitWeight) {
                    dual_range.push(range);
                }

                dual_range.push(range);
            }

            abs_min_p1 += options.placardCockpitWeightIncremments;
        } while (abs_min_p1 <= datum.maxSeatWeight);
    }

    return dual_range;
}
