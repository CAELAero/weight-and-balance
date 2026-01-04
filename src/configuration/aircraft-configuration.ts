export enum UndercarriageConfiguration {
    INLINE = "inline",
    TRIKE_NOSEWHEEL = "trike_nosewheel",
    TRIKE_TAILDRAGGER = "trike_taildragger"
}

export enum SeatingConfiguration {
    SINGLE = "single",
    TANDEM = "tandem",
    SIDE_BY_SIDE = "side_by_side"
}

export enum TailBallastType {
    NONE = 'none',
    WATER = 'water',
    BLOCKS = 'blocks'
}

export const reverseUndercarriageConfigurationMap = new Map<string, UndercarriageConfiguration>(Object.values(UndercarriageConfiguration).map((value => [`${value}`, value])));
export const reverseSeatingConfigurationMap = new Map<string, SeatingConfiguration>(Object.values(SeatingConfiguration).map((value => [`${value}`, value])));
export const reverseTailBallastTypeMap = new Map<string, TailBallastType>(Object.values(TailBallastType).map((value => [`${value}`, value])));

/**
 * Defines a number blocks of a single configuration that can be added as ballast. 
 * Ballast may be placed in the tail or nose, to the maximum number of the blocks
 * of this weight. 
 */
export interface BallastBlockCapacity {
    label: string;
    weightPerBlock: number;
    maxBlockCount: number;
}

/**
 * Mapping from wing ballast to tail ballast amount. 
 */
export interface WingBallastCompensation {
    wingBallastAmount: number;
    tailBallastAmount: number;
}

/**
 * Represents the configuration of an aircraft based on type certificate. This represents the combinations
 * the type cert is capable of having. However, an individual aircraft may not have all of these configuration
 * options - eg DG300s could be ordered with or without a tail tank. 
 */
export interface AircraftConfiguration {
    /** 
     * An identifier of the type certificate the configuration belongs to. Not used by the calculator, but can be used
     * if this is fetched from a DB, file or other data source.
     */
    typeCertificateId: string;

    hasFlaps: boolean;

    /**
     * Separate trim tab for the elevator trim. Mostly a feature on older
     * wood and metal gliders eg K13 and IS28
     */
    hasElevatorTrim: boolean;

    /**
     * Is this a v-tail aircraft, which can have other interesting rammifications
     * for control deflection measurements
     */
    hasRudderVators: boolean;

    /** 
     * Used for any form of fixed undercarriage, including
     * aircraft with only skids
     */
    hasFixedUndercarriage: boolean;

    undercarriageType: UndercarriageConfiguration;

    /**
     * How the seat(s) are configured in the aircraft. Important to know for
     * weight and balance calculations.
     */
    seatingType: SeatingConfiguration;

    /**
     * This is the maximum amount of water ballast that can be put into the 
     * fuselage tanks. The assumption is there's only a single fuselage tank.
     * CG location of the tank is defined in the W&B datum configuration.
     */
    fuselageMaxBallastAmount?: number;

    /**
     * This is the maximum
     * amount of water ballast that can be put into the wings. This 
     * can be modified by aircraft-specific SBs and the overall weight
     * and balance of the aircraft
     */
    wingMaxBallastAmount?: number;

    /**
     * Sets the type of ballast, if any that can be used to adjust the CG
     * position and is located in the tail. 
     */
    tailCGAdjustBallastType: TailBallastType;

    /**
     * Total capacity of ballast that can be located in the tail for adjusting
     * the CG location. The type found here is dependent on the type defined in
     * #tailCGAdjustBallastType:
     *   * NONE, this will be null.
     *   * WATER: a number defining the maximum number of litres/kgs of ballast
     *   * BLOCKS: A set of block configurations that can be added
     */
    tailCGAdjustBallastCapacity: number | BallastBlockCapacity[] | null;

    /**
     * IF there is a tail ballast tank that can be used to offset the wing water 
     * ballast amount then this is the maximum amount allowed. 
     */
    tailWingBallastCompensationAmount?: number;

    /**
     * Primary wingspan (typically the shorter). Value always in metres. 
     */
    wingSpanPrimary: number;

    /**
     * When there's an alternate wingspan length available. Value always in
     * metres. Note that this can also be linked to a weight and balance change.
     */
    wingSpanAlternate?: number;

    /** 
     * The number of panels that are used for the whole wing. Typically is an 
     * even number since most aircraft do not have a single central section that
     * tips attach to. However, some aircraft, particularly older wooden aircraft
     * might have a single piece wing, so the panel count is 1. 
     */
    wingPanelCount: number;

    /**
     * Used to describe if an aircraft has separate winglet and flat tips in a 
     * given length wing. Mostly used on older generation flapped aircraft, or
     * the DG300 where you can have 15m flat and 15m Winglets. The winglets will
     * replace the outer-most panel. 
     */
    hasWingletOption: boolean;

    /** 
     * Number of blocks that could be fixed in the cockpit if there is the
     * ability to mount them
     */
    cockpitBallastBlockCount: number;

    /**
     * Typical weight of ballast blocks. It is possible that some aircraft
     * have two different size blocks (eg DG1000 with 1kg and 0.5kg blocks).
     * This should be the smaller amount in that case.
     */
    cockpitBallastWeightPerBlock?: number;
}
