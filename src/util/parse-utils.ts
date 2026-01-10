
import { Readable } from 'stream';

import { ParsingOptions, WorkBook, readFile, read } from 'xlsx';

const BOOLEAN_TRUE_MAP = new Set();
BOOLEAN_TRUE_MAP.add("true");
BOOLEAN_TRUE_MAP.add("yes");

export function parseBoolean(src: any): boolean {
    let raw = parseString(src);

    raw = raw.toLowerCase();

    // If true, otherwise default to false.
    return BOOLEAN_TRUE_MAP.has(raw);
}

export function parseFloat(src: any): number {
    let raw = parseString(src);

    let retval: number = undefined;

    if(raw && raw.length > 0) {
        try {
            retval = Number.parseFloat(raw);
            if(Number.isNaN(retval)) {
                retval = undefined;
            }
        } catch (err) {
            console.debug("Error parsing aircraft config field as a float: " + raw, err);
        }
    }

    return retval;
}

export function parseInt(src: any): number {
    let raw = parseString(src);

    let retval: number = undefined;

    if(raw && raw.length > 0) {
        try {
            retval = Number.parseInt(raw, 10);
            if(Number.isNaN(retval)) {
                retval = undefined;
            }
        } catch (err) {
            console.debug("Error parsing aircraft config field as an integer: " + raw, err);
        }
    }

    return retval;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseString(src: any): string {
    const src_type = typeof src;

    if (src_type === 'string' || src_type === 'number') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return src ? src.toString().trim() : undefined;
    } else {
        return undefined;
    }
}

export async function readInput(
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
