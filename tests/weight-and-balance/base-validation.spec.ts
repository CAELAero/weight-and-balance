import { generateWeightAndBalancePlacardData }  from "../../src/weight-and-balance/calculator";
import { SingleSeaterWeightAndBalanceResult, TwoSeaterWeightAndBalanceResult } from "../../src/weight-and-balance/result-types";
import { WeightAndBalanceMeasurement, WeightAndBalanceComponentChange } from "../../src/weight-and-balance/measurements";

import { JANTAR_DATUM, JANTAR_CONFIG, DG1000_CONFIG, DG1000_P1_RANGED_DATUM, DG1000_P1_FIXED_DATUM, K21_CONFIG, K21_DATUM, LS6_CONFIG, LS6_DATUM } from "./data-gen";

describe("Base validation", () => {
    describe("Single Seater", () => {
        it("Basic setup, no ballast", () => {
            const datum = JANTAR_DATUM;
            const config = JANTAR_CONFIG;
            config.wingMaxBallastAmount = 0;

            const aircaft_weight = 279;
            const aircraft_arm = 551;
            const nlp_weight = 133;

            const result = generateWeightAndBalancePlacardData(datum, config, aircaft_weight, aircraft_arm, nlp_weight) as SingleSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();

            expect(result.emptyCGArm).toBe(551);
            expect(result.emptyWeight).toBe(279);
            expect(result.minPilotWeight).toBe(70);
            expect(result.maxPilotWeight).toBe(106);
            expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();

            // ensure we copy out the options too
            expect(result.calculationInputOptions.p1ArmRangePercentage).toBeUndefined();
            expect(result.calculationInputOptions.primaryWingspanSelected).toBeTruthy();
            expect(result.calculationInputOptions.useGFAMinBuffer).toBeFalsy();
        });

        it("Tail ballast", () => {
            const datum = LS6_DATUM;
            const config = LS6_CONFIG;

            const aircaft_weight = 277.9;
            const aircraft_arm = 608;
            const nlp_weight = 131.3;

            const result = generateWeightAndBalancePlacardData(datum, config, aircaft_weight, aircraft_arm, nlp_weight, { calculatePrimary: false }) as SingleSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();

            expect(result.minPilotWeight).toBe(70);
            expect(result.maxPilotWeight).toBe(109);
            expect(result.allowedWingBallast).toBeDefined();
            expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();

            if(result.allowedWingBallast) {

                expect(result.allowedWingBallast[0].pilotWeight).toBe(result.minPilotWeight);
                expect(result.allowedWingBallast[0].maxBallast).toBe(config.wingMaxBallastAmount);

                const w_ballast_len = result.allowedWingBallast.length - 1;
                const max_ballast = Math.floor(datum.maxAllUpWeight - result.maxPilotWeight - result.emptyWeight);

                expect(result.allowedWingBallast[w_ballast_len].pilotWeight).toBe(result.maxPilotWeight);
                expect(result.allowedWingBallast[w_ballast_len].maxBallast).toBe(max_ballast);
            }

            // ensure we copy out the options too
            expect(result.calculationInputOptions.p1ArmRangePercentage).toBeUndefined();
            expect(result.calculationInputOptions.primaryWingspanSelected).toBeFalsy();
            expect(result.calculationInputOptions.useGFAMinBuffer).toBeFalsy();
        });

        it("GFA 5% buffer used ", () => {
            const datum = LS6_DATUM;
            const config = LS6_CONFIG;

            const aircaft_weight = 272.3;
            const aircraft_arm = 614;
            const nlp_weight = 131.3;

            const result = generateWeightAndBalancePlacardData(datum, config, aircaft_weight, aircraft_arm, nlp_weight, { useGFAMinBuffer: true, calculatePrimary: false }) as SingleSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();

            expect(result.minPilotWeight).toBe(72);
            expect(result.maxPilotWeight).toBe(109);
            expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();

            // ensure we copy out the options too
            expect(result.calculationInputOptions.p1ArmRangePercentage).toBeUndefined();
            expect(result.calculationInputOptions.primaryWingspanSelected).toBeFalsy();
            expect(result.calculationInputOptions.useGFAMinBuffer).toBeTruthy();
        });
    });

    describe("Two Seater 2 wheel", () => {
        it("Basic, no water", () => {
            const datum = K21_DATUM;
            const config = K21_CONFIG;

            const aircaft_weight = 373.8;
            const aircraft_arm = 778;
            const nlp_weight = 179.4;

            const result = generateWeightAndBalancePlacardData(datum, config, aircaft_weight, aircraft_arm, nlp_weight) as TwoSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();
            expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();

            expect(result.soloMinPilotWeight).toBe(70);
            expect(result.soloMaxPilotWeight).toBe(110);
    
            //console.log(JSON.stringify(result, null, 2));
        });

        it("Two seater with tail ballast", () => {
            const datum = DG1000_P1_FIXED_DATUM;
            const config = DG1000_CONFIG;

            // 18M configuration values from VH-DGI 8 Nov 2022 measurements.
            const aircaft_weight = 411.5;
            const aircraft_arm = 707;
            const nlp_weight = 224.5;

            const result = generateWeightAndBalancePlacardData(datum, config, aircaft_weight, aircraft_arm, nlp_weight, { useGFAMinBuffer: true }) as TwoSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();
    
            // console.log(JSON.stringify(result, null, 2));

            expect(result.soloMinPilotWeight).toBe(70);
            expect(result.soloMaxPilotWeight).toBe(110);

            expect(result.dualPilotWeightRanges).toBeDefined();
            expect(result.allowedWingBallast).toBeDefined();

            if(result.allowedWingBallast) {
                expect(result.allowedWingBallast[0].maxBallast).toBe(config.wingMaxBallastAmount);
                expect(result.allowedWingBallast[0].pilotWeight).toBe(datum.minAllowedPilotWeight);
            }
        });


        it("P1 arm range with default conservative handling", () => {
            const datum_default = DG1000_P1_FIXED_DATUM;
            const datum_ranged = DG1000_P1_RANGED_DATUM;
            const config = DG1000_CONFIG;

            // 18M configuration values from VH-DGI 8 Nov 2022 measurements.
            const aircaft_weight = 411.5;
            const aircraft_arm = 707;
            const nlp_weight = 224.5;

            const result_default = generateWeightAndBalancePlacardData(datum_default, config, aircaft_weight, aircraft_arm, nlp_weight, { useGFAMinBuffer: true }) as TwoSeaterWeightAndBalanceResult;
            const result_ranged = generateWeightAndBalancePlacardData(datum_ranged, config, aircaft_weight, aircraft_arm, nlp_weight, { useGFAMinBuffer: true }) as TwoSeaterWeightAndBalanceResult;

            expect(result_default).toBeTruthy();
            expect(result_ranged).toBeTruthy();
    
            //console.log(JSON.stringify(result, null, 2));

            // Should give identical values to the 4 panel version above.
            // Weights and arm should not change.
            expect(result_ranged.emptyCGArm).toBe(result_default.emptyCGArm);
            expect(result_ranged.emptyWeight).toBe(result_default.emptyWeight);
            expect(result_ranged.nonLiftingPartsWeight).toBe(result_default.nonLiftingPartsWeight);

            // Since we know with this aircraft that  the min pilot weight is actually much less 
            // that the required min pilot, these shouldn't change either. 
            expect(result_ranged.soloMinPilotWeight).toBe(70);
            expect(result_ranged.soloMaxPilotWeight).toBe(110);

            //console.log(JSON.stringify(result_ranged, null, 2));

            // ensure we copy out the options too
            expect(result_ranged.calculationInputOptions.p1ArmRangePercentage).toBeUndefined();
            expect(result_ranged.calculationInputOptions.primaryWingspanSelected).toBeTruthy();
            expect(result_ranged.calculationInputOptions.useGFAMinBuffer).toBeTruthy();
        });
    });

    describe("Error handling", () => {
        it("Ignores missing ballast block arm", () => {
            const datum = LS6_DATUM;
            const config = LS6_CONFIG;

            datum.cockpitBallastBlockArm = undefined;

            const aircaft_weight = 277.9;
            const aircraft_arm = 608;
            const nlp_weight = 131.3;

            const result = generateWeightAndBalancePlacardData(datum, config, aircaft_weight, aircraft_arm, nlp_weight) as SingleSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();
            expect(result.cockpitBallast).toBeFalsy();
        });

        it("Ignores zero ballast block count", () => {
            const datum = LS6_DATUM;
            const config = LS6_CONFIG;

            config.cockpitBallastBlockCount = 0;

            const aircaft_weight = 277.9;
            const aircraft_arm = 608;
            const nlp_weight = 131.3;

            const result = generateWeightAndBalancePlacardData(datum, config, aircaft_weight, aircraft_arm, nlp_weight) as SingleSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();
            expect(result.cockpitBallast).toBeFalsy();
        });

        it("Ignores zero ballast block weight", () => {
            const datum = LS6_DATUM;
            const config = LS6_CONFIG;

            config.cockpitBallastWeightPerBlock = 0;
            
            const aircaft_weight = 277.9;
            const aircraft_arm = 608;
            const nlp_weight = 131.3;

            const result = generateWeightAndBalancePlacardData(datum, config, aircaft_weight, aircraft_arm, nlp_weight) as SingleSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();
            expect(result.cockpitBallast).toBeFalsy();
        });

        it("Fails on a two seater with no P2 arm defined", () => {
            const datum = K21_DATUM;
            const config = K21_CONFIG;

            datum.pilot2Arm = undefined;

            const aircaft_weight = 373.8;
            const aircraft_arm = 778;
            const nlp_weight = 179.4;

            const result = generateWeightAndBalancePlacardData(datum, config, aircaft_weight, aircraft_arm, nlp_weight) as SingleSeaterWeightAndBalanceResult;

            expect(result).toBeFalsy();
        });
    })
});
