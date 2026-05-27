function ProcessInputData(rawData) {
    // Split the entire raw input string into an array of individual lines.
    let processedLines = rawData.split("\n");

    // Initialize a pointer to keep track of the current line being processed.
    let currentLinePointer = 0;

    // Begin an indefinite loop to process sets of data until a specific termination condition is met.
    while (true) {
        // For the current line, split it by spaces to get individual parameters.
        processedLines[currentLinePointer] = processedLines[currentLinePointer].split(' ');

        // Parse the first parameter as the total number of participants.
        const numberOfParticipants = parseInt(processedLines[currentLinePointer][0], 10);
        // Parse the second parameter as the 1-based index of the winning participant.
        const winningParticipantIndex = parseInt(processedLines[currentLinePointer][1], 10);
        // Parse the third parameter as the tax percentage to be applied, then advance the line pointer.
        const taxRatePercentage = parseInt(processedLines[currentLinePointer++][2], 10);

        // Check if all three parameters are zero, which signifies the end of input.
        if (numberOfParticipants === 0 && winningParticipantIndex === 0 && taxRatePercentage === 0) {
            break; // Exit the processing loop.
        }

        // Initialize variables for the total prize amount and the winner's individual contribution.
        let totalPrizeAmount = 0;
        let winnerIndividualContribution;

        // Iterate through each participant to collect their contributions.
        for (let participantIterator = 0; participantIterator < numberOfParticipants; participantIterator++) {
            // Parse the current participant's contribution from the next line, then advance the line pointer.
            const currentParticipantAmount = parseInt(processedLines[currentLinePointer++], 10);

            // Add the current participant's contribution (multiplied by 100) to the total prize pool.
            totalPrizeAmount += currentParticipantAmount * 100;

            // If the current participant is the winner (adjusting for 0-based indexing).
            if ((winningParticipantIndex - 1) === participantIterator) {
                winnerIndividualContribution = currentParticipantAmount; // Store their contribution.
            }
        }

        // Apply the tax percentage to the calculated total prize amount.
        totalPrizeAmount = totalPrizeAmount * (100 - taxRatePercentage) / 100;

        // Determine and output the winner's share.
        if (winnerIndividualContribution > 0) {
            // If the winner contributed a positive amount, calculate their share and print the floor value.
            console.log(Math.floor(totalPrizeAmount / winnerIndividualContribution));
        } else {
            // If the winner contributed nothing, their share is 0.
            console.log("0");
        }
    }
}

// Read the entire content from standard input (typically a file) as a UTF-8 string,
// then pass it to the main data processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
