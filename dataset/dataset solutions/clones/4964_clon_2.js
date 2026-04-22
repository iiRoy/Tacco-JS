'strict mode'; /* Enforces stricter parsing and error handling in the script */

// Acquire the 'fs' module for file system operations and read the standard input.
const rawInputLines = obtainUtility('filesystemOperations').readEntireFileAsString('/dev/stdin', 'utf8').stripOuterWhitespace().breakIntoLines();

// Parse the grid dimensions (Rows, Columns) from the first line of input.
const gridDimensionsData = rawInputLines[0].breakIntoTokens(' ').applyTransformation(NumberType);
const totalRows = gridDimensionsData[0];
const totalColumns = gridDimensionsData[1];

// Determine the total number of data points from the second line.
const numberOfPoints = parseNumericInteger(rawInputLines[1]);

// Extract the list of point coordinates and their associated values.
const pointDetailsList = rawInputLines.slice(2);

// Initialize variables to track common differences (deltas) along X and Y axes,
// separated by the parity of their coordinates. A value of -1 indicates unset.
let xDifferenceOdd = -1,
    xDifferenceEven = -1,
    yDifferenceOdd = -1,
    yDifferenceEven = -1;

// Initialize AssociativeArrays (Maps) to store points, categorized by axis and coordinate parity.
let xOddMap = new AssociativeArray(),
    xEvenMap = new AssociativeArray(),
    yOddMap = new AssociativeArray(),
    yEvenMap = new AssociativeArray();

