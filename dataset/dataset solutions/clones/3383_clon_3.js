// Helper function to calculate the sum of all numeric elements in a collection.
function computeSumOfValues(valueList) {
    let currentAccumulation = 0; // Initialize sum for accumulation.
    // Iterate through the list using a standard for loop.
    for (let index = 0; index < valueList.length; ++index) {
        currentAccumulation += valueList[index]; // Add each element to the running total.
    }
    return currentAccumulation; // Return the final computed sum.
}

// Helper function to sum numeric elements, specifically excluding any '1's.
// This is useful for specific game logic where '1's might have a different meaning or impact.
function sumValuesExcludingOne(valueList) {
    let currentAccumulation = 0; // Initialize sum for values not equal to one.
    // Loop through the array, conditionally adding elements.
    for (let index = 0; index < valueList.length; ++index) {
        // Only add the element to the accumulation if it is not equal to 1.
        if (valueList[index] !== 1) {
            currentAccumulation += valueList[index];
        }
    }
    return currentAccumulation; // Return the sum of non-one values.
}

// Main function to process game input and determine the outcome based on specific rules.
function determineGameOutcome(rawGameInput) {
    // Parse the raw string input.
    // First, split by newline to get individual lines.
    // Then, convert each line to a number.
    // Finally, use .slice(1) to discard the very first element, as it's typically metadata (like a count)
    // that is not used in subsequent calculations in this specific problem.
    const gameNumericData = rawGameInput.split('\n').map(Number).slice(1);

    // Calculate the total sum of all relevant numbers present in the game data.
    const totalCurrentScore = computeSumOfValues(gameNumericData);

    // Calculate a specialized sum: the total of all numbers, explicitly ignoring any '1's.
    const scoreWithoutOnes = sumValuesExcludingOne(gameNumericData);

    // Initialize a crucial flag that will ultimately determine the game's final result.
    // Its initial state is based on the comprehensive total score.
    let finalDecisionValue = totalCurrentScore;

    // A boolean flag to track if any special condition has been met that would override
    // the 'finalDecisionValue' to a specific state (in this case, '1').
    let specialOutcomeTriggered = false;

    // Condition A: Check if all numbers in the processed data were '1's.
    // If the total sum equals the count of elements, it implies every element must have been '1'.
    // This is a specific game rule that triggers a special outcome.
    if (totalCurrentScore === gameNumericData.length) {
        specialOutcomeTriggered = true; // Mark that this special case has occurred.
    }

    // Condition B: Check the parity of the sum of numbers excluding '1's.
    // If this sum is odd (i.e., not perfectly divisible by 2), it's another special game rule.
    if (scoreWithoutOnes % 2 !== 0) { // Using '!== 0' is a clear way to check for oddness.
        specialOutcomeTriggered = true; // Mark this special case as well.
    }

    // If any of the defined special conditions were met, the 'finalDecisionValue' is forcibly set to '1'.
    // This override is central to the game's logic.
    if (specialOutcomeTriggered) {
        finalDecisionValue = 1;
    }

    // The ultimate game outcome depends on the parity of the 'finalDecisionValue'.
    // An odd value typically means the "first" player wins, while an even value means the "second" player wins.
    const isFirstPlayerClaimingVictory = (finalDecisionValue % 2 !== 0);

    // Output the determined result to the standard console.
    if (isFirstPlayerClaimingVictory) {
        console.log("first"); // Announce the "first" player as the winner.
    } else {
        console.log("second"); // Announce the "second" player as the winner.
    }
}

// Execute the game outcome determination process.
// The input is read from standard input, decoded as UTF-8, and any leading/trailing whitespace is removed.
determineGameOutcome(require("fs").readFileSync("/dev/stdin", "utf8").trim());