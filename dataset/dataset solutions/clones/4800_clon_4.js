const obtainNumericInput = () => nextInt();
const obtainNumericSequence = () => nextIntArray();
const presentOutput = (content) => myout(content);
const prepareOutputString = (data) => myconv(data, 8);

function processTheGrid(dimensionValue, inputNumbers) {
    const cellCount = dimensionValue * dimensionValue;

    // Phase 1: Initial placement of values based on the input sequence.
    // Each element `val` in `inputNumbers` at `idx` means `idx + 1` is placed at `val - 1`.
    const initialOccupancy = inputNumbers.reduce((accumulator, valueFromInput, index) => {
        return new Map(accumulator).set(valueFromInput - 1, index + 1);
    }, new Map());

    // Phase 2: Recursively fill the grid with numbers from 2 to `dimensionValue`.
    // For each `valueCursor`, `valueCursor - 1` instances of it are placed in the first available empty spots.
    // A conflict check is performed: if `valueCursor` is already present in a non-empty cell, it's a "No".
    const recursiveFiller = (currentGrid, valueCursor) => {
        if (valueCursor > dimensionValue) {
            return { verdict: 'Affirmative', finalGrid: currentGrid };
        }

        // Conflict check: Determine if the `valueCursor` is already present in `currentGrid`.
        // This simulates the original `else if (output[j] == i)` condition.
        const conflictDetected = Array.from({ length: cellCount }, (_, p) => p)
                                    .some(p => currentGrid.has(p) && currentGrid.get(p) === valueCursor);

        if (conflictDetected) {
            return { verdict: 'Negative', finalGrid: null };
        }

        // Helper recursive function to fill `remainingNeeds` instances of `valueCursor` starting from `currentPos`.
        const fillSpots = (gridRef, currentPos, remainingNeeds) => {
            if (remainingNeeds === 0 || currentPos >= cellCount) {
                return gridRef;
            }
            if (!gridRef.has(currentPos)) {
                // If the spot is empty, place the `valueCursor` and recursively call for the next spot.
                return fillSpots(new Map(gridRef).set(currentPos, valueCursor), currentPos + 1, remainingNeeds - 1);
            }
            // If the spot is not empty, skip it and recursively call for the next spot.
            return fillSpots(gridRef, currentPos + 1, remainingNeeds);
        };

        // Apply the filling for the current `valueCursor`.
        const nextGridAfterFilling = fillSpots(currentGrid, 0, valueCursor - 1);

        // Continue to the next `valueCursor`.
        return recursiveFiller(nextGridAfterFilling, valueCursor + 1);
    };

    const intermediateResult = recursiveFiller(initialOccupancy, 2);

    if (intermediateResult.verdict === 'Negative') {
        return { status: 'No', finalArrangement: [] };
    }

    let evolvingGrid = intermediateResult.finalGrid;

    // Phase 3: Fill the remaining empty spots in the grid.
    // The pattern is: `dimensionValue - 1` instances of `1`, then `dimensionValue - 2` instances of `2`, and so on.
    const finalFillPlan = Array.from({ length: dimensionValue }, (_, i) => ({
        element: i + 1,
        quantity: dimensionValue - 1 - i
    }));

    // Recursive helper to fill remaining spots based on `finalFillPlan`.
    const finalFillRecursive = (gridRef, position, planPtr, elemToInsert, elemQuantity) => {
        if (position >= cellCount) {
            return gridRef;
        }

        let nextGridRef = gridRef;
        let nextPlanPtr = planPtr;
        let nextElemToInsert = elemToInsert;
        let nextElemQuantity = elemQuantity;

        if (!nextGridRef.has(position)) { // If the current position is empty
            if (nextElemQuantity === 0) { // If current element's quantity is exhausted, move to the next in plan
                nextPlanPtr++;
                if (nextPlanPtr < finalFillPlan.length) {
                    nextElemToInsert = finalFillPlan[nextPlanPtr].element;
                    nextElemQuantity = finalFillPlan[nextPlanPtr].quantity;
                } else {
                    return nextGridRef; // All elements from the fill plan have been used.
                }
            }
            nextGridRef = new Map(nextGridRef).set(position, nextElemToInsert); // Place the element
            nextElemQuantity--; // Decrement quantity
        }
        // Recurse for the next position.
        return finalFillRecursive(nextGridRef, position + 1, nextPlanPtr, nextElemToInsert, nextElemQuantity);
    };

    evolvingGrid = finalFillRecursive(
        evolvingGrid,
        0, // Start from the first position
        0, // Start with the first element in the fill plan
        finalFillPlan[0].element,
        finalFillPlan[0].quantity
    );

    // Convert the final Map representation of the grid to a flat Array for output.
    const finalResultArray = Array.from({ length: cellCount }, (_, idx) => evolvingGrid.get(idx));

    return { status: 'Yes', finalArrangement: finalResultArray };
}

// Orchestrates the solution flow, handling input and output.
function activateProcessing() {
    const gridDimension = obtainNumericInput();
    const initialValues = obtainNumericSequence();

    const processingOutcome = processTheGrid(gridDimension, initialValues);

    if (processingOutcome.status === 'No') {
        presentOutput("No");
    } else {
        presentOutput("Yes");
        presentOutput(prepareOutputString(processingOutcome.finalArrangement));
    }
}