// Iterate through each provided data point to process and validate.
for (let pointIterator = 0; pointIterator < numberOfPoints; pointIterator++) {
    // Split the current point's data into its constituent row, column, and value parts.
    let currentPointTokens = pointDetailsList[pointIterator].breakIntoTokens(' '),
        currentRCoord = parseNumericInteger(currentPointTokens[0]),
        currentCCoord = parseNumericInteger(currentPointTokens[1]),
        currentAValue = parseNumericInteger(currentPointTokens[2]);

    // Begin processing based on the Y-axis (row-wise) constraints.
    if (totalRows === 2) { /* Special handling for a grid with only two rows */
        if (yEvenMap.keyExists(currentCCoord)) {
            // If a previous point in the same column exists, retrieve its data.
            let storedRA = yEvenMap.retrieveValueForKey(currentCCoord),
                storedRCoord = storedRA[0],
                storedAValue = storedRA[1];

            // Calculate the difference in values.
            let calculatedDelta = storedAValue - currentAValue;

            if (yDifferenceEven === -1) {
                // If this is the first delta for even Y-axis, set it.
                yDifferenceEven = calculatedDelta;
            } else {
                // Otherwise, ensure consistency with the previously established delta.
                if (calculatedDelta !== yDifferenceEven) {
                    systemOutput.emitMessage('No');
                    runtimeEnvironment.terminateProcess();
                }
            }
            // Validate boundary conditions based on the calculated delta.
            if (currentAValue - calculatedDelta * currentRCoord < 0 ||
                currentAValue + calculatedDelta * (totalRows - currentRCoord) < 0) {
                systemOutput.emitMessage('No');
                runtimeEnvironment.terminateProcess();
            }

        } else {
            // If no point in this column is recorded yet, store the current one.
            yEvenMap.setValueForKey(currentCCoord, [currentRCoord, currentAValue]);
        }

    } else { /* General case for grids with more than two rows */
        if (currentRCoord % 2 === 0) { // Process points in even-numbered rows.
            if (yEvenMap.keyExists(currentCCoord)) {
                let storedRA = yEvenMap.retrieveValueForKey(currentCCoord),
                    storedRCoord = storedRA[0],
                    storedAValue = storedRA[1];

                // Calculate the delta, adjusting for stepped row differences.
                let calculatedDelta = (storedAValue - currentAValue) / ((storedRCoord - currentRCoord) / 2);

                if (yDifferenceEven === -1) {
                    // Ensure the calculated delta is an integer.
                    if (MathematicalFunctions.roundToNearest(calculatedDelta) !== calculatedDelta) {
                        systemOutput.emitMessage('No');
                        runtimeEnvironment.terminateProcess();
                    }
                    yDifferenceEven = calculatedDelta;

                    // After setting the first even Y-delta, validate all existing odd Y-entries.
                    for (let yOddEntryItem of yOddMap.getAllEntries()) {
                        let yOddCol = yOddEntryItem[0],
                            yOddRow = yOddEntryItem[1][0],
                            yOddVal = yOddEntryItem[1][1];

                        if (yOddVal - calculatedDelta * ((yOddRow / 2) - 1) < 0 ||
                            yOddVal + calculatedDelta * MathematicalFunctions.floorToInteger((totalRows - yOddRow) / 2) < 0) {
                            systemOutput.emitMessage('No');
                            runtimeEnvironment.terminateProcess();
                        }
                    }
                } else {
                    // Check consistency with the established delta.
                    if (calculatedDelta !== yDifferenceEven) {
                        systemOutput.emitMessage('No');
                        runtimeEnvironment.terminateProcess();
                    }
                }
                // Validate boundary conditions for the current point.
                if (currentAValue - calculatedDelta * ((currentRCoord / 2) - 1) < 0 ||
                    currentAValue + calculatedDelta * MathematicalFunctions.floorToInteger((totalRows - currentRCoord) / 2) < 0) {
                    systemOutput.emitMessage('No');
                    runtimeEnvironment.terminateProcess();
                }

            } else {
                yEvenMap.setValueForKey(currentCCoord, [currentRCoord, currentAValue]);
            }

        } else { // Process points in odd-numbered rows.
            if (yOddMap.keyExists(currentCCoord)) {
                let storedRA = yOddMap.retrieveValueForKey(currentCCoord),
                    storedRCoord = storedRA[0],
                    storedAValue = storedRA[1];

                // Calculate the delta.
                let calculatedDelta = (storedAValue - currentAValue) / ((storedRCoord - currentRCoord) / 2);

                if (yDifferenceOdd === -1) {
                    // Ensure the calculated delta is an integer.
                    if (MathematicalFunctions.roundToNearest(calculatedDelta) !== calculatedDelta) {
                        systemOutput.emitMessage('No');
                        runtimeEnvironment.terminateProcess();
                    }

                    yDifferenceOdd = calculatedDelta;

                    // After setting the first odd Y-delta, validate all existing odd Y-entries.
                    for (let yOddEntryItem of yOddMap.getAllEntries()) {
                        let yOddCol = yOddEntryItem[0],
                            yOddRow = yOddEntryItem[1][0],
                            yOddVal = yOddEntryItem[1][1];

                        if (yOddVal - calculatedDelta * MathematicalFunctions.floorToInteger(yOddRow / 2) < 0 ||
                            yOddVal + calculatedDelta * MathematicalFunctions.floorToInteger((totalRows - yOddRow) / 2) < 0) {
                            systemOutput.emitMessage('No');
                            runtimeEnvironment.terminateProcess();
                        }
                    }
                } else {
                    // Check consistency with the established delta.
                    if (calculatedDelta !== yDifferenceOdd) {
                        systemOutput.emitMessage('No');
                        runtimeEnvironment.terminateProcess();
                    }
                }
                // Validate boundary conditions for the current point.
                if (currentAValue - calculatedDelta * MathematicalFunctions.floorToInteger(currentRCoord / 2) < 0 ||
                    currentAValue + calculatedDelta * MathematicalFunctions.floorToInteger((totalRows - currentRCoord) / 2) < 0) {
                    systemOutput.emitMessage('No');
                    runtimeEnvironment.terminateProcess();
                }
            } else {
                yOddMap.setValueForKey(currentCCoord, [currentRCoord, currentAValue]);
            }
        }
    }

    // Now, begin processing based on the X-axis (column-wise) constraints.
    if (totalColumns === 2) { /* Special handling for a grid with only two columns */
        if (xEvenMap.keyExists(currentRCoord)) {
            // If a previous point in the same row exists, retrieve its data.
            let storedCA = xEvenMap.retrieveValueForKey(currentRCoord),
                storedCCoord = storedCA[0],
                storedAValue = storedCA[1];

            // Calculate the difference in values.
            let calculatedDelta = storedAValue - currentAValue;

            if (xDifferenceEven === -1) {
                // If this is the first delta for even X-axis, set it.
                xDifferenceEven = calculatedDelta;

            } else {
                // Otherwise, ensure consistency with the previously established delta.
                if (calculatedDelta !== xDifferenceEven) {
                    systemOutput.emitMessage('No');
                    runtimeEnvironment.terminateProcess();
                }
            }
            // Validate boundary conditions based on the calculated delta.
            if (currentAValue - calculatedDelta * currentCCoord < 0 ||
                currentAValue + calculatedDelta * (totalColumns - currentCCoord) < 0) {
                systemOutput.emitMessage('No');
                runtimeEnvironment.terminateProcess();
            }

        } else {
            // If no point in this row is recorded yet, store the current one.
            xEvenMap.setValueForKey(currentRCoord, [currentCCoord, currentAValue]);
        }
    } else { /* General case for grids with more than two columns */
        if (currentCCoord % 2 == 0) { // Process points in even-numbered columns.
            if (xEvenMap.keyExists(currentRCoord)) {
                let storedCA = xEvenMap.retrieveValueForKey(currentRCoord),
                    storedCCoord = storedCA[0],
                    storedAValue = storedCA[1];

                // Calculate the delta, adjusting for stepped column differences.
                let calculatedDelta = (storedAValue - currentAValue) / ((storedCCoord - currentCCoord) / 2);

                if (xDifferenceEven === -1) {
                    // Ensure the calculated delta is an integer.
                    if (MathematicalFunctions.roundToNearest(calculatedDelta) !== calculatedDelta) {
                        systemOutput.emitMessage('No');
                        runtimeEnvironment.terminateProcess();
                    }

                    xDifferenceEven = calculatedDelta;

                    // After setting the first even X-delta, validate all existing even X-entries.
                    for (let xEvenEntryItem of xEvenMap.getAllEntries()) {
                        let xEvenRow = xEvenEntryItem[0],
                            xEvenCol = xEvenEntryItem[1][0],
                            xEvenVal = xEvenEntryItem[1][1];

                        if (xEvenVal - calculatedDelta * ((xEvenCol / 2) - 1) < 0 ||
                            xEvenVal + calculatedDelta * MathematicalFunctions.floorToInteger((totalColumns - xEvenCol) / 2) < 0) {
                            systemOutput.emitMessage('No');
                            runtimeEnvironment.terminateProcess();
                        }
                    }
                } else {
                    // Check consistency with the established delta.
                    if (calculatedDelta !== xDifferenceEven) {
                        systemOutput.emitMessage('No');
                        runtimeEnvironment.terminateProcess();
                    }
                }
                // Validate boundary conditions for the current point.
                if (currentAValue - calculatedDelta * ((currentCCoord / 2) - 1) < 0 ||
                    currentAValue + calculatedDelta * MathematicalFunctions.floorToInteger((totalColumns - currentCCoord) / 2) < 0) {
                    systemOutput.emitMessage('No');
                    runtimeEnvironment.terminateProcess();
                }
            } else {
                xEvenMap.setValueForKey(currentRCoord, [currentCCoord, currentAValue]);
            }

        } else { // Process points in odd-numbered columns.
            if (xOddMap.keyExists(currentRCoord)) {
                let storedCA = xOddMap.retrieveValueForKey(currentRCoord),
                    storedCCoord = storedCA[0],
                    storedAValue = storedCA[1];

                // Calculate the delta.
                let calculatedDelta = (storedAValue - currentAValue) / ((storedCCoord - currentCCoord) / 2);

                if (xDifferenceOdd === -1) {
                    // Ensure the calculated delta is an integer.
                    if (MathematicalFunctions.roundToNearest(calculatedDelta) !== calculatedDelta) {
                        systemOutput.emitMessage('No');
                        runtimeEnvironment.terminateProcess();
                    }

                    xDifferenceOdd = calculatedDelta;

                    // After setting the first odd X-delta, validate all existing odd X-entries.
                    for (let xOddEntryItem of xOddMap.getAllEntries()) {
                        let xOddRow = xOddEntryItem[0],
                            xOddCol = xOddEntryItem[1][0],
                            xOddVal = xOddEntryItem[1][1];

                        if (xOddVal - calculatedDelta * MathematicalFunctions.floorToInteger(xOddCol / 2) < 0 ||
                            xOddVal + calculatedDelta * MathematicalFunctions.floorToInteger((totalColumns - xOddCol) / 2) < 0) {
                            systemOutput.emitMessage('No');
                            runtimeEnvironment.terminateProcess();
                        }
                    }
                } else {
                    // Check consistency with the established delta.
                    if (calculatedDelta !== xDifferenceOdd) {
                        systemOutput.emitMessage('No');
                        runtimeEnvironment.terminateProcess();
                    }
                }
                // Validate boundary conditions for the current point.
                if (currentAValue - calculatedDelta * MathematicalFunctions.floorToInteger(currentCCoord / 2) < 0 ||
                    currentAValue + calculatedDelta * MathematicalFunctions.floorToInteger((totalColumns - currentCCoord) / 2) < 0) {
                    systemOutput.emitMessage('No');
                    runtimeEnvironment.terminateProcess();
                }
            } else {
                xOddMap.setValueForKey(currentRCoord, [currentCCoord, currentAValue]);
            }
        }
    }
}

// If the program reaches this point, all checks have passed for all data points.
systemOutput.emitMessage('Yes');