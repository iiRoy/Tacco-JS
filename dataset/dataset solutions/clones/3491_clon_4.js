'use strict';

function evaluateCandidates(sourceData) {
    const dataLines = sourceData.split('\n');

    const maxCostAllowed = Number(dataLines[0].split(' ')[1]);

    const viableOptions = dataLines.slice(1)
        .map(entryLine => entryLine.split(' ').map(strNum => Number(strNum)))
        .filter(optionPair => optionPair[1] <= maxCostAllowed);

    if (viableOptions.length === 0) {
        return "TLE";
    } else {
        const candidateValues = viableOptions.map(optionPair => optionPair[0]);
        const minimumAchievable = Math.min(...candidateValues);
        return minimumAchievable;
    }
}

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(evaluateCandidates(rawInputContent));
