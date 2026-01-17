import { Sheet2JSONOpts, WorkBook, utils } from "xlsx";

import { DatumCalculationModel, encodeTypeCertificateId, reverseCalculationModelMap, WeightAndBalanceDatum } from "../../src";
import { readInput, parseString, parseInt } from "../../src/util/parse-utils";

// GFA spreadsheet has following column names:
// 0 Type
// 1 "Wet Kg"
// 2 "Dry Kg"
// 3 "Non lift Kg"
// 4 "CG fwd mm"	
// 5 "CG aft mm"
// 6 "Pilot P1 arm mm"
// 7 "Ballast arm mm"	
// 8 "Water Ltrs"	
// 9 Smooth air Kts
// 10 Rough air Kts
// 11 Maneuv sp Kts
// 12 "Aerotow Kts"
// 13 "Winch Kts"	
// 14 Weak link Kg	
// 15 "Issue date"	
// 16 P2 moment
// 17 Datum
// 18 Level
// 19 Model
// 20 Fuse fuel Moment
// 21 Tail Ballast Moment
// 22 Wing fuel moment
// 23 Wing water moment	

// The last 4 column names say "moment" but it appears they're arm distances in mm since that
// seems to match other sources of data

export async function loadGFASpreadsheet(source: string): Promise<WeightAndBalanceDatum[]> {
    if (!source) {
        throw new Error("No source given to parse");
    }

    const workbook: WorkBook = await readInput(source);

    const loaded_data = workbook.Sheets["Aircraft Data"];

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
        try{
            const type_cert_id = encodeTypeCertificateId(parseString(row[0]));
            const mauw = parseInt(row[1]);
            const mdry = parseInt(row[2]);
            const mnlp = parseInt(row[3]);
            const fwd_cg = parseInt(row[4]);
            const aft_cg = parseInt(row[5]);
            const p1_arm = parseInt(row[6]);
            const cockpit_arm = parseInt(row[7]);
            const p2_arm = parseInt(row[16]);
            const location = parseString(row[17]);
            const levelling = parseString(row[18]);
            const model = reverseCalculationModelMap.get("model_" + parseInt(row[19])) || DatumCalculationModel.MODEL_1;
            const fuselage_fuel_arm = parseInt(row[20]);            
            const tail_arm = parseInt(row[21]);
            const wing_fuel_arm = parseInt(row[22]);
            const wing_water_arm = parseInt(row[23]);

            const obj: WeightAndBalanceDatum = {
                typeCertificateId: type_cert_id,
                location: location,
                levellingInstructions: levelling,
                calculationModel: model,
                maxAllUpWeight: mauw,
                //                maxAllUpWeightAlternateSpan: undefined,
                maxDryWeight: mdry,
                maxNonLiftingPartsWeight: mnlp,
                maxSeatWeight: 0,
                minAllowedPilotWeight: 0,
                forwardCGLimit: fwd_cg,
                aftCGLimit: aft_cg,
                pilot1Arm: p1_arm,
                //                pilot1ArmMax: undefined,
                pilot2Arm: p2_arm,
                cockpitBallastBlockArm: cockpit_arm,
                tailBallastArm: tail_arm,
                distanceFrontWheelToDatum: 0,
                distanceFrontWheelToRearWheel: 0
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
