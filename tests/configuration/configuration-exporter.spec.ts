import { AircraftConfiguration, exportAircraftConfigToCSV, SeatingConfiguration, TailBallastType, UndercarriageConfiguration } from "../../src";

describe("Configuration export", () => {
    it("exports a header-only output", () => {
        const result = exportAircraftConfigToCSV([]);

        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].toLowerCase()).toBe('type certificate,wingspan options,flaps,trim,ruddervator,fixed uc,uc type,seat type,fuselage max ballast,wings max ballast,tail ballast type,tail ballast capacity,tail wing compensation max ballast,wing panel count,winglets,cockpit ballast count,cockpit ballast block weight');
    });

    it("exports a single line file", () => {
        const JANTAR_CONFIG: AircraftConfiguration = {
            typeCertificateId: "SZD481",
            wingspanOptions: [15],
            hasFlaps: false,
            hasElevatorTrim: false,
            hasRudderVators: false,
            hasFixedUndercarriage: false,
            undercarriageType: UndercarriageConfiguration.INLINE,
            seatingType: SeatingConfiguration.SINGLE,
            wingPanelCount: 2,
            hasWingletOption: false,
            wingMaxBallastAmount: 150,
            cockpitBallastBlockCount: 0,
            tailCGAdjustBallastType: TailBallastType.NONE,
            tailCGAdjustBallastCapacity: null
        };

        const result = exportAircraftConfigToCSV([JANTAR_CONFIG]);

        expect(result).toBeTruthy();
        expect(result.length).toBe(2);
        expect(result[1].startsWith(JANTAR_CONFIG.typeCertificateId)).toBeTruthy();
        expect(result[1]).toBe("SZD481,15,false,false,false,false,inline,single,,150,none,,,2,false,0,");
    });

    it("Floating point number formatting", () => {
        const LS6_CONFIG: AircraftConfiguration = {
            typeCertificateId: "LS6C",
            wingspanOptions: [15,17.6],
            hasFlaps: true,
            hasElevatorTrim: false,
            hasRudderVators: false,
            hasFixedUndercarriage: false,
            undercarriageType: UndercarriageConfiguration.INLINE,
            seatingType: SeatingConfiguration.SINGLE,
            wingPanelCount: 4,
            hasWingletOption: false,
            wingMaxBallastAmount: 140,
            cockpitBallastBlockCount: 0,
            tailCGAdjustBallastType: TailBallastType.NONE,
            tailCGAdjustBallastCapacity: null
        };

        const result = exportAircraftConfigToCSV([LS6_CONFIG]);

        expect(result).toBeTruthy();
        expect(result.length).toBe(2);
        expect(result[1].startsWith(LS6_CONFIG.typeCertificateId)).toBeTruthy();
        expect(result[1]).toBe("LS6C,15:17.6,true,false,false,false,inline,single,,140,none,,,4,false,0,");
    });

    describe("Tail CG ballast options", () => {
        it("Water", () => {
            const DG1000_CONFIG: AircraftConfiguration = {
                typeCertificateId: "DG1000S",
                wingspanOptions: [18,20],
                hasFlaps: false,
                hasElevatorTrim: false,
                hasRudderVators: false,
                hasFixedUndercarriage: false,
                undercarriageType: UndercarriageConfiguration.INLINE,
                seatingType: SeatingConfiguration.TANDEM,
                wingPanelCount: 4,
                hasWingletOption: false,
                wingMaxBallastAmount: 160,
                cockpitBallastBlockCount: 0,
                tailCGAdjustBallastType: TailBallastType.WATER,
                tailCGAdjustBallastCapacity: 5.5
            };

            const result = exportAircraftConfigToCSV([DG1000_CONFIG]);

            expect(result).toBeTruthy();
            expect(result.length).toBe(2);
            expect(result[1].startsWith(DG1000_CONFIG.typeCertificateId)).toBeTruthy();
            expect(result[1]).toBe("DG1000S,18:20,false,false,false,false,inline,tandem,,160,water,5.5,,4,false,0,");
        });

        it("Single tail block", () => {
            const DG1000_CONFIG: AircraftConfiguration = {
                typeCertificateId: "DG1000S",
                wingspanOptions: [18,20],
                hasFlaps: false,
                hasElevatorTrim: false,
                hasRudderVators: false,
                hasFixedUndercarriage: false,
                undercarriageType: UndercarriageConfiguration.INLINE,
                seatingType: SeatingConfiguration.TANDEM,
                wingPanelCount: 4,
                hasWingletOption: false,
                wingMaxBallastAmount: 160,
                cockpitBallastBlockCount: 0,
                tailCGAdjustBallastType: TailBallastType.BLOCKS,
                tailCGAdjustBallastCapacity: [ { label: "small", weightPerBlock: 2, maxBlockCount: 4} ]
            };

            const result = exportAircraftConfigToCSV([DG1000_CONFIG]);

            expect(result).toBeTruthy();
            expect(result.length).toBe(2);
            expect(result[1].startsWith(DG1000_CONFIG.typeCertificateId)).toBeTruthy();
            expect(result[1]).toBe("DG1000S,18:20,false,false,false,false,inline,tandem,,160,blocks,small:2:4,,4,false,0,");
        });

        it("Multiple tail blocks", () => {
            const DG1000_CONFIG: AircraftConfiguration = {
                typeCertificateId: "DG1000S",
                wingspanOptions: [18,20],
                hasFlaps: false,
                hasElevatorTrim: false,
                hasRudderVators: false,
                hasFixedUndercarriage: false,
                undercarriageType: UndercarriageConfiguration.INLINE,
                seatingType: SeatingConfiguration.TANDEM,
                wingPanelCount: 4,
                hasWingletOption: false,
                wingMaxBallastAmount: 160,
                cockpitBallastBlockCount: 0,
                tailCGAdjustBallastType: TailBallastType.BLOCKS,
                tailCGAdjustBallastCapacity: [ { label: "large", weightPerBlock: 2, maxBlockCount: 4}, { label: "small", maxBlockCount: 2, weightPerBlock: 1} ]
            };

            const result = exportAircraftConfigToCSV([DG1000_CONFIG]);

            expect(result).toBeTruthy();
            expect(result.length).toBe(2);
            expect(result[1].startsWith(DG1000_CONFIG.typeCertificateId)).toBeTruthy();
            expect(result[1]).toBe("DG1000S,18:20,false,false,false,false,inline,tandem,,160,blocks,large:2:4:small:1:2,,4,false,0,");
        });

    })
});