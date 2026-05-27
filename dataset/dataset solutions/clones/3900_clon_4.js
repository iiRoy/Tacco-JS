"use strict";

const processData = incomingData => {
    const inputLines = incomingData.trim().split("\n");
    const itemQuantity = Number.parseInt(inputLines[0].split(" ")[0]);
    const initialValues = inputLines[1].split(" ").map(Number);

    const orderedValues = [...initialValues].sort((first, second) => first - second);

    const lowerBoundMedian = orderedValues[itemQuantity / 2 - 1];
    const upperBoundMedian = orderedValues[itemQuantity / 2];

    const transformedSequence = initialValues.map(currentValue => 
        (currentValue < upperBoundMedian) ? upperBoundMedian : lowerBoundMedian
    );
    
    console.log(transformedSequence.join("\n"));
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
