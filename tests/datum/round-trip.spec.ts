import { Readable } from "stream";

import { CertificationCategory, DatumCalculationModel, exportDatumToCSV, loadDatumFromCSV, WeightAndBalanceDatum } from "../../src";

describe("Round trip datum import/export", () => {
    it("Handles simple import/export", async () => {
        const JANTAR_DATUM: WeightAndBalanceDatum = {
            typeCertificateId: "SZD481",
            category: CertificationCategory.UTILITY,
            wingspan: 15,
            location: "location with, comma",
            levellingInstructions: "levelling, with comma",
            calculationModel: DatumCalculationModel.MODEL_1,
            maxAllUpWeight: 535,
            maxDryWeight: 385,
            maxNonLiftingPartsWeight: 245,
            maxSeatWeight: 110,
            minAllowedPilotWeight: 70,
            forwardCGLimit: 158,
            aftCGLimit: 336,
            pilot1Arm: -616,
            distanceFrontWheelToDatum: 120,
            distanceFrontWheelToRearWheel: 3648
        };

        const output = exportDatumToCSV([JANTAR_DATUM]);

        const input = new Readable();
        input.push(output.join("\n"));
        input.push(null);

        const parsed = await loadDatumFromCSV(input);

        expect(parsed.length).toBe(1);
        expect(parsed[0]).toMatchObject(JANTAR_DATUM);
    })
});