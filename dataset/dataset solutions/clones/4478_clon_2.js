"use strict";

const performCalculation = (inputDataString) => {
    let processedInputLines = inputDataString.trim().split("\n");

    const quantity = parseInt(processedInputLines[0], 10);

    const valueSequence = processedInputLines[1]
        .split(" ")
        .map( (parsedNumber) => {
            return parseInt(parsedNumber, 10);
        });

    const aggregateValue = valueSequence.reduce( (runningSum, elementValue) => runningSum + elementValue, 0);
  
    let currentLeftSegmentSum = valueSequence[0];
    let currentRightSegmentSum = aggregateValue - valueSequence[0];
  
    let finalMinimumDifference = Number.POSITIVE_INFINITY;
  
    for (let segmentIndex in valueSequence) {
        let calculatedDelta = Math.abs(currentRightSegmentSum - currentLeftSegmentSum);
    
        finalMinimumDifference = Math.min(finalMinimumDifference, calculatedDelta);
    
        currentRightSegmentSum -= valueSequence[parseInt(segmentIndex, 10) + 1];
        currentLeftSegmentSum  += valueSequence[parseInt(segmentIndex, 10) + 1];
    }
  
    console.log(finalMinimumDifference);
};

performCalculation(
    require("fs").readFileSync(
        "/dev/stdin",
        "utf8"
    )
);