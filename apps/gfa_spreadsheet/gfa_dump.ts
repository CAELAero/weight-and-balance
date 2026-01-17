import { writeFileSync } from "fs";
import { exportDatumToCSV } from "../../src";
import { loadGFASpreadsheet } from "./gfa_file_reader";

import yargs from "yargs";

const options = yargs(process.argv.slice(2))
 .usage("Usage: -src <source-file-path> -dest <dest-file-path>")
    .options({
        src: { alias: "source-file-path", describe: "Path to the GFA source file", type: "string", demandOption: true },
        dest: { alias: "dest-file-path", describe: "Path to the output file", type: "string", demandOption: true }
    })
 .parseSync();

const source_data = await loadGFASpreadsheet(options.src);

const data_for_output = exportDatumToCSV(source_data);

try {
    writeFileSync(options.dest, data_for_output.join("\n"));
} catch(err) {
    console.log("Failed to write file: ", err);
}
