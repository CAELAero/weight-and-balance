import { DatumCalculationModel, exportDatumToCSV, WeightAndBalanceDatum } from "../../src";

describe("Datum export", () => {
    it("exports a header-only output", () => {
        const result = exportDatumToCSV([]);

        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].toLowerCase()).toBe('type certificate,location,levelling instructions,model,mauw,mauw alternate,mdry,mnlp,max seat,min pilot,fwd cg,aft cg,p1arm,p1arm max,p2arm,cockpit ballast arm,tail ballast arm,wheel to datum,wheel to tailwheel');
    });

    it("Exports a single seater definition", () => {
        const JANTAR_DATUM: WeightAndBalanceDatum = {
            typeCertificateId: "SZD481",
            location: "WRLE",
            levellingInstructions: "flat",
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

        const result = exportDatumToCSV([JANTAR_DATUM]);
        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(2);
        expect(result[1].startsWith(JANTAR_DATUM.typeCertificateId)).toBeTruthy();
        expect(result[1]).toBe('SZD481,WRLE,flat,model_1,535,,385,245,110,70,158,336,-616,,,,,120,3648');
    });

    it("Quotes string fields containing commas", () => {
        const JANTAR_DATUM: WeightAndBalanceDatum = {
            typeCertificateId: "SZD481",
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

        const result = exportDatumToCSV([JANTAR_DATUM]);
        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(2);
        expect(result[1].startsWith(JANTAR_DATUM.typeCertificateId)).toBeTruthy();
        expect(result[1]).toBe('SZD481,"location with, comma","levelling, with comma",model_1,535,,385,245,110,70,158,336,-616,,,,,120,3648');
    });
});