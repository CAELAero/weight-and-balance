import { AircraftConfiguration, SeatingConfiguration } from "../configuration/aircraft-configuration";

import { WeightAndBalanceDatum } from "../datum/datum";
import { calculateG1, calculateG2, calculateWingWeights, WeightAndBalanceOptions } from "./calculator-common";
import { WeightAndBalanceMeasurement, WeightAndBalanceComponentChange } from "./measurements";
import { WeightAndBalanceResult } from "./result-types";
import { calculateSingleSeaterResult } from "./single-seater-calculator";
import { calculateTwoSeater } from "./two-seater-calculator";

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
