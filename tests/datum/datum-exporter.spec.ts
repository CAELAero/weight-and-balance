import { CertificationCategory, DatumCalculationModel, exportDatumToCSV, WeightAndBalanceDatum } from "../../src";

describe("Datum export", () => {
    it("exports a header-only output", () => {
        const result = exportDatumToCSV([]);

        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].toLowerCase()).toBe('type certificate,category,wingspan,variation,location,levelling instructions,model,mauw,mdry,mnlp,max seat,min pilot,max cockpit,fwd cg,aft cg,p1arm,p1arm max,p2arm,cockpit ballast arm,tail wing ballast arm,tail cg ballast arm,tail battery arm,wing ballast arm,baggage arm,wing fuel arm,fuselage fuel arm,fuselage battery arm,p1 instrument arm,p2 instrument arm,wheel to datum,wheel to tailwheel');
    });

    it("Exports a single seater definition", () => {
        const JANTAR_DATUM: WeightAndBalanceDatum = {
            typeCertificateId: "SZD481",
            category: CertificationCategory.UTILITY,
            wingspan: 15,
            variation: "TN 38-01",
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
        expect(result[1]).toBe('SZD481,utility,15,TN 38-01,WRLE,flat,model_1,535,385,245,110,70,,158,336,-616,,,,,,,,,,,,,,120,3648');
    });

    it("Quotes string fields containing commas", () => {
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
            maxCockpitWeight: 120,
            forwardCGLimit: 158,
            aftCGLimit: 336,
            pilot1Arm: -616,
            distanceFrontWheelToDatum: 120,
            distanceFrontWheelToRearWheel: 3648,
        };

        const result = exportDatumToCSV([JANTAR_DATUM]);
        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(2);
        expect(result[1].startsWith(JANTAR_DATUM.typeCertificateId)).toBeTruthy();
        expect(result[1]).toBe('SZD481,utility,15,,"location with, comma","levelling, with comma",model_1,535,385,245,110,70,120,158,336,-616,,,,,,,,,,,,,,120,3648');
    });

    it("Exports array field values", () => {
        const JANTAR_DATUM: WeightAndBalanceDatum = {
            typeCertificateId: "SZD481",
            category: CertificationCategory.UTILITY,
            wingspan: 15,
            variation: "TN 38-01",
            location: "WRLE",
            levellingInstructions: "flat",
            calculationModel: DatumCalculationModel.MODEL_1,
            maxAllUpWeight: 535,
            maxDryWeight: 385,
            maxNonLiftingPartsWeight: 245,
            maxSeatWeight: 110,
            minAllowedPilotWeight: 70,
            maxCockpitWeight: 120,
            forwardCGLimit: 158,
            aftCGLimit: 336,
            pilot1Arm: -616,
            distanceFrontWheelToDatum: 120,
            distanceFrontWheelToRearWheel: 3648,
            baggageArms: [40, 950],
            cockpitBallastBlockArms: [ -1190, -1140],
            fuselageFuelArms: [ 400,421 ]
        };

        const result = exportDatumToCSV([JANTAR_DATUM]);
        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(2);
        expect(result[1].startsWith(JANTAR_DATUM.typeCertificateId)).toBeTruthy();
        expect(result[1]).toBe('SZD481,utility,15,TN 38-01,WRLE,flat,model_1,535,385,245,110,70,120,158,336,-616,,,-1190:-1140,,,,,40:950,,400:421,,,,120,3648');
    });

});