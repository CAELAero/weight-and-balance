import { parseBoolean, parseFloat, parseInt } from "../../src/util/parse-utils";

describe("Parse Utilities", () => {
    describe("parseBoolean", () => {
        const INPUT_DATA = [
            { description: "lowercase true", input: "true", result: true },
            { description: "uppercase TRUE", input: "TRUE", result: true },
            { description: "lowercase false", input: "false", result: false },
            { description: "uppercase FALSE", input: "FALSE", result: false },
            { description: "lowercase yes", input: "yes", result: true },
            { description: "uppercase YES", input: "YES", result: true },
            { description: "random string is false", input: "freg3g3", result: false },
            { description: "Additional whitespace is ignored", input: " true ", result: true },
            { description: "Numbers do not equate to a boolean", input: "1", result: false },
        ];
        
        INPUT_DATA.forEach(data => {
            it(data.description, () => {
                const result = parseBoolean(data.input);

                expect(result).toBe(data.result);

            });
        });
    });

    describe("parseInt", () => {
        const INPUT_DATA = [
            { description: "Simple positive number", input: "1", result: 1 },
            { description: "Simple negative number", input: "-1", result: -1 },
            { description: "Zero is still a number", input: "0", result: 0 },
            { description: "Letters result in undefined", input: "vger3", result: undefined },
            { description: "Letters result in undefined", input: "vger3", result: undefined },
            { description: "Empty string is undefined", input: " ", result: undefined },
            { description: "Zero length string is undefined", input: "", result: undefined },
        ]

        INPUT_DATA.forEach(data => {
            it(data.description, () => {
                const result = parseInt(data.input);

                expect(result).toBe(data.result);
            });
        });
    });

    describe("parseFloat", () => {
        const INPUT_DATA = [
            { description: "Simple positive number", input: "1.3", result: 1.3 },
            { description: "Simple negative number", input: "-6.5", result: -6.5 },
            { description: "Zero is still a number", input: "0.0", result: 0 },
            { description: "Letters result in undefined", input: "vger3", result: undefined },
            { description: "Letters result in undefined", input: "vger3", result: undefined },
            { description: "Empty string is undefined", input: " ", result: undefined },
            { description: "Zero length string is undefined", input: "", result: undefined },
        ]

        INPUT_DATA.forEach(data => {
            it(data.description, () => {
                const result = parseFloat(data.input);

                expect(result).toBe(data.result);
            });
        });
    });
});