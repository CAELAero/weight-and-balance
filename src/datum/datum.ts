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

    /** Plain text description of where the datum is located on the airframe */
    location: string;

    /** Description on how to level the aircraft to take the correct measurement */
    levellingInstructions: string;

    /** Location of the ground touch points relative to the datum location */
    calculationModel: DatumCalculationModel;

    maxAllUpWeight: number;

    maxDryWeight: number;

    maxNonLiftingPartsWeight: number;

    /** Max weight the seat is allowed to have on it */
    maxSeatWeight: number;

    /**
     * Min pilot weight defined in the AMM. There's no specific basis for this and often this
     * will be higher than the calculated forward CG amount. However, an aircraft after repair
     * may have a higher minimum pilot weight than this. It just can't be lower.
     */
    minAllowedPilotWeight: number;

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
     * If there is cockpit ballast, arm to the location of the ballast box.
     */
    cockpitBallastBlockArm?: number;

    /**
     * Arm to the tail ballast location, relative to the datum location. If there is
     * two tail ballast locations (eg tank + blocks or two tanks) for now assume they
     * have the same arm distance.
     */
    tailBallastArm?: number;

    /**
     * For aircraft with fuel tanks in the fuselage, the arm to the tank. Assumes a linear 
     * arm from a regular shaped tank. 
     */
    fuselageFuelArm?: number;

    distanceFrontWheelToDatum: number;
    distanceFrontWheelToRearWheel: number;
}
