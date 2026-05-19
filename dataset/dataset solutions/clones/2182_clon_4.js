"use strict";

// Helper function to count set bits (popcount) in a number.
// This replaces the string-based `mask.split('1').length - 1` approach.
function countSetBits(numericValue) {
    let bitCounter = 0;
    let temporaryValue = numericValue;
    while (temporaryValue > 0) {
        temporaryValue &= (temporaryValue - 1); // Brian Kernighan's algorithm
        bitCounter++;
    }
    return bitCounter;
}

// Helper function to construct a number by placing digits from a source number
// into positions indicated by '1's in a binary pattern string.
// This replaces the `replace9` function.
function assembleNumberFromPattern(binaryPatternString, sourceDigitsValue) {
    const patternCharacters = binaryPatternString.split('');
    const sourceDigitCharacters = String(sourceDigitsValue).split('');
    const assembledCharacters = Array(patternCharacters.length).fill('0');
    let sourceDigitPointer = sourceDigitCharacters.length - 1; // Start from the rightmost digit of the source

    // Iterate the pattern from right to left to fill digits
    for (let position = patternCharacters.length - 1; position >= 0; position--) {
        if (patternCharacters[position] === '1') {
            if (sourceDigitPointer >= 0) {
                assembledCharacters[position] = sourceDigitCharacters[sourceDigitPointer];
                sourceDigitPointer--;
            } else {
                // If there are more '1's in the pattern than available source digits,
                // the original code would result in `undefined` being pushed,
                // leading to `Number("...undefined...")` which is NaN.
                // We explicitly return NaN to preserve this behavior.
                return NaN;
            }
        }
    }
    return Number(assembledCharacters.join(''));
}

// Generator function for the outer loop, mimicking the `for` loop with a `break` condition.
// It yields objects containing pattern data until the length condition is met.
function* generatePatternData(maxIterations, lengthLimit) {
    for (let currentInteger = 0; currentInteger < maxIterations; currentInteger++) {
        const binaryRepresentation = currentInteger.toString(2);
        if (binaryRepresentation.length > lengthLimit) {
            return; // Mimics the `break` statement in the original loop
        }
        yield {
            patternString: binaryRepresentation,
            patternLength: binaryRepresentation.length,
            setBitQuantity: countSetBits(currentInteger)
        };
    }
}

// Generator function for the inner loop, mimicking the `for` loop over digit sources.
function* generateDigitSources(startValue, endValue) {
    for (let currentNumber = startValue; currentNumber <= endValue; currentNumber++) {
        yield currentNumber;
    }
}

// The main logic function, replacing `z1`.
function determineMatchingCount(upperBoundValue, requiredNonZeroDigitCount) {
    const upperBoundDigitLength = String(upperBoundValue).length;
    let finalAccumulatedCount = 0;

    // Iterate through pattern data using the generator
    for (const patternInfo of generatePatternData(100, upperBoundDigitLength)) {
        const { patternString: currentPattern, patternLength: currentPatternLength, setBitQuantity: patternSetBits } = patternInfo;

        // Skip if the number of set bits doesn't match the requirement
        if (patternSetBits !== requiredNonZeroDigitCount) {
            continue;
        }

        if (currentPatternLength < upperBoundDigitLength) {
            // For patterns shorter than the upper bound, add 9^b possibilities
            finalAccumulatedCount += Math.pow(9, patternSetBits);
        } else { // currentPatternLength === upperBoundDigitLength
            // For patterns of the same length as the upper bound, iterate through digit sources
            for (const digitSource of generateDigitSources(111, 999)) {
                const constructedNumber = assembleNumberFromPattern(currentPattern, digitSource);
                if (constructedNumber > upperBoundValue) {
                    break; // Mimics the `break` statement in the original inner loop
                }
                finalAccumulatedCount += 1;
            }
        }
    }
    return finalAccumulatedCount;
}

// Entry point function, replacing `main`.
function executeMainProgram(programInput) {
    const inputLines = programInput.trim().split("\n");
    const firstValue = Number(inputLines[0]);
    const secondValue = Number(inputLines[1]);

    const computedResult = determineMatchingCount(firstValue, secondValue);
    console.log(computedResult);
}

// Execute the program by reading from standard input
executeMainProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
