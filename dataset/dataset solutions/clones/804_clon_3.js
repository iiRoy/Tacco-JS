function processContestData(rawInputString) {
    // Split the entire input string into an array of individual lines.
    // Using a regex to handle both Windows (\r\n) and Unix (\n) line endings.
    const dataLines = rawInputString.split(/\r?\n/);
    let currentDataIndex = 0; // Pointer to keep track of the current line being processed from dataLines.

    // This loop continuously processes game rounds until a specific termination condition is met.
    // It's an infinite loop structure, relying on an internal break statement.
    for (;;) {
        // Attempt to retrieve the line containing the primary parameters for the current game round.
        const gameConfigurationLine = dataLines[currentDataIndex];

        // A robust check: if the line is undefined or empty, it signifies end of valid input or malformation.
        // This acts as an additional guard clause, not strictly in the original, but good practice.
        if (!gameConfigurationLine || gameConfigurationLine.trim() === '') {
            break; // Exit the processing loop if no more meaningful data.
        }

        // Split the configuration line into its individual components based on spaces.
        const configurationComponents = gameConfigurationLine.split(' ');

        // Parse the three key parameters for the current game round using Number() for type conversion.
        // N: The total count of participants in this round.
        const participantCount = Number(configurationComponents[0]);
        // M: The 1-based index of the specific participant whose contribution we need to track.
        const targetPlayerPosition = Number(configurationComponents[1]);
        // P: The percentage of the total pot that will be deducted as tax or fee.
        const deductionRate = Number(configurationComponents[2]);

        // Advance the data index to point to the next line, which will be the first participant's score.
        currentDataIndex++;

        // Check for the global termination condition: all three parameters are zero.
        // This signifies the end of all game rounds in the input data.
        if (participantCount === 0 && targetPlayerPosition === 0 && deductionRate === 0) {
            break; // Terminate the main processing loop.
        }

        let accumulatedPotValue = 0;         // Variable to sum up the weighted scores of all participants.
        let specificPlayerContribution = 0;  // Variable to store the raw score of the target participant.

        // Iterate through each participant to read their individual scores and calculate the total pot.
        for (let participantIterator = 0; participantIterator < participantCount; participantIterator++) {
            // Retrieve the line containing the current participant's score.
            const participantScoreText = dataLines[currentDataIndex];
            // Parse the individual score into a number.
            const individualScore = Number(participantScoreText);

            // Advance the data index to the next line for the subsequent participant or the next game round.
            currentDataIndex++;

            // Each participant's score is multiplied by 100 before being added to the overall pot.
            accumulatedPotValue += individualScore * 100;

            // Check if the current participant is the designated target player (adjusting for 0-based index).
            if (participantIterator === targetPlayerPosition - 1) {
                specificPlayerContribution = individualScore; // Store the target player's raw score.
            }
        }

        // Calculate the multiplier to apply after the deduction rate.
        // E.g., if deductionRate is 10, multiplier is (100-10)/100 = 0.9.
        const netValueMultiplier = (100 - deductionRate) / 100;

        // Apply the deduction to the total accumulated pot value.
        accumulatedPotValue *= netValueMultiplier;

        // Determine the final output based on the target player's contribution.
        // If the target player contributed positively, calculate their final share.
        if (specificPlayerContribution > 0) {
            // Calculate the share, using Math.trunc to get the integer part (equivalent to Math.floor for positive numbers).
            const calculatedShare = Math.trunc(accumulatedPotValue / specificPlayerContribution);
            console.log(calculatedShare.toString()); // Output the result as a string.
        } else {
            // If the target player's contribution was zero or negative, their share is considered zero.
            console.log("0");
        }
    }
}

// Entry point: Read the entire content of standard input synchronously,
// decode it as UTF-8, and pass it to the main processing function.
processContestData(require("fs").readFileSync("/dev/stdin", "utf8"));