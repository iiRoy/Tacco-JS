// This section handles the initial setup for reading input data.
var dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input string is processed: leading/trailing whitespace is removed,
// then it's split into an array of individual lines.
var lineData = dataSource.trim().split("\n");

// The main simulation loop begins here. It continues indefinitely
// until a specific termination sequence is encountered.
while (true) {
    // Read the first line of parameters for the current simulation iteration.
    // These parameters are space-separated numbers.
    var currentParams = lineData.shift().split(" ").map(Number);

    // Check if the current parameter set signals the end of input.
    // The termination condition is "0 0 0".
    if (currentParams.join(" ") === "0 0 0") {
        break; // Exit the loop if the termination condition is met.
    }

    // Extract the individual parameters into distinct, semantically named variables.
    var firstParam = currentParams[0];   // Represents 'x' from the original code.
    var secondParam = currentParams[1];  // Represents 'y' from the original code.
    var thirdParam = currentParams[2];   // Represents 'z' from the original code.

    // Read the next line, which contains a list of step values or increments.
    var valueList = lineData.shift().split(" ").map(Number);

    // Initialize a data structure to hold special effects or modifiers.
    // This will be an array acting as a map where indices correspond to states.
    var effectMap = [];

    // Populate the 'effectMap' based on the 'thirdParam', which dictates
    // how many effect definitions follow.
    for (var loopVar1 = 0; loopVar1 < thirdParam; loopVar1++) {
        // Each effect definition consists of a state index, an effect type, and an effect amount.
        var effectInfo = lineData.shift().split(" ").map(Number);
        // Store the effect type and amount at the specified state index.
        effectMap[effectInfo[0]] = [effectInfo[1], effectInfo[2]];
    }

    // Initialize the dynamic programming table (2D array) for probability calculations.
    var probabilityMatrix = [];

    // Set up the dimensions of the probability matrix.
    // The first dimension goes up to 'secondParam' (inclusive), and the second up to 5000.
    for (var loopVar1 = 0; loopVar1 <= secondParam; loopVar1++) {
        probabilityMatrix[loopVar1] = []; // Initialize inner array for each row.
        for (var loopVar2 = 0; loopVar2 <= 5000; loopVar2++) {
            probabilityMatrix[loopVar1][loopVar2] = 0; // All probabilities start at zero.
        }
    }

    // Set the initial condition: starting at state (0,0) with 100% probability.
    probabilityMatrix[0][0] = 1;

    // This is the core dynamic programming iteration loop.
    // It calculates probabilities for each state transition.
    for (var loopVar1 = 0; loopVar1 < secondParam; loopVar1++) {
        for (var loopVar2 = 0; loopVar2 < firstParam; loopVar2++) {
            // Determine the next state based on the current state and a value from 'valueList'.
            var nextState = loopVar1 + valueList[loopVar2];
            // Ensure the 'nextState' does not exceed the maximum allowed 'secondParam'.
            if (nextState > secondParam) {
                nextState = secondParam;
            }

            // Iterate through all possible values of the secondary state dimension ('k').
            for (var loopVar3 = 0; loopVar3 <= 5000; loopVar3++) {
                // Check if there is a special effect associated with the 'nextState'.
                if (effectMap[nextState] !== undefined) {
                    var effectType = effectMap[nextState][0];    // Extract the type of effect.
                    var effectAmount = effectMap[nextState][1];  // Extract the magnitude of the effect.

                    // Apply the effect based on its type.
                    if (effectType === 1) { // Effect type 1: modifies the 'i' dimension of the state.
                        probabilityMatrix[nextState + effectAmount][loopVar3] += probabilityMatrix[loopVar1][loopVar3] / firstParam;
                    } else if (effectType === 2) { // Effect type 2: modifies the 'k' dimension of the state.
                        probabilityMatrix[nextState][loopVar3 + effectAmount] += probabilityMatrix[loopVar1][loopVar3] / firstParam;
                    } else if (effectType === 3) { // Effect type 3: decreases the 'k' dimension, with a lower bound at 0.
                        if (loopVar3 - effectAmount < 0) {
                            effectAmount = loopVar3; // Adjust amount to prevent 'k' from going below zero.
                        }
                        probabilityMatrix[nextState][loopVar3 - effectAmount] += probabilityMatrix[loopVar1][loopVar3] / firstParam;
                    }
                } else {
                    // If no special effect is present, simply propagate the probability
                    // to the 'nextState' with the same 'k' value.
                    probabilityMatrix[nextState][loopVar3] += probabilityMatrix[loopVar1][loopVar3] / firstParam;
                }
            }
        }
    }

    // After all probabilities are calculated, determine the total expected value.
    var totalExpectedValue = 0;
    // Iterate through the final row of the probability matrix (corresponding to 'secondParam').
    for (var loopVar1 = 0; loopVar1 <= 5000; loopVar1++) {
        // Sum up (k * P(final_state, k)) for all possible k values.
        totalExpectedValue += loopVar1 * probabilityMatrix[secondParam][loopVar1];
    }

    // Output the final expected value, rounded down to the nearest integer.
    console.log(Math.floor(totalExpectedValue));
}