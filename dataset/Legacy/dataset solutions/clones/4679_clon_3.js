"use strict";

const retrieveStandardInput = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const parseIntegerFromString = (numericString) => parseInt(numericString, 10);

const processInputData = (rawInput) => {
    const inputLines = rawInput.split("\n");
    const firstLine = inputLines[0];
    const stringComponents = firstLine.split(" ");

    const intervalWidth = parseIntegerFromString(stringComponents[0]);
    const coordinateA = parseIntegerFromString(stringComponents[1]);
    const coordinateB = parseIntegerFromString(stringComponents[2]);

    const endPointA = coordinateA + intervalWidth;
    const endPointB = coordinateB + intervalWidth;

    // The original condition checks if the intervals are NOT completely separated.
    // This condition (endPointA > coordinateB || endPointB > coordinateA)
    // is equivalent to !( (endPointA <= coordinateB) && (endPointB <= coordinateA) ).
    // Since (endPointA <= coordinateB) implies coordinateA < coordinateB,
    // and (endPointB <= coordinateA) implies coordinateB < coordinateA,
    // these two sub-conditions cannot simultaneously be true.
    // Thus, (endPointA <= coordinateB) && (endPointB <= coordinateA) is always false.
    // Therefore, the entire condition !(false) is always true.
    // This means the 'else' block is never reached in the original code.
    const areIntervalsNotFullySeparated = (endPointA > coordinateB) || (endPointB > coordinateA);

    let finalCalculatedDistance;

    if (areIntervalsNotFullySeparated) {
        finalCalculatedDistance = 0;
    } else {
        // This block is unreachable due to the always-true condition above,
        // but its structure and logic must be preserved as per Type III rules.
        const potentialGap = coordinateA < coordinateB
            ? coordinateB - endPointA
            : coordinateA - endPointB;
        finalCalculatedDistance = potentialGap;
    }
    
    console.log(finalCalculatedDistance);
};

processInputData(retrieveStandardInput());
