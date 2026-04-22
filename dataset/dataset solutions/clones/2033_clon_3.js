function extractDataRows(sourceText) {
    if (typeof sourceText !== 'string') {
        console.error('Input for row extraction must be a string.');
        return [];
    }
    return sourceText.split('\n').map(lineStr => lineStr.trim()).filter(lineStr => lineStr !== '');
}

function convertTokensToNumbers(lineSegment) {
    if (typeof lineSegment !== 'string' || lineSegment.trim() === '') {
        return [];
    }
    return lineSegment.split(' ').filter(token => token !== '').map(token => Number(token));
}

function sortNumericallyDescending(valueA, valueB) {
    return valueB - valueA;
}

function executeProcessing(rawInputString) {
    if (!rawInputString || rawInputString.trim() === '') {
        console.log(0);
        return;
    }

    const numericalMatrix = extractDataRows(rawInputString)
                                .map(line => convertTokensToNumbers(line))
                                .filter(arr => arr.length > 0);

    if (numericalMatrix.length < 4) {
        console.error("Error: Insufficient data rows provided for processing.");
        console.log(0);
        return;
    }

    const controlParameters = numericalMatrix[0];
    if (controlParameters.length < 5) {
        console.error("Error: First line parameters are incomplete.");
        console.log(0);
        return;
    }

    const countToSelectP = controlParameters[0];
    const countToSelectQ = controlParameters[1];
    const originalMaxIndexP = controlParameters[2] - 1;
    const originalMaxIndexQ = controlParameters[3] - 1;
    const originalMaxIndexR = controlParameters[4] - 1;

    const valuesArrayP = numericalMatrix[1];
    const valuesArrayQ = numericalMatrix[2];
    const valuesArrayR = numericalMatrix[3];

    // Basic validation for array sizes and requested counts
    if (valuesArrayP.length <= originalMaxIndexP || valuesArrayQ.length <= originalMaxIndexQ || valuesArrayR.length <= originalMaxIndexR) {
        console.error("Error: Data array sizes do not match expected maximum indices.");
        console.log(0);
        return;
    }
    if (countToSelectP > (originalMaxIndexP + 1) || countToSelectQ > (originalMaxIndexQ + 1)) {
        console.error("Error: Requested selection count exceeds available elements in P or Q.");
        console.log(0);
        return;
    }

    // Sort all relevant arrays in descending order to easily access largest values
    valuesArrayP.sort(sortNumericallyDescending);
    valuesArrayQ.sort(sortNumericallyDescending);
    valuesArrayR.sort(sortNumericallyDescending);

    let runningTotal = 0;

    // Sum the 'countToSelectP' largest elements from valuesArrayP
    for (let currentIdx = 0; currentIdx < countToSelectP; currentIdx++) {
        runningTotal += valuesArrayP[currentIdx];
    }

    // Sum the 'countToSelectQ' largest elements from valuesArrayQ
    for (let currentIdx = 0; currentIdx < countToSelectQ; currentIdx++) {
        runningTotal += valuesArrayQ[currentIdx];
    }

    // Pointers to the smallest elements currently included in the 'runningTotal' from P and Q.
    // These pointers will decrement as elements are replaced by larger ones from valuesArrayR.
    let pointerToSmallestP = countToSelectP - 1; // Index of the smallest of the top 'countToSelectP' elements
    let pointerToSmallestQ = countToSelectQ - 1; // Index of the smallest of the top 'countToSelectQ' elements

    // Iterate through valuesArrayR (largest elements first) to find potential replacements
    for (let currentRIdx = 0; currentRIdx <= originalMaxIndexR; currentRIdx++) {
        const currentRValue = valuesArrayR[currentRIdx];

        // Determine the values of the smallest elements currently in the sum from P and Q.
        // If a pointer is less than 0, it means all elements from that array that were
        // initially included have either been replaced or the initial count was 0.
        // In such a case, treat its value as positive infinity so it's not chosen for replacement.
        const smallestPInSelection = (pointerToSmallestP >= 0) ? valuesArrayP[pointerToSmallestP] : Number.POSITIVE_INFINITY;
        const smallestQInSelection = (pointerToSmallestQ >= 0) ? valuesArrayQ[pointerToSmallestQ] : Number.POSITIVE_INFINITY;

        // If the current R value is not greater than the smallest available from P or Q,
        // no further improvement can be made, so we terminate the loop.
        if (currentRValue <= Math.min(smallestPInSelection, smallestQInSelection)) {
            break;
        }

        // Replace the smaller of the two (smallestPInSelection or smallestQInSelection) with currentRValue
        // to maximize the total sum.
        if (smallestPInSelection < smallestQInSelection) {
            runningTotal += currentRValue - smallestPInSelection;
            pointerToSmallestP--; // Move pointer to the next smallest selected P item
        } else {
            runningTotal += currentRValue - smallestQInSelection;
            pointerToSmallestQ--; // Move pointer to the next smallest selected Q item
        }
    }

    console.log(runningTotal);
}

// Standard boilerplate for competitive programming environments:
// Reads input from stdin and passes it to the main processing function.
// This section is typically left as-is for platform compatibility.
// executeProcessing(require("fs").readFileSync(__dirname+'/in.txt', "utf8")); // For local testing
executeProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));