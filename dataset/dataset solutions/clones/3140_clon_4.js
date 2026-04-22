"use strict"

const createLineIterator = (textualSource) => {
    const segments = textualSource.trim().split("\n");
    let pointer = 0;
    return {
        pull: () => {
            if (pointer < segments.length) {
                return segments[pointer++];
            }
            return undefined;
        }
    };
};

const parseNumericSequence = (textLine) => textLine.split(" ").map(Number);

function ProcessorKernel(sourceData) {
    const outcomeCollection = [];
    const lineSupply = createLineIterator(sourceData);

    const obtainLine = () => lineSupply.pull();
    const storeOutcome = (data) => outcomeCollection.push(data);

    const [entityCount, attributeCount, offsetBias] = parseNumericSequence(obtainLine());
    const coefficientVector = parseNumericSequence(obtainLine());

    const finalTally = Array.from({ length: entityCount }).reduce((currentCount, _, elementIndex) => {
        const currentAttributes = parseNumericSequence(obtainLine());

        const computedScore = currentAttributes.reduce((scoreAccumulator, attributeValue, attributeIndex) => {
            return scoreAccumulator + attributeValue * coefficientVector[attributeIndex];
        }, offsetBias);

        return currentCount + (computedScore > 0 ? 1 : 0);
    }, 0);

    storeOutcome(finalTally);

    const formattedResult = outcomeCollection.join("\n");
    console.log(formattedResult);
    return formattedResult;
}

ProcessorKernel(require("fs").readFileSync("/dev/stdin", "utf8"));