const moduleForFilesystem = require('node:fs');

const rawInputContent = moduleForFilesystem.readFileSync('/dev/stdin', 'utf8');

// A divergent approach to parse all numeric components from the input text
const parsedNumbers = rawInputContent.match(/-?\d+/g).map(Number);

// Extract initial configuration values
const primaryDimension = parsedNumbers[0]; // Corresponds to 'm'
const secondaryDimension = parsedNumbers[1]; // Corresponds to 'n'

// Extract the sequence of segment values
const valueSegments = parsedNumbers.slice(2, 2 + primaryDimension - 1);

// Extract the sequence of movement directives
const movementCommands = parsedNumbers.slice(2 + primaryDimension - 1, 2 + primaryDimension - 1 + secondaryDimension);

// The core processing uses a functional reduction pattern
// The accumulator holds [currentTotalValue, currentPointerPosition]
const startingState = [0, 0];

const finalProcessingResult = movementCommands.reduce((accumulator, commandValue) => {
    let [accumulatedTotal, currentPointer] = accumulator;

    const directionIndicator = (commandValue > 0) ? 1 : -1;
    const effectiveSteps = Math.abs(commandValue);

    let rangeStart, rangeEnd; // Inclusive indices for the segment summation

    if (directionIndicator === 1) { // Movement to the right
        rangeStart = currentPointer;
        rangeEnd = currentPointer + effectiveSteps - 1;
    } else { // Movement to the left
        rangeStart = currentPointer - effectiveSteps;
        rangeEnd = currentPointer - 1;
    }

    // Generate indices for the current movement's summation, then sum their corresponding values
    const indicesForCurrentPass = Array.from({ length: effectiveSteps }, (_, indexOffset) => {
        return (directionIndicator === 1) ? rangeStart + indexOffset : rangeEnd - indexOffset;
    });

    const sumForThisCommand = indicesForCurrentPass.reduce((currentSum, segmentIndex) => {
        return currentSum + valueSegments[segmentIndex];
    }, 0);

    const nextPointerPosition = currentPointer + commandValue;

    return [accumulatedTotal + sumForThisCommand, nextPointerPosition];

}, startingState);

// Output the final accumulated value, applying the modulo operation
console.log(finalProcessingResult[0] % 100000);