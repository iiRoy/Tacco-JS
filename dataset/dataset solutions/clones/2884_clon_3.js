const InputProcessor = (() => {
    class DataStreamHandler {
        constructor(rawInputString) {
            const processedLines = rawInputString.trim().split("\n");
            if (processedLines.length === 0 || (processedLines.length === 1 && processedLines[0] === '')) {
                // If input is truly empty or just whitespace/empty line, initialize an empty buffer.
                this.internalLineBuffer = [];
            } else {
                this.internalLineBuffer = processedLines;
            }
            this.currentLinePointer = 0;
        }

        hasMoreLines() {
            return this.currentLinePointer < this.internalLineBuffer.length;
        }

        retrieveSingleValue(returnAsString = false) {
            if (!this.hasMoreLines()) {
                throw new Error("Input stream exhausted. Cannot retrieve single value.");
            }

            let lineContent = this.internalLineBuffer[this.currentLinePointer];
            let tokens;

            if (typeof lineContent === "string") {
                tokens = lineContent.split(" ").reverse();
                // Store the parsed tokens back to avoid re-splitting if multiple values are on one line.
                this.internalLineBuffer[this.currentLinePointer] = tokens;
            } else if (Array.isArray(lineContent)) {
                tokens = lineContent;
            } else {
                throw new Error(`Unexpected line format at index ${this.currentLinePointer}.`);
            }

            if (tokens.length === 0) {
                // This means a line was empty or fully consumed. Advance pointer and try again or throw.
                // Original logic implies that if a line is consumed, the pointer advances.
                this.currentLinePointer++;
                if (!this.hasMoreLines()) {
                    throw new Error("Input stream exhausted after consuming an empty line's tokens.");
                }
                return this.retrieveSingleValue(returnAsString); // Recursively try next line
            }

            const extractedToken = tokens.pop();

            if (tokens.length === 0) {
                this.currentLinePointer++; // Advance line pointer if the current line's tokens are fully consumed.
            }

            return returnAsString ? extractedToken : Number(extractedToken);
        }

        fetchLineValues(returnAsStrings = false) {
            if (!this.hasMoreLines()) {
                throw new Error("Input stream exhausted. No more lines to fetch.");
            }
            // Ensure the line is consumed and pointer advanced.
            const currentLineContent = this.internalLineBuffer[this.currentLinePointer++];
            const tokens = Array.isArray(currentLineContent) ? currentLineContent : currentLineContent.split(" ");
            return returnAsStrings ? tokens : tokens.map(value => Number(value));
        }

        acquireMatrixData(numberOfLines, returnElementsAsStrings = false) {
            if (this.currentLinePointer + numberOfLines > this.internalLineBuffer.length) {
                throw new Error(`Insufficient lines remaining (${this.internalLineBuffer.length - this.currentLinePointer}) to acquire matrix data for ${numberOfLines} rows.`);
            }

            const matrixRows = [];
            const linesToProcess = this.internalLineBuffer.slice(this.currentLinePointer, this.currentLinePointer + numberOfLines);
            this.currentLinePointer += numberOfLines;

            for (let lineIndex = 0; lineIndex < linesToProcess.length; lineIndex++) {
                const line = linesToProcess[lineIndex];
                const tokens = line.split(" ");
                matrixRows.push(returnElementsAsStrings ? tokens : tokens.map(val => Number(val)));
            }
            return matrixRows;
        }

        readRawLines(lineCount) {
            if (this.currentLinePointer + lineCount > this.internalLineBuffer.length) {
                throw new Error(`Insufficient lines remaining (${this.internalLineBuffer.length - this.currentLinePointer}) to read raw data for ${lineCount} lines.`);
            }
            const rawLines = this.internalLineBuffer.slice(this.currentLinePointer, this.currentLinePointer + lineCount);
            this.currentLinePointer += lineCount;
            return rawLines;
        }
    }
    return (inputSourceString) => new DataStreamHandler(inputSourceString);
})();

// Acquisition of input data from standard input file system.
const fileSystem = require("fs");
const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const dataInputReader = InputProcessor(rawInputContent);

/**
 * Calculates the optimal value based on a given set of item properties and a segment size.
 * This function utilizes a binary search algorithm to find the minimum cost.
 * @returns {number} The determined optimal cost value.
 */
