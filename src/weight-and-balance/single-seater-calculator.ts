import { AircraftConfiguration, BallastBlockCapacity, TailBallastType } from "../configuration/aircraft-configuration";

import { WeightAndBalanceDatum } from "../datum/datum";
import { CertificationCategory } from "../util/certifcation-category";
import {
    calculateBaseCGLimits,
    calculateCockpitBallast,
    calculateMaxWingBallast,
    calculateWingWaterBallast,
    WeightAndBalanceOptions,
} from "./calculator-common";
import { FittedBallastBlock, SingleSeaterPlacardData, SingleSeaterWeightAndBalanceResult } from "./result-types";

export function calculateSingleSeaterResult(
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
