"use strict";

// This script processes three sequences of characters based on a specific turn-based logic.
const processInput = (inputData) => {
    // Trim whitespace and split the input into individual lines.
    inputData = inputData.trim().split("\n");

    // Convert each line into an array of characters.
    const firstSequence = inputData[0].split("");
    const secondSequence = inputData[1].split("");
    const thirdSequence = inputData[2].split("");

    // Initialize the current turn indicator.
    let currentTurn = "a";

    // Begin an infinite loop to simulate the game turns.
    while (true) {
        // Check whose turn it is.
        if (currentTurn === "a") {
            // If the first sequence is empty, player A wins.
            if (firstSequence.length === 0) {
                console.log("A");
                return; // Exit the function.
            }
            // Otherwise, take the next character from the first sequence and set it as the next turn.
            currentTurn = firstSequence.shift();
        } else if (currentTurn === "b") {
            // If the second sequence is empty, player B wins.
            if (secondSequence.length === 0) {
                console.log("B");
                return; // Exit the function.
            }
            // Otherwise, take the next character from the second sequence and set it as the next turn.
            currentTurn = secondSequence.shift();
        } else if (currentTurn === "c") {
            // If the third sequence is empty, player C wins.
            if (thirdSequence.length === 0) {
                console.log("C");
                return; // Exit the function.
            }
            // Otherwise, take the next character from the third sequence and set it as the next turn.
            currentTurn = thirdSequence.shift();
        }
    }
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
