"use strict";

const performCalculation = (inputData) => {
    const contentLines = inputData.trim().split("\n");

    const [totalElements, windowLength] = contentLines[0].split(" ").map(Number);
    const coordinates = contentLines[1].split(" ").map(Number);

    const calculatedCosts = Array.from({ length: totalElements - windowLength + 1 }, (_, windowStartIdx) => {
        const windowLeftmost = coordinates[windowStartIdx];
        const windowRightmost = coordinates[windowStartIdx + windowLength - 1];

        const distanceToLeftmostFromOrigin = Math.abs(windowLeftmost);
        const distanceToRightmostFromOrigin = Math.abs(windowRightmost);
        const spanDistance = Math.abs(windowRightmost - windowLeftmost);

        // The cost is the distance from origin to the closer endpoint,
        // plus the distance to traverse the entire span.
        return Math.min(distanceToLeftmostFromOrigin, distanceToRightmostFromOrigin) + spanDistance;
    });

    console.log(Math.min(...calculatedCosts));
};

performCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));
