export enum UndercarriageConfiguration {
    INLINE = "inline",
    TRIKE_NOSEWHEEL = "trike_nosewheel",
    TRIKE_TAILDRAGGER = "trike_taildragger",
}

export enum SeatingConfiguration {
    SINGLE = "single",
    TANDEM = "tandem",
    SIDE_BY_SIDE = "side_by_side",
}

export enum TailBallastType {
    NONE = "none",
    WATER = "water",
    BLOCKS = "blocks",
}

export const reverseUndercarriageConfigurationMap = new Map<string, UndercarriageConfiguration>(
    Object.values(UndercarriageConfiguration).map((value) => [`${value}`, value]),
);
export const reverseSeatingConfigurationMap = new Map<string, SeatingConfiguration>(
    Object.values(SeatingConfiguration).map((value) => [`${value}`, value]),
);
export const reverseTailBallastTypeMap = new Map<string, TailBallastType>(
    Object.values(TailBallastType).map((value) => [`${value}`, value]),
);
