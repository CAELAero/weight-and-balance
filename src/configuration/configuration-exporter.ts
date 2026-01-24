import { AircraftConfiguration, BallastBlockCapacity, TailBallastType } from "./aircraft-configuration";

const HEADER = [
    "type certificate",
    "wingspan options",
    "flaps",
    "trim",
    "ruddervator",
    "fixed uc",
    "uc type",
    "seat type",
    "fuselage max ballast",
    "wings max ballast",
    "tail ballast type",
    "tail ballast capacity",
    "tail wing compensation max ballast",
    "wing panel count",
    "winglets",
    "cockpit ballast count",
    "cockpit ballast block weight",
];

const FLOAT_FORMAT = new Intl.NumberFormat("en-IN", { maximumSignificantDigits: 3 });

export function exportAircraftConfigToCSV(configs: AircraftConfiguration[]): string[] {
    const retval: string[] = [];

    retval.push(HEADER.join(","));

    configs.forEach((data) => {
        const row: string[] = [];

        // order is important here, to match the header.
        row.push(data.typeCertificateId);
        let options: string[] = [];
        data.wingspanOptions.forEach(val => {
            options.push(convertFloatToString(val));
        });

        row.push(options.join(":"));

        row.push(data.hasFlaps.toString());
        row.push(data.hasElevatorTrim.toString());
        row.push(data.hasRudderVators.toString());
        row.push(data.hasFixedUndercarriage.toString());
        row.push(data.undercarriageType.toString());
        row.push(data.seatingType.toString());
        row.push(convertIntToString(data.fuselageMaxBallastAmount));
        row.push(convertIntToString(data.wingMaxBallastAmount));
        row.push(data.tailCGAdjustBallastType.toString());

        switch (data.tailCGAdjustBallastType) {
            case TailBallastType.NONE:
                row.push("");
                break;

            case TailBallastType.WATER:
                row.push(convertFloatToString(data.tailCGAdjustBallastCapacity as number));
                break;

            case TailBallastType.BLOCKS:
                const blocks = data.tailCGAdjustBallastCapacity as BallastBlockCapacity[];
                const output: string[] = [];

                blocks.forEach((b) => {
                    output.push(b.label);
                    output.push(convertFloatToString(b.weightPerBlock));
                    output.push(convertIntToString(b.maxBlockCount));
                });

                row.push(output.join(":"));
                break;
        }

        row.push(convertFloatToString(data.tailWingBallastCompensationAmount));
        row.push(convertIntToString(data.wingPanelCount));
        row.push(data.hasWingletOption.toString());
        row.push(convertIntToString(data.cockpitBallastBlockCount));
        row.push(convertFloatToString(data.cockpitBallastWeightPerBlock));

        retval.push(row.join(","));
    });

    return retval;
}

function convertIntToString(src?: number): string {
    return src != undefined && src != null ? src.toFixed(0) : "";
}

function convertFloatToString(src?: number): string {
    return src != undefined && src != null ? FLOAT_FORMAT.format(src) : "";
}
