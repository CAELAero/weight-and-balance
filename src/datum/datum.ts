import { CertificationCategory } from "../util/certifcation-category";

export enum DatumCalculationModel {
    MODEL_1 = "model_1",
    MODEL_1A = "model_1a",
    MODEL_2 = "model_2",
    MODEL_3 = "model_3",
}

export const reverseCalculationModelMap = new Map<string, DatumCalculationModel>(
    Object.values(DatumCalculationModel).map((value) => [`${value}`, value]),
);

/**
 * Datum is defined by type certificate, not per aircraft type. Note that to uniquely identify
 * what calculation is to be done, 3 parts will uniquely identify the aircraft - the type
 * certification ID, the JAR22 category, and also a wingspan. Most modern aircraft will have
 * multiple wingspan options, which can, sometimes, lead to different datum requirements
 * particularly dry or all up weights.
 */
export interface WeightAndBalanceDatum {
    /**
     * An identifier of the type certificate the configuration belongs to. Not used by the calculator, but can be used
     * if this is fetched from a DB, file or other data source.
     */
    typeCertificateId: string;

    /** The JAR22 certification category, used to uniquely identify which datum to use for calculation */
    category: CertificationCategory;

    /** 3rd part of the unique ID to identify a specific variant */
    wingspan: number;

    /**
     * IF this is a variation of the base defined datum information, this describes what the
     * variation is. Typically this will be the name of the manufacturer's technical note
     * or service bulletin that allows for a change in the datum information (eg max all up
     * weight)
     */
    variation?: string;

    /** Plain text description of where the datum is located on the airframe */
    location: string;

    /** Description on how to level the aircraft to take the correct measurement */
    levellingInstructions: string;

    /** Location of the ground touch points relative to the datum location */
    calculationModel: DatumCalculationModel;

    maxAllUpWeight: number;

    maxDryWeight: number;

    maxNonLiftingPartsWeight: number;

    /**
     * Max weight the seat is allowed to have on it. Often set by JAR22/CS22 as a minimum
     * standard to meet, but manufacturers will allow for higher. This impacts safety
     * items such as the harnesses and their fixings in the fuselage
     */
    maxSeatWeight: number;

    /**
     * Min pilot weight defined in the AMM. There's no specific basis for this and often this
     * will be higher than the calculated forward CG amount. However, an aircraft after repair
     * may have a higher minimum pilot weight than this. It just can't be lower.
     */
    minAllowedPilotWeight: number;

    /**
     * Maxiumum total amount of cockpit load permitted. This may be pilot and baggage (inc O2
     * bottles), but in 2 seaters there is often a combined pilot weight that cannot be
     * exceeded.
     */
    maxCockpitWeight?: number;

    forwardCGLimit: number;

    aftCGLimit: number;

    /**
     * The default value for the P1 arm in the glider. If there is a range specified in the
     * AMM or TCDS then this would be the one located closest to the datum.
     */
    pilot1Arm: number;

    /**
     * Optional P1 arm if the AMM or TCDS contains a range value. If undefined, then only the
     * base value is used. If defined, the the calculator options define how to interpret the
     * two numbers. If no option is supplied, it defaults to using the base value only. If provided
     * this should reference the distance furthest away from the datum (typically a larger negative
     * number than pilot1Arm).
     */
    pilot1ArmMax?: number;

    /**
     * If this is a 2 seater, this is the arm to the second pilot.
     */
    pilot2Arm?: number;

    /**
     * If there is cockpit ballast, arm to the location of the ballast boxs. Most aircraft
     * only have a single location, but some older 2 seaters (eg TwinAstir) will have two
     * separate locations which the ballast blocks are spread between.
     */
    cockpitBallastBlockArms?: number[];

    /**
     * Tail ballast location for the tank that is used to compensate for the forward CG
     * shift when adding wing ballast. These tanks will be emptied in flight as the wing
     * ballast tanks are emptied.
     */
    tailWingBallastCompensationArm?: number;

    /**
     * Tail ballast location for adjusting the CG location independently of the wing
     * ballast. Usually found in advanced modern gliders and is defined as the ballast
     * that is not adjustable in flight. Some modern gliders, like the JS3 can have
     * multiple tanks at different arm lengths.
     */
    tailCGAdjustBallastArm?: number[];

    /**
     * Some aircraft have a removable tail battery that can be used to influence the pilot
     * weight, a bit like ballast blocks. The battery arm may be different to the tail ballast
     * tanks. If so, this is the arm for the battery.
     */
    tailBatteryArm?: number;

    /** If the manufacturer defines an arm for the wing ballast tanks, this is the distance. */
    wingBallastArm?: number;

    /**
     * If the cockpit can hold baggage, and the manufacturer provides an arm for the baggage
     * location area(s), this is the distance. Gliders may have multiple locations, such
     * as bags and O2 bottles that can be removed. The array will describe each location
     * sorted from front of the aircraft to the rear.
     */
    baggageArms?: number[];

    /**
     * For aircraft with fuel tanks in the fuselage, the arm to the tank(s). Assumes a linear
     * arm from a regular shaped tank. If there are multiple tanks, sorted in order from
     * front to rear of aircraft.
     */
    fuselageFuelArms?: number[];

    /** If the wings can hold fuel, this is the arm for that fuel amount */
    wingFuelArm?: number;

    /**
     * Arm for any large batteries mounted in the fuselage. This is important for gliders
     * with electrical propulsion where the batteries can be removed (FES/RES setups)
     */
    fuselageBatteryArm?: number;

    /** If known, arm for the P1 instrument panel */
    p1InstrumentPanelArm?: number;

    /** If known for a 2 seater, arm for the P2 instrument panel */
    p2InstrumentPanelArm?: number;

    distanceFrontWheelToDatum: number;
    distanceFrontWheelToRearWheel: number;
}
