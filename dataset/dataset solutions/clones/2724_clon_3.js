// Input reading utility for competitive programming.
// This module provides functions to parse standard input efficiently.
const InputParser = (function () {
    /**
     * Creates an instance of the InputParser.
     * @param {string} rawInputString - The raw string content from standard input.
     * @returns {LineStreamHandler} An instance of the LineStreamHandler.
     */
    function createStreamHandler(rawInputString) {
        return new LineStreamHandler(rawInputString);
    }

    /**
     * Handles parsing lines and tokens from the input stream.
     * @class
     */
    function LineStreamHandler(inputContent) {
        // Store all lines, trimmed and split.
        this._sourceLines = inputContent.trim().split("\n");
        // Pointer to the current line being processed.
        this._currentLineIdx = 0;
        // Cache for split tokens of the current line to avoid re-splitting.
        this._currentLineTokens = [];
    }

    /**
     * Extracts a single token (number or string) from the current line.
     * If the current line is exhausted, moves to the next.
     * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, attempts to convert to a number.
     * @returns {(string|number)} The extracted token.
     */
    LineStreamHandler.prototype.extractToken = function (returnAsString = false) {
        // If current line tokens are empty or we just moved to a new line, prepare tokens.
        if (this._currentLineTokens.length === 0) {
            // Check if there are lines left to process.
            if (this._currentLineIdx >= this._sourceLines.length) {
                throw new Error("End of input stream reached.");
            }
            const lineData = this._sourceLines[this._currentLineIdx];
            // Split the line into tokens.
            this._currentLineTokens = lineData.split(" ");
        }

        const nextToken = this._currentLineTokens.shift(); // Get the first token
        if (this._currentLineTokens.length === 0) {
            this._currentLineIdx++; // Advance to the next line if current is exhausted
        }

        return returnAsString ? nextToken : Number(nextToken);
    };

    /**
     * Reads the entire current line as an array of tokens.
     * Advances the line pointer.
     * @param {boolean} [returnStrings=false] - If true, returns tokens as strings; otherwise, attempts to convert to numbers.
     * @returns {(string[]|number[])} An array of tokens from the line.
     */
    LineStreamHandler.prototype.readFullLine = function (returnStrings = false) {
        if (this._currentLineIdx >= this._sourceLines.length) {
            throw new Error("End of input stream reached when trying to read full line.");
        }
        const lineContent = this._sourceLines[this._currentLineIdx++];
        const tokens = lineContent.split(" ");

        // Clear any cached tokens for the previous line, as we're explicitly reading a new one.
        this._currentLineTokens = [];

        return returnStrings ? tokens : tokens.map(str => Number(str));
    };

    /**
     * Reads multiple lines (a matrix) as a 2D array of tokens.
     * Advances the line pointer by 'count' lines.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [returnStrings=false] - If true, returns tokens as strings; otherwise, attempts to convert to numbers.
     * @returns {(string[][]|number[][])} A 2D array representing the matrix.
     */
    LineStreamHandler.prototype.readTokenMatrix = function (count, returnStrings = false) {
        const matrixData = [];
        for (let i = 0; i < count; i++) {
            matrixData.push(this.readFullLine(returnStrings));
        }
        return matrixData;
    };

    /**
     * Reads multiple lines as a 1D array of tokens, where each line is a single token.
     * Advances the line pointer by 'count' lines.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [returnStrings=false] - If true, returns tokens as strings; otherwise, attempts to convert to numbers.
     * @returns {(string[]|number[])} A 1D array of tokens.
     */
    LineStreamHandler.prototype.readColumnData = function (count, returnStrings = false) {
        const columnData = [];
        for (let i = 0; i < count; i++) {
            if (this._currentLineIdx >= this._sourceLines.length) {
                throw new Error("End of input stream reached when trying to read column data.");
            }
            const token = this._sourceLines[this._currentLineIdx++];
            columnData.push(returnStrings ? token : Number(token));
        }
        this._currentLineTokens = []; // Clear cached tokens as we explicitly read full lines
        return columnData;
    };

    return createStreamHandler;
})();

// Initialize the input handler by reading from standard input.
const dataStream = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * This function uses 'eval' for dynamic array creation based on provided dimensions.
 * @param {*} initialValue - The value to initialize all array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., dim1, dim2, dim3).
 * @returns {Array} The created multi-dimensional array.
 */
function initializeNestedArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    let codeString = `Array(dimensions[${dimensions.length - 1}]).fill(0).map(() => (${JSON.stringify(initialValue)}))`;
    for (let i = dimensions.length - 2; i >= 0; --i) {
        codeString = `Array(dimensions[${i}]).fill(0).map(() => ${codeString})`;
    }
    // Using eval is generally discouraged due to security and performance,
    // but kept here to maintain the spirit of the original 'xArray' utility.
    return eval(codeString);
}

/**
 * Performs a binary search to find the lower bound (first element >= target) in a sorted array.
 * If all elements are less than target, returns array length.
 * @param {number[]} sortedArray - The sorted array to search within.
 * @param {number} startIndex - The starting index of the search range.
 * @param {number} endIndex - The ending index (exclusive) of the search range.
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index of the lower bound.
 */
