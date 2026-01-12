import { Readable } from "stream";

import { Sheet2JSONOpts, WorkBook, utils } from "xlsx";

import { reverseCalculationModelMap, WeightAndBalanceDatum } from "./datum";
import { parseString, parseInt, readInput } from "../util/parse-utils";

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
            const location = parseString(row[1]);
            const levelling = parseString(row[2]);
            const model = reverseCalculationModelMap.get(parseString(row[3]));
            const mauw = parseInt(row[4]);
            const mauw_alt = parseInt(row[5]);
            const mdry = parseInt(row[6]);
            const mnlp = parseInt(row[7]);
            const max_seat = parseInt(row[8]);
            const min_seat = parseInt(row[9]);
            const fwd_cg = parseInt(row[10]);
            const rear_cg = parseInt(row[11]);
            const p1_arm = parseInt(row[12]);
            const p1_arm_alt = parseInt(row[13]);
            const p2_arm = parseInt(row[14]);
            const cockpit_arm = parseInt(row[15]);
            const tail_arm = parseInt(row[16]);
            const front_wheel = parseInt(row[17]);
            const wheel_to_wheel = parseInt(row[18]);

            const obj: WeightAndBalanceDatum = {
                typeCertificateId: type_cert_id,
                location: location,
                levellingInstructions: levelling,
                calculationModel: model,
                maxAllUpWeight: mauw,
                maxAllUpWeightAlternateSpan: mauw_alt,
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
                tailBallastArm: tail_arm,
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
