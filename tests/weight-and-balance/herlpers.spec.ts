import { WeightAndBalanceResult, calculateArm, calculateTailBallastAmountForCGPosition } from "../../src";
import { JANTAR_DATUM } from "./data-gen";

describe("Helpers", () => {
    describe("calculateArm", () => {
        it("Calculates happy path", () => {
            // Use a known example from Jantar 2s that regularly have a block of lead fixed
            // to the fin post. These are real numbers from IZX and should result in the
            // arm being calculated correctly
            const empty_result: WeightAndBalanceResult = {
                calculationInputOptions: {
                    useGFAMinBuffer: false,
                    primaryWingspanSelected: false,
                    p1ArmRangePercentage: undefined
                },
                maxAllUpWeight: 0,
                emptyCGArm: 516.5,
                emptyWeight: 276,
                maxFuselageLoad: 0,
                nonLiftingPartsWeight: 0,
                pilotArmMinMaxUsed: false,
                pilot1ArmUsed: 0
            };

            const ballasted_result: WeightAndBalanceResult = {
                calculationInputOptions: {
                    useGFAMinBuffer: false,
                    primaryWingspanSelected: false,
                    p1ArmRangePercentage: undefined
                },
                maxAllUpWeight: 0,
                emptyCGArm: 553,
                emptyWeight: 279,
                maxFuselageLoad: 0,
                nonLiftingPartsWeight: 0,
                pilotArmMinMaxUsed: false,
                pilot1ArmUsed: 0
            };

            const result = calculateArm(empty_result, ballasted_result);

            // Bolted to the fin post, so shouldn't be any closer than the rear wheel location
            // relative to the datum. Probably could get more specific here and make sure 
            // it is not too large. 
            const tail_wheel_arm = JANTAR_DATUM.distanceFrontWheelToDatum + JANTAR_DATUM.distanceFrontWheelToRearWheel;
            expect(result).toBeGreaterThanOrEqual(tail_wheel_arm);
            expect(result).toBeLessThanOrEqual(tail_wheel_arm + 150);
        });

        it("Handles zero change in value of empty weight", () => {
            const empty_result: WeightAndBalanceResult = {
                calculationInputOptions: {
                    useGFAMinBuffer: false,
                    primaryWingspanSelected: false,
                    p1ArmRangePercentage: undefined
                },
                maxAllUpWeight: 0,
                emptyCGArm: 516.5,
                emptyWeight: 276,
                maxFuselageLoad: 0,
                nonLiftingPartsWeight: 0,
                pilotArmMinMaxUsed: false,
                pilot1ArmUsed: 0
            };

            const result = calculateArm(empty_result, empty_result);

            expect(result).toBe(empty_result.emptyCGArm);
        })
    });

    describe("calculateTailBallastAmountForCGPosition", () => {
        describe("Error handling", () => {
            it("Rejects MAC < 0", () => {
                const empty_result: WeightAndBalanceResult = {
                    calculationInputOptions: {
                        useGFAMinBuffer: false,
                        primaryWingspanSelected: false,
                        p1ArmRangePercentage: undefined
                    },
                    maxAllUpWeight: 0,
                    emptyCGArm: 516.5,
                    emptyWeight: 276,
                    maxFuselageLoad: 0,
                    nonLiftingPartsWeight: 0,
                    pilotArmMinMaxUsed: false,
                    pilot1ArmUsed: 0
                };

                expect(calculateTailBallastAmountForCGPosition(JANTAR_DATUM, empty_result, 90, -1)).toThrow();
            });

            it("Rejects MAC > 100", () => {
                const empty_result: WeightAndBalanceResult = {
                    calculationInputOptions: {
                        useGFAMinBuffer: false,
                        primaryWingspanSelected: false,
                        p1ArmRangePercentage: undefined
                    },
                    maxAllUpWeight: 0,
                    emptyCGArm: 516.5,
                    emptyWeight: 276,
                    maxFuselageLoad: 0,
                    nonLiftingPartsWeight: 0,
                    pilotArmMinMaxUsed: false,
                    pilot1ArmUsed: 0
                };

                expect(calculateTailBallastAmountForCGPosition(JANTAR_DATUM, empty_result, 90, 102)).toThrow();
            });

            it("Cockpit weight > max seat weight", () => {
                const empty_result: WeightAndBalanceResult = {
                    calculationInputOptions: {
                        useGFAMinBuffer: false,
                        primaryWingspanSelected: false,
                        p1ArmRangePercentage: undefined
                    },
                    maxAllUpWeight: 0,
                    emptyCGArm: 516.5,
                    emptyWeight: 276,
                    maxFuselageLoad: 0,
                    nonLiftingPartsWeight: 0,
                    pilotArmMinMaxUsed: false,
                    pilot1ArmUsed: 0
                };

                expect(isNaN(calculateTailBallastAmountForCGPosition(JANTAR_DATUM, empty_result, JANTAR_DATUM.maxSeatWeight + 1, 70))).toBeTruthy();
            });

            it("Cockpit weight < min seat weight", () => {
                const empty_result: WeightAndBalanceResult = {
                    calculationInputOptions: {
                        useGFAMinBuffer: false,
                        primaryWingspanSelected: false,
                        p1ArmRangePercentage: undefined
                    },
                    maxAllUpWeight: 0,
                    emptyCGArm: 516.5,
                    emptyWeight: 276,
                    maxFuselageLoad: 0,
                    nonLiftingPartsWeight: 0,
                    pilotArmMinMaxUsed: false,
                    pilot1ArmUsed: 0
                };

                expect(isNaN(calculateTailBallastAmountForCGPosition(JANTAR_DATUM, empty_result, JANTAR_DATUM.minAllowedPilotWeight - 1, 70))).toBeTruthy();
            });
            
        });
    })
})