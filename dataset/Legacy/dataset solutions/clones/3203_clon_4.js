"use strict";

function createNumericStream(sourceText) {
    const allNumericTokens = sourceText
        .split('\n')
        .flatMap(lineSegment => lineSegment.trim().split(' '))
        .filter(tokenUnit => tokenUnit !== '')
        .map(Number);
    let currentPosition = 0;

    return {
        retrieveNext: () => {
            if (currentPosition < allNumericTokens.length) {
                return allNumericTokens[currentPosition++];
            }
            return undefined;
        }
    };
}

function analyzeConnectivity(sourceData) {
    const numericSource = createNumericStream(sourceData);

    const degreeCounter = new Map();
    Array.from({ length: 4 }).forEach((_, index) => degreeCounter.set(index + 1, 0));

    Array.from({ length: 3 }).forEach(() => {
        const firstEndpoint = numericSource.retrieveNext();
        const secondEndpoint = numericSource.retrieveNext();

        if (firstEndpoint !== undefined && secondEndpoint !== undefined) {
            degreeCounter.set(firstEndpoint, degreeCounter.get(firstEndpoint) + 1);
            degreeCounter.set(secondEndpoint, degreeCounter.get(secondEndpoint) + 1);
        }
    });

    const finalDegrees = Array.from(degreeCounter.values()).sort((valA, valB) => valA - valB);

    const expectedPattern = [1, 1, 2, 2];
    const isConfigurationValid = finalDegrees.length === expectedPattern.length &&
                                 finalDegrees.every((value, index) => value === expectedPattern[index]);

    if (isConfigurationValid) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

analyzeConnectivity(require("fs").readFileSync("/dev/stdin", "utf8"));
