import { CertificationCategory } from "../../src/util/certifcation-category";
import { AircraftConfiguration, SeatingConfiguration, TailBallastType, UndercarriageConfiguration } from "../../src/configuration/aircraft-configuration";
import { DatumCalculationModel, WeightAndBalanceDatum } from "../../src/datum/datum";

export const JANTAR2_DATUM: WeightAndBalanceDatum = {
    typeCertificateId: "SZD 48-1",
    category: CertificationCategory.UTILITY,
    wingspan: 15,
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

export const JANTAR3_DATUM: WeightAndBalanceDatum = {
    typeCertificateId: "SZD 48-3",
    category: CertificationCategory.UTILITY,
    wingspan: 15,
    location: "1",
    levellingInstructions: "flat",
    calculationModel: DatumCalculationModel.MODEL_1,
    maxAllUpWeight: 540,
    maxDryWeight: 390,
    maxNonLiftingPartsWeight: 243,
    maxSeatWeight: 110,
    minAllowedPilotWeight: 70,
    forwardCGLimit: 158,
    aftCGLimit: 336,
    pilot1Arm: -605,
    pilot1ArmMax: -713,
    distanceFrontWheelToDatum: 120,
    distanceFrontWheelToRearWheel: 3648
};

export const DG300_DATUM: WeightAndBalanceDatum = {
    typeCertificateId: "DG300 ELAN",
    category: CertificationCategory.UTILITY,
    wingspan: 15,
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
    distanceFrontWheelToRearWheel: 3648,
    tailWingBallastCompensationArm :4180,
    wingBallastArm: 160,
    cockpitBallastBlockArms: [ -1250 ],
    baggageArms: [ 140 ]
};

export const LS6_DATUM: WeightAndBalanceDatum = {
    typeCertificateId: "LS6C",
    category: CertificationCategory.UTILITY,
    wingspan: 15,
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
    cockpitBallastBlockArms: [-1400],
    tailWingBallastCompensationArm: 4181, // unknown, so just use the same as the tailwheel distance.
};

export const K21_DATUM: WeightAndBalanceDatum = {
    typeCertificateId: "ASK21",
    category: CertificationCategory.UTILITY,
    wingspan: 17,
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
    cockpitBallastBlockArms: [-2300]
};

export const DG1000_P1_RANGED_DATUM: WeightAndBalanceDatum = {
    typeCertificateId: "DG1000S",
    category: CertificationCategory.UTILITY,
    wingspan: 20,
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
    cockpitBallastBlockArms: [-1960],
    tailWingBallastCompensationArm: 5260,
    tailCGAdjustBallastArm: [ 5400 ]
};

export const DG1000_P1_FIXED_DATUM: WeightAndBalanceDatum = {
    typeCertificateId: "DG1000S",
    category: CertificationCategory.UTILITY,
    wingspan: 20,
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
    cockpitBallastBlockArms: [-1960],
    wingBallastArm: 206,
    tailWingBallastCompensationArm: 5260,
    tailCGAdjustBallastArm: [ 5400 ],
    baggageArms: [ 270 ]
};

export const T31_DATUM: WeightAndBalanceDatum = {
    typeCertificateId: "T31",
    category: CertificationCategory.UTILITY,
    wingspan: 10,
    location: "WRLE",
    levellingInstructions: "something",
    calculationModel: DatumCalculationModel.MODEL_3,
    maxAllUpWeight: 376,
    maxDryWeight: 376,
    maxNonLiftingPartsWeight: 376,
    maxSeatWeight: 110,
    minAllowedPilotWeight: 0,
    forwardCGLimit: 381,
    aftCGLimit: 533,
    pilot1Arm: -420,
    pilot2Arm: 571,
    distanceFrontWheelToDatum: -628,
    distanceFrontWheelToRearWheel: 5690
}

export const JANTAR_CONFIG: AircraftConfiguration = {
    typeCertificateId: "SZD 48-1",
    wingspanOptions: [{ span: 15, maxBallastAmount: 150, hasWinglets:false }],
    hasFlaps: false,
    hasElevatorTrim: false,
    hasRudderVators: false,
    hasFixedUndercarriage: false,
    undercarriageType: UndercarriageConfiguration.INLINE,
    seatingType: SeatingConfiguration.SINGLE,
    wingPanelCount: 2,
    tailCGAdjustBallastType: TailBallastType.NONE,
    tailCGAdjustBallastCapacity: null
};

export const LS6_CONFIG: AircraftConfiguration = {
    typeCertificateId: "LS6C",
    wingspanOptions: [
        { span: 15, maxBallastAmount: 140, hasWinglets: false },
        { span: 17.5, maxBallastAmount: 140, hasWinglets: false }
    ],
    hasFlaps: true,
    hasElevatorTrim: false,
    hasRudderVators: false,
    hasFixedUndercarriage: false,
    undercarriageType: UndercarriageConfiguration.INLINE,
    seatingType: SeatingConfiguration.SINGLE,
    wingPanelCount: 4,
    cockpitBallast: [{ label: "", maxBlockCount: 5, weightPerBlock: 1 }],
    tailCGAdjustBallastType: TailBallastType.NONE,
    tailWingBallastCompensationAmount: 5.5,
    tailCGAdjustBallastCapacity: null
};

export const K21_CONFIG: AircraftConfiguration = {
    typeCertificateId: "ASK21",
    wingspanOptions: [
        { span: 15, maxBallastAmount: 0, hasWinglets: false },
    ],
    hasFlaps: false,
    hasElevatorTrim: false,
    hasRudderVators: false,
    hasFixedUndercarriage: true,
    undercarriageType: UndercarriageConfiguration.INLINE,
    seatingType: SeatingConfiguration.TANDEM,
    wingPanelCount: 2,
    cockpitBallast: [ {label: "", maxBlockCount: 10, weightPerBlock: 1.25 }],
    tailCGAdjustBallastType: TailBallastType.NONE,
    tailCGAdjustBallastCapacity: null
};

export const DG300_CONFIG: AircraftConfiguration = {
    typeCertificateId: "DG300",
    wingspanOptions: [ 
        { span: 15, maxBallastAmount: 0, hasWinglets: true },
        { span: 15, maxBallastAmount: 130, hasWinglets: false },
        { span: 15, maxBallastAmount: 190, hasWinglets: false }
    ],
    hasFlaps: false,
    hasElevatorTrim: false,
    hasRudderVators: false,
    hasFixedUndercarriage: false,
    undercarriageType: UndercarriageConfiguration.INLINE,
    seatingType: SeatingConfiguration.SINGLE,
    wingPanelCount: 4,
    cockpitBallast: [ { label: "", maxBlockCount: 3, weightPerBlock: 2.16}],
    tailCGAdjustBallastType: TailBallastType.NONE,
    tailCGAdjustBallastCapacity: null,
    tailWingBallastCompensationAmount: 5.5,
    baggage: [15],
}

export const DG1000_CONFIG: AircraftConfiguration = {
    typeCertificateId: "DG1000S",
    wingspanOptions: [
        { span: 17.2, maxBallastAmount: 160, hasWinglets:false },
        { span: 18, maxBallastAmount: 160, hasWinglets:false },
        { span: 20, maxBallastAmount: 160, hasWinglets:true }
    ],
    hasFlaps: false,
    hasElevatorTrim: false,
    hasRudderVators: false,
    hasFixedUndercarriage: false,
    undercarriageType: UndercarriageConfiguration.INLINE,
    seatingType: SeatingConfiguration.TANDEM,
    wingPanelCount: 4,
    cockpitBallast: [ {label: "", maxBlockCount: 4, weightPerBlock: 2.4 }],
    tailCGAdjustBallastType: TailBallastType.BLOCKS,
    tailCGAdjustBallastCapacity: [ { label: "Large", weightPerBlock: 2.4, maxBlockCount: 4 }, { label: "Small", weightPerBlock: 1.2, maxBlockCount: 2 }],
    tailWingBallastCompensationAmount: 5.5
};

export const T31_CONFIG: AircraftConfiguration = {
    typeCertificateId: "T31",
    wingspanOptions: [ { span: 13.6, maxBallastAmount: 0, hasWinglets: false }],
    hasFlaps: false,
    hasElevatorTrim: false,
    hasRudderVators: false,
    hasFixedUndercarriage: true,
    undercarriageType: UndercarriageConfiguration.INLINE,
    seatingType: SeatingConfiguration.TANDEM,
    tailCGAdjustBallastType: TailBallastType.NONE,
    tailCGAdjustBallastCapacity: null,
    wingPanelCount: 1
};