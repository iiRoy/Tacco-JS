let permutationsList = []; // Array to store all generated permutations of indices
let usedIndices = []; // Boolean array to keep track of used indices during permutation generation

// Initialize the 'usedIndices' array to all false, indicating no index is used initially
for (let indexCounter = 0; indexCounter < 4; indexCounter++) {
    usedIndices[indexCounter] = false;
}

let permutationCounter = 0; // Counter for the number of permutations found

// Generate all unique permutations of 4 distinct indices (0, 1, 2, 3)
// This uses a recursive-like structure with nested loops to ensure each index is used only once per permutation.

// Select the first index
for (let firstIndex = 0; firstIndex < 4; firstIndex++) {
    usedIndices[firstIndex] = true; // Mark the first selected index as used

    // Select the second index
    for (let secondIndex = 0; secondIndex < 4; secondIndex++) {
        if (usedIndices[secondIndex]) { // If this index is already used, skip it
            continue;
        }
        usedIndices[secondIndex] = true; // Mark the second selected index as used

        // Select the third index
        for (let thirdIndex = 0; thirdIndex < 4; thirdIndex++) {
            if (usedIndices[thirdIndex]) { // If this index is already used, skip it
                continue;
            }
            usedIndices[thirdIndex] = true; // Mark the third selected index as used

            // Select the fourth index
            for (let fourthIndex = 0; fourthIndex < 4; fourthIndex++) {
                if (usedIndices[fourthIndex]) { // If this index is already used, skip it
                    continue;
                }
                // A complete unique permutation of four indices has been found
                permutationsList[permutationCounter] = [firstIndex, secondIndex, thirdIndex, fourthIndex];
                permutationCounter++; // Increment the total permutation count
            }
            usedIndices[thirdIndex] = false; // Backtrack: Unmark the third index for subsequent iterations
        }
        usedIndices[secondIndex] = false; // Backtrack: Unmark the second index for subsequent iterations
    }
    usedIndices[firstIndex] = false; // Backtrack: Unmark the first index for subsequent iterations
}

// Read the entire input from standard input as a UTF-8 string
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace and split into an array of lines
let inputLines = (rawInputData.trim()).split("\n");

// Loop indefinitely until a specific termination condition is met
while (true) {
    let currentInputLine = inputLines.shift(); // Get the next line from the input array

    // Check if the current line is the termination signal "0 0 0 0"
    if (currentInputLine === "0 0 0 0") {
        break; // Exit the loop if the termination signal is found
    }

    // Parse the numbers from the current line, splitting by space and converting to Number type
    const numericalValues = currentInputLine.split(" ").map(Number);
    let finalExpressionResult = 0; // Initialize the result variable; 0 means no solution found yet

    // Define the set of arithmetic operators to be used
    const arithmeticOperators = ["+", "-", "*"];

    // Iterate through all possible combinations of three operators
    for (let operatorIndex1 = 0; operatorIndex1 < 3; operatorIndex1++) {
        for (let operatorIndex2 = 0; operatorIndex2 < 3; operatorIndex2++) {
            for (let operatorIndex3 = 0; operatorIndex3 < 3; operatorIndex3++) {

                // For each operator combination, iterate through all generated number permutations
                permutationsList.forEach(function(currentPermutationIndices) {
                    // Extract the four numbers from 'numericalValues' based on the current permutation
                    const valueA = numericalValues[currentPermutationIndices[0]];
                    const valueB = numericalValues[currentPermutationIndices[1]];
                    const valueC = numericalValues[currentPermutationIndices[2]];
                    const valueD = numericalValues[currentPermutationIndices[3]];

                    // Attempt to find an expression that evaluates to 10.
                    // Only update 'finalExpressionResult' if a solution hasn't been found yet (it's still 0).

                    // Expression form 1: A op1 B op2 C op3 D
                    if (finalExpressionResult === 0 && eval(valueA + arithmeticOperators[operatorIndex1] + valueB + arithmeticOperators[operatorIndex2] + valueC + arithmeticOperators[operatorIndex3] + valueD) === 10) {
                        finalExpressionResult = valueA + arithmeticOperators[operatorIndex1] + valueB + arithmeticOperators[operatorIndex2] + valueC + arithmeticOperators[operatorIndex3] + valueD;
                    }
                    // Expression form 2: (A op1 B op2 C) op3 D
                    if (finalExpressionResult === 0 && eval("(" + valueA + arithmeticOperators[operatorIndex1] + valueB + arithmeticOperators[operatorIndex2] + valueC + ")" + arithmeticOperators[operatorIndex3] + valueD) === 10) {
                        finalExpressionResult = "(" + valueA + arithmeticOperators[operatorIndex1] + valueB + arithmeticOperators[operatorIndex2] + valueC + ")" + arithmeticOperators[operatorIndex3] + valueD;
                    }
                    // Expression form 3: (A op1 B) op2 (C op3 D)
                    if (finalExpressionResult === 0 && eval("(" + valueA + arithmeticOperators[operatorIndex1] + valueB + ")" + arithmeticOperators[operatorIndex2] + "(" + valueC + arithmeticOperators[operatorIndex3] + valueD + ")") === 10) {
                        finalExpressionResult = "(" + valueA + arithmeticOperators[operatorIndex1] + valueB + ")" + arithmeticOperators[operatorIndex2] + "(" + valueC + arithmeticOperators[operatorIndex3] + valueD + ")";
                    }
                    // Expression form 4: ((A op1 B) op2 C) op3 D
                    if (finalExpressionResult === 0 && eval("(" + "(" + valueA + arithmeticOperators[operatorIndex1] + valueB + ")" + arithmeticOperators[operatorIndex2] + valueC + ")" + arithmeticOperators[operatorIndex3] + valueD) === 10) {
                        finalExpressionResult = "(" + "(" + valueA + arithmeticOperators[operatorIndex1] + valueB + ")" + arithmeticOperators[operatorIndex2] + valueC + ")" + arithmeticOperators[operatorIndex3] + valueD;
                    }
                });
            }
        }
    }

    // If a valid expression was found (finalExpressionResult is not 0), wrap it in parentheses for output
    if (finalExpressionResult !== 0) {
        finalExpressionResult = "(" + finalExpressionResult + ")";
    }
    // Print the result to the console (either the expression string or 0 if no solution)
    console.log(finalExpressionResult);
}
