import { AircraftConfiguration, exportAircraftConfigToCSV, SeatingConfiguration, TailBallastType, UndercarriageConfiguration } from "../../src";

describe("Configuration export", () => {
    it("exports a header-only output", () => {
        const result = exportAircraftConfigToCSV([]);

        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(1);
        expect(result[0].toLowerCase()).toBe('type certificate,flaps,trim,ruddervator,fixed uc,uc type,seat type,fuselage max ballast,wings max ballast,tail ballast type,tail ballast capacity,tail wing compensation max ballast,winspan primary,wingspan alternate,wing panel count,winglets,cockpit ballast count,cockpit ballast block weight');
    });

    it("exports a single line file", () => {
        const JANTAR_CONFIG: AircraftConfiguration = {
            typeCertificateId: "SZD481",
            hasFlaps: false,
            hasElevatorTrim: false,
            hasRudderVators: false,
            hasFixedUndercarriage: false,
            undercarriageType: UndercarriageConfiguration.INLINE,
            seatingType: SeatingConfiguration.SINGLE,
            wingSpanPrimary: 15,
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
        expect(result[1]).toBe("SZD481,false,false,false,false,inline,single,,150,none,,,15,,2,false,,");
    });

    it("Floating point number formatting", () => {
        const LS6_CONFIG: AircraftConfiguration = {
            typeCertificateId: "LS6C",
            hasFlaps: true,
            hasElevatorTrim: false,
            hasRudderVators: false,
            hasFixedUndercarriage: false,
            undercarriageType: UndercarriageConfiguration.INLINE,
            seatingType: SeatingConfiguration.SINGLE,
            wingSpanPrimary: 15,
            wingSpanAlternate: 17.6,
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
        expect(result[1]).toBe("LS6C,true,false,false,false,inline,single,,140,none,,,15,17.6,4,false,,");
    });

    describe("Tail CG ballast options", () => {
        it("Water", () => {
            const DG1000_CONFIG: AircraftConfiguration = {
                typeCertificateId: "DG1000S",
                hasFlaps: false,
                hasElevatorTrim: false,
                hasRudderVators: false,
                hasFixedUndercarriage: false,
                undercarriageType: UndercarriageConfiguration.INLINE,
                seatingType: SeatingConfiguration.TANDEM,
                wingSpanPrimary: 18,
                wingSpanAlternate: 20,
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
            expect(result[1]).toBe("DG1000S,false,false,false,false,inline,tandem,,160,water,5.5,,18,20,4,false,,");
        });

        it("Single tail block", () => {
            const DG1000_CONFIG: AircraftConfiguration = {
                typeCertificateId: "DG1000S",
                hasFlaps: false,
                hasElevatorTrim: false,
                hasRudderVators: false,
                hasFixedUndercarriage: false,
                undercarriageType: UndercarriageConfiguration.INLINE,
                seatingType: SeatingConfiguration.TANDEM,
                wingSpanPrimary: 18,
                wingSpanAlternate: 20,
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
            expect(result[1]).toBe("DG1000S,false,false,false,false,inline,tandem,,160,blocks,small:2:4,,18,20,4,false,,");
        });

        it("Multiple tail blocks", () => {
            const DG1000_CONFIG: AircraftConfiguration = {
                typeCertificateId: "DG1000S",
                hasFlaps: false,
                hasElevatorTrim: false,
                hasRudderVators: false,
                hasFixedUndercarriage: false,
                undercarriageType: UndercarriageConfiguration.INLINE,
                seatingType: SeatingConfiguration.TANDEM,
                wingSpanPrimary: 18,
                wingSpanAlternate: 20,
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
            expect(result[1]).toBe("DG1000S,false,false,false,false,inline,tandem,,160,blocks,large:2:4:small:1:2,,18,20,4,false,,");
        });

    })
});