"use strict";

const rotationPermutations = {
    'N': [1, 5, 2, 3, 0, 4],
    'S': [4, 0, 2, 3, 5, 1],
    'W': [2, 1, 5, 0, 4, 3],
    'E': [3, 1, 0, 5, 4, 2]
};

const transformDieState = (currentValues, rotationKey) => {
    const permutationIndices = rotationPermutations[rotationKey];
    return currentValues.map((_, newPosition) => currentValues[permutationIndices[newPosition]]);
};

new Promise((resolveInput) => {
    let accumulatedData = "";
    process.stdin.on("data", (dataChunk) => { accumulatedData += dataChunk; });
    process.stdin.on("end", () => { resolveInput(accumulatedData); });
}).then(async (fullInputContent) => {
    const [initialConfigurationString, movementSequence] = fullInputContent.trim().split("\n");
    const initialDieValues = initialConfigurationString.split(" ").map(Number);

    const resultantDieValues = Array.from(movementSequence).reduce(transformDieState, initialDieValues);

    process.stdout.write(`${resultantDieValues[0]}\n`);
});
