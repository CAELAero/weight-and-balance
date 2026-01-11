import { Readable } from "stream";

import { AircraftConfiguration, exportAircraftConfigToCSV, loadAircraftConfigFromCSV, SeatingConfiguration, TailBallastType, UndercarriageConfiguration } from "../../src";

describe("Round trip datum import/export", () => {
    it("Handles simple import/export", async () => {
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

        const output = exportAircraftConfigToCSV([JANTAR_CONFIG]);
        const input = new Readable();
        input.push(output.join("\n"));
        input.push(null);

        const parsed = await loadAircraftConfigFromCSV(input);

        expect(parsed.length).toBe(1);
        expect(parsed[0]).toMatchObject(JANTAR_CONFIG);

    });
});