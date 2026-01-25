import { BallastBlockCapacity, loadAircraftConfigFromCSV, SeatingConfiguration, TailBallastType, UndercarriageConfiguration } from "../../src/index";

describe("configuration-loader", () => {
    describe("happy path", () => {
        it("Doesn't fail on an empty file", async () => {
            const result = await loadAircraftConfigFromCSV("tests/configuration/data/empty_data.csv");    

            expect(result.length).toBe(0);
        });

        it("loads a basic, correct file", async () => {
            const result = await loadAircraftConfigFromCSV("tests/configuration/data/single_complete_row.csv");    

            expect(result.length).toBe(1);

            const entry = result[0];
            expect(entry.typeCertificateId).toBe("SZD 48-1");
            expect(entry.wingspanOptions[0]).toBe(15);
            expect(entry.hasFlaps).toBeFalsy();
            expect(entry.hasElevatorTrim).toBeFalsy();
            expect(entry.hasRudderVators).toBeFalsy();
            expect(entry.hasFixedUndercarriage).toBeFalsy();
            expect(entry.undercarriageType).toBe(UndercarriageConfiguration.INLINE);
            expect(entry.seatingType).toBe(SeatingConfiguration.SINGLE);
            expect(entry.fuselageMaxBallastAmount).toBeUndefined();
            expect(entry.wingMaxBallastAmount).toBe(150);
            expect(entry.tailWingBallastCompensationAmount).toBeUndefined();
            expect(entry.tailCGAdjustBallastType).toBe(TailBallastType.NONE);
            expect(entry.tailCGAdjustBallastCapacity).toBeFalsy();
            expect(entry.wingPanelCount).toBe(2);
            expect(entry.hasWingletOption).toBeFalsy();
            expect(entry.cockpitBallastBlockCount).toBe(0);
            expect(entry.cockpitBallastWeightPerBlock).toBeFalsy();
            expect(entry.fuselageFuelAmount).toBe(20.5);
        });

        it("Alternate versions of true/false", async () => {
            const result = await loadAircraftConfigFromCSV("tests/configuration/data/true-false-variations.csv");    

            expect(result.length).toBe(1);

            const entry = result[0];
            expect(entry.typeCertificateId).toBe("SZD 48-1");
            expect(entry.hasFlaps).toBeFalsy();
            expect(entry.hasElevatorTrim).toBeTruthy();
            expect(entry.hasRudderVators).toBeTruthy();
            expect(entry.hasFixedUndercarriage).toBeTruthy();
            expect(entry.hasWingletOption).toBeFalsy();
        });

        it("Loads tail block definitions", async () => {
            const result = await loadAircraftConfigFromCSV("tests/configuration/data/tail_blocks.csv");    

            expect(result.length).toBe(1);

            const entry = result[0];
            expect(entry.typeCertificateId).toBe("DG1000S");
            expect(entry.tailCGAdjustBallastType).toBe(TailBallastType.BLOCKS);
            expect(entry.tailCGAdjustBallastCapacity).toBeDefined();

            expect(Array.isArray(entry.tailCGAdjustBallastCapacity)).toBeTruthy();
            const cap = entry.tailCGAdjustBallastCapacity as BallastBlockCapacity[];

            expect(cap.length).toBe(1);
            expect(cap[0].label).toBe("large");
            expect(cap[0].weightPerBlock).toBe(2.4);
            expect(cap[0].maxBlockCount).toBe(4);
        });
    });

    describe("Error handling", () => {
        it("Ignores invalid enums", async () => {
            const result = await loadAircraftConfigFromCSV("tests/configuration/data/invalid_enums.csv");    

            expect(result.length).toBe(1);

            const entry = result[0];
            expect(entry.typeCertificateId).toBe("SZD 48-1");

            expect(entry.undercarriageType).toBeFalsy();
            expect(entry.seatingType).toBeFalsy();
            expect(entry.tailCGAdjustBallastType).toBeFalsy();
        });

        it("Handles incomplete tail block definitions", async () => {
            const result = await loadAircraftConfigFromCSV("tests/configuration/data/invalid_tail_blocks.csv");    

            expect(result.length).toBe(3);

            let entry = result[0];
            expect(entry.tailCGAdjustBallastType).toBe(TailBallastType.BLOCKS);
            expect(entry.tailCGAdjustBallastCapacity).toBeDefined();

            expect(Array.isArray(entry.tailCGAdjustBallastCapacity)).toBeTruthy();
            let cap = entry.tailCGAdjustBallastCapacity as BallastBlockCapacity[];

            expect(cap.length).toBe(0);

            entry = result[1];
            expect(entry.tailCGAdjustBallastType).toBe(TailBallastType.BLOCKS);
            expect(entry.tailCGAdjustBallastCapacity).toBeDefined();

            expect(Array.isArray(entry.tailCGAdjustBallastCapacity)).toBeTruthy();
            cap = entry.tailCGAdjustBallastCapacity as BallastBlockCapacity[];

            expect(cap.length).toBe(1);

            entry = result[2];
            expect(entry.tailCGAdjustBallastType).toBe(TailBallastType.BLOCKS);
            expect(entry.tailCGAdjustBallastCapacity).toBeDefined();

            expect(Array.isArray(entry.tailCGAdjustBallastCapacity)).toBeTruthy();
            cap = entry.tailCGAdjustBallastCapacity as BallastBlockCapacity[];

            expect(cap.length).toBe(0);
        });
    })
})