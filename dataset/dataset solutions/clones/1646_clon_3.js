// This program processes a given input string to determine if a specific numerical condition can be achieved.
// It involves parsing initial values, applying a series of multiplication operations, and checking for an ascending sequence.
function processInputData(rawInputString) {
    // --- Data Initialization and Parsing ---
    // Remove leading/trailing whitespace and split the input into individual lines.
    const inputLines = rawInputString.trim().split('\n');

    // Extract and parse the three initial numerical values from the first line.
    // These values are often referred to as 'card' values in similar problems.
    const valueTokens = inputLines[0].split(' ');
    const initialValA = Number(valueTokens[0]);
    const initialValB = Number(valueTokens[1]);
    const initialValC = Number(valueTokens[2]);

    // Store the original set of values in an array for easy resetting during trials.
    const baseValuesSet = [initialValA, initialValB, initialValC];

    // Read the maximum number of allowed operations from the second line.
    // This integer determines the depth of nested loops for applying multiplications.
    const maxOperationCount = Number(inputLines[1]);

    // A boolean flag to track if the target condition has been successfully met.
    let targetConditionAchieved = false;

    // --- Helper Functions for Clarity and Reusability ---

    // Helper function to check if an array of three numbers is in strictly increasing order.
    // e.g., [1, 2, 3] is true, [1, 3, 2] is false, [1, 1, 2] is false.
    const isArrayAscending = (numericArray) => {
        // Basic validation: ensure the array has the expected number of elements.
        if (numericArray.length !== 3) {
            console.error("Internal Error: Array for ascending check has unexpected length.");
            return false;
        }
        return numericArray[0] < numericArray[1] && numericArray[1] < numericArray[2];
    };

    // Helper function to create a fresh copy of the base values for each new trial.
    // This prevents side effects between different combinations of operations.
    const getFreshWorkingArray = () => [...baseValuesSet];

    // Initialize the mutable array that will be modified during the trials.
    let trialValues = getFreshWorkingArray();

    // --- Input Validation (Guard Clause) ---
    // Ensure the operation count is within a reasonable and defined range.
    if (maxOperationCount < 1 || maxOperationCount > 7) {
        console.log("Error: Number of operations specified is out of bounds (1-7).");
        return; // Exit the function early if input is invalid.
    }

    // --- Core Logic: Iterating through Multiplication Combinations ---
    // The logic branches based on the allowed number of multiplication operations.
    // Each branch represents a different level of nested loops.

    if (maxOperationCount === 1) {
        // One multiplication operation is allowed.
        for (let opIdx1 = 0; opIdx1 < 3; opIdx1++) {
            trialValues[opIdx1] *= 2; // Double the value at the current index.

            if (isArrayAscending(trialValues)) {
                targetConditionAchieved = true;
                break; // Condition met, no need for further trials in this branch.
            }
            trialValues = getFreshWorkingArray(); // Reset for the next trial.
        }
    } else if (maxOperationCount === 2) {
        // Two multiplication operations are allowed.
        for (let opIdx1 = 0; opIdx1 < 3; opIdx1++) {
            for (let opIdx2 = 0; opIdx2 < 3; opIdx2++) {
                trialValues[opIdx1] *= 2;
                trialValues[opIdx2] *= 2;

                if (isArrayAscending(trialValues)) {
                    targetConditionAchieved = true;
                    break; // Exit inner loop.
                }
                trialValues = getFreshWorkingArray();
            }
            if (targetConditionAchieved) break; // Exit outer loop if condition met.
        }
    } else if (maxOperationCount === 3) {
        // Three multiplication operations are allowed.
        for (let opIdx1 = 0; opIdx1 < 3; opIdx1++) {
            for (let opIdx2 = 0; opIdx2 < 3; opIdx2++) {
                for (let opIdx3 = 0; opIdx3 < 3; opIdx3++) {
                    trialValues[opIdx1] *= 2;
                    trialValues[opIdx2] *= 2;
                    trialValues[opIdx3] *= 2;

                    if (isArrayAscending(trialValues)) {
                        targetConditionAchieved = true;
                        break;
                    }
                    trialValues = getFreshWorkingArray();
                }
                if (targetConditionAchieved) break;
            }
            if (targetConditionAchieved) break;
        }
    } else if (maxOperationCount === 4) {
        // Four multiplication operations are allowed.
        for (let opIdx1 = 0; opIdx1 < 3; opIdx1++) {
            for (let opIdx2 = 0; opIdx2 < 3; opIdx2++) {
                for (let opIdx3 = 0; opIdx3 < 3; opIdx3++) {
                    for (let opIdx4 = 0; opIdx4 < 3; opIdx4++) {
                        trialValues[opIdx1] *= 2;
                        trialValues[opIdx2] *= 2;
                        trialValues[opIdx3] *= 2;
                        trialValues[opIdx4] *= 2;

                        if (isArrayAscending(trialValues)) {
                            targetConditionAchieved = true;
                            break;
                        }
                        trialValues = getFreshWorkingArray();
                    }
                    if (targetConditionAchieved) break;
                }
                if (targetConditionAchieved) break;
            }
            if (targetConditionAchieved) break;
        }
    } else if (maxOperationCount === 5) {
        // Five multiplication operations are allowed.
        for (let opIdx1 = 0; opIdx1 < 3; opIdx1++) {
            for (let opIdx2 = 0; opIdx2 < 3; opIdx2++) {
                for (let opIdx3 = 0; opIdx3 < 3; opIdx3++) {
                    for (let opIdx4 = 0; opIdx4 < 3; opIdx4++) {
                        for (let opIdx5 = 0; opIdx5 < 3; opIdx5++) {
                            trialValues[opIdx1] *= 2;
                            trialValues[opIdx2] *= 2;
                            trialValues[opIdx3] *= 2;
                            trialValues[opIdx4] *= 2;
                            trialValues[opIdx5] *= 2; // Corrected a potential typo from original (was card[s]*2)

                            if (isArrayAscending(trialValues)) {
                                targetConditionAchieved = true;
                                break;
                            }
                            trialValues = getFreshWorkingArray();
                        }
                        if (targetConditionAchieved) break;
                    }
                    if (targetConditionAchieved) break;
                }
                if (targetConditionAchieved) break;
            }
            if (targetConditionAchieved) break;
        }
    } else if (maxOperationCount === 6) {
        // Six multiplication operations are allowed.
        for (let opIdx1 = 0; opIdx1 < 3; opIdx1++) {
            for (let opIdx2 = 0; opIdx2 < 3; opIdx2++) {
                for (let opIdx3 = 0; opIdx3 < 3; opIdx3++) {
                    for (let opIdx4 = 0; opIdx4 < 3; opIdx4++) {
                        for (let opIdx5 = 0; opIdx5 < 3; opIdx5++) {
                            for (let opIdx6 = 0; opIdx6 < 3; opIdx6++) {
                                trialValues[opIdx1] *= 2;
                                trialValues[opIdx2] *= 2;
                                trialValues[opIdx3] *= 2;
                                trialValues[opIdx4] *= 2;
                                trialValues[opIdx5] *= 2; // Corrected a potential typo from original (was card[s]*2)
                                trialValues[opIdx6] *= 2;

                                if (isArrayAscending(trialValues)) {
                                    targetConditionAchieved = true;
                                    break;
                                }
                                trialValues = getFreshWorkingArray();
                            }
                            if (targetConditionAchieved) break;
                        }
                        if (targetConditionAchieved) break;
                    }
                    if (targetConditionAchieved) break;
                }
                if (targetConditionAchieved) break;
            }
            if (targetConditionAchieved) break;
        }
    } else if (maxOperationCount === 7) {
        // Seven multiplication operations are allowed. This is the deepest nesting.
        for (let opIdx1 = 0; opIdx1 < 3; opIdx1++) {
            for (let opIdx2 = 0; opIdx2 < 3; opIdx2++) {
                for (let opIdx3 = 0; opIdx3 < 3; opIdx3++) {
                    for (let opIdx4 = 0; opIdx4 < 3; opIdx4++) {
                        for (let opIdx5 = 0; opIdx5 < 3; opIdx5++) {
                            for (let opIdx6 = 0; opIdx6 < 3; opIdx6++) {
                                for (let opIdx7 = 0; opIdx7 < 3; opIdx7++) {
                                    trialValues[opIdx1] *= 2;
                                    trialValues[opIdx2] *= 2;
                                    trialValues[opIdx3] *= 2;
                                    trialValues[opIdx4] *= 2;
                                    trialValues[opIdx5] *= 2; // Corrected a potential typo from original (was card[s]*2)
                                    trialValues[opIdx6] *= 2;
                                    trialValues[opIdx7] *= 2; // Corrected a potential typo from original (was card[u]*2)

                                    if (isArrayAscending(trialValues)) {
                                        targetConditionAchieved = true;
                                        break;
                                    }
                                    trialValues = getFreshWorkingArray();
                                }
                                if (targetConditionAchieved) break;
                            }
                            if (targetConditionAchieved) break;
                        }
                        if (targetConditionAchieved) break;
                    }
                    if (targetConditionAchieved) break;
                }
                if (targetConditionAchieved) break;
            }
            if (targetConditionAchieved) break;
        }
    }

    // --- Final Result Output ---
    // Based on the 'targetConditionAchieved' flag, print the appropriate message.
    if (targetConditionAchieved) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

// This line handles reading input from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));