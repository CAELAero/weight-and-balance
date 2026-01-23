import { WeightAndBalanceDatum } from "../datum/datum";
import { WeightAndBalanceResult } from "./result-types";

/**
 * Calculate the arm for an object in the aircraft by looking at the moment change
 * between two consecutive weighings and the known object weight. This is the more
 * generic version using the results from the empty weighing and then a weighing
 * with the object/person in the aircraft and weighed again. 
 * 
 * There are caveats with this result, so please read AIRW‐D011 Section 7.1 for more details
 * 
 * @param emptyResult The base W&B result of the empty aircraft. 
 * @param withObjectResult The calculated result from weighing with the object/person change
 * @returns The arm calculated from the two weighings
 */
export function calculateArm(
    emptyResult: WeightAndBalanceResult, 
    withObjectResult: WeightAndBalanceResult): number {

    const objectWeightDifference = withObjectResult.emptyWeight - emptyResult.emptyWeight;

    // Avoid dividing by zero. as we don't want to create black holes. Just
    // return the original arm
    if(objectWeightDifference == 0) {
        return emptyResult.emptyCGArm;
    }

    // Equation 26 
    const xp = ((withObjectResult.emptyCGArm * withObjectResult.emptyWeight) - (emptyResult.emptyCGArm * emptyResult.emptyWeight)) / objectWeightDifference;

    return xp;
}

/**
 * Calculate the amount of tail ballast needed in order to achieve the desired
 * loaded CG position. This calculation does not know the maximum amount of 
 * water/blocks that can be placed in the tail, so the pilot must limit the 
 * weight to what can be physically installed.
 * 
 * If this is already at the aft CG, return 0.
 * If the pilot weight is outside the allowed seat range provided by the datum
 * return NaN.
 * If the pilot weight puts the MAC rearward from the desired MAC (ie requires
 * a negative weight in the tail), return NaN
 * 
 * If the desired MAC range is not [0,100] throw an error
 * 
 * 
 * @param datum W&B datum details
 * @param emptyResult Base empty W&B result for the aircraft
 * @param cockpitWeight The combined weight of pilot, parachute and anything else in
 *   the cockpit that would move the CG forward
 * @param macPercent The percentage of Mean Aerodynamic Chord that is desired. 0 is forward CG limit, 100 is aftCGLimit
 * @returns The amount of weight to place the CG at the desired position. If this is not 
 *   possible, return NaN.
 */
export function calculateTailBallastAmountForCGPosition(
    datum: WeightAndBalanceDatum, 
    emptyResult: WeightAndBalanceResult, 
    cockpitWeight: number,
    macPercent: number
): number {

    if(macPercent < 0) {
        throw new Error("MAC percentage must be greater than or equal to zero");
    }

    if(macPercent > 100) {
        throw new Error("MAC percentage must be less than or equal to 100");
    }
    
    if(cockpitWeight > datum.maxSeatWeight) {
        return Number.NaN;
    }

    if(cockpitWeight < datum.minAllowedPilotWeight) {
        return Number.NaN;
    }
    
    return 0;
}