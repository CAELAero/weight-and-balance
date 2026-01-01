import { AircraftConfiguration, BallastBlockCapacity, SeatingConfiguration, TailBallastType, UndercarriageConfiguration } from "../../src/weight-and-balance/aircraft-configuration";
import { calculateBlockCombos, calculateWeightAndBalance, updateWeightAndBalance }  from "../../src/weight-and-balance/calculator";
import { SingleSeaterWeightAndBalanceResult, TwoSeaterWeightAndBalanceResult } from "../../src/weight-and-balance/result-types";
import { DatumCalculationModel, WeightAndBalanceDatum } from "../../src/weight-and-balance/datum";
import { WeightAndBalanceComponentChange, WeightAndBalanceMeasurement } from "../../src/weight-and-balance/measurements";

describe("WeightAndBalance Calculator", () => {
    describe("Calculate from measurements", () => {
        describe("Single Seater", () => {
            it("Basic 2 piece wing, no ballast", () => {
                const datum = getJantarDatum();
                const config = getJantarConfig();
                config.wingMaxBallastAmount = 0;

                const measured: WeightAndBalanceMeasurement = {
                    undercarriage1Weight: 246,
                    undercarriage2Weight: 33,
                    wing1Weight: 72,
                    wing2Weight: 74,
                };

                const result = calculateWeightAndBalance(datum, config, measured) as SingleSeaterWeightAndBalanceResult;

                expect(result).toBeTruthy();

                // Paperwork says553.23, but that doesn't match hand calculation, which is the number below.
                expect(result.emptyCGArm).toBe(551);
                expect(result.emptyWeight).toBe(279);
                expect(result.minPilotWeight).toBe(70);
                expect(result.maxPilotWeight).toBe(106);
                expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();

                // ensure we copy out the options too
                expect(result.calculationInputOptions.p1ArmRangePercentage).toBeUndefined();
                expect(result.calculationInputOptions.primaryWingspanSelected).toBeTruthy();
                expect(result.calculationInputOptions.useGFAMinBuffer).toBeFalsy();
            });

            it("4 piece wing - 15M", () => {
                const datum = getLS6Datum();
                const config = getLS6Config();

                const measured: WeightAndBalanceMeasurement = {
                    undercarriage1Weight: 244,
                    undercarriage2Weight: 28.3,
                    wing1Weight: 70,
                    wing3Weight: 2,
                    wing2Weight: 67,
                    wing4Weight: 2,
                };

                const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: false, calculatePrimary: true }) as SingleSeaterWeightAndBalanceResult;

                expect(result).toBeTruthy();

                // Paperwork says553.23, but that doesn't match hand calculation, which is the number below.
                expect(result.emptyCGArm).toBe(614);
                expect(result.emptyWeight).toBe(272.3);
                expect(result.minPilotWeight).toBe(70);
                expect(result.maxPilotWeight).toBe(109);
                expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();
            });

            it("4 piece wing - 17.5M", () => {
                const datum = getLS6Datum();
                const config = getLS6Config();

                // Just a bit heavier with the 17.5M wings, so the max ballast should drop 
                // a bit
                const measured: WeightAndBalanceMeasurement = {
                    undercarriage1Weight: 249.4,
                    undercarriage2Weight: 28.5,
                    wing1Weight: 70,
                    wing5Weight: 5,
                    wing2Weight: 67,
                    wing6Weight: 5,
                };

                const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: false, calculatePrimary: false }) as SingleSeaterWeightAndBalanceResult;
                
                expect(result).toBeTruthy();

                // Paperwork says553.23, but that doesn't match hand calculation, which is the number below.
                expect(result.emptyCGArm).toBe(608);
                expect(result.emptyWeight).toBe(277.9);
                expect(result.minPilotWeight).toBe(70);
                expect(result.maxPilotWeight).toBe(109);
                expect(result.allowedWingBallast).toBeDefined();
                expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();

                if(result.allowedWingBallast) {

                    expect(result.allowedWingBallast[0].pilotWeight).toBe(result.minPilotWeight);
                    expect(result.allowedWingBallast[0].maxBallast).toBe(config.wingMaxBallastAmount);

                    const w_ballast_len = result.allowedWingBallast.length - 1;
                    const max_ballast = Math.floor(datum.maxAllUpWeight - result.maxPilotWeight - result.emptyWeight);
    
                    expect(result.allowedWingBallast[w_ballast_len].pilotWeight).toBe(result.maxPilotWeight);
                    expect(result.allowedWingBallast[w_ballast_len].maxBallast).toBe(max_ballast);
                }

                // ensure we copy out the options too
                expect(result.calculationInputOptions.p1ArmRangePercentage).toBeUndefined();
                expect(result.calculationInputOptions.primaryWingspanSelected).toBeFalsy();
                expect(result.calculationInputOptions.useGFAMinBuffer).toBeFalsy();
            });

            it("GFA 5% buffer used ", () => {
                const datum = getLS6Datum();
                const config = getLS6Config();

                const measured: WeightAndBalanceMeasurement = {
                    undercarriage1Weight: 244,
                    undercarriage2Weight: 28.3,
                    wing1Weight: 70,
                    wing3Weight: 2,
                    wing2Weight: 67,
                    wing4Weight: 2,
                };

                const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: true, calculatePrimary: true }) as SingleSeaterWeightAndBalanceResult;

                expect(result).toBeTruthy();

                // Paperwork says553.23, but that doesn't match hand calculation, which is the number below.
                expect(result.emptyCGArm).toBe(614);
                expect(result.emptyWeight).toBe(272.3);
                expect(result.minPilotWeight).toBe(72);
                expect(result.maxPilotWeight).toBe(109);
                expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();

                // ensure we copy out the options too
                expect(result.calculationInputOptions.p1ArmRangePercentage).toBeUndefined();
                expect(result.calculationInputOptions.primaryWingspanSelected).toBeTruthy();
                expect(result.calculationInputOptions.useGFAMinBuffer).toBeTruthy();
            });
        });

        describe("Two Seater 2 wheel", () => {
            it("Basic, no water", () => {
                const datum = getK21Datum();
                const config = getK21Config();

                const measured: WeightAndBalanceMeasurement = {
                    undercarriage1Weight: 249,
                    undercarriage2Weight: 132,
                    wing1Weight: 78,
                    wing2Weight: 77,
                };

                const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: true, calculatePrimary: true }) as TwoSeaterWeightAndBalanceResult;

                expect(result).toBeTruthy();
                expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();
        
                //console.log(JSON.stringify(result, null, 2));
            });

            it("Two seater with tail ballast", () => {
                const datum = getDG1000SDatum();
                const config = getDG1000SConfig();

                // 18M configuration values from VH-DGI 8 Nov 2022 measurements.
                const measured: WeightAndBalanceMeasurement = {
                    undercarriage1Weight: 364.5,
                    undercarriage2Weight: 47,
                    wing1Weight: 91.5,
                    wing2Weight: 91.5,
                    wing3Weight: 2,
                    wing4Weight: 2,
                };

                const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: true, calculatePrimary: true }) as TwoSeaterWeightAndBalanceResult;

                expect(result).toBeTruthy();
        
                // console.log(JSON.stringify(result, null, 2));

                expect(result.emptyCGArm).toBe(707);
                expect(result.emptyWeight).toBe(411.5);
                expect(result.soloMinPilotWeight).toBe(70);
                expect(result.soloMaxPilotWeight).toBe(110);

                expect(result.dualPilotWeightRanges).toBeDefined();
                expect(result.allowedWingBallast).toBeDefined();

                if(result.allowedWingBallast) {
                    expect(result.allowedWingBallast[0].maxBallast).toBe(config.wingMaxBallastAmount);
                    expect(result.allowedWingBallast[0].pilotWeight).toBe(datum.minAllowedPilotWeight);
                }
            });

            it("Multiple wing panels combined together", () => {
                const datum = getDG1000SDatum();
                const config = getDG1000SConfig();

                // 18M configuration values from VH-DGI 8 Nov 2022 measurements.
                const measured: WeightAndBalanceMeasurement = {
                    undercarriage1Weight: 364.5,
                    undercarriage2Weight: 47,
                    wing1Weight: 93.5,
                    wing2Weight: 93.5,
                };

                const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: true, calculatePrimary: true }) as TwoSeaterWeightAndBalanceResult;

                expect(result).toBeTruthy();
        
                //console.log(JSON.stringify(result, null, 2));

                // Should give identical values to the 4 panel version above.
                expect(result.emptyCGArm).toBe(707);
                expect(result.emptyWeight).toBe(411.5);
                expect(result.soloMinPilotWeight).toBe(70);
                expect(result.soloMaxPilotWeight).toBe(110);
            });

            it("P1 arm range with default conservative handling", () => {
                const datum_default = getDG1000SDatum(false);
                const datum_ranged = getDG1000SDatum(true);
                const config = getDG1000SConfig();

                // 18M configuration values from VH-DGI 8 Nov 2022 measurements.
                const measured: WeightAndBalanceMeasurement = {
                    undercarriage1Weight: 364.5,
                    undercarriage2Weight: 47,
                    wing1Weight: 93.5,
                    wing2Weight: 93.5,
                };

                const result_default = calculateWeightAndBalance(datum_default, config, measured, { useGFAMinBuffer: true, calculatePrimary: true }) as TwoSeaterWeightAndBalanceResult;
                const result_ranged = calculateWeightAndBalance(datum_ranged, config, measured, { useGFAMinBuffer: true, calculatePrimary: true }) as TwoSeaterWeightAndBalanceResult;

                expect(result_default).toBeTruthy();
                expect(result_ranged).toBeTruthy();
        
                //console.log(JSON.stringify(result, null, 2));

                // Should give identical values to the 4 panel version above.
                // Weights and arm should not change.
                expect(result_ranged.emptyCGArm).toBe(result_default.emptyCGArm);
                expect(result_ranged.emptyWeight).toBe(result_default.emptyWeight);
                expect(result_ranged.nonLiftingPartsWeight).toBe(result_default.nonLiftingPartsWeight);

                // Since we know with this aircraft that  the min pilot weight is actually much less 
                // that the required min pilot, these shouldn't change either. 
                expect(result_ranged.soloMinPilotWeight).toBe(70);
                expect(result_ranged.soloMaxPilotWeight).toBe(110);

                //console.log(JSON.stringify(result_ranged, null, 2));

                // ensure we copy out the options too
                expect(result_ranged.calculationInputOptions.p1ArmRangePercentage).toBeUndefined();
                expect(result_ranged.calculationInputOptions.primaryWingspanSelected).toBeTruthy();
                expect(result_ranged.calculationInputOptions.useGFAMinBuffer).toBeTruthy();
            });
        });

        describe("Two Seater 3 wheel", () => {
            describe("Nose wheel", () => {

            })

            describe("Taildragger", () => {
                
            })
        });

        describe("Error handling", () => {
            it("Ignores missing ballast block arm", () => {
                const datum = getLS6Datum();
                const config = getLS6Config();

                datum.cockpitBallastBlockArm = undefined;

                const measured: WeightAndBalanceMeasurement = {
                    undercarriage1Weight: 244,
                    undercarriage2Weight: 28.3,
                    wing1Weight: 70,
                    wing3Weight: 2,
                    wing2Weight: 67,
                    wing4Weight: 2,
                };

                const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: true }) as SingleSeaterWeightAndBalanceResult;

                expect(result).toBeTruthy();
                expect(result.cockpitBallast).toBeFalsy();
            });

            it("Ignores zero ballast block count", () => {
                const datum = getLS6Datum();
                const config = getLS6Config();

                config.cockpitBallastBlockCount = 0;

                const measured: WeightAndBalanceMeasurement = {
                    undercarriage1Weight: 244,
                    undercarriage2Weight: 28.3,
                    wing1Weight: 70,
                    wing3Weight: 2,
                    wing2Weight: 67,
                    wing4Weight: 2,
                };

                const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: true }) as SingleSeaterWeightAndBalanceResult;

                expect(result).toBeTruthy();
                expect(result.cockpitBallast).toBeFalsy();
            });

            it("Ignores zero ballast block weight", () => {
                const datum = getLS6Datum();
                const config = getLS6Config();

                config.cockpitBallastWeightPerBlock = 0;
                
                const measured: WeightAndBalanceMeasurement = {
                    undercarriage1Weight: 244,
                    undercarriage2Weight: 28.3,
                    wing1Weight: 70,
                    wing3Weight: 2,
                    wing2Weight: 67,
                    wing4Weight: 2,
                };

                const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: true }) as SingleSeaterWeightAndBalanceResult;

                expect(result).toBeTruthy();
                expect(result.cockpitBallast).toBeFalsy();
            });

            it("Fails on a two seater with no P2 arm defined", () => {
                const datum = getK21Datum();
                const config = getK21Config();

                datum.pilot2Arm = undefined;

                const measured: WeightAndBalanceMeasurement = {
                    undercarriage1Weight: 249,
                    undercarriage2Weight: 132,
                    wing1Weight: 78,
                    wing2Weight: 77,
                };

                const result = calculateWeightAndBalance(datum, config, measured, { useGFAMinBuffer: false }) as TwoSeaterWeightAndBalanceResult;

                expect(result).toBeFalsy();
            });
        })

        describe("Block combination calculator", () => {
            it("Single block size", () => {
                const input: BallastBlockCapacity = {
                    label: "Regular",
                    weightPerBlock: 2,
                    maxBlockCount: 3
                };

                const result = calculateBlockCombos([input]);

                expect(result).toBeTruthy();
                expect(result.length).toBe(3);
                expect(result[0].length).toBe(1);
                expect(result[0][0].label).toBe(input.label);
                expect(result[0][0].blockCount).toBe(1);
                expect(result[0][0].weightPerBlock).toBe(input.weightPerBlock);

                expect(result[1].length).toBe(1);
                expect(result[1][0].label).toBe(input.label);
                expect(result[1][0].blockCount).toBe(2);
                expect(result[1][0].weightPerBlock).toBe(input.weightPerBlock);

                expect(result[2].length).toBe(1);
                expect(result[2][0].label).toBe(input.label);
                expect(result[2][0].blockCount).toBe(3);
                expect(result[2][0].weightPerBlock).toBe(input.weightPerBlock);
            });

            it("Simple 2 block combo one of each size", () => {
                const input1: BallastBlockCapacity = {
                    label: "Large",
                    weightPerBlock: 2,
                    maxBlockCount: 1
                };
                const input2: BallastBlockCapacity = {
                    label: "Small",
                    weightPerBlock: 1,
                    maxBlockCount: 1
                };

                const result = calculateBlockCombos([input1, input2]);

                expect(result).toBeTruthy();
                expect(result.length).toBe(3);
                expect(result[0].length).toBe(1);
                expect(result[0][0].label).toBe(input2.label);
                expect(result[0][0].blockCount).toBe(1);
                expect(result[0][0].weightPerBlock).toBe(input2.weightPerBlock);

                expect(result[1].length).toBe(1);
                expect(result[1][0].label).toBe(input1.label);
                expect(result[1][0].blockCount).toBe(1);
                expect(result[1][0].weightPerBlock).toBe(input1.weightPerBlock);

                expect(result[2].length).toBe(2);
                expect(result[2][0].label).toBe(input1.label);
                expect(result[2][0].blockCount).toBe(1);
                expect(result[2][0].weightPerBlock).toBe(input1.weightPerBlock);
                expect(result[2][1].label).toBe(input2.label);
                expect(result[2][1].blockCount).toBe(1);
                expect(result[2][1].weightPerBlock).toBe(input2.weightPerBlock);
            });

            it("Complex 2 block combo (DG1000)", () => {
                const input1: BallastBlockCapacity = {
                    label: "Large",
                    weightPerBlock: 2,
                    maxBlockCount: 4
                };
                const input2: BallastBlockCapacity = {
                    label: "Small",
                    weightPerBlock: 1,
                    maxBlockCount: 2
                };

                const result = calculateBlockCombos([input1, input2]);

                expect(result).toBeTruthy();
                expect(result.length).toBe(10);

                // spot check the last 2 entries.
                expect(result[8].length).toBe(2);
                expect(result[8][0].label).toBe(input1.label);
                expect(result[8][0].blockCount).toBe(4);
                expect(result[8][0].weightPerBlock).toBe(input1.weightPerBlock);
                expect(result[8][1].label).toBe(input2.label);
                expect(result[8][1].blockCount).toBe(1);
                expect(result[8][1].weightPerBlock).toBe(input2.weightPerBlock);

                expect(result[9].length).toBe(2);
                expect(result[9][0].label).toBe(input1.label);
                expect(result[9][0].blockCount).toBe(4);
                expect(result[9][0].weightPerBlock).toBe(input1.weightPerBlock);
                expect(result[9][1].label).toBe(input2.label);
                expect(result[9][1].blockCount).toBe(2);
                expect(result[9][1].weightPerBlock).toBe(input2.weightPerBlock);
            });
        })
    });

    describe("Update with component change", () => {
        it("Returns the same result if no item change data", () => {
            const datum = getJantarDatum();
            const config = getJantarConfig();
            config.wingMaxBallastAmount = 0;

            const change_request: WeightAndBalanceComponentChange = {
                aircraftWeight: 279,
                aircraftArm: 551,
                nonLiftingPartsWeight: 133
            };

            const result = updateWeightAndBalance(datum, config, change_request) as SingleSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();

            // Paperwork says553.23, but that doesn't match hand calculation, which is the number below.
            expect(result.emptyCGArm).toBe(change_request.aircraftArm);
            expect(result.emptyWeight).toBe(change_request.aircraftWeight);
            expect(result.minPilotWeight).toBe(70);
            expect(result.maxPilotWeight).toBe(106);
            expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();
        });

        it("Remove tail fixed ballast weight", () => {
            // This example comes from IZX calculated numbers from the original weight and balance. 
            // Later 3kg of lead was added to the tail, so this is the reverse calculation. The numbers
            // here should result in returning to the original weight and balance arm.
            const datum = getJantarDatum();
            const config = getJantarConfig();
            config.wingMaxBallastAmount = 0;

            const change_request: WeightAndBalanceComponentChange = {
                aircraftWeight: 279,
                aircraftArm: 551,
                nonLiftingPartsWeight: 133,
                itemArm: datum.distanceFrontWheelToRearWheel + datum.distanceFrontWheelToDatum,
                itemWeightChange: -3.0,
                weightChangeInFuselage: true
            };

            const result = updateWeightAndBalance(datum, config, change_request) as SingleSeaterWeightAndBalanceResult;

            expect(result).toBeTruthy();

            // only the arm should change here;
            expect(result.emptyCGArm).toBe(516);
            expect(result.emptyWeight).toBe(change_request.aircraftWeight + (change_request.itemWeightChange || 0));
            expect(result.minPilotWeight).toBe(70);
            expect(result.maxPilotWeight).toBe(109);
            expect(result.tailBallastAdjustedPilotWeights).toBeUndefined();
        });
    })
});

function getJantarDatum(): WeightAndBalanceDatum {
    const datum: WeightAndBalanceDatum = {
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

    return datum;
}

function getDG300Datum(): WeightAndBalanceDatum {
    const datum: WeightAndBalanceDatum = {
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

    return datum;
}

function getLS6Datum(): WeightAndBalanceDatum {
    const datum: WeightAndBalanceDatum = {
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

    return datum;
}

function getK21Datum(): WeightAndBalanceDatum {
    const datum: WeightAndBalanceDatum = {
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

    return datum;
}

function getDG1000SDatum(withRange: boolean = false): WeightAndBalanceDatum {
    const datum: WeightAndBalanceDatum = {
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

    if(withRange) {
        datum.pilot1Arm = -1250;
        datum.pilot1ArmMax = -1350;
    }

    return datum;
}

function getJantarConfig(): AircraftConfiguration {
    const config: AircraftConfiguration = {
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

    return config;
}

function getLS6Config(): AircraftConfiguration {
    const config: AircraftConfiguration = {
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

    return config;
}

function getK21Config(): AircraftConfiguration {
    const config: AircraftConfiguration = {
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

    return config;
}

function getDG1000SConfig(): AircraftConfiguration {
    const config: AircraftConfiguration = {
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

    return config;
}
