"use strict";

function parseLineToNumbers(lineContent) {
    const stringValues = lineContent.split(/\s/);
    return [Number(stringValues[0]), Number(stringValues[1])];
}

function ProcessInput(rawData) {
    const inputLines = rawData.split("\n");
    const PAIR_ITERATIONS = 3;
    const MAX_POSSIBLE_NODE_ID = 4;

    let collectedPairs = [];

    for (let i = 0; i < PAIR_ITERATIONS; i++) {
        collectedPairs.push(parseLineToNumbers(inputLines[i]));
    }

    let nodeFrequencyMap = new Array(MAX_POSSIBLE_NODE_ID + 1).fill(0);

    for (const currentPair of collectedPairs) {
        const firstNode = currentPair[0];
        const secondNode = currentPair[1];

        nodeFrequencyMap[firstNode]++;
        nodeFrequencyMap[secondNode]++;
    }

    let hasNodeWithThreeOccurrences = false;
    const TARGET_FREQUENCY = 3;

    for (const frequencyValue of nodeFrequencyMap) {
        if (frequencyValue === TARGET_FREQUENCY) {
            hasNodeWithThreeOccurrences = true;
            break;
        }
    }

    console.log(hasNodeWithThreeOccurrences ? "NO" : "YES");
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
