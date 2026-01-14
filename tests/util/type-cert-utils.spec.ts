import { encodeTypeCertificateId } from "../../src";

describe("Type Certificate Utils", () => {
    describe("Encoding tests", () => {
        it("Doesn't change a simple string", () => {
            const input = "ALLCAPS";

            var result = encodeTypeCertificateId(input);

            expect(result).toEqual(input);
        }),
        it("Encodes as all upper case", () => {
            const input = "MixedCase";

            var result = encodeTypeCertificateId(input);

            expect(result).toEqual(input.toUpperCase());
        }),
        it("Removes spaces", () => {
            const input = "ALL CAPS";

            var result = encodeTypeCertificateId(input);

            expect(result).toEqual("ALLCAPS");
        })
        it("Removes dashes", () => {
            const input = "ALL-CAPS";

            var result = encodeTypeCertificateId(input);

            expect(result).toEqual("ALLCAPS");
        })
        it("Removes underscore", () => {
            const input = "ALL_CAPS";

            var result = encodeTypeCertificateId(input);

            expect(result).toEqual("ALLCAPS");
        })
        it("Removes dots", () => {
            const input = "ALL.CAPS";

            var result = encodeTypeCertificateId(input);

            expect(result).toEqual("ALLCAPS");
        })
        it("Removes double quotes", () => {
            const input = "ALL \"CAPS\"";

            var result = encodeTypeCertificateId(input);

            expect(result).toEqual("ALLCAPS");
        })
        it("Removes single quotes", () => {
            const input = "ALL \'CAPS\'";

            var result = encodeTypeCertificateId(input);

            expect(result).toEqual("ALLCAPS");
        })
        it("Removes slash", () => {
            const input = "ALL/CAPS";

            var result = encodeTypeCertificateId(input);

            expect(result).toEqual("ALLCAPS");
        })
        it("Removes everything", () => {
            const input = "ALL - CAPS";

            var result = encodeTypeCertificateId(input);

            expect(result).toEqual("ALLCAPS");
        })
        it("Substitutes an alternate type cert", () => {
            var result = encodeTypeCertificateId("LIBELLE");

            expect(result).toEqual("STANDARDLIBELLE");
        })
    })
});
