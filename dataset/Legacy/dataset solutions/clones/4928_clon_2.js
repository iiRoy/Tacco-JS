function ProcessInput(rawData) {
    // Convert the input string into an array of individual characters.
    let charArray = rawData.split("");

    // Initialize variables for tracking game state and score.
    let currentScore = 0; // This variable accumulates the final score.
    let gTracker = 0;     // Keeps track of the 'g' count.
    let pTracker = 0;     // Keeps track of the 'p' count.

    // Iterate through each character in the array to apply game logic.
    charArray.forEach(function(singleChar) {
        // Use a switch statement to handle different character types.
        switch (singleChar) {
            case "g":
                // If the 'p' tracker is less than the 'g' tracker,
                // it means we can score a point and use a 'p'.
                if (pTracker < gTracker) {
                    currentScore++; // Increment the score.
                    pTracker++;     // Increment the 'p' tracker.
                } else {
                    // Otherwise, we just increment the 'g' tracker.
                    gTracker++;
                }
                break; // Exit the switch for 'g'.

            case "p":
                // If the 'p' tracker is less than the 'g' tracker,
                // we just use a 'p' without changing the score.
                if (pTracker < gTracker) {
                    pTracker++; // Increment the 'p' tracker.
                } else {
                    // Otherwise, we increment 'g' tracker and decrement the score.
                    gTracker++;
                    currentScore--; // Decrement the score.
                }
                break; // Exit the switch for 'p'.
        }
    });

    // Display the final calculated score to the console.
    console.log(currentScore);
}

// Read the entire content from standard input, convert it to a string,
// remove leading/trailing whitespace, and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
