import { calculateWeightAndBalance }  from "../../src/weight-and-balance/calculator";
import { SingleSeaterWeightAndBalanceResult, TwoSeaterWeightAndBalanceResult } from "../../src/weight-and-balance/result-types";
import { WeightAndBalanceMeasurement } from "../../src/weight-and-balance/measurements";

import { JANTAR_DATUM, JANTAR_CONFIG, DG1000_CONFIG, DG1000_P1_RANGED_DATUM, DG1000_P1_FIXED_DATUM, K21_CONFIG, K21_DATUM, LS6_CONFIG, LS6_DATUM } from "./data-gen";

describe("Calculate from measurements", () => {
    describe("Single Seater", () => {
        it("Basic 2 piece wing, no ballast", () => {
            const datum = JANTAR_DATUM;
            const config = JANTAR_CONFIG;
            config.wingMaxBallastAmount = 0;

            const measured: WeightAndBalanceMeasurement = {
                undercarriage1Weight: 246,
                undercarriage2Weight: 33,
                wing1Weight: 72,
                wing2Weight: 74,
            };

            const result = calculateWeightAndBalance(datum, config, measured) as SingleSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();

            // Paperwork says553.23, but that doesn't match hand calculation, which is the number below.
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

        it("4 piece wing - 15M", () => {
            const datum = LS6_DATUM;
            const config = LS6_CONFIG;

            const measured: WeightAndBalanceMeasurement = {
                undercarriage1Weight: 244,
                undercarriage2Weight: 28.3,
                wing1Weight: 70,
                wing3Weight: 2,
                wing2Weight: 67,
                wing4Weight: 2,
            };

            const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: false, calculatePrimary: true }) as SingleSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();

            // Paperwork says553.23, but that doesn't match hand calculation, which is the number below.
            expect(result.emptyCGArm).toBe(614);
            expect(result.emptyWeight).toBe(272.3);
            expect(result.minPilotWeight).toBe(70);
            expect(result.maxPilotWeight).toBe(109);
            expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();
        });

        it("4 piece wing - 17.5M", () => {
            const datum = LS6_DATUM;
            const config = LS6_CONFIG;

            // Just a bit heavier with the 17.5M wings, so the max ballast should drop 
            // a bit
            const measured: WeightAndBalanceMeasurement = {
                undercarriage1Weight: 249.4,
                undercarriage2Weight: 28.5,
                wing1Weight: 70,
                wing5Weight: 5,
                wing2Weight: 67,
                wing6Weight: 5,
            };

            const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: false, calculatePrimary: false }) as SingleSeaterWeightAndBalanceResult;
            
            expect(result).toBeTruthy();

            // Paperwork says553.23, but that doesn't match hand calculation, which is the number below.
            expect(result.emptyCGArm).toBe(608);
            expect(result.emptyWeight).toBe(277.9);
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

            const measured: WeightAndBalanceMeasurement = {
                undercarriage1Weight: 244,
                undercarriage2Weight: 28.3,
                wing1Weight: 70,
                wing3Weight: 2,
                wing2Weight: 67,
                wing4Weight: 2,
            };

            const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: true, calculatePrimary: true }) as SingleSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();

            // Paperwork says553.23, but that doesn't match hand calculation, which is the number below.
            expect(result.emptyCGArm).toBe(614);
            expect(result.emptyWeight).toBe(272.3);
            expect(result.minPilotWeight).toBe(72);
            expect(result.maxPilotWeight).toBe(109);
            expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();

            // ensure we copy out the options too
            expect(result.calculationInputOptions.p1ArmRangePercentage).toBeUndefined();
            expect(result.calculationInputOptions.primaryWingspanSelected).toBeTruthy();
            expect(result.calculationInputOptions.useGFAMinBuffer).toBeTruthy();
        });
    });

    describe("Two Seater 2 wheel", () => {
        it("Basic, no water", () => {
            const datum = K21_DATUM;
            const config = K21_CONFIG;

            const measured: WeightAndBalanceMeasurement = {
                undercarriage1Weight: 249,
                undercarriage2Weight: 132,
                wing1Weight: 78,
                wing2Weight: 77,
            };

            const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: true, calculatePrimary: true }) as TwoSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();
            expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();
    
            //console.log(JSON.stringify(result, null, 2));
        });

        it("Two seater with tail ballast", () => {
            const datum = DG1000_P1_FIXED_DATUM;
            const config = DG1000_CONFIG;

            // 18M configuration values from VH-DGI 8 Nov 2022 measurements.
            const measured: WeightAndBalanceMeasurement = {
                undercarriage1Weight: 364.5,
                undercarriage2Weight: 47,
                wing1Weight: 91.5,
                wing2Weight: 91.5,
                wing3Weight: 2,
                wing4Weight: 2,
            };

            const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: true, calculatePrimary: true }) as TwoSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();
    
            // console.log(JSON.stringify(result, null, 2));

            expect(result.emptyCGArm).toBe(707);
            expect(result.emptyWeight).toBe(411.5);
            expect(result.soloMinPilotWeight).toBe(70);
            expect(result.soloMaxPilotWeight).toBe(110);

            expect(result.dualPilotWeightRanges).toBeDefined();
            expect(result.allowedWingBallast).toBeDefined();

            if(result.allowedWingBallast) {
                expect(result.allowedWingBallast[0].maxBallast).toBe(config.wingMaxBallastAmount);
                expect(result.allowedWingBallast[0].pilotWeight).toBe(datum.minAllowedPilotWeight);
            }
        });

        it("Multiple wing panels combined together", () => {
            const datum = DG1000_P1_FIXED_DATUM;
            const config = DG1000_CONFIG;

            // 18M configuration values from VH-DGI 8 Nov 2022 measurements.
            const measured: WeightAndBalanceMeasurement = {
                undercarriage1Weight: 364.5,
                undercarriage2Weight: 47,
                wing1Weight: 93.5,
                wing2Weight: 93.5,
            };

            const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: true, calculatePrimary: true }) as TwoSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();
    
            //console.log(JSON.stringify(result, null, 2));

            // Should give identical values to the 4 panel version above.
            expect(result.emptyCGArm).toBe(707);
            expect(result.emptyWeight).toBe(411.5);
            expect(result.soloMinPilotWeight).toBe(70);
            expect(result.soloMaxPilotWeight).toBe(110);
        });

        it("P1 arm range with default conservative handling", () => {
            const datum_default = DG1000_P1_FIXED_DATUM;
            const datum_ranged = DG1000_P1_RANGED_DATUM;
            const config = DG1000_CONFIG;

            // 18M configuration values from VH-DGI 8 Nov 2022 measurements.
            const measured: WeightAndBalanceMeasurement = {
                undercarriage1Weight: 364.5,
                undercarriage2Weight: 47,
                wing1Weight: 93.5,
                wing2Weight: 93.5,
            };

            const result_default = calculateWeightAndBalance(datum_default, config, measured, { useGFAMinBuffer: true, calculatePrimary: true }) as TwoSeaterWeightAndBalanceResult;
            const result_ranged = calculateWeightAndBalance(datum_ranged, config, measured, { useGFAMinBuffer: true, calculatePrimary: true }) as TwoSeaterWeightAndBalanceResult;

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

    describe("Two Seater 3 wheel", () => {
        describe("Nose wheel", () => {

        })

        describe("Taildragger", () => {
            
        })
    });
});
