import { DatumCalculationModel, loadDatumFromCSV } from "../../src";

describe("Datum loader", () => {
    describe("Happy path", () => {
        it("Doesn't fail on an empty file", async () => {
            const result = await loadDatumFromCSV("tests/datum/data/empty_data.csv");    

            expect(result.length).toBe(0);
        });

        it("Loads a single  row for basic single seater", async () => {
            const result = await loadDatumFromCSV("tests/datum/data/single_basic_row.csv");    

            expect(result.length).toBe(1);

            const entry = result[0];
            expect(entry.typeCertificateId).toBe("SZD481");
            expect(entry.location).toBeTruthy();
            expect(entry.levellingInstructions).toBeTruthy();
            expect(entry.calculationModel).toBe(DatumCalculationModel.MODEL_1);
            expect(entry.maxAllUpWeight).toBe(535);
            expect(entry.maxDryWeight).toBe(385);
            expect(entry.maxNonLiftingPartsWeight).toBe(245);
            expect(entry.maxSeatWeight).toBe(110);
            expect(entry.minAllowedPilotWeight).toBe(70);
            expect(entry.forwardCGLimit).toBe(158);
            expect(entry.aftCGLimit).toBe(336);
            expect(entry.pilot1Arm).toBe(-616);
            expect(entry.pilot1ArmMax).toBeUndefined();
            expect(entry.pilot2Arm).toBeUndefined();
            expect(entry.cockpitBallastBlockArm).toBeUndefined();
            expect(entry.tailBallastArm).toBeUndefined();
            expect(entry.fuselageFuelArm).toBeUndefined();
            expect(entry.distanceFrontWheelToDatum).toBe(120);
            expect(entry.distanceFrontWheelToRearWheel).toBe(3648);
        });

        it("Loads a single row for a complex two  seater", async () => {
            const result = await loadDatumFromCSV("tests/datum/data/single_complete_row.csv");    

            expect(result.length).toBe(1);

            const entry = result[0];
            expect(entry.typeCertificateId).toBe("DG1000S");
            expect(entry.location).toBeTruthy();
            expect(entry.levellingInstructions).toBeTruthy();
            expect(entry.calculationModel).toBe(DatumCalculationModel.MODEL_1);
            expect(entry.maxAllUpWeight).toBe(750);
            expect(entry.maxDryWeight).toBe(630);
            expect(entry.maxNonLiftingPartsWeight).toBe(469);
            expect(entry.maxSeatWeight).toBe(110);
            expect(entry.minAllowedPilotWeight).toBe(70);
            expect(entry.forwardCGLimit).toBe(190);
            expect(entry.aftCGLimit).toBe(440);
            expect(entry.pilot1Arm).toBe(-1250);
            expect(entry.pilot1ArmMax).toBe(-1350);
            expect(entry.pilot2Arm).toBe(-272);
            expect(entry.cockpitBallastBlockArm).toBe(-1960);
            expect(entry.tailBallastArm).toBe(5400);
            expect(entry.fuselageFuelArm).toBe(-300);
            expect(entry.distanceFrontWheelToDatum).toBe(114);
            expect(entry.distanceFrontWheelToRearWheel).toBe(5189);
        });
    });

    describe("Error Handling", () => {
        it("Ignores invalid enums", async () => {
            const result = await loadDatumFromCSV("tests/datum/data/invalid_enums.csv");    

            expect(result.length).toBe(1);
            expect(result[0].calculationModel).toBeUndefined();
        });
    });
});