/**
 * Global module exports
 */
export { exportAircraftConfigToCSV } from "./configuration/configuration-exporter";
export { loadAircraftConfigFromCSV } from "./configuration/configuration-loader";

export { 
    SeatingConfiguration, 
    TailBallastType, 
    UndercarriageConfiguration,
    reverseUndercarriageConfigurationMap,
    reverseSeatingConfigurationMap,
    reverseTailBallastTypeMap,
    type BallastBlockCapacity,
    type WingBallastCompensation,
    type AircraftConfiguration
} from "./configuration/aircraft-configuration";

export {
    type DatumCalculationModel, 
    reverseCalculationModelMap,
    type WeightAndBalanceDatum
} from "./weight-and-balance/datum";

export { 
    type WeightAndBalanceComponentChange, 
    type WeightAndBalanceMeasurement
} from "./weight-and-balance/measurements";

export {
    type WeightAndBalanceCockpitBallast, 
    type WeightAndBalanceBallastAmount,
    type SingleSeaterPilotWeightTailBallastAdjustment,
    type TwoSeaterPilotWeightTailBallastAdjustment,
    type WeightAndBalanceResult,
    type SingleSeaterWeightAndBalanceResult,
    type TwoSeatWeightRange,
    type FittedBallastBlock,
    type TwoSeaterWeightAndBalanceResult    
} from "./weight-and-balance/result-types";

export {
    type WeightAndBalanceOptions,
    generateWeightAndBalancePlacardData,
    updateWeightAndBalance,
    calculateWeightAndBalance
} from "./weight-and-balance/calculator";
