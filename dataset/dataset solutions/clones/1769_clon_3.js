const fileSystemInterface = require('node:fs');

function analyzeCreaturePossibility() {
    // Read all input lines from standard input.
    // The input is expected to be UTF-8 encoded and lines are separated by newlines.
    const rawInputLines = fileSystemInterface.readFileSync('/dev/stdin', 'utf8').split('\n');

    // Extract the primary data line, which contains two space-separated integers.
    // The first integer represents the total number of creatures (heads).
    // The second integer represents the total number of legs.
    const numericStrings = rawInputLines[0].split(' ');

    // Convert the string representations to integer values.
    const totalCreatures = parseInt(numericStrings[0], 10);
    const totalLegs = parseInt(numericStrings[1], 10);

    // Initialize a boolean flag to track if a valid solution is found.
    // By default, assume no solution exists until proven otherwise.
    let isSolutionViable = false;

    // --- Core Logic for Determining Viability ---
    // Let 'c' be the count of 2-legged creatures and 't' be the count of 4-legged creatures.
    // We have a system of two linear equations:
    // 1) c + t = totalCreatures
    // 2) 2c + 4t = totalLegs

    // From (1), c = totalCreatures - t. Substitute this into (2):
    // 2 * (totalCreatures - t) + 4t = totalLegs
    // 2 * totalCreatures - 2t + 4t = totalLegs
    // 2 * totalCreatures + 2t = totalLegs
    // 2t = totalLegs - (2 * totalCreatures)
    // t = (totalLegs - (2 * totalCreatures)) / 2

    // First, establish the minimum and maximum possible leg counts for the given creatures.
    // If all creatures have 2 legs: minLegs = 2 * totalCreatures
    // If all creatures have 4 legs: maxLegs = 4 * totalCreatures
    const minPossibleLegs = 2 * totalCreatures;
    const maxPossibleLegs = 4 * totalCreatures;

    // Apply initial guard clauses to quickly eliminate impossible scenarios.
    // The total number of legs must fall within the possible range.
    if (totalLegs >= minPossibleLegs && totalLegs <= maxPossibleLegs) {
        // Calculate the intermediate value: (totalLegs - (2 * totalCreatures)).
        // This value represents 2 * 't' (twice the count of 4-legged creatures).
        const twiceFourLeggedCount = totalLegs - (2 * totalCreatures);

        // For 't' to be an integer, 'twiceFourLeggedCount' must be an even number.
        // This is equivalent to checking if 'totalLegs' is even, since '2 * totalCreatures' is always even.
        const isLegDifferenceEven = (twiceFourLeggedCount % 2 === 0);

        // If the difference is even, we can proceed to calculate 't'.
        if (isLegDifferenceEven) {
            // Calculate the actual count of 4-legged creatures.
            const calculatedFourLeggedCount = twiceFourLeggedCount / 2;

            // Now, we must ensure that the calculated count of 4-legged creatures is valid:
            // 1. It must be non-negative (cannot have negative animals).
            // 2. It must not exceed the total number of creatures (cannot have more 4-legged animals than total animals).
            if (calculatedFourLeggedCount >= 0 && calculatedFourLeggedCount <= totalCreatures) {
                // If all conditions are met, a valid combination exists.
                isSolutionViable = true;
            }
        }
    }

    // Based on the flag, prepare the final output string.
    const finalOutputString = isSolutionViable ? 'Yes' : 'No';

    // Print the result to standard output.
    console.log(finalOutputString);
}

// Execute the main analysis function.
analyzeCreaturePossibility();