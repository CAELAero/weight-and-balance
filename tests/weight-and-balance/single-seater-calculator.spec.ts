import { generateWeightAndBalancePlacardData }  from "../../src/weight-and-balance/calculator";
import { SingleSeaterWeightAndBalanceResult } from "../../src/weight-and-balance/result-types";

import { JANTAR2_DATUM, JANTAR_CONFIG, LS6_CONFIG, LS6_DATUM } from "./data-gen";

describe("Single Seater", () => {
    it("Basic setup, no ballast", () => {
        const datum = JANTAR2_DATUM;
        const config = JANTAR_CONFIG;
        config.wingspanOptions[0].maxBallastAmount = 0;

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
        expect(result.calculationInputOptions.useGFAMinBuffer).toBeFalsy();
    });

    it("Tail ballast", () => {
        const datum = LS6_DATUM;
        const config = LS6_CONFIG;

        const aircaft_weight = 277.9;
        const aircraft_arm = 608;
        const nlp_weight = 131.3;

        const result = generateWeightAndBalancePlacardData(datum, config, aircaft_weight, aircraft_arm, nlp_weight) as SingleSeaterWeightAndBalanceResult;

        expect(result).toBeTruthy();

        expect(result.minPilotWeight).toBe(70);
        expect(result.maxPilotWeight).toBe(109);
        expect(result.allowedWingBallast).toBeDefined();
        expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();

        if(result.allowedWingBallast) {

            expect(result.allowedWingBallast[0].pilotWeight).toBe(result.minPilotWeight);
            expect(result.allowedWingBallast[0].maxWingBallast).toBe(config.wingspanOptions[0].maxBallastAmount);

            const w_ballast_len = result.allowedWingBallast.length - 1;
            const max_ballast = Math.floor(datum.maxAllUpWeight - result.maxPilotWeight - result.emptyWeight);

            expect(result.allowedWingBallast[w_ballast_len].pilotWeight).toBe(result.maxPilotWeight);
            expect(result.allowedWingBallast[w_ballast_len].maxWingBallast).toBe(max_ballast);
        }

        // ensure we copy out the options too
        expect(result.calculationInputOptions.p1ArmRangePercentage).toBeUndefined();
        expect(result.calculationInputOptions.useGFAMinBuffer).toBeFalsy();
    });

    it("GFA 5% buffer used ", () => {
        const datum = LS6_DATUM;
        const config = LS6_CONFIG;

        const aircaft_weight = 272.3;
        const aircraft_arm = 614;
        const nlp_weight = 131.3;

        const result = generateWeightAndBalancePlacardData(datum, config, aircaft_weight, aircraft_arm, nlp_weight, { useGFAMinBuffer: true }) as SingleSeaterWeightAndBalanceResult;

        expect(result).toBeTruthy();

        expect(result.minPilotWeight).toBe(72);
        expect(result.maxPilotWeight).toBe(109);
        expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();

        // ensure we copy out the options too
        expect(result.calculationInputOptions.p1ArmRangePercentage).toBeUndefined();
        expect(result.calculationInputOptions.useGFAMinBuffer).toBeTruthy();
    });

    describe("Error handling", () => {
        it("Ignores missing ballast block arm", () => {
            const datum = LS6_DATUM;
            const config = LS6_CONFIG;

            datum.cockpitBallastBlockArms = undefined;

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

            config.cockpitBallast = [];

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

            config.cockpitBallast = [];
            
            const aircaft_weight = 277.9;
            const aircraft_arm = 608;
            const nlp_weight = 131.3;

            const result = generateWeightAndBalancePlacardData(datum, config, aircaft_weight, aircraft_arm, nlp_weight) as SingleSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();
            expect(result.cockpitBallast).toBeFalsy();
        });
    });
});
