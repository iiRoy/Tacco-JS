'use strict'

function Main(input) {
    const inputSegments = input.trim().split(' ');
    const [durationUnit, itemsPerUnit, totalTimeLimit] = inputSegments.map(segment => parseInt(segment, 10));

    let generatedProductCount = 0;
    let currentAccumulatedTime = 0;
    const adjustedTimeBoundary = totalTimeLimit + 0.5;

    while (currentAccumulatedTime + durationUnit <= adjustedTimeBoundary) {
        currentAccumulatedTime += durationUnit;
        generatedProductCount += itemsPerUnit;
    }

    console.log(generatedProductCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
