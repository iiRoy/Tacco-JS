"use strict";

class InputProcessor {
    constructor(rawInputContent) {
        this.tokens = rawInputContent.split(/ |\n/);
        this.tokenPointer = 0;
    }

    readNextNumber() {
        return Number(this.tokens[this.tokenPointer++]);
    }

    readNextString() {
        return this.tokens[this.tokenPointer++];
    }

    readNextBigInt() {
        return BigInt(this.tokens[this.tokenPointer++]);
    }

    readNumberArray(count) {
        const numbers = [];
        for (let i = 0; i < count; i++) {
            numbers.push(this.readNextNumber());
        }
        return numbers;
    }

    readBigIntArray(count) {
        const bigInts = [];
        for (let i = 0; i < count; i++) {
            bigInts.push(this.readNextBigInt());
        }
        return bigInts;
    }

    readNumberMatrix(height, width) {
        const matrix = [];
        for (let h = 0; h < height; h++) {
            const row = [];
            for (let w = 0; w < width; w++) {
                row.push(this.readNextNumber());
            }
            matrix.push(row);
        }
        return matrix;
    }

    readStringMatrix(height, width) {
        const matrix = [];
        for (let h = 0; h < height; h++) {
            const row = [];
            for (let w = 0; w < width; w++) {
                row.push(this.readNextString());
            }
            matrix.push(row);
        }
        return matrix;
    }
}

function createMultiDimensionalArray(initialValue) {
    const dimensionArguments = arguments;
    const totalDimensions = dimensionArguments.length;
    let arrayConstructionExpression = `Array(dimensionArguments[${totalDimensions - 1}]).fill().map(() => ${initialValue})`;

    for (let dimIndex = totalDimensions - 2; dimIndex >= 1; dimIndex--) {
        arrayConstructionExpression = `Array(dimensionArguments[${dimIndex}]).fill().map(() => ${arrayConstructionExpression})`;
    }
    return eval(arrayConstructionExpression);
}


function solveLightPropagationProblem() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const inputReader = new InputProcessor(fileContent);

    const arrayLength = inputReader.readNextNumber(); // N
    const maxSimulationIterations = inputReader.readNextNumber(); // K

    let currentLightBrightness = inputReader.readNumberArray(arrayLength); // A

    const STABILIZATION_CHECK_START_ITERATION = 41;

    for (let currentIteration = 0; currentIteration < maxSimulationIterations; currentIteration++) {
        const nextLightBrightness = new Array(arrayLength).fill(0); // B
        let minimumObservedBrightness = currentIteration; // Bmin initialized with k

        for (let elementIndex = 0; elementIndex < arrayLength; elementIndex++) {
            const lightSourceStrength = currentLightBrightness[elementIndex];

            // Calculate the 1-indexed position and illumination range
            const oneBasedPosition = elementIndex + 1;
            const illuminationRadius = lightSourceStrength;

            const effectiveMinOneBased = Math.max(oneBasedPosition - illuminationRadius, 1);
            const effectiveMaxOneBased = Math.min(oneBasedPosition + illuminationRadius, arrayLength);

            // Convert back to 0-indexed for array access
            const illuminationRangeStart = effectiveMinOneBased - 1;
            const illuminationRangeEnd = effectiveMaxOneBased - 1;

            // Increment brightness for all cells within the illuminated range
            for (let illuminatedCellIndex = illuminationRangeStart; illuminatedCellIndex <= illuminationRangeEnd; illuminatedCellIndex++) {
                nextLightBrightness[illuminatedCellIndex]++;
            }

            // Update the minimum brightness observed in the 'nextLightBrightness' array for this iteration
            minimumObservedBrightness = Math.min(minimumObservedBrightness, nextLightBrightness[elementIndex]);
        }

        // Update the current state for the next iteration
        currentLightBrightness = [...nextLightBrightness]; // Equivalent to B.concat()

        // Check for stabilization condition after a certain number of iterations
        if (currentIteration > STABILIZATION_CHECK_START_ITERATION) {
            // If the minimum brightness across all lights reaches 'arrayLength',
            // it implies stabilization, and further iterations won't change the state.
            if (minimumObservedBrightness >= arrayLength) {
                break;
            }
        }
    }

    return currentLightBrightness.join(" ");
}

console.log(solveLightPropagationProblem());
