String.prototype.padWithLeadingZeros = function(count, padChar) {
    let currentString = this; // Reference to the string instance
    if (typeof padChar === 'undefined') {
        padChar = "0"; // Default padding character
    }
    // Check for potential overflow if the string is already too long
    if (currentString.length > padChar.length * count) {
        throw new Error("String length exceeds padding capacity: " + currentString.length + " > " + (padChar.length * count));
    }
    // Generate padding and concatenate, then slice from the end
    return (padChar.repeat(count) + this).slice(-1 * padChar.length * count);
};

function ProcessContestData(rawData){
    // Split the input string into individual lines
    rawData = rawData.split("\n");

    // Parse the first line for problem count and target score
    let difficultyGoal = rawData.shift().split(" ").map(val => parseInt(val, 10));
    let numProblems = difficultyGoal[0]; // D from original
    let targetScore = difficultyGoal[1] / 100; // G from original, converted to hundreds

    let problemPoints = []; // p from original
    let bonusScores = [];   // c from original
    
    // The 'total' variable is declared but not used in the original, maintaining its presence.
    let total = 0; 

    // Loop through the remaining lines to populate problem data
    for (let problemIndex = 0; problemIndex < numProblems; problemIndex++) {
        let problemComponent = rawData.shift().split(" ").map(val => parseInt(val, 10));
        problemPoints.push(problemComponent[0]);
        bonusScores.push(problemComponent[1] / 100); // Convert bonus to hundreds
    }
    
    // Calculate total number of combinations (2^D)
    let combinationsCount = Math.pow(2, numProblems);
    
    let minProblemsSolved = []; // Stores the minimum problems solved for each valid combination
    
    // Iterate through all possible combinations of solving problems
    for (let comboIndex = 0; comboIndex < combinationsCount; comboIndex++) {
        // Convert combination index to binary string and pad it
        let selectionPattern = comboIndex.toString(2).padWithLeadingZeros(numProblems);
        let currentScore = 0;
        let problemsSolvedCount = 0;

        // Evaluate the current combination
        for (let difficultyLevel = 0; difficultyLevel < numProblems; difficultyLevel++) {
            if (selectionPattern[difficultyLevel] === "1") { // If this problem set is selected
                problemsSolvedCount += problemPoints[difficultyLevel];
                currentScore += problemPoints[difficultyLevel] * (difficultyLevel + 1) + bonusScores[difficultyLevel];
            }
        }
        
        // If the target score is already met with selected problems
        if (targetScore <= currentScore) {
            minProblemsSolved.push(problemsSolvedCount);
            continue; // Move to the next combination
        }
        
        // If target score not met, try to solve remaining problems partially
        for (let difficultyLevel = 0; difficultyLevel < numProblems; difficultyLevel++) {
            if (selectionPattern[difficultyLevel] === "1") {
                continue; // Skip problems already selected
            }
            // Calculate how many problems of this difficulty are needed to reach the target
            let neededPartial = Math.floor((targetScore - currentScore) / (difficultyLevel + 1));
            // If we need more than available problems (minus one, as we can't solve all if we need partial)
            if (neededPartial > problemPoints[difficultyLevel] - 1) {
                continue; // Cannot solve enough from this category
            }
            minProblemsSolved.push(problemsSolvedCount + neededPartial);
        }
    }
    
    // Return the minimum number of problems solved across all valid combinations
    return Math.min(...minProblemsSolved);
}

// This section handles input/output for different environments.
// It's not part of the core algorithm logic.

((inputString, resultValue, resultType) => {
    // Check if running in a Node.js-like environment (e.g., competitive programming platform)
    if (typeof require !== "undefined") {
        // Read input from stdin, process it, and print the result to console
        console.log(ProcessContestData(require("fs").readFileSync("/dev/stdin", "utf8")));
    } else {
        // Assume browser environment for testing/display
        // Prepare input string by removing first/last empty lines
        inputString = inputString.split("\n").slice(1, -1).join("\n");
        
        // Execute the main processing function and capture any errors
        resultValue = (() => {
            try {
                return ProcessContestData(inputString);
            } catch (errorObject) {
                return errorObject.stack || errorObject.message; // Return error details
            }
        })();
        
        // Determine the type of the result
        resultType = typeof resultValue;
        
        // If the result is not a string, convert it to JSON string for display
        if (resultType !== "string") {
            resultValue = JSON.stringify(resultValue);
        }

        // Create a form with textareas to display input, result type, and result value
        // This part uses jQuery, assuming it's available in a browser context.
        $("<form>")
            .append(
                [
                    [10, inputString], // Input data textarea
                    0,                 // Separator (br)
                    [1, resultType],   // Result type textarea
                    0,                 // Separator (br)
                    [10, resultValue]  // Result value textarea
                ].map(elementData => {
                    // For non-zero elements, create a textarea; otherwise, a <br>
                    return elementData
                        ? $("<textarea>", {
                              rows: elementData[0],
                              cols: 40,
                              text: elementData[1],
                          })
                        : $("<br>");
                })
            )
            .appendTo("body"); // Add the form to the document body
    }
})(`
2 700
3 500
5 800
`);
