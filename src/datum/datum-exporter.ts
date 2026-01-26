import { WeightAndBalanceDatum } from "./datum";

const FLOAT_FORMAT = new Intl.NumberFormat("en-IN", { maximumSignificantDigits: 3 });

const HEADER = [
    "type certificate",
    "category",
    "wingspan",
    "variation",
    "location",
    "levelling instructions",
    "model",
    "mauw",
    "mdry",
    "mnlp",
    "max seat",
    "min pilot",
    "fwd cg",
    "aft cg",
    "p1arm",
    "p1arm max",
    "p2arm",
    "cockpit ballast arm",
    "tail ballast arm",
    "tail battery arm",
    "wing ballast arm",
    "baggage arm",
    "wing fuel arm",
    "fuselage fuel arm",
    "wheel to datum",
    "wheel to tailwheel",
];

export function exportDatumToCSV(configs: WeightAndBalanceDatum[]): string[] {
    const retval: string[] = [];

    retval.push(HEADER.join(","));

    configs.forEach((data) => {
        const row: string[] = [];

        row.push(data.typeCertificateId);
        row.push(data.category);
        row.push(convertFloatToString(data.wingspan));
        row.push(escapeString(data.variation));
        row.push(escapeString(data.location));
        row.push(escapeString(data.levellingInstructions));
        row.push(data.calculationModel);
        row.push(convertIntToString(data.maxAllUpWeight));
        row.push(convertIntToString(data.maxDryWeight));
        row.push(convertIntToString(data.maxNonLiftingPartsWeight));
        row.push(convertIntToString(data.maxSeatWeight));
        row.push(convertIntToString(data.minAllowedPilotWeight));
        row.push(convertIntToString(data.forwardCGLimit));
        row.push(convertIntToString(data.aftCGLimit));
        row.push(convertIntToString(data.pilot1Arm));
        row.push(convertIntToString(data.pilot1ArmMax));
        row.push(convertIntToString(data.pilot2Arm));
        row.push(convertIntToString(data.cockpitBallastBlockArm));
        row.push(convertIntToString(data.tailBallastArm));
        row.push(convertIntToString(data.tailBatteryArm));
        row.push(convertIntToString(data.wingBallastArm));
        row.push(convertIntToString(data.baggageArm));
        row.push(convertIntToString(data.wingFuelArm));
        row.push(convertIntToString(data.fuselageFuelArm));
        row.push(convertIntToString(data.distanceFrontWheelToDatum));
        row.push(convertIntToString(data.distanceFrontWheelToRearWheel));

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

function escapeString(src: string): string {
    if (src && src.indexOf(",") != -1) {
        return '"' + src + '"';
    } else {
        return src;
    }
}
