"use strict";

const processInput = (inputString) => {
    const lines = inputString.trim().split("\n");
    const [gridSize, maxIterations] = lines[0].split(" ").map(val => parseInt(val));
    let currentIllumination = lines[1].split(" ").map(val => parseInt(val));

    for (let iterationIndex = 0; iterationIndex < maxIterations; iterationIndex++) {
        let nextIlluminationState = new Array(gridSize).fill(0);

        for (let targetPosition = 0; targetPosition < gridSize; targetPosition++) {
            let coverageCount = 0;
            for (let sourceIndex = 0; sourceIndex < gridSize; sourceIndex++) {
                const lightRange = currentIllumination[sourceIndex];
                const effectiveLeft = Math.max(0, sourceIndex - lightRange);
                const effectiveRight = Math.min(gridSize - 1, sourceIndex + lightRange);

                if (targetPosition >= effectiveLeft && targetPosition <= effectiveRight) {
                    coverageCount++;
                }
            }
            nextIlluminationState[targetPosition] = coverageCount;
        }

        currentIllumination = nextIlluminationState;

        let allCovered = true;
        for (let j = 0; j < gridSize; j++) {
            if (currentIllumination[j] !== gridSize) {
                allCovered = false;
                break;
            }
        }

        if (allCovered) {
            break;
        }
    }
    console.log(currentIllumination.join(" "));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
