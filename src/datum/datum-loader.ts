import { Readable } from "stream";

import { Sheet2JSONOpts, WorkBook, utils } from "xlsx";

import { reverseCalculationModelMap, WeightAndBalanceDatum } from "./datum";
import { parseString, parseInt, readInput } from "../util/parse-utils";
import { reverseCertificationCategoryMap } from "..";

export async function loadDatumFromCSV(
    source: string | Readable | ReadableStream | Blob,
): Promise<WeightAndBalanceDatum[]> {
    if (!source) {
        throw new Error("No source given to parse");
    }

    const workbook: WorkBook = await readInput(source);
    const loaded_data = workbook.Sheets[workbook.SheetNames[0]];

    // Could we find the data? undefined or null here if not. Throw error
    const conv_opts: Sheet2JSONOpts = {
        header: 1,
        blankrows: false,
        range: 1,
        UTC: true,
        dateNF: "yyyy-mm-dd",
        raw: false,
    };

    const sheet_data: any[][] = utils.sheet_to_json(loaded_data, conv_opts);

    const retval: WeightAndBalanceDatum[] = [];

    sheet_data.forEach((row) => {
        try {
            const type_cert_id = parseString(row[0]);
            const category = reverseCertificationCategoryMap.get(parseString(row[1]));
            const wingspan = parseFloat(row[2]);
            const variation = parseString(row[3]);
            const location = parseString(row[4]);
            const levelling = parseString(row[5]);
            const model = reverseCalculationModelMap.get(parseString(row[6]));
            const mauw = parseInt(row[7]);
            const mdry = parseInt(row[8]);
            const mnlp = parseInt(row[9]);
            const max_seat = parseInt(row[10]);
            const min_seat = parseInt(row[11]);
            const fwd_cg = parseInt(row[12]);
            const rear_cg = parseInt(row[13]);
            const p1_arm = parseInt(row[14]);
            const p1_arm_alt = parseInt(row[15]);
            const p2_arm = parseInt(row[16]);
            const cockpit_arm = parseInt(row[17]);
            const tail_ballast_arm = parseInt(row[18]);
            const tail_battery_arm = parseInt(row[19]);
            const wing_ballast_arm = parseInt(row[20]);
            const baggage_arm = parseInt(row[21]);
            const wing_fuel_arm = parseInt(row[22]);
            const fuse_fuel_arm = parseInt(row[23]);
            const front_wheel = parseInt(row[24]);
            const wheel_to_wheel = parseInt(row[25]);

            const obj: WeightAndBalanceDatum = {
                typeCertificateId: type_cert_id,
                category: category,
                wingspan: wingspan,
                variation: variation,
                location: location,
                levellingInstructions: levelling,
                calculationModel: model,
                maxAllUpWeight: mauw,
                maxDryWeight: mdry,
                maxNonLiftingPartsWeight: mnlp,
                maxSeatWeight: max_seat,
                minAllowedPilotWeight: min_seat,
                forwardCGLimit: fwd_cg,
                aftCGLimit: rear_cg,
                pilot1Arm: p1_arm,
                pilot1ArmMax: p1_arm_alt,
                pilot2Arm: p2_arm,
                cockpitBallastBlockArm: cockpit_arm,
                tailBallastArm: tail_ballast_arm,
                tailBatteryArm: tail_battery_arm,
                wingBallastArm: wing_ballast_arm,
                wingFuelArm: wing_fuel_arm,
                baggageArm: baggage_arm,
                fuselageFuelArm: fuse_fuel_arm,
                distanceFrontWheelToDatum: front_wheel,
                distanceFrontWheelToRearWheel: wheel_to_wheel,
            };

            retval.push(obj);
        } catch (error) {
            // Should never get here since the above parsing is quite forgiving. Likely this is due
            // to a stream or other interrupt error.
            const row_str = "[ " + row.join(",") + " ]";
            if (error instanceof Error) {
                console.error(`Error reading row ${row_str} due to ${error.message}`, error);
            } else {
                console.error(`Unexpected row error object found on row ${row_str}`, error);
            }
        }
    });

    return retval;
}
