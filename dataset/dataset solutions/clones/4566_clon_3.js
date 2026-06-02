"use strict";

const processInput = (inputString) => {
    const lines = inputString.trim().split("\n");
    const dimensions = lines[0].split(" ");
    let heightVal = parseInt(dimensions[0], 10);
    let widthVal = parseInt(dimensions[1], 10);

    let totalArea = heightVal * widthVal;
    let minDiffResult = totalArea; // Initialize with a value guaranteed to be larger than any valid difference

    const calculateAndMinimizeDifference = (areaPartA, areaPartB, areaPartC, currentMin) => {
        const currentAreas = [areaPartA, areaPartB, areaPartC];
        currentAreas.sort((a, b) => a - b);
        const calculatedDiff = currentAreas[2] - currentAreas[0];
        return Math.min(currentMin, calculatedDiff);
    };

    for (let rotationIdx = 0; rotationIdx < 2; rotationIdx++) {
        for (let splitHeight = 1; splitHeight < heightVal; splitHeight++) {
            const remainingHeight = heightVal - splitHeight;

            // Strategy 1: Vertical cut
            const area1_v = splitHeight * widthVal;
            const area2_v = remainingHeight * (widthVal / 2);
            const area3_v = totalArea - area1_v - area2_v;
            minDiffResult = calculateAndMinimizeDifference(area1_v, area2_v, area3_v, minDiffResult);

            // Strategy 2: Horizontal cut
            const area1_h = splitHeight * widthVal;
            const area2_h = (remainingHeight / 2) * widthVal;
            const area3_h = totalArea - area1_h - area2_h;
            minDiffResult = calculateAndMinimizeDifference(area1_h, area2_h, area3_h, minDiffResult);
        }

        // Rotate the dimensions for the second iteration
        let tempDim = heightVal;
        heightVal = widthVal;
        widthVal = tempDim;
        totalArea = heightVal * widthVal; // Recalculate total area after rotation
    }

    console.log(minDiffResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
