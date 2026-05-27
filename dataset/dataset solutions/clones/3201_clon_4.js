"use strict";

function ProcessInput(rawData) {
    const numericEntries = rawData
        .split("\n")
        .slice(0, 3)
        .flatMap((lineSegment) =>
            lineSegment.split(" ").map(Number)
        );

    const occurrenceRegistry = numericEntries.reduce((accumulator, currentNumber) => {
        accumulator.set(currentNumber, (accumulator.get(currentNumber) || 0) + 1);
        return accumulator;
    }, new Map());

    const hasExactThreeOccurrences = Array.from(occurrenceRegistry.values()).some(
        (freqCount) => freqCount === 3
    );

    console.log(hasExactThreeOccurrences ? "NO" : "YES");
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
