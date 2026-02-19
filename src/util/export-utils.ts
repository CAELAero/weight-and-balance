const FLOAT_FORMAT = new Intl.NumberFormat("en-IN", { maximumSignificantDigits: 3 });

export function convertIntToString(src?: number): string {
    return src != undefined && src != null ? src.toFixed(0) : "";
}

export function convertFloatToString(src?: number): string {
    return src != undefined && src != null ? FLOAT_FORMAT.format(src) : "";
}

export function convertIntArrayToString(src?: number[]): string {
    if (src == undefined || src == null || src.length == 0) {
        return "";
    }

    // ensure they're sorted from front to rear of aircraft
    src.sort((a, b) => a - b);
    return src.join(":");
}

export function escapeString(src: string): string {
    if (src && src.indexOf(",") != -1) {
        return '"' + src + '"';
    } else {
        return src;
    }
}
