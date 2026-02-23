import { AircraftConfiguration, SeatingConfiguration, TailBallastType, UndercarriageConfiguration, WeightAndBalanceMeasurement } from "../../src";
import { calculateG1, calculateG2, calculateWingWeights, calculateBaseCGLimits, calculateWingWaterBallast, calculateTailWingCompensationBallast, calculateCockpitBallast } from "../../src/weight-and-balance/calculator-common";
import { JANTAR2_DATUM, JANTAR3_DATUM, JANTAR_CONFIG, DG1000_P1_FIXED_DATUM, DG1000_CONFIG, DG300_CONFIG, DG300_DATUM } from "./data-gen";

describe("Common Calculator Functions", () => {
    describe("calculateG1", () => {
        it("Calculates Inline value", () => {
            const INPUT_CONFIG: AircraftConfiguration = {
                typeCertificateId: "dummy",
                wingspanOptions: [],
                hasFlaps: false,
                hasElevatorTrim: false,
                hasRudderVators: false,
                hasFixedUndercarriage: false,
                undercarriageType: UndercarriageConfiguration.INLINE,
                seatingType: SeatingConfiguration.SINGLE,
                tailCGAdjustBallastType: TailBallastType.NONE,
                tailCGAdjustBallastCapacity: null,
                wingPanelCount: 0
            };

            const SRC_MEASUREMENTS: WeightAndBalanceMeasurement = {
                undercarriage1Weight: 235,
                undercarriage2Weight: 23,
                wing1Weight: 0
            }

            const result = calculateG1(INPUT_CONFIG, SRC_MEASUREMENTS);

            expect(result).toBe(SRC_MEASUREMENTS.undercarriage1Weight);
        });

        it("Calculates Trike Nosewheel value", () => {
            const INPUT_CONFIG: AircraftConfiguration = {
                typeCertificateId: "dummy",
                wingspanOptions: [],
                hasFlaps: false,
                hasElevatorTrim: false,
                hasRudderVators: false,
                hasFixedUndercarriage: false,
                undercarriageType: UndercarriageConfiguration.TRIKE_NOSEWHEEL,
                seatingType: SeatingConfiguration.SINGLE,
                tailCGAdjustBallastType: TailBallastType.NONE,
                tailCGAdjustBallastCapacity: null,
                wingPanelCount: 0
            };

            const SRC_MEASUREMENTS: WeightAndBalanceMeasurement = {
                undercarriage1Weight: 235,
                undercarriage2Weight: 23,
                wing1Weight: 0
            }

            const result = calculateG1(INPUT_CONFIG, SRC_MEASUREMENTS);

            expect(result).toBe(SRC_MEASUREMENTS.undercarriage1Weight);
        });

        it("Calculates Trike tailwheel value", () => {
            const INPUT_CONFIG: AircraftConfiguration = {
                typeCertificateId: "dummy",
                wingspanOptions: [],
                hasFlaps: false,
                hasElevatorTrim: false,
                hasRudderVators: false,
                hasFixedUndercarriage: false,
                undercarriageType: UndercarriageConfiguration.TRIKE_TAILDRAGGER,
                seatingType: SeatingConfiguration.SINGLE,
                tailCGAdjustBallastType: TailBallastType.NONE,
                tailCGAdjustBallastCapacity: null,
                wingPanelCount: 0
            };

            const SRC_MEASUREMENTS: WeightAndBalanceMeasurement = {
                undercarriage1Weight: 123,
                undercarriage2Weight: 124,
                wing1Weight: 0
            }

            const result = calculateG1(INPUT_CONFIG, SRC_MEASUREMENTS);

            expect(result).toBe(SRC_MEASUREMENTS.undercarriage1Weight + SRC_MEASUREMENTS.undercarriage2Weight);
        });
    });


    describe("calculateG2", () => {
        it("Calculates Inline value", () => {
            const INPUT_CONFIG: AircraftConfiguration = {
                typeCertificateId: "dummy",
                wingspanOptions: [],
                hasFlaps: false,
                hasElevatorTrim: false,
                hasRudderVators: false,
                hasFixedUndercarriage: false,
                undercarriageType: UndercarriageConfiguration.INLINE,
                seatingType: SeatingConfiguration.SINGLE,
                tailCGAdjustBallastType: TailBallastType.NONE,
                tailCGAdjustBallastCapacity: null,
                wingPanelCount: 0
            };

            const SRC_MEASUREMENTS: WeightAndBalanceMeasurement = {
                undercarriage1Weight: 235,
                undercarriage2Weight: 23,
                wing1Weight: 0
            }

            const result = calculateG2(INPUT_CONFIG, SRC_MEASUREMENTS);

            expect(result).toBe(SRC_MEASUREMENTS.undercarriage2Weight);
        });

        it("Calculates Trike Nosewheel value", () => {
            const INPUT_CONFIG: AircraftConfiguration = {
                typeCertificateId: "dummy",
                wingspanOptions: [],
                hasFlaps: false,
                hasElevatorTrim: false,
                hasRudderVators: false,
                hasFixedUndercarriage: false,
                undercarriageType: UndercarriageConfiguration.TRIKE_NOSEWHEEL,
                seatingType: SeatingConfiguration.SINGLE,
                tailCGAdjustBallastType: TailBallastType.NONE,
                tailCGAdjustBallastCapacity: null,
                wingPanelCount: 0
            };

            const SRC_MEASUREMENTS: WeightAndBalanceMeasurement = {
                undercarriage1Weight: 235,
                undercarriage2Weight: 23,
                undercarriage3Weight: 26,
                wing1Weight: 0
            }

            const result = calculateG2(INPUT_CONFIG, SRC_MEASUREMENTS);

            expect(result).toBe(SRC_MEASUREMENTS.undercarriage2Weight + SRC_MEASUREMENTS.undercarriage3Weight);
        });

        it("Calculates Trike tailwheel value", () => {
            const INPUT_CONFIG: AircraftConfiguration = {
                typeCertificateId: "dummy",
                wingspanOptions: [],
                hasFlaps: false,
                hasElevatorTrim: false,
                hasRudderVators: false,
                hasFixedUndercarriage: false,
                undercarriageType: UndercarriageConfiguration.TRIKE_TAILDRAGGER,
                seatingType: SeatingConfiguration.SINGLE,
                tailCGAdjustBallastType: TailBallastType.NONE,
                tailCGAdjustBallastCapacity: null,
                wingPanelCount: 0
            };

            const SRC_MEASUREMENTS: WeightAndBalanceMeasurement = {
                undercarriage1Weight: 123,
                undercarriage2Weight: 124,
                undercarriage3Weight: 135,
                wing1Weight: 0
            }

            const result = calculateG2(INPUT_CONFIG, SRC_MEASUREMENTS);

            expect(result).toBe(SRC_MEASUREMENTS.undercarriage3Weight);
        });
    });

    describe("calculateWingWeights", () => {
        const TEST_DATA = [
            { count: 1, weight1: 10, weight2: 1,  weight3: 1,  weight4: 1,  weight5: 1,  weight6: 1,  expected: 10, description: "Single panel" },
            { count: 2, weight1: 10, weight2: 9,  weight3: 1,  weight4: 1,  weight5: 1,  weight6: 1,  expected: 19, description: "Two panels" },
            { count: 3, weight1: 10, weight2: 9,  weight3: 8,  weight4: 1,  weight5: 1,  weight6: 1,  expected: 27, description: "Three panels" },
            { count: 4, weight1: 10, weight2: 9,  weight3: 8,  weight4: 7,  weight5: 1,  weight6: 1,  expected: 34, description: "Foun panels" },
            { count: 4, weight1: 10, weight2: 9,  weight3: undefined,  weight4: 7,  weight5: 1,  weight6: 1,  expected: 26, description: "Foun panels, weight 3 undefined" },
            { count: 4, weight1: 10, weight2: 9,  weight3: 8,  weight4: undefined,  weight5: 1,  weight6: 1,  expected: 27, description: "Foun panels, weight 4 undefined" },
            { count: 5, weight1: 10, weight2: 9,  weight3: 8,  weight4: 7,  weight5: 1,  weight6: 1,  expected: 0, description: "5 panels are not supported" },
            { count: 6, weight1: 10, weight2: 9,  weight3: 8,  weight4: 7,  weight5: 6,  weight6: 5,  expected: 45, description: "6 panels all defined" },
            { count: 6, weight1: 10, weight2: 9,  weight3: undefined,  weight4: 7,  weight5: 6,  weight6: 5,  expected: 37, description: "6 panels, weight 3 undefined" },
            { count: 6, weight1: 10, weight2: 9,  weight3: 8,  weight4: undefined,  weight5: 6,  weight6: 5,  expected: 38, description: "6 panels, weight 4 undefined" },
            { count: 6, weight1: 10, weight2: 9,  weight3: 8,  weight4: 7,  weight5: undefined,  weight6: 5,  expected: 39, description: "6 panels, weight 5 undefined" },
            { count: 6, weight1: 10, weight2: 9,  weight3: 8,  weight4: 7,  weight5: 6,  weight6: undefined,  expected: 40, description: "6 panels, weight 6 undefined" },
        ];

        TEST_DATA.forEach((data) => {
            it(data.description, () => {
                const INPUT_CONFIG: AircraftConfiguration = {
                    typeCertificateId: "dummy",
                    wingspanOptions: [],
                    hasFlaps: false,
                    hasElevatorTrim: false,
                    hasRudderVators: false,
                    hasFixedUndercarriage: false,
                    undercarriageType: UndercarriageConfiguration.TRIKE_TAILDRAGGER,
                    seatingType: SeatingConfiguration.SINGLE,
                    tailCGAdjustBallastType: TailBallastType.NONE,
                    tailCGAdjustBallastCapacity: null,
                    wingPanelCount: data.count
                };

                const SRC_MEASUREMENTS: WeightAndBalanceMeasurement = {
                    undercarriage1Weight: 1,
                    undercarriage2Weight: 1,
                    wing1Weight: data.weight1,
                    wing2Weight: data.weight2,
                    wing3Weight: data.weight3,
                    wing4Weight: data.weight4,
                    wing5Weight: data.weight5,
                    wing6Weight: data.weight6,
                }
                
                const result = calculateWingWeights(INPUT_CONFIG, SRC_MEASUREMENTS);

                expect(result).toBe(data.expected);
            })
        });
    });

    describe("calculateBaseCGLimits", () => {
        it("Creates a basic fixed P1 arm calculation", () => {
            const aircaft_weight = 279;
            const aircraft_arm = 551;
            const nlp_weight = 133;

            const result = calculateBaseCGLimits(JANTAR2_DATUM, aircaft_weight, aircraft_arm, JANTAR2_DATUM.aftCGLimit, nlp_weight);

            expect(result).toBeDefined();
            expect(result.minPilotWeight).toBeCloseTo(63, 1);
            expect(result.maxPilotWeight).toBe(106);
            expect(result.pilot1ArmUsed).toBe(JANTAR2_DATUM.pilot1Arm);
            expect(result.pilotArmMinMaxUsed).toBeTruthy();  // because we didn't provide a percentage value
            expect(result.maxFuselageLoad).toBe(106);
        });

        it("Min/max P1 arm calculation", () => {
            const aircaft_weight = 279;
            const aircraft_arm = 551;
            const nlp_weight = 133;

            const result = calculateBaseCGLimits(JANTAR3_DATUM, aircaft_weight, aircraft_arm, JANTAR3_DATUM.aftCGLimit, nlp_weight);

            expect(result).toBeDefined();
            expect(result.minPilotWeight).toBeCloseTo(63.5, 0);
            expect(result.maxPilotWeight).toBe(110);
            expect(result.pilot1ArmUsed).toBe(JANTAR3_DATUM.pilot1Arm);
            expect(result.pilotArmMinMaxUsed).toBeTruthy();  // because we didn't provide a percentage value
            expect(result.maxFuselageLoad).toBe(110);
        });

        it("Percentage P1 arm calculation", () => {
            const aircaft_weight = 279;
            const aircraft_arm = 551;
            const nlp_weight = 133;
            const arm_percentage = 10; // rough estimation to equalthe min/max version

            const result = calculateBaseCGLimits(JANTAR3_DATUM, aircaft_weight, aircraft_arm, JANTAR3_DATUM.aftCGLimit, nlp_weight, arm_percentage);
            expect(result).toBeDefined();
            expect(result.minPilotWeight).toBeCloseTo(63.5, 0);
            expect(result.maxPilotWeight).toBe(110);
            expect(result.pilot1ArmUsed).toBeCloseTo(-616, 0);
            expect(result.pilotArmMinMaxUsed).toBeFalsy();  
            expect(result.maxFuselageLoad).toBe(110);
        });
    });

    describe("calculateWaterBallast", () => {
        it("Basic calculation with no tail ballast", () => {
            const max_pilot = 106
            const empty_weight = 279;
            const placard_inc = 5;

            const result = calculateWingWaterBallast(JANTAR2_DATUM, 
                                                 JANTAR2_DATUM.minAllowedPilotWeight, 
                                                 max_pilot, 
                                                 empty_weight, 
                                                 JANTAR_CONFIG.wingspanOptions[0].maxBallastAmount, 
                                                 { placardCockpitWeightIncremments: placard_inc } );

            expect(result).toBeTruthy();    
            // +2 to account for the two ends at min and max pilot weights.
            expect(result.length).toBe(Math.round((max_pilot - JANTAR2_DATUM.minAllowedPilotWeight) / placard_inc) + 2);                                            

            expect(result[0].pilotWeight).toBe(JANTAR2_DATUM.minAllowedPilotWeight);
            expect(result[0].maxWingBallast).toBe(Math.min(JANTAR2_DATUM.maxAllUpWeight - JANTAR2_DATUM.minAllowedPilotWeight - empty_weight, 
                                                       JANTAR_CONFIG.wingspanOptions[0].maxBallastAmount));

            expect(result[2].pilotWeight - result[1].pilotWeight).toBe(placard_inc);                                                       

            const last_item = result.length - 1;

            expect(result[last_item].pilotWeight).toBe(max_pilot);
            expect(result[last_item].maxWingBallast).toBe(Math.min(JANTAR2_DATUM.maxAllUpWeight - max_pilot - empty_weight, 
                                                      JANTAR_CONFIG.wingspanOptions[0].maxBallastAmount));
        });
    });

    describe("calculateTailWingCompensationBallast", () => {
        it("Calculates tail ballast offsets with even increments", () => {
            const placard_inc = 20;

            const result = calculateTailWingCompensationBallast(
                DG1000_P1_FIXED_DATUM, 
                DG1000_CONFIG.wingspanOptions[1].maxBallastAmount, 
                DG1000_CONFIG.tailWingBallastCompensationAmount,
                { placardWingBallastWeightIncrememnts: placard_inc} );

            expect(result).toBeTruthy();
            expect(result.length).toBe(DG1000_CONFIG.wingspanOptions[1].maxBallastAmount / placard_inc);
            expect(result[0].wingBallastAmount).toBe(placard_inc);
            expect(result[0].tailBallastAmount).toBeCloseTo(0.8, 1);

            const last_item = result.length - 1;
            expect(result[last_item].wingBallastAmount).toBe(DG1000_CONFIG.wingspanOptions[1].maxBallastAmount);
            expect(result[last_item].tailBallastAmount).toBe(DG1000_CONFIG.tailWingBallastCompensationAmount);
        });

        it("Uses default increment if options not provided", () => {
            const result = calculateTailWingCompensationBallast(
                DG1000_P1_FIXED_DATUM, 
                DG1000_CONFIG.wingspanOptions[1].maxBallastAmount, 
                DG1000_CONFIG.tailWingBallastCompensationAmount);

            expect(result).toBeTruthy();
            expect(result[1].wingBallastAmount - result[0].wingBallastAmount).toBe(20);
        });

        it("Uses default increment if not defined", () => {
            const result = calculateTailWingCompensationBallast(
                DG1000_P1_FIXED_DATUM, 
                DG1000_CONFIG.wingspanOptions[1].maxBallastAmount, 
                DG1000_CONFIG.tailWingBallastCompensationAmount,
                {});

            expect(result).toBeTruthy();
            expect(result[1].wingBallastAmount - result[0].wingBallastAmount).toBe(20);
        });

        const ARM_ERROR_TEST_DATA = [
            { wing: undefined, tail: 5000, description: "Undefined wing ballast arm"},
            { wing: 0, tail: 5000, description: "Zero wing ballast arm"},
            { wing: 200, tail: undefined, description: "Undefined tail ballast arm"},
            { wing: 200, tail: 0, description: "Zero tail ballast arm"},
        ];

        ARM_ERROR_TEST_DATA.forEach((data) => {
            it(data.description, () => {
                const datum = { ...DG1000_P1_FIXED_DATUM };
                datum.wingBallastArm = data.wing;
                datum.tailWingBallastCompensationArm = data.tail;

                const result = calculateTailWingCompensationBallast( datum, 150, 5.5, { placardWingBallastWeightIncrememnts: 20} );

                expect(result).toBeFalsy();
            });

        });

        const AMOUNT_ERROR_TEST_DATA = [
            { wing: undefined, tail: 5, description: "Undefined wing ballast amount" },
            { wing: 0, tail: 5, description: "Zero wing ballast amount" },
            { wing: 100, tail: undefined, description: "Undefined tail ballast amount" },
            { wing: 100, tail: 0, description: "Zero tail ballast amount" },
        ]

        AMOUNT_ERROR_TEST_DATA.forEach((data) => {
            it(data.description, () => {
                const result = calculateTailWingCompensationBallast(
                    DG1000_P1_FIXED_DATUM, 
                    data.wing, 
                    data.tail,
                    { placardWingBallastWeightIncrememnts: 20} );

                expect(result).toBeFalsy();
            });
        });
    });

    describe("calculateCockpitBallast", () => {
        it("Won't calculate if ballast block arms missing", () => {
            const datum = { ...DG1000_P1_FIXED_DATUM };
            datum.cockpitBallastBlockArms = undefined;

            const result = calculateCockpitBallast(datum, 100, 100, 250, -500, []);

            expect(result).toBeFalsy();
        });

        it("Won't calculate if length of ballast arms and weights are different", () => {
            const result = calculateCockpitBallast(DG1000_P1_FIXED_DATUM, 100, 100, 250, -500, []);

            expect(result).toBeFalsy();
        });

        it("Basic calculation", () => {
            const result = calculateCockpitBallast(DG300_DATUM, 259, 553.4, DG300_DATUM.aftCGLimit, DG300_DATUM.pilot1Arm, DG300_CONFIG.cockpitBallast || [])

            let block_count = 0;
            
            if(DG300_CONFIG.cockpitBallast) {
                block_count = DG300_CONFIG.cockpitBallast[0].maxBlockCount;
            }

            expect(result).toBeTruthy();
            expect(result.length).toBe(block_count);

            for(let i = 0; i < block_count; i++) {
                expect(result[i].blockCount).toBe(i + 1);
                expect(result[i].minPilotWeight).toBeLessThan(DG300_DATUM.minAllowedPilotWeight);
            }
        });
    });
});