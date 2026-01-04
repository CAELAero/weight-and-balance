import { AircraftConfiguration, SeatingConfiguration, TailBallastType, UndercarriageConfiguration } from "../../src/configuration/aircraft-configuration";
import { DatumCalculationModel, WeightAndBalanceDatum } from "../../src/weight-and-balance/datum";

export const JANTAR_DATUM: WeightAndBalanceDatum = {
    typeCertificateId: "SZD 48-1",
    location: "1",
    levellingInstructions: "flat",
    calculationModel: DatumCalculationModel.MODEL_1,
    maxAllUpWeight: 535,
    maxDryWeight: 385,
    maxNonLiftingPartsWeight: 245,
    maxSeatWeight: 110,
    minAllowedPilotWeight: 70,
    // Latest TCDS says 158mm. Original docs say 148mm
    forwardCGLimit: 158,
    aftCGLimit: 336,
    pilot1Arm: -616,
    distanceFrontWheelToDatum: 120,
    distanceFrontWheelToRearWheel: 3648
};

export const DG300_DATUM: WeightAndBalanceDatum = {
    typeCertificateId: "DG300 ELAN",
    location: "1",
    levellingInstructions: "flat",
    calculationModel: DatumCalculationModel.MODEL_1,
    maxAllUpWeight: 525,
    maxDryWeight: 450,
    maxNonLiftingPartsWeight: 246,
    maxSeatWeight: 110,
    minAllowedPilotWeight: 70,
    // Latest TCDS says 158mm. Original docs say 148mm
    forwardCGLimit: 158,
    aftCGLimit: 325,
    pilot1Arm: -549,
    distanceFrontWheelToDatum: 120,
    distanceFrontWheelToRearWheel: 3648
    // tail tank arm: 4180
};

export const LS6_DATUM: WeightAndBalanceDatum = {
    typeCertificateId: "LS6C",
    location: "1",
    levellingInstructions: "flat",
    calculationModel: DatumCalculationModel.MODEL_1,
    maxAllUpWeight: 525,
    maxDryWeight: 425,
    maxNonLiftingPartsWeight: 243,
    maxSeatWeight: 110,
    minAllowedPilotWeight: 70,
    forwardCGLimit: 294,
    aftCGLimit: 386,
    pilot1Arm: -500,
    distanceFrontWheelToDatum: 179,
    distanceFrontWheelToRearWheel: 4181,
    cockpitBallastBlockArm: -1400
};

export const K21_DATUM: WeightAndBalanceDatum = {
    typeCertificateId: "ASK21",
    location: "1",
    levellingInstructions: "1",
    calculationModel: DatumCalculationModel.MODEL_3,
    maxAllUpWeight: 600,
    maxDryWeight: 600,
    maxNonLiftingPartsWeight: 410,
    maxSeatWeight: 110,
    minAllowedPilotWeight: 0,
    forwardCGLimit: 234,
    aftCGLimit: 469,
    pilot1Arm: -1185,  // shorter pilots can use -1250, let's assume tall, light pilot
    pilot2Arm: -80,
    distanceFrontWheelToDatum: -1600,
    distanceFrontWheelToRearWheel: 6871,
    cockpitBallastBlockArm: -2300
};

export const DG1000_P1_RANGED_DATUM: WeightAndBalanceDatum = {
    typeCertificateId: "DG1000S",
    location: "1",
    levellingInstructions: "1",
    calculationModel: DatumCalculationModel.MODEL_1,
    maxAllUpWeight: 750,
    maxDryWeight: 630,
    maxNonLiftingPartsWeight: 469,
    maxSeatWeight: 110,
    minAllowedPilotWeight: 70,
    forwardCGLimit: 190,
    aftCGLimit: 440,
    pilot1Arm: -1250,
    pilot1ArmMax: -1350,
    pilot2Arm: -272,
    distanceFrontWheelToDatum: 114,
    distanceFrontWheelToRearWheel: 5189,
    cockpitBallastBlockArm: -1960,
    tailBallastArm: 5400
};