function findLowerBoundIndex(sortedArray, startIndex, endIndex, targetValue) {
    let low = startIndex;
    let high = endIndex;
    // Standard binary search loop.
    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (sortedArray[mid] < targetValue) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
}


// Entry point for the main algorithm execution.
executeAlgorithm();

function executeAlgorithm() {
    // Read problem parameters: sequence length (N) and repetition count (K).
    const sequenceLength = dataStream.extractToken();
    const repetitionCount = dataStream.extractToken();
    // Read the main data sequence.
    const mainSequence = dataStream.readFullLine();

    // Create a map to store all indices for each unique number in the sequence.
    // This allows quick lookup of all occurrences of a number.
    const valuePositionMap = new Map();
    for (let i = 0; i < sequenceLength; ++i) {
        const currentNum = mainSequence[i];
        if (!valuePositionMap.has(currentNum)) {
            valuePositionMap.set(currentNum, []);
        }
        valuePositionMap.get(currentNum).push(i);
    }

    // --- Phase 1: Determine the initial filtered sequence ---
    // This phase identifies elements that do not have a successor within the remaining sequence.
    const initialFilteredResult = [];
    for (let currentIdx = 0; currentIdx < sequenceLength; ++currentIdx) {
        const currentValue = mainSequence[currentIdx];
        const positions = valuePositionMap.get(currentValue);

        // Guard against values not found in map (though unlikely given how map is built).
        if (!positions) {
            continue;
        }

        // Find the first occurrence of currentValue that is strictly after currentIdx.
        // The search range for findLowerBoundIndex needs to be within the 'positions' array itself.
        // We are looking for an index within 'positions' that corresponds to a value > currentIdx.
        const searchTargetForNextOccur = currentIdx + 1;
        const nextOccurIndexInPositions = findLowerBoundIndex(positions, 0, positions.length, searchTargetForNextOccur);

        // If 'nextOccurIndexInPositions' is the length of 'positions', it means no more occurrences
        // of 'currentValue' exist after 'currentIdx'.
        if (nextOccurIndexInPositions === positions.length) {
            initialFilteredResult.push(currentValue);
        } else {
            // If another occurrence exists, skip the loop to that position.
            // This effectively "removes" elements that have a later duplicate.
            currentIdx = positions[nextOccurIndexInPositions];
        }
    }

    // Helper to output the result.
    const outputResult = (resultArray) => {
        if (resultArray.length > 0) {
            console.log(resultArray.join(" "));
        }
    };

    // --- Handle edge cases for repetitionCount or empty initial result ---
    if (repetitionCount === 1 || initialFilteredResult.length === 0) {
        outputResult(initialFilteredResult);
        return;
    }

    // --- Phase 2: Identify the repeating pattern based on 'repetitionCount' ---
    // This phase attempts to find a repeating sequence of filtered elements.
    const identifiedPatternElements = new Set();
    const patternSegmentCandidates = []; // Stores the first element of each pattern segment.
    let currentPatternLength = 0; // The actual number of unique pattern segments found.

    // Initialize with the first element of the initial filtered result.
    if (initialFilteredResult.length > 0) {
        identifiedPatternElements.add(initialFilteredResult[0]);
        patternSegmentCandidates.push(initialFilteredResult[0]);
        currentPatternLength = 1; // We've found at least one segment start.
    } else {
        // If initialFilteredResult is empty, there's no pattern to find.
        outputResult([]);
        return;
    }

    // Iterate up to 'repetitionCount' to find distinct pattern segments.
    for (let segmentIndex = 1; segmentIndex < repetitionCount; ++segmentIndex) {
        // The 'seed' element for this segment is the 'segmentIndex'-th element in our 'patternSegmentCandidates'.
        // If we ran out of candidates, we've identified the full pattern.
        if (segmentIndex >= patternSegmentCandidates.length) {
            break; // No more distinct pattern starts found.
        }
        const currentSegmentSeed = patternSegmentCandidates[segmentIndex];

        // Find the first occurrence of this seed element in the main sequence.
        const seedPositions = valuePositionMap.get(currentSegmentSeed);
        if (!seedPositions || seedPositions.length === 0) {
            // This should ideally not happen if the seed came from initialFilteredResult.
            // But as a guard, if it does, it means no further sequence can be built.
            break;
        }
        // We're looking for the first global occurrence (index 0 for lower bound).
        const firstSeedOccurGlobalIndex = seedPositions[findLowerBoundIndex(seedPositions, 0, seedPositions.length, 0)];

        let currentIterationResult = []; // Result for the current pattern segment iteration.
        let isBuildingNewPatternSegment = false; // Flag to indicate if we're identifying a *new* pattern element.

        // Start scanning the main sequence from *after* the first occurrence of the seed element.
        for (let scanIdx = firstSeedOccurGlobalIndex + 1; scanIdx < sequenceLength; ++scanIdx) {
            const scannedValue = mainSequence[scanIdx];
            const scannedValuePositions = valuePositionMap.get(scannedValue);

            // Guard against values not found in map.
            if (!scannedValuePositions) {
                continue;
            }

            // Find the next occurrence of 'scannedValue' strictly after 'scanIdx'.
            const nextScanOccurIndexInPositions = findLowerBoundIndex(scannedValuePositions, 0, scannedValuePositions.length, scanIdx + 1);

            if (nextScanOccurIndexInPositions === scannedValuePositions.length) {
                // If no more occurrences, add to the current iteration's result.
                currentIterationResult.push(scannedValue);

                // Logic to identify new pattern elements.
                if (isBuildingNewPatternSegment) {
                    // If we are already building a new segment and this element is not seen yet...
                    if (!identifiedPatternElements.has(scannedValue)) {
                        // We found a new element that extends the distinct pattern.
                        segmentIndex++; // Increment segment index to account for this new element.
                        patternSegmentCandidates.push(scannedValue); // Add it as a new pattern segment candidate.
                        identifiedPatternElements.add(scannedValue); // Mark as seen.
                    } else {
                        // If it's already in the set, this segment isn't "new" in terms of pattern.
                        isBuildingNewPatternSegment = false; // Reset flag.
                    }
                }

                if (currentIterationResult.length === 1) {
                    // If this is the very first element added to 'currentIterationResult' for this segment,
                    // consider it a potential start of a new pattern segment.
                    if (!identifiedPatternElements.has(scannedValue)) {
                        identifiedPatternElements.add(scannedValue);
                        patternSegmentCandidates.push(scannedValue);
                        isBuildingNewPatternSegment = true;
                    }
                }
            } else {
                // If another occurrence exists, skip to that position.
                scanIdx = scannedValuePositions[nextScanOccurIndexInPositions];
                isBuildingNewPatternSegment = false; // Reset flag as we skipped.
            }
        }
        // If currentIterationResult is empty, it means no more elements can be filtered
        // from this point onwards, so the pattern sequence has effectively ended.
        if (currentIterationResult.length === 0) {
            break;
        }
        // Update the current result with the one from this iteration.
        // This 'initialFilteredResult' variable effectively holds the last full 'ans' from the original code.
        initialFilteredResult.splice(0, initialFilteredResult.length, ...currentIterationResult);
        currentPatternLength = segmentIndex + 1; // Update length based on how many segments we've tried to build.
    }

    // Adjust 'currentPatternLength' if the loop broke prematurely.
    // This ensures 'currentPatternLength' accurately reflects the number of distinct pattern segments found.
    if (initialFilteredResult.length === 0) { // If the last iteration produced an empty result
        currentPatternLength++; // Increment to correctly reflect the last 'i' value.
    }


    // --- Phase 3: Final result computation based on K and the identified pattern ---
    // Calculate the effective starting point for the final sequence.
    const remainderForFinalPass = repetitionCount % currentPatternLength;
    let finalSequenceStartIdx = 0;

    if (remainderForFinalPass === 0) {
        // If K is a perfect multiple of the pattern length, the result is the last full pattern segment.
        outputResult(initialFilteredResult);
        return;
    } else if (remainderForFinalPass === 1) {
        // If remainder is 1, it means we start from the very beginning of the main sequence.
        finalSequenceStartIdx = 0;
    } else {
        // For other remainders, we need to find the element that starts the (remainderForFinalPass - 1) segment.
        const targetPatternElement = patternSegmentCandidates[remainderForFinalPass - 1];
        const targetElementPositions = valuePositionMap.get(targetPatternElement);
        if (!targetElementPositions || targetElementPositions.length === 0) {
            // This case should be handled gracefully, perhaps output an empty array or the last known result.
            // For now, assume a valid element is always found if patternSegmentCandidates has it.
            outputResult([]); // Fallback
            return;
        }
        // Find the first global occurrence of this target pattern element.
        const firstOccurOfTarget = targetElementPositions[findLowerBoundIndex(targetElementPositions, 0, targetElementPositions.length, 0)];
        finalSequenceStartIdx = firstOccurOfTarget + 1; // Start scanning from after this element.
    }

    // --- Final Pass: Generate the sequence starting from 'finalSequenceStartIdx' ---
    let finalOutputSequence = [];
    for (let passIdx = finalSequenceStartIdx; passIdx < sequenceLength; ++passIdx) {
        const currentVal = mainSequence[passIdx];
        const valPositions = valuePositionMap.get(currentVal);

        // Guard against values not found in map.
        if (!valPositions) {
            continue;
        }

        // Find the next occurrence of 'currentVal' strictly after 'passIdx'.
        const nextValOccurIndexInPositions = findLowerBoundIndex(valPositions, 0, valPositions.length, passIdx + 1);

        if (nextValOccurIndexInPositions === valPositions.length) {
            // If no more occurrences, add to the final result.
            finalOutputSequence.push(currentVal);
        } else {
            // If another occurrence exists, skip to that position.
            passIdx = valPositions[nextValOccurIndexInPositions];
        }
    }

    outputResult(finalOutputSequence);
}