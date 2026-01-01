/**
 * Used to represent either an initial entry or a single component change. If
 * this is an externally calculated entry then the item weight and arm will
 * be left blank.
 */
export interface WeightAndBalanceComponentChange {
    /**
     * Is the weight change in the fuselage, or wings. If true, then this changes the
     * current weight of non-lifting parts. A weight change in wings might be because of
     * adding/removing winglets etc. If undefined, and the other item change fields are
     * defined, assume this is true. 
     */
    weightChangeInFuselage?: boolean;

    /** 
     * Delta of the change from old to new component. If this is an external calculation
     * then this will be null.
     */
    itemWeightChange?: number;

    /**
     * Measured arm to the location of the component. If this is an external calculation
     * then this will be null. 
     */
    itemArm?: number;

    /** Existing aircraft empty weight. Provided from a previous full W&B */
    aircraftWeight: number;

    /** Existing aircraft arm. Provided from a previous full W&B */
    aircraftArm: number;

    /** Empty Non-lifting parts weight of this aircraft */
    nonLiftingPartsWeight: number;
}

/**
 * Captures actual measurements from a specific aircraft. This can be used as the input 
 * for a calculator.
 * 
 * Wing panel count: 
 * 2: left + right inner
 * 3: left + right inner + left outer
 * 4: left + right inner + left + right winglet or panel depending on config.hasWinglet option
 * 5: Invalid
 * 6: left + right inner + left + right outer + left + right winglet
 */
export interface WeightAndBalanceMeasurement {
    undercarriage1Weight: number;
    undercarriage2Weight: number;

    // Optional weight measurement if the aircraft has 3 points of contact
    undercarriage3Weight?: number;

    wing1Weight: number;
    wing2Weight?: number;
    wing3Weight?: number;
    wing4Weight?: number;
    wing5Weight?: number;
    wing6Weight?: number;    
}