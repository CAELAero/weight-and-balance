import { TwoSeaterWeightAndBalanceResult } from "../../src/weight-and-balance/result-types";
import { calculateTwoSeater } from "../../src/weight-and-balance/two-seater-calculator";

import { DG1000_CONFIG, DG1000_P1_RANGED_DATUM, DG1000_P1_FIXED_DATUM, K21_CONFIG, K21_DATUM, T31_DATUM, T31_CONFIG, LS6_CONFIG, LS6_DATUM } from "./data-gen";

describe("Two Seater 2 wheel", () => {
    it("Basic, no water", () => {
        const datum = K21_DATUM;
        const config = K21_CONFIG;

        const aircaft_weight = 373.8;
        const aircraft_arm = 778;
        const nlp_weight = 179.4;

        const result = calculateTwoSeater(datum, config, aircaft_weight, aircraft_arm, K21_DATUM.aftCGLimit, nlp_weight, {}) as TwoSeaterWeightAndBalanceResult;

        expect(result).toBeTruthy();
        expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();
        expect(result.allowedWingBallast).toBeUndefined();

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

        const result = calculateTwoSeater(
            datum,
            config, 
            aircaft_weight, 
            aircraft_arm, 
            DG1000_P1_FIXED_DATUM.aftCGLimit, 
            nlp_weight, 
            { useGFAMinBuffer: true, placardCockpitWeightIncremments: 10, wingspanSelected: 2 }
        ) as TwoSeaterWeightAndBalanceResult;

        expect(result).toBeTruthy();

        // console.log(JSON.stringify(result, null, 2));

        expect(result.soloMinPilotWeight).toBe(70);
        expect(result.soloMaxPilotWeight).toBe(110);

        expect(result.dualPilotWeightRanges).toBeDefined();
        expect(result.allowedWingBallast).toBeDefined();

        if(result.allowedWingBallast) {
            expect(result.allowedWingBallast[0].maxWingBallast).toBe(config.wingspanOptions[0].maxBallastAmount);
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

        const result_default = calculateTwoSeater(datum_default, config, aircaft_weight, aircraft_arm, DG1000_P1_FIXED_DATUM.aftCGLimit, nlp_weight, { useGFAMinBuffer: true }) as TwoSeaterWeightAndBalanceResult;
        const result_ranged = calculateTwoSeater(datum_ranged, config, aircaft_weight, aircraft_arm, DG1000_P1_RANGED_DATUM.aftCGLimit, nlp_weight, { useGFAMinBuffer: true }) as TwoSeaterWeightAndBalanceResult;

        expect(result_default).toBeTruthy();
        expect(result_ranged).toBeTruthy();

        //console.log(JSON.stringify(result, null, 2));

        // Should give identical values to the 4 panel version above.
        // Weights and arm should not change.
        expect(result_ranged.emptyCGArm).toBe(result_default.emptyCGArm);
        expect(result_ranged.emptyWeight).toBe(result_default.emptyWeight);
        expect(result_ranged.nonLiftingPartsWeight).toBe(result_default.nonLiftingPartsWeight);
        expect(result_ranged.pilotArmMinMaxUsed).toBeTruthy();
        expect(result_ranged.pilot1ArmUsed).toBe(datum_ranged.pilot1Arm);

        // Since we know with this aircraft that  the min pilot weight is actually much less 
        // that the required min pilot, these shouldn't change either. 
        expect(result_ranged.soloMinPilotWeight).toBe(70);
        expect(result_ranged.soloMaxPilotWeight).toBe(110);

        //console.log(JSON.stringify(result_ranged, null, 2));

        // ensure we copy out the options too
        expect(result_ranged.calculationInputOptions.p1ArmRangePercentage).toBeUndefined();
        expect(result_ranged.calculationInputOptions.useGFAMinBuffer).toBeTruthy();
    });

    it("P1 arm range with explicit percentage", () => {
        const datum = DG1000_P1_RANGED_DATUM;
        const config = DG1000_CONFIG;

        // 18M configuration values from VH-DGI 8 Nov 2022 measurements.
        const aircaft_weight = 411.5;
        const aircraft_arm = 707;
        const nlp_weight = 224.5;
        const arm_percentage = 30;

        const result = calculateTwoSeater(datum, config, aircaft_weight, aircraft_arm, DG1000_P1_FIXED_DATUM.aftCGLimit, nlp_weight, { useGFAMinBuffer: true, p1ArmRangePercentage: arm_percentage }) as TwoSeaterWeightAndBalanceResult;
        
        expect(result.calculationInputOptions.p1ArmRangePercentage).toBe(arm_percentage);
        expect(result.pilotArmMinMaxUsed).toBeFalsy();
        expect(result.pilot1ArmUsed).toBe(datum.pilot1Arm + ((datum.pilot1ArmMax || 0) - datum.pilot1Arm) * (arm_percentage / 100) );
    });

    it("Handles rear pilot located behind rear CG", () => {
        const datum = T31_DATUM;
        const config = T31_CONFIG;

        const aircaft_weight = 198;
        const aircraft_arm = 688;
        const nlp_weight = 198;

        const result = calculateTwoSeater(T31_DATUM, config, aircaft_weight, aircraft_arm, T31_DATUM.aftCGLimit, nlp_weight, { useGFAMinBuffer: false, placardCockpitWeightIncremments: 5 }) as TwoSeaterWeightAndBalanceResult;

        expect(result).toBeTruthy();

        //console.log(JSON.stringify(result, null, 2));

        const solo_aft = (result.emptyCGArm * result.emptyWeight + result.soloMinPilotWeight * datum.pilot1Arm) / (result.emptyWeight + result.soloMinPilotWeight);
        const solo_fwd = (result.emptyCGArm * result.emptyWeight + result.soloMaxPilotWeight * datum.pilot1Arm) / (result.emptyWeight + result.soloMaxPilotWeight);

        expect(solo_fwd).toBeGreaterThanOrEqual(datum.forwardCGLimit);
        expect(solo_aft).toBeLessThanOrEqual(datum.aftCGLimit);

        expect(result.dualPilotWeightRanges.length).toBeGreaterThan(0);

        // console.log("Solo: " + result.soloMinPilotWeight + " " + result.soloMaxPilotWeight + "\n" +
        //             "Forward "+ Math.floor(solo_fwd) + " required " + datum.forwardCGLimit + "\n" +
        //             "Aft "+ Math.ceil(solo_aft) + " required " + datum.aftCGLimit);

        result.dualPilotWeightRanges.forEach((entry) => {
            const dual_fwd = (result.emptyCGArm * result.emptyWeight + entry.pilot1Weight * datum.pilot1Arm + entry.minPilot2Weight * (datum.pilot2Arm || 0)) / (result.emptyWeight + entry.pilot1Weight + entry.minPilot2Weight);
            const dual_aft = (result.emptyCGArm * result.emptyWeight + entry.pilot1Weight * datum.pilot1Arm + entry.maxPilot2Weight * (datum.pilot2Arm || 0)) / (result.emptyWeight + entry.pilot1Weight + entry.maxPilot2Weight);


            // console.log("Dual. P1: " + entry.pilot1Weight +  "\n" + 
            //             "Forward at " + entry.minPilot2Weight + ": " + Math.floor(dual_fwd) + " required " + datum.forwardCGLimit + "\n" +
            //             "Aft at     " + entry.maxPilot2Weight + ": "+ Math.ceil(dual_aft) + " required " + datum.aftCGLimit);

            expect(dual_fwd).toBeGreaterThanOrEqual(datum.forwardCGLimit);
            expect(dual_aft).toBeLessThanOrEqual(datum.aftCGLimit);
        });
    });

    it("Rejects a request without a P2 arm", () => {
        const result = calculateTwoSeater(LS6_DATUM, LS6_CONFIG, 270, 400, LS6_DATUM.aftCGLimit, LS6_DATUM.maxNonLiftingPartsWeight, {});

        expect(result).toBeFalsy();
    });
});
