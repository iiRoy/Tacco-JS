"use strict";

const evaluateTravelFeasibility = (inputData) => {
    const firstLineSegments = inputData.trim().split("\n")[0].split(" ");
    const [requiredDistance, availableTime, averageSpeed] = firstLineSegments.map(Number);

    let resultIndicator;
    if (requiredDistance <= availableTime * averageSpeed) {
        resultIndicator = "Yes";
    } else {
        resultIndicator = "No";
    }
    console.log(resultIndicator);
};

evaluateTravelFeasibility(require('fs').readFileSync('/dev/stdin', 'utf8'));