export const DG1000_P1_FIXED_DATUM: WeightAndBalanceDatum = {
    typeCertificateId: "DG1000S",
    location: "1",
    levellingInstructions: "1",
    calculationModel: DatumCalculationModel.MODEL_1,
    maxAllUpWeight: 750,
    maxDryWeight: 630,
    maxNonLiftingPartsWeight: 469,
    maxSeatWeight: 110,
    minAllowedPilotWeight: 70,
    forwardCGLimit: 190,
    aftCGLimit: 440,
    pilot1Arm: -1335,  //-1350 to range -1250, THese numbers are taken from VH-DGI sheet, which doesn't use either value.
    pilot2Arm: -272,
    distanceFrontWheelToDatum: 114,
    distanceFrontWheelToRearWheel: 5189,
    cockpitBallastBlockArm: -1960,
    tailBallastArm: 5400
};

export const JANTAR_CONFIG: AircraftConfiguration = {
    typeCertificateId: "SZD 48-1",
    hasFlaps: false,
    hasElevatorTrim: false,
    hasRudderVators: false,
    hasFixedUndercarriage: false,
    undercarriageType: UndercarriageConfiguration.INLINE,
    seatingType: SeatingConfiguration.SINGLE,
    wingSpanPrimary: 15,
    wingPanelCount: 2,
    hasWingletOption: false,
    wingMaxBallastAmount: 150,
    cockpitBallastBlockCount: 0,
    tailCGAdjustBallastType: TailBallastType.NONE,
    tailCGAdjustBallastCapacity: null
};

export const LS6_CONFIG: AircraftConfiguration = {
    typeCertificateId: "LS6C",
    hasFlaps: true,
    hasElevatorTrim: false,
    hasRudderVators: false,
    hasFixedUndercarriage: false,
    undercarriageType: UndercarriageConfiguration.INLINE,
    seatingType: SeatingConfiguration.SINGLE,
    wingSpanPrimary: 15,
    wingSpanAlternate: 17.5,
    wingPanelCount: 4,
    hasWingletOption: true,
    wingMaxBallastAmount: 140,
    cockpitBallastBlockCount: 5,
    cockpitBallastWeightPerBlock: 1,
    tailCGAdjustBallastType: TailBallastType.WATER,
    tailCGAdjustBallastCapacity: 5.5
};

export const K21_CONFIG: AircraftConfiguration = {
    typeCertificateId: "ASK21",
    hasFlaps: false,
    hasElevatorTrim: false,
    hasRudderVators: false,
    hasFixedUndercarriage: true,
    undercarriageType: UndercarriageConfiguration.INLINE,
    seatingType: SeatingConfiguration.TANDEM,
    wingSpanPrimary: 17,
    wingPanelCount: 2,
    hasWingletOption: false,
    cockpitBallastBlockCount: 10,
    cockpitBallastWeightPerBlock: 1.25,
    tailCGAdjustBallastType: TailBallastType.NONE,
    tailCGAdjustBallastCapacity: null
};

export const DG1000_CONFIG: AircraftConfiguration = {
    typeCertificateId: "DG1000S",
    hasFlaps: false,
    hasElevatorTrim: false,
    hasRudderVators: false,
    hasFixedUndercarriage: false,
    undercarriageType: UndercarriageConfiguration.INLINE,
    seatingType: SeatingConfiguration.TANDEM,
    wingSpanPrimary: 18,
    wingSpanAlternate: 20,
    wingPanelCount: 4,
    hasWingletOption: true,
    wingMaxBallastAmount: 160,
    cockpitBallastBlockCount: 4,
    cockpitBallastWeightPerBlock: 2.4,
    tailCGAdjustBallastType: TailBallastType.BLOCKS,
    tailCGAdjustBallastCapacity: [ { label: "Large", weightPerBlock: 2.4, maxBlockCount: 4 }, { label: "Small", weightPerBlock: 1.2, maxBlockCount: 2 }]
};
