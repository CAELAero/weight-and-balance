import {
    AircraftConfiguration,
    BallastBlockCapacity,
    TailBallastType,
} from "../configuration/aircraft-configuration";

import { WeightAndBalanceDatum } from "../datum/datum";
import { CertificationCategory } from "../util/certifcation-category";
import { 
    calculateBaseCGLimits, 
    calculateBlockCombos, 
    calculateCockpitBallast, 
    calculateMaxWingBallast, 
    calculateWingWaterBallast, 
    convertP1ArmPercentage, 
    WeightAndBalanceOptions
} from "./calculator-common";
import {
    FittedBallastBlock,
    TwoSeaterPilotWeightTailBallastAdjustment,
    TwoSeaterWeightAndBalanceResult,
    TwoSeatWeightRange,
} from "./result-types";

export function calculateTwoSeater(
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
    const dual_range = calculateTwoSeaterP2(datum, ge, xe, xaft, nlpWeight, base_pilot.minPilotWeight, max_cockpit_weight, options);

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
            let arm_range = datum.pilot1ArmMax - datum.pilot1Arm;
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
                } else {
                    console.log("Ignoring range " + abs_min_p1 + " " + range.maxPilot2Weight + " vs " + maxCockpitWeight);
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
