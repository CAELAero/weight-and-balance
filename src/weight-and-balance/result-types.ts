export interface WeightAndBalanceCockpitBallast {
    blockCount: number;
    minPilotWeight: number;
}

export interface WeightAndBalanceBallastAmount {
    maxBallast: number;
    pilotWeight: number;
}

/**
 * Modified pilot weights based on the amount of ballast in the tail
 */
export interface SingleSeaterPilotWeightTailBallastAdjustment {
    ballastAmount: number;

    minPilotWeight: number;
    maxPilotWeight: number;
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

/**
 * Base, shared base set of fields when reporting results.
 */
export interface WeightAndBalanceResult {
    calculationInputOptions: {
        useGFAMinBuffer: boolean;
        p1ArmRangePercentage?: number;
    };

    /** Numbers copied from the datum so that the results can be standalone when printing */
    maxAllUpWeight: number;

    emptyCGArm: number;
    emptyWeight: number;

    maxFuselageLoad: number;

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

    /**
     * Ballast blocks to adjust the minimum pilot weight. Optional as some aircraft
     * don't have removable ballast.
     */
    cockpitBallast?: WeightAndBalanceCockpitBallast[];

    allowedWingBallast?: WeightAndBalanceBallastAmount[];
    allowedTailBallast?: WeightAndBalanceBallastAmount[];
}

export interface SingleSeaterWeightAndBalanceResult extends WeightAndBalanceResult {
    /** Minimum pilot weight assuming no ballast blocks are fitted */
    minPilotWeight: number;

    maxPilotWeight: number;

    /**
     * If this aircaft config allows adjusting the CG with tail ballast, this documents how
     * the pilot weight range changes.
     */
    tailBallastAdjustedPilotWeights?: SingleSeaterPilotWeightTailBallastAdjustment[];
}

export interface TwoSeatWeightRange {
    pilot1Weight: number;

    minPilot2Weight: number;
    maxPilot2Weight: number;
}

export interface FittedBallastBlock {
    label: string;
    weightPerBlock: number;
    blockCount: number;
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
