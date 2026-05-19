"use strict";

function Main(sourceData) {
    const processingOutcome = Array.from(sourceData).reduce((currentAccumulator, currentSymbol, currentPosition) => {
        if (currentSymbol === 'W') {
            currentAccumulator.cumulativeDisplacement += currentPosition - currentAccumulator.whiteMarkerCount;
            currentAccumulator.whiteMarkerCount++;
        }
        return currentAccumulator;
    }, { cumulativeDisplacement: 0, whiteMarkerCount: 0 });

    console.log(processingOutcome.cumulativeDisplacement);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
