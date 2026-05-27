"use strict";

function processInputAndTransform(rawInput) {
    const inputSegments = rawInput.split(/\s|\n/).filter(Boolean);

    const iterationCount = parseInt(inputSegments[0], 10);
    const sourceStringValue = inputSegments[1];
    const targetIndexValue = parseInt(inputSegments[2], 10);

    const comparisonCharacter = sourceStringValue.charAt(targetIndexValue - 1);

    const resultCharacters = Array.from({ length: iterationCount }, (_, charIndex) => {
        const currentCharacter = sourceStringValue.charAt(charIndex);
        return currentCharacter === comparisonCharacter ? currentCharacter : '*';
    });

    return resultCharacters.join('');
}

function entryPoint(inputData) {
    console.log(processInputAndTransform(inputData));
}

if (typeof window === "undefined") {
    entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
}
