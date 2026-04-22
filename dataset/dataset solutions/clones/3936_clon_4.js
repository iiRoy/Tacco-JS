const processDataFlow = (incomingPayload) => {
    const requiredCount = Number.parseInt(incomingPayload);

    const specificSequence = Object.freeze([2, 3, 25]);

    const baseOffsets = Object.freeze([2, 4, 3, 9, 8, 10, 6, 12]);

    const deriveElementAtPosition = (indexIdentifier) => {
        const cycleLength = baseOffsets.length;
        const repetitionBlock = Math.floor(indexIdentifier / cycleLength);
        const intraBlockOffset = indexIdentifier % cycleLength;
        return (repetitionBlock * 12) + baseOffsets[intraBlockOffset];
    };

    const finalArrangement = (requiredCount === 3)
        ? specificSequence
        : Array.from({ length: requiredCount }, (_, elementIndex) => {
            const derivedValue = deriveElementAtPosition(elementIndex);

            return (requiredCount % 2 === 1 && elementIndex === requiredCount - 1)
                ? 30000
                : derivedValue;
        });

    return finalArrangement.join(" ");
};

const executeProgram = (streamSource) => {
    const contentBuffer = require("node:fs").readFileSync(streamSource, "utf8");
    const outputString = processDataFlow(contentBuffer);
    console.log(outputString);
};

executeProgram("/dev/stdin");