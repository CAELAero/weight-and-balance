import { updateWeightAndBalance }  from "../../src/weight-and-balance/calculator";
import { SingleSeaterWeightAndBalanceResult } from "../../src/weight-and-balance/result-types";
import { WeightAndBalanceComponentChange } from "../../src/weight-and-balance/measurements";
import { JANTAR_DATUM, JANTAR_CONFIG } from "./data-gen";

describe("Update with component change", () => {
    it("Returns the same result if no item change data", () => {
        const datum = JANTAR_DATUM;
        const config = JANTAR_CONFIG;
        config.wingMaxBallastAmount = 0;

        const change_request: WeightAndBalanceComponentChange = {
            aircraftWeight: 279,
            aircraftArm: 551,
            nonLiftingPartsWeight: 133
        };

        const result = updateWeightAndBalance(datum, config, change_request) as SingleSeaterWeightAndBalanceResult;

        expect(result).toBeTruthy();

        // Paperwork says553.23, but that doesn't match hand calculation, which is the number below.
        expect(result.emptyCGArm).toBe(change_request.aircraftArm);
        expect(result.emptyWeight).toBe(change_request.aircraftWeight);
        expect(result.minPilotWeight).toBe(70);
        expect(result.maxPilotWeight).toBe(106);
        expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();
    });

    it("Remove tail fixed ballast weight", () => {
        // This example comes from IZX calculated numbers from the original weight and balance. 
        // Later 3kg of lead was added to the tail, so this is the reverse calculation. The numbers
        // here should result in returning to the original weight and balance arm.
        const datum = JANTAR_DATUM;
        const config = JANTAR_CONFIG;
        config.wingMaxBallastAmount = 0;

        const change_request: WeightAndBalanceComponentChange = {
            aircraftWeight: 279,
            aircraftArm: 551,
            nonLiftingPartsWeight: 133,
            itemArm: datum.distanceFrontWheelToRearWheel + datum.distanceFrontWheelToDatum,
            itemWeightChange: -3.0,
            weightChangeInFuselage: true
        };

        const result = updateWeightAndBalance(datum, config, change_request) as SingleSeaterWeightAndBalanceResult;

        expect(result).toBeTruthy();

        // only the arm should change here;
        expect(result.emptyCGArm).toBe(516);
        expect(result.emptyWeight).toBe(change_request.aircraftWeight + (change_request.itemWeightChange || 0));
        expect(result.minPilotWeight).toBe(70);
        expect(result.maxPilotWeight).toBe(109);
        expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();
    });
})
