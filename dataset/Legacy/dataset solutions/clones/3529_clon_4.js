const fileSystem = require('fs');

function analyzeCharacterMapping(sourceSequence, targetSequence) {
    const mappingState = Array.from(sourceSequence).reduce((accumulator, currentSourceChar, index) => {
        if (!accumulator.isValid) {
            return accumulator;
        }

        const currentTargetChar = targetSequence[index];

        if (accumulator.forwardMap.has(currentSourceChar)) {
            if (accumulator.forwardMap.get(currentSourceChar) !== currentTargetChar) {
                accumulator.isValid = false;
            }
        } else {
            accumulator.forwardMap.set(currentSourceChar, currentTargetChar);
            accumulator.backwardMap.set(currentTargetChar, currentSourceChar);
        }
        return accumulator;
    }, {
        forwardMap: new Map(),
        backwardMap: new Map(),
        isValid: true
    });

    if (!mappingState.isValid) {
        console.log("No");
        return;
    }

    const finalConsistencyCheck = Array.from(mappingState.forwardMap.entries()).every(([sourceKey, mappedValue]) => {
        if (sourceKey === mappedValue) {
            return mappingState.backwardMap.get(sourceKey) === sourceKey;
        } else {
            return mappedValue !== mappingState.backwardMap.get(mappedValue);
        }
    });

    if (finalConsistencyCheck) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

try {
    const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    const inputTokens = rawInputContent.trim().split(/\s+/g);

    const firstInputToken = inputTokens[0];
    const secondInputToken = inputTokens[1];

    analyzeCharacterMapping(firstInputToken, secondInputToken);

} catch (processingError) {
    throw processingError;
}
