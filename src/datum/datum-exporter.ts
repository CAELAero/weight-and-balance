import { convertFloatToString, convertIntToString, convertIntArrayToString, escapeString } from "../util/export-utils";
import { WeightAndBalanceDatum } from "./datum";

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
    "max cockpit",
    "fwd cg",
    "aft cg",
    "p1arm",
    "p1arm max",
    "p2arm",
    "cockpit ballast arm",
    "tail wing ballast arm",
    "tail cg ballast arm",
    "tail battery arm",
    "wing ballast arm",
    "baggage arm",
    "wing fuel arm",
    "fuselage fuel arm",
    "fuselage battery arm",
    "p1 instrument arm",
    "p2 instrument arm",
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
        row.push(convertIntToString(data.maxCockpitWeight));
        row.push(convertIntToString(data.forwardCGLimit));
        row.push(convertIntToString(data.aftCGLimit));
        row.push(convertIntToString(data.pilot1Arm));
        row.push(convertIntToString(data.pilot1ArmMax));
        row.push(convertIntToString(data.pilot2Arm));
        row.push(convertIntArrayToString(data.cockpitBallastBlockArms));
        row.push(convertIntToString(data.tailWingBallastCompensationArm));
        row.push(convertIntToString(data.tailCGAdjustBallastArm));
        row.push(convertIntToString(data.tailBatteryArm));
        row.push(convertIntToString(data.wingBallastArm));
        row.push(convertIntArrayToString(data.baggageArms));
        row.push(convertIntToString(data.wingFuelArm));
        row.push(convertIntArrayToString(data.fuselageFuelArms));
        row.push(convertIntToString(data.fuselageBatteryArm));
        row.push(convertIntToString(data.p1InstrumentPanelArm));
        row.push(convertIntToString(data.p2InstrumentPanelArm));
        row.push(convertIntToString(data.distanceFrontWheelToDatum));
        row.push(convertIntToString(data.distanceFrontWheelToRearWheel));

        retval.push(row.join(","));
    });

    return retval;
}