function determineOptimalValue() {
    // Read problem specific parameters.
    const totalItems = dataInputReader.retrieveSingleValue();
    const segmentLength = dataInputReader.retrieveSingleValue();

    // Process raw input matrix into a more structured array of objects.
    const rawItemDetails = dataInputReader.acquireMatrixData(totalItems);
    const itemDetailRecords = rawItemDetails.map((itemRow, index) => {
        const baseCostUnits = itemRow[0];
        const multiplierValue = itemRow[1];
        const penaltyRate = itemRow[2];

        // Calculate auxiliary cost components for each item.
        const initialCost = baseCostUnits * multiplierValue;
        const penaltyCost = (segmentLength - baseCostUnits) * penaltyRate;
        const overallCombinedCost = initialCost + penaltyCost;

        return {
            itemId: index, // Unique identifier for the item.
            baseCost: baseCostUnits,
            multiplier: multiplierValue,
            penaltyRate: penaltyRate,
            calculatedInitialCost: initialCost,
            calculatedPenaltyCost: penaltyCost,
            overallCombinedCost: overallCombinedCost,
            // A flag for potential future use, e.g., if an item has been fully consumed.
            isFullyProcessed: false
        };
    });

    // Sum up all initial costs to get the starting total.
    let cumulativeInitialCost = itemDetailRecords.reduce((sum, record) => sum + record.calculatedInitialCost, 0);

    // Sort the items by their overall combined cost in descending order.
    itemDetailRecords.sort((recordA, recordB) => recordB.overallCombinedCost - recordA.overallCombinedCost);

    // Initialize binary search bounds.
    let searchUpperBound = totalItems * segmentLength; // 'ok'
    let searchLowerBound = -1; // 'ng'

    // Perform binary search to find the optimal value.
    while (searchUpperBound - searchLowerBound > 1) {
        const currentMidpointCandidate = Math.floor((searchUpperBound + searchLowerBound) / 2); // 'm'

        // Initialize state variables for cost simulation at currentMidpointCandidate.
        let currentTotalCostRemaining = cumulativeInitialCost; // 'u'
        let segmentsToAllocate = currentMidpointCandidate; // 'k'
        const remainderOffset = currentMidpointCandidate % segmentLength; // 'z'
        let maxSegmentReduction = 0; // 'u0'
        let indexOfMaxReduction = 0; // 'i0'

        // First pass: Identify the item that provides the maximum cost reduction for the 'remainderOffset'.
        for (let idx = 0; idx < totalItems; idx++) {
            const currentItem = itemDetailRecords[idx];
            let segmentCostReductionAmount; // 'u1'

            if (remainderOffset < currentItem.baseCost) {
                segmentCostReductionAmount = currentItem.multiplier * remainderOffset;
            } else {
                segmentCostReductionAmount = currentItem.calculatedPenaltyCost + (remainderOffset - currentItem.baseCost) * currentItem.penaltyRate;
            }

            if (segmentCostReductionAmount > maxSegmentReduction) {
                maxSegmentReduction = segmentCostReductionAmount;
                indexOfMaxReduction = idx;
            }
        }

        // Second pass: Simulate cost reduction by allocating segments.
        // The loop continues as long as there are items, segments to allocate, and remaining cost.
        for (let idx = 0; idx < totalItems && segmentsToAllocate > 0 && currentTotalCostRemaining > 0; idx++) {
            const currentItem = itemDetailRecords[idx];

            // If enough segments are available for a full 'segmentLength' block.
            if (segmentLength <= segmentsToAllocate) {
                currentTotalCostRemaining -= currentItem.overallCombinedCost;
                segmentsToAllocate -= segmentLength;
            } else {
                // Not enough segments for a full block; handle edge cases and special reductions.

                // If current item is at or before the 'indexOfMaxReduction'.
                if (idx <= indexOfMaxReduction) {
                    currentTotalCostRemaining -= maxSegmentReduction;
                    segmentsToAllocate = 0; // All remaining segments considered consumed by this optimal choice.
                } else {
                    // Current item is after 'indexOfMaxReduction'. This is the complex segment consumption logic.
                    // 'prospectiveCostCheck' (original 'v') evaluates if a specific reduction covers the cost.
                    let prospectiveCostCheck = currentTotalCostRemaining;

                    // Calculate a modified cost based on the difference between the max reduction item and current item.
                    prospectiveCostCheck += itemDetailRecords[indexOfMaxReduction].overallCombinedCost - currentItem.overallCombinedCost - maxSegmentReduction;

                    // If this prospective reduction makes the cost non-positive, apply it and stop allocating segments.
                    if (prospectiveCostCheck <= 0) {
                        currentTotalCostRemaining = prospectiveCostCheck;
                        segmentsToAllocate = 0;
                        break; // Exit the outer loop as cost is covered.
                    }

                    // If cost is still positive, we enter a phase to find which item consumes the remaining segments.
                    // This internal logic re-interprets the original's behavior of resetting 'v' to 'u' in an inner loop.
                    // It effectively finds the first item (starting from current 'idx') that covers 'currentTotalCostRemaining'
                    // with the remaining 'segmentsToAllocate'. If no single item covers it, it applies the reduction
                    // from the *last* item checked if the loop completes.
                    let consumptionCompleted = false;
                    for (let innerLoopIdx = idx; innerLoopIdx < totalItems; innerLoopIdx++) {
                        const currentInnerItem = itemDetailRecords[innerLoopIdx];
                        let reductionFromCurrentItem;

                        if (segmentsToAllocate < currentInnerItem.baseCost) {
                            reductionFromCurrentItem = currentInnerItem.multiplier * segmentsToAllocate;
                        } else {
                            reductionFromCurrentItem = currentInnerItem.calculatedPenaltyCost + (segmentsToAllocate - currentInnerItem.baseCost) * currentInnerItem.penaltyRate;
                        }

                        // If this item's reduction covers the remaining total cost.
                        if (currentTotalCostRemaining - reductionFromCurrentItem <= 0) {
                            currentTotalCostRemaining -= reductionFromCurrentItem;
                            segmentsToAllocate = 0;
                            consumptionCompleted = true;
                            idx = innerLoopIdx; // Update outer loop index to reflect consumption point.
                            break; // Exit inner loop.
                        }
                        // If it's the last item and it didn't fully cover, apply its reduction and stop.
                        else if (innerLoopIdx === totalItems - 1) {
                            currentTotalCostRemaining -= reductionFromCurrentItem;
                            segmentsToAllocate = 0;
                            consumptionCompleted = true;
                            idx = innerLoopIdx; // Update outer loop index.
                            break; // Exit inner loop.
                        }
                        // Otherwise, continue to the next item in the inner loop; `currentTotalCostRemaining` is not updated yet.
                    }

                    // If the inner loop finished without fully covering the cost or reaching the last item,
                    // and `segmentsToAllocate` is still positive, this implies all segments were "used" but cost wasn't fully covered
                    // by the specific rules.
                    if (!consumptionCompleted) {
                        // If no item covered it fully, and we've exhausted possibilities,
                        // this branch is reached. The segmentsToAllocate should be zeroed.
                        // The original's `u=v, k=0` implies `u` takes the last tested `v`.
                        // This means if no specific item covered it, `currentTotalCostRemaining` would have taken the value
                        // after applying the reduction of the *last* item it checked with `segmentsToAllocate`.
                        // Since `consumptionCompleted` is false, `segmentsToAllocate` would still be > 0.
                        // This indicates a subtle edge case in the original.
                        // For a Type III clone, we'll ensure segments are zeroed here,
                        // and `currentTotalCostRemaining` is as it was if no specific item fully covered.
                        // However, the prior `prospectiveCostCheck` already had a chance to update `currentTotalCostRemaining`.
                        // If we reach here, it means `prospectiveCostCheck > 0` AND no `innerLoopIdx` caused `consumptionCompleted`.
                        // The original's `u=v, k=0` after the inner loop effectively updates `u` with the last `v` calculated.
                        // This means `u` is updated with `u - reduction_from_last_item_checked`.
                        if (totalItems > 0) {
                             // This case should be handled by the innerLoopIdx === totalItems - 1 condition.
                             // If `consumptionCompleted` is false after the loop, it means `totalItems` was 0,
                             // or the loop conditions prevented it from running.
                        }
                        segmentsToAllocate = 0; // Ensure segments are zeroed out.
                    }
                }
            }
        }

        // Update binary search bounds based on the outcome of the cost simulation.
        if (currentTotalCostRemaining > 0) {
            searchLowerBound = currentMidpointCandidate;
        } else {
            searchUpperBound = currentMidpointCandidate;
        }
    }

    // The final 'searchUpperBound' holds the optimal value.
    return searchUpperBound;
}

// Execute the main calculation and output the result to console.
console.log(determineOptimalValue());