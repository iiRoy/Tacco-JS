function ProcessInput(rawData) {
    "use strict";

    const linesArray = rawData.split('\n');
    const dimensionsAndCounts = linesArray.shift().split(' ').map(elementStr => Number.parseInt(elementStr, 10));

    const heightVal = dimensionsAndCounts[0];
    const widthVal = dimensionsAndCounts[1];
    const countA = dimensionsAndCounts[2];
    const countB = dimensionsAndCounts[3];

    // Helper function to create a string of repeated characters
    const createCharString = (length, char) => {
        let resultString = '';
        for (let k = 0; k < length; k++) {
            resultString += char;
        }
        return resultString;
    };

    if (countB === 0) {
        // Case 1: countB is zero
        const patternPartOne = createCharString(countA, '1');
        const patternPartZero = createCharString(widthVal - countA, '0');
        const finalOutputLine = patternPartOne + patternPartZero;

        for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
            console.log(finalOutputLine);
        }
    } else if (countA === 0) {
        // Case 2: countA is zero
        const zeroPatternLine = createCharString(widthVal, '0');
        const onePatternLine = createCharString(widthVal, '1');
        const bThreshold = countB; // Helper variable for clarity

        for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
            if (rowIdx < bThreshold) {
                console.log(zeroPatternLine);
            } else {
                console.log(onePatternLine);
            }
        }
    } else if ((heightVal * countA) !== (widthVal * countB)) {
        // Case 3: Incompatible dimensions
        console.log("No");
    } else {
        // Case 4: General pattern generation
        const isWidthDivisibleByA = (widthVal % countA === 0);

        if (isWidthDivisibleByA) {
            // Subcase 4.1: width is a multiple of countA
            for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
                const currentBlockRowIndex = Math.floor(rowIdx / countB);
                const blockStartColumn = currentBlockRowIndex * countA;
                const blockEndColumn = (currentBlockRowIndex + 1) * countA;

                const lineCharacters = Array(widthVal).fill('0'); // Initialize with '0's
                for (let colIdx = blockStartColumn; colIdx < blockEndColumn; colIdx++) {
                    if (colIdx < widthVal) { // Ensure index is within bounds
                        lineCharacters[colIdx] = '1';
                    }
                }
                console.log(lineCharacters.join(''));
            }
        } else {
            // Subcase 4.2: width is not a multiple of countA (modulo arithmetic)
            for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
                const lineCharacters = Array(widthVal).fill('0'); // Initialize with '0's

                const currentModuloStart = (rowIdx * countA) % widthVal;
                const nextModuloEnd = ((rowIdx + 1) * countA) % widthVal;

                const requiresWrapAroundLogic = (currentModuloStart + countA >= widthVal);

                if (requiresWrapAroundLogic) {
                    // Pattern wraps around the end of the line
                    for (let colIdx = 0; colIdx < widthVal; colIdx++) {
                        if (colIdx >= currentModuloStart || colIdx < nextModuloEnd) {
                            lineCharacters[colIdx] = '1';
                        }
                    }
                } else {
                    // Pattern is a contiguous block
                    for (let colIdx = 0; colIdx < widthVal; colIdx++) {
                        if (colIdx >= currentModuloStart && colIdx < nextModuloEnd) {
                            lineCharacters[colIdx] = '1';
                        }
                    }
                }
                console.log(lineCharacters.join(''));
            }
        }
    }
}

// This line should remain unchanged as per instructions
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
