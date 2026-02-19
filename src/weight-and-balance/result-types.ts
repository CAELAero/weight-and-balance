import { CertificationCategory } from "../util/certifcation-category";

export interface WeightAndBalanceMoment {
    arm: number;
    weight: number;
}
export interface WeightAndBalanceCockpitBallast {
    blockCount: number;
    minPilotWeight: number;
}

export interface WeightAndBalanceBallastAmount {
    maxBallast: number;
    pilotWeight: number;
}

/**
 * Modified pilot weights based on the amount of ballast in the tail. Note that in aircraft
 * that have 2 tail ballast tanks for CG adjustment, this is the total amount of water
 * between both tanks. It is up to the pilot to decide how to distribute the weight between
 * those tanks.
 *
 * Note that this is not used for tail batteries that might be removable.
 */
export interface SingleSeaterPilotWeightTailBallastAdjustment {
    ballastAmount: number;

    minPilotWeight: number;
    maxPilotWeight: number;
}

/**
 * Represents a single set of ballast blocks of a particular weight/size that can
 * be fitted to the aircraft. The label is for advisory purposes only when generating
 * cockpit placards.
 */
export interface FittedBallastBlock {
    label: string;
    weightPerBlock: number;
    blockCount: number;
}

export interface TwoSeaterPilotWeightTailBallastAdjustment {
    /**
     * Amount of tail ballast to fit. Can be either a number for water ballast, or
     * a block count for aircraft that can handle blocks.
     */
    ballastAmount: number | FittedBallastBlock[];
    soloMinPilotWeight: number;
    soloMaxPilotWeight: number;
    dualPilotWeightRanges: TwoSeatWeightRange[];
}

export interface WeightAndBalancePlacardData {
    /**
     * Optional label that can be associated with the data that can be used in the display
     */
    label?: string;

    maxFuselageLoad: number;

    /**
     * A system assigned label that can be used for this data. Comes from internally knowing which
     * variation is being used, for example removal of a tail battery.
     */
    /**
     * Ballast blocks to adjust the minimum pilot weight. Optional as some aircraft
     * don't have removable ballast.
     */
    cockpitBallast?: WeightAndBalanceCockpitBallast[];

    allowedWingBallast?: WeightAndBalanceBallastAmount[];
    allowedTailBallast?: WeightAndBalanceBallastAmount[];

    /**
     * If the glider can take fuel in the fuselage, this is the table for
     * fuel to cockpit load chart. Typically this is used for TMGs, but can
     * apply to SLGs that have significant fuel amounts. This is not used for
     * electric motor setups where the batteries are removable.
     */
    allowedFuelLoad?: WeightAndBalanceBallastAmount[];
}

/**
 * Base, shared base set of fields when reporting results.
 */
export interface WeightAndBalanceResult extends WeightAndBalancePlacardData {
    /** The JAR22 certification category, used to uniquely identify which variation was used for calculation */
    category: CertificationCategory;

    /**
     * Which wingspan this was calculated for. Allows for unique labelling of variations in
     * cockpit placard data.
     */
    wingspan: number;

    calculationInputOptions: {
        useGFAMinBuffer: boolean;
        p1ArmRangePercentage?: number;
        defaultWithBatteryFitted?: boolean;
    };

    /** Numbers copied from the datum so that the results can be standalone when printing */
    maxAllUpWeight: number;

    emptyCGArm: number;
    emptyWeight: number;

    nonLiftingPartsWeight: number;

    /**
     * If the calculation used the min-max method for a P1 arm, this will be set to true. If so,
     * then pilot1ArmUsed will reference the arm length closest to the datum.
     */
    pilotArmMinMaxUsed: boolean;

    /**
     * The selected arm distance used for P1 calculation. This can vary if a range is defined in
     * aircraft datum, and the user has selected a percentage range.
     */
    pilot1ArmUsed: number;
}

export interface SingleSeaterPlacardData extends WeightAndBalancePlacardData {
    /** Minimum pilot weight assuming no ballast blocks are fitted */
    minPilotWeight: number;

    /** Maximum pilot weight, not including baggage weights */
    maxPilotWeight: number;
}
export interface SingleSeaterWeightAndBalanceResult extends WeightAndBalanceResult {
    /** Minimum pilot weight assuming no ballast blocks are fitted */
    minPilotWeight: number;

    /** Maximum pilot weight, not including baggage weights */
    maxPilotWeight: number;

    /**
     * If this aircaft config allows adjusting the CG with tail ballast, this documents how
     * the pilot weight range changes.
     */
    tailBallastAdjustedPilotWeights?: SingleSeaterPilotWeightTailBallastAdjustment[];

    /**
     * If there is a rear baggage compartment, this is how the pilot weights change
     */
    baggageAdjustedPilotWeights?: SingleSeaterPilotWeightTailBallastAdjustment;

    /**
     * When the glider contains batteries that are removable, this is the adjusted
     * min and max cockpit weights for when the batteries have been removed, since
     * the assumption is that the normal aircraft configuration, and as originally
     * weighed, included the batteries.
     *
     * The batteries are typically well behind the
     * CG location, either in the fuselage for FES/RES setups, or in the fin, which
     * is common in many single seaters. Note that this doesn't have to be a battery
     * but can be a single lump of weight in the battery slot which has been removed.
     */
    variations?: SingleSeaterPlacardData[];
}

export interface TwoSeatWeightRange {
    pilot1Weight: number;

    minPilot2Weight: number;
    maxPilot2Weight: number;
}

export interface TwoSeaterWeightAndBalanceResult extends WeightAndBalanceResult {
    soloMinPilotWeight: number;
    soloMaxPilotWeight: number;

    dualPilotWeightRanges: TwoSeatWeightRange[];

    /**
     * If this aircaft config allows adjusting the CG with tail ballast, this documents how
     * the pilot weight range changes.
     */
    tailBallastAdjustedPilotWeights?: TwoSeaterPilotWeightTailBallastAdjustment[];
}
