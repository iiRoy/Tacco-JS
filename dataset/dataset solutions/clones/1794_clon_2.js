"use strict";
let sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenSequence = sourceData.split(/ |\n/);
let tokenPosition = 0;

/* Retrieves a single numerical value from the token stream. */
function retrieveNextNumericValue() {
    return +tokenSequence[tokenPosition++];
} /* This function fetches the subsequent number */

/* Retrieves a single string token from the stream. */
function retrieveNextTextString() {
    return tokenSequence[tokenPosition++];
} /* This function fetches the subsequent string */

/* Gets a single BigInt value from the current token position. */
function retrieveNextLargeIntValue() {
    return BigInt(tokenSequence[tokenPosition++]);
} /* This function fetches the subsequent BigInt */

/* Fetches an array of a specified length. The 'isStringArray' parameter
   determines if elements are treated as strings or converted to numbers. */
function fetchPrimitiveArray(arrayLength, isStringArray) {
    return isStringArray
        ? tokenSequence.slice(tokenPosition, (tokenPosition += arrayLength))
        : tokenSequence.slice(tokenPosition, (tokenPosition += arrayLength)).map((element) => +element);
} /* Obtains an array of specified length. The 'isStringArray' flag indicates if elements should be strings. */

/* Retrieves an array of BigInt values with the given length from the input. */
function fetchBigIntArray(arrayLength) {
    return tokenSequence.slice(tokenPosition, (tokenPosition += arrayLength)).map((item) => BigInt(item));
} /* Obtains an array of BigInts of the given length. */

/* Forms a two-dimensional array (matrix) with 'matrixHeight' rows
   and 'matrixWidth' columns. The 'isTextMatrix' flag dictates if
   elements are stored as strings or numbers. */
function acquire2DMatrix(matrixHeight, matrixWidth, isTextMatrix) {
    let matrixResult = [];
    let rowIndex = 0;
    if (isTextMatrix) {
        for (; rowIndex < matrixHeight; rowIndex++)
            matrixResult.push(tokenSequence.slice(tokenPosition, (tokenPosition += matrixWidth)));
    } else {
        for (; rowIndex < matrixHeight; rowIndex++)
            matrixResult.push(tokenSequence.slice(tokenPosition, (tokenPosition += matrixWidth)).map((val) => +val));
    }
    return matrixResult;
} /* Generates a 2D array (matrix) of specified height and width. 'isTextMatrix' determines element type. */

/* Dynamically constructs a multi-dimensional array based on provided dimension sizes,
   initialized with a default value. */
function generateNestedArray(defaultValue) {
    let dimensionSizes = arguments;
    let dimCount = dimensionSizes.length;
    let arrayCreationString = `Array(dimensionSizes[${--dimCount}]).fill().map((_) => { return ${defaultValue};})`;
    while (--dimCount)
        arrayCreationString = `Array(dimensionSizes[${dimCount}]).fill().map((_) => ${arrayCreationString})`;
    return eval(arrayCreationString);
}


console.log(processIllumination());

/* This is the primary function orchestrating the illumination simulation logic. */
function processIllumination() {
    let numPositions = retrieveNextNumericValue();
    let numOperations = retrieveNextNumericValue();
    let currentIlluminationLevels = fetchPrimitiveArray(numPositions);
    let nextIlluminationLevels = Array(numPositions);

    let positionIndex, illuminationTarget, operationCycle, effectiveMinRange, effectiveMaxRange;

    for (operationCycle = 0; operationCycle < numOperations; operationCycle++) {
        nextIlluminationLevels.fill(0);
        let minIlluminationValue = operationCycle; // Initialize with operation cycle for comparison.

        for (positionIndex = 0; positionIndex < numPositions; positionIndex++) {
            // Evaluates how each light source at 'currentIlluminationLevels[positionIndex]' affects target positions.
            effectiveMinRange = Math.max(positionIndex + 1 - currentIlluminationLevels[positionIndex], 1) - 1;
            effectiveMaxRange = Math.min(positionIndex + 1 + currentIlluminationLevels[positionIndex], numPositions) - 1;
            // console.debug(positionIndex, effectiveMinRange, effectiveMaxRange); // Debugging output, uncomment for insights.

            for (illuminationTarget = effectiveMinRange; illuminationTarget <= effectiveMaxRange; illuminationTarget++) {
                nextIlluminationLevels[illuminationTarget]++;
            }
            minIlluminationValue = Math.min(minIlluminationValue, nextIlluminationLevels[positionIndex]);
        }

        currentIlluminationLevels = nextIlluminationLevels.concat(); // Update for the next cycle's input.

        // Optimization: If the minimum illumination has reached a saturated state, further operations are redundant.
        if (operationCycle > 41) {
            // for (let pIdx = 0; pIdx <= numPositions; pIdx++) minIlluminationValue = Math.min(minIlluminationValue, nextIlluminationLevels[pIdx]); // Alternative min calculation (commented out).
            if (minIlluminationValue >= numPositions) break;
        }
    }

    // console.info(finalIlluminationState); // Final state logging (commented out in original).
    return currentIlluminationLevels.join(" ");
}