import { BallastBlockCapacity } from "../../src/configuration/aircraft-configuration";
import { calculateBlockCombos }  from "../../src/weight-and-balance/calculator";

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
});
