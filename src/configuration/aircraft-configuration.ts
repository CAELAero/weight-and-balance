import { CertificationCategory } from "../util/certifcation-category";

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

interface WingspanDetails {
    /** Total span of the wings for this configuration */
    span: number;

    /** Max amount of water ballast that can be carried for this wingspan */
    maxBallastAmount:number;

    /**
     * Used to describe if an aircraft has separate winglet and flat tips in a
     * given length wing. Mostly used on older generation flapped aircraft, or
     * the DG300 where you can have 15m flat and 15m Winglets. 
     */
    hasWinglets: boolean;
    
    /** If the wing can carry fuel, total amount for both wings */
    fuelAmount?: number;
}

/**
 * Represents the configuration of an aircraft based on type certificate. This represents the combinations
 * the type cert is capable of having. However, an individual aircraft may not have all of these configuration
 * options - eg DG300s could be ordered with or without a tail tank.
 * 
 * Some values here are an array. This corresponds to the configuration of the aircraft that may have multiple
 * of that items, such as baggage areas. Since this is used in conjunction with the W&B datum, the values
 * in the array should correspond to the datum position in the aircraft, from front to rear. 
 */
export interface AircraftConfiguration {
    /**
     * An identifier of the type certificate the configuration belongs to. Not used by the calculator, but can be used
     * if this is fetched from a DB, file or other data source.
     */
    typeCertificateId: string;

    /**
     * If this is a variation of the base defined type information, this describes what the
     * variation is. Typically this will be the name of the manufacturer's technical note
     * or service bulletin that allows for a change in the weights information (eg LS4 different
     * wing ballast amounts for higher NLP mass).
     */
    variation?: string;

    /** 
     * How many different wingspans this aircraft can have. Typically 1 or 2, but some types
     * will have 3 (eg DG1000 or ASH25). This array must always be at least length 1.
     */
    wingspanOptions: WingspanDetails[];

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
    tailCGAdjustBallastCapacity: number[] | BallastBlockCapacity[] | null;

    /**
     * IF there is a tail ballast tank that can be used to offset the wing water
     * ballast amount then this is the maximum amount allowed.
     */
    tailWingBallastCompensationAmount?: number;

    /**
     * The number of panels that are used for the whole wing. Typically is an
     * even number since most aircraft do not have a single central section that
     * tips attach to. However, some aircraft, particularly older wooden aircraft
     * might have a single piece wing, so the panel count is 1.
     */
    wingPanelCount: number;

    /**
     * Cockpit ballast blocks that can be installed. Most gliders will only
     * have a single configuration, but a few will have two sets. If there
     * are two sets, but of the same weight per block, there will still be
     * two entries here, to line up with the different ballast block arms. 
     */
    cockpitBallast?: BallastBlockCapacity[];

    /**
     * Maximum amount of fuel that can be carried in the fuselage tank, if
     * this aircraft has one. Undefined if no fuselage tank. This should be
     * weight in KG, not litres, as fuel is slightly lighter than water per
     * unit volume.
     */
    fuselageFuelAmount?: number[];

    /**
     * Weight of batteries that are mounted in the fuselage for the purposes
     * of propulsion power (ie FES/RES). The can be removed and impact the
     * weight and balance of the glider. Do not include fixed batteries,
     * such as avionics batteries or those with IC engines that stay in the
     * glider as part of the motor system. If the motor is removed, then
     * calculate a full new W&B. For the moment, this assumes both batteries
     * are at the same arm distance. 
     */
    fuselageBatteryWeight?: number[];

    /**
     * If there's dedicated baggage areas (defined by arm definitions in the
     * W&B datum, these are the max allowable values. Oxygen bottle fittings
     * are considered baggage from the W&B datum perspective, so should
     * be included here. 
     */
    baggage?: number[];
}
