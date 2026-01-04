import { Readable } from 'stream';

import { ParsingOptions, Sheet2JSONOpts, WorkBook, utils, readFile, read } from 'xlsx';

import { 
    AircraftConfiguration, 
    reverseSeatingConfigurationMap, 
    reverseUndercarriageConfigurationMap, 
    reverseTailBallastTypeMap, 
    TailBallastType, 
    BallastBlockCapacity
} from "./aircraft-configuration";

const BOOLEAN_TRUE_MAP = new Set();
BOOLEAN_TRUE_MAP.add("true");
BOOLEAN_TRUE_MAP.add("yes");

export async function loadAircraftConfigFromCSV (source: string | Readable | ReadableStream | Blob) : Promise<AircraftConfiguration[]> {
    if (!source) {
        throw new Error('No source given to parse');
    }

    const workbook: WorkBook = await readInput(source);
    const loaded_data = workbook.Sheets[workbook.SheetNames[0]];

    // Could we find the data? undefined or null here if not. Throw error
    const conv_opts: Sheet2JSONOpts = {
        header: 1,
        blankrows: false,
        range: 1,
        UTC: true,
        dateNF: 'yyyy-mm-dd',
        raw: false,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sheet_data: any[][] = utils.sheet_to_json(loaded_data, conv_opts);

    const retval: AircraftConfiguration[] = [];

    sheet_data.forEach((row) => {

        try {
            const type_cert_id = parseString(row[0]);
            const flaps = parseBoolean(row[1]);
            const trim = parseBoolean(row[2]);
            const ruddervator = parseBoolean(row[3]);
            const fixed_uc = parseBoolean(row[4]);

            const uc_type = reverseUndercarriageConfigurationMap.get(parseString(row[5])?.toLowerCase());
            const seat_type = reverseSeatingConfigurationMap.get(parseString(row[6])?.toLowerCase());

            const fuse_max_ballast = parseInt(row[7]);
            const wing_max_ballast = parseInt(row[8]);
            const tail_ballast_type = reverseTailBallastTypeMap.get(parseString(row[9])?.toLowerCase());


            let tail_cap = null;
            
            switch(tail_ballast_type) {
                case TailBallastType.WATER:
                    tail_cap = parseFloat(row[10]);
                    break;
                
                case TailBallastType.BLOCKS:
                    // use a colon separated list, in blocks of 3. Really needs JSON here, but mixing
                    // JSON with CSV is just ugly, so we go for a slightly less ugly version.
                    let raw = parseString(row[10]);
                    const parts = raw?.split(':');
                    const block_defs: BallastBlockCapacity[] = [];
                    const num_blocks = Math.floor(parts?.length / 3);

                    for(let i = 0; i < num_blocks * 3; i+= 3) {
                        const block: BallastBlockCapacity = {
                            label: parts[i],
                            weightPerBlock: parseFloat(parts[i + 1]),
                            maxBlockCount: parseInt(parts[i + 2])
                        }

                        block_defs.push(block);
                    }                    
                    tail_cap = block_defs;
                    break;
            
                //defaut:
                    // do nothing            
            }

            const wing_comp_ballast = parseInt(row[11]);
            const span_primary = parseFloat(row[12]);
            const span_alt = parseFloat(row[13]);
            const panel_count = parseInt(row[14]);
            const winglets = parseBoolean(row[15]);
            const cockpit_ballast_count = parseInt(row[16]);
            const cockpit_block_weight = parseFloat(row[19]);

            const obj: AircraftConfiguration = {
                typeCertificateId: type_cert_id,
                hasFlaps: flaps,
                hasElevatorTrim: trim,
                hasRudderVators: ruddervator,
                hasFixedUndercarriage: fixed_uc,
                undercarriageType: uc_type,
                seatingType: seat_type,
                tailCGAdjustBallastType: tail_ballast_type,
                tailCGAdjustBallastCapacity: tail_cap,
                fuselageMaxBallastAmount: fuse_max_ballast,
                wingMaxBallastAmount: wing_max_ballast,
                tailWingBallastCompensationAmount: wing_comp_ballast,
                wingSpanPrimary: span_primary,
                wingSpanAlternate: span_alt,
                wingPanelCount: panel_count,
                hasWingletOption: winglets,
                cockpitBallastBlockCount: cockpit_ballast_count,
                cockpitBallastWeightPerBlock: cockpit_block_weight
            }

            retval.push(obj);
        } catch (error) {
            // Should never get here since the above parsing is quite forgiving. Likely this is due
            // to a stream or other interrupt error.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const row_str = '[ ' + row.join(',') + ' ]';
            if (error instanceof Error) {
                console.error(`Error reading row ${row_str} due to ${error.message}`, error);
            } else {
                console.error(`Unexpected row error object found on row ${row_str}`, error);
            }
        }

    });

    return retval;
}

function parseBoolean(src: any): boolean {
    let raw = parseString(src);

    raw = raw.toLowerCase();

    // If true, otherwise default to false.
    return BOOLEAN_TRUE_MAP.has(raw);
}

function parseFloat(src: any): number {
    let raw = parseString(src);

    let retval: number = undefined;

    if(raw && raw.length > 0) {
        try {
            retval = Number.parseFloat(raw);
        } catch (err) {
            console.debug("Error parsing aircraft config field as a float: " + raw, err);
        }
    }

    return retval;
}

function parseInt(src: any): number {
    let raw = parseString(src);

    let retval: number = undefined;

    if(raw && raw.length > 0) {
        try {
            retval = Number.parseInt(raw, 10);
        } catch (err) {
            console.debug("Error parsing aircraft config field as an integer: " + raw, err);
        }
    }

    return retval;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseString(src: any): string {
    const src_type = typeof src;

    if (src_type === 'string' || src_type === 'number') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return src ? src.toString().trim() : undefined;
    } else {
        return undefined;
    }
}

async function readInput(
    source: string | Readable | ReadableStream | Blob,
): Promise<WorkBook> {
    // Need to force raw parsing here since it will mess up the registration dates,
    // which are in internation style dd/mm/yyyy and it converts to american style.
    const options: ParsingOptions = {};
    options.raw = true;

    if (typeof source === 'string') {
        return readFile(source, options);
    } else if (source instanceof Readable) {
        // ReadableStream is a derived type of Readable, so we're good here
        return readStream(source, options);
    } else if (source instanceof ReadableStream) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        const readable = new Readable().wrap(source as any);
        return readStream(readable, options);
    } else if (source instanceof Blob) {
        const blob_stream = source.stream();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        const readable = new Readable().wrap(blob_stream as any);
        return readStream(readable, options);
    } else {
        throw new Error('Unhandled type of input source');
    }
}

async function readStream(stream: Readable, options: ParsingOptions): Promise<WorkBook> {
    const buffers: Uint8Array[] = [];
    options.type = 'buffer';

    const reader = new Promise<WorkBook>((resolve, reject) => {
        stream.on('data', (data) => {
            if (data instanceof Uint8Array) {
                buffers.push(data);
            }
        });
        stream.on('end', () => resolve(read(Buffer.concat(buffers), options)));
        stream.on('error', reject);
    });

    return reader;
}
