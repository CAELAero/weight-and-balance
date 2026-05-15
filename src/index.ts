/**
 * Global module exports
 */
export { CertificationCategory, reverseCertificationCategoryMap } from "./util/certifcation-category";

export { encodeTypeCertificateId } from "./util/type-cert-utils";

export {
    SeatingConfiguration,
    TailBallastType,
    UndercarriageConfiguration,
    reverseUndercarriageConfigurationMap,
    reverseSeatingConfigurationMap,
    reverseTailBallastTypeMap,
    type BallastBlockCapacity,
    type AircraftConfiguration,
} from "./configuration/aircraft-configuration";

export { DatumCalculationModel, type WeightAndBalanceDatum, reverseCalculationModelMap } from "./datum/datum";

export { exportDatumToCSV } from "./datum/datum-exporter";
export { loadDatumFromCSV } from "./datum/datum-loader";

export {
    type WeightAndBalanceComponentChange,
    type WeightAndBalanceMeasurement,
} from "./weight-and-balance/measurements";

export {
    type WeightAndBalanceMoment,
    type WeightAndBalanceCockpitBallast,
    type WeightAndBalanceBallastAmount,
    type WingBallastCompensation,
    type SingleSeaterPilotWeightTailBallastAdjustment,
    type TwoSeaterPilotWeightTailBallastAdjustment,
    type WeightAndBalanceResult,
    type SingleSeaterWeightAndBalanceResult,
    type TwoSeatWeightRange,
    type FittedBallastBlock,
    type TwoSeaterWeightAndBalanceResult,
} from "./weight-and-balance/result-types";

export { type WeightAndBalanceOptions } from "./weight-and-balance/calculator-common";

export {
    generateWeightAndBalancePlacardData,
    updateWeightAndBalance,
    calculateWeightAndBalance,
} from "./weight-and-balance/calculator";

export { calculateArm, calculateTailBallastAmountForCGPosition } from "./weight-and-balance/helpers";
