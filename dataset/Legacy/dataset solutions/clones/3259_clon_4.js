process.stdin.resume();
process.stdin.setEncoding('utf8');
let inputBuffer = '';

process.stdin.on('data', function(chunk) {
    inputBuffer += chunk;
});

process.stdin.on('end', function() {
    const dataLines = inputBuffer.split("\n");
    const elementCount = parseInt(dataLines[0]);
    const initialValues = dataLines[1].split(" ").map(Number);

    // Helper function to recursively apply decrements to subsequent elements (replaces innermost 'for' loop)
    const applySubsequentDecrements = (currentArrayState, startIndex, thresholdValue) => {
        if (startIndex >= currentArrayState.length || currentArrayState[startIndex] < thresholdValue) {
            return currentArrayState; // Base case: end of array or condition fails
        }
        const modifiedArray = [...currentArrayState]; // Create a new array for immutability
        modifiedArray[startIndex]--; // Decrement the current element
        return applySubsequentDecrements(modifiedArray, startIndex + 1, thresholdValue); // Recurse for the next element
    };

    // Helper function to perform one full pass over the array recursively (replaces outer 'for' loop)
    const executeSinglePass = (currentArray, currentIndex, passOperationsAccumulator, passChangedFlag) => {
        if (currentIndex >= currentArray.length) {
            // Base case: finished processing all elements in this pass
            return {
                processedArray: currentArray,
                passOps: passOperationsAccumulator,
                modifiedInPass: passChangedFlag
            };
        }

        let nextArrayForRecursion = [...currentArray]; // Start with a fresh copy for this element's processing
        let nextPassOps = passOperationsAccumulator;
        let nextPassChanged = passChangedFlag;

        if (nextArrayForRecursion[currentIndex] > 0) {
            const originalElementValue = nextArrayForRecursion[currentIndex];
            nextPassChanged = true;
            nextPassOps++;

            // Apply the inner loop's logic using the recursive helper
            nextArrayForRecursion = applySubsequentDecrements(nextArrayForRecursion, currentIndex + 1, originalElementValue);
            nextArrayForRecursion[currentIndex]--; // Decrement the current element itself
        }

        // Recurse for the next element in the array
        return executeSinglePass(nextArrayForRecursion, currentIndex + 1, nextPassOps, nextPassChanged);
    };

    // Main recursive function to simulate the 'while' loop
    const determineTotalDecrements = (currentArrayState, accumulatedTotalOperations) => {
        const { processedArray: nextArrayState, passOps: operationsThisRound, modifiedInPass: roundModified } =
            executeSinglePass(currentArrayState, 0, 0, false);

        if (!roundModified) {
            // Base case: no changes occurred in this round, so we are done
            return accumulatedTotalOperations;
        } else {
            // Recursive step: continue with the modified array and updated total operations
            return determineTotalDecrements(nextArrayState, accumulatedTotalOperations + operationsThisRound);
        }
    };

    const finalOperationCount = determineTotalDecrements(initialValues, 0);
    console.log(finalOperationCount);
});
