"use strict";

function ProcessData(programInput) {
    // Split the entire program input into an array of text rows
    const textRows = programInput.split('\n');

    // Extract the first line, convert it to an integer, and store as the total count
    let totalCount = parseInt(textRows.shift(), 10);

    // Declare an array to hold all participant records
    const participantRecords = new Array(totalCount);

    // Loop through each remaining line to populate the participant records
    for (let currentIdx = 0; currentIdx < totalCount; currentIdx++) {
        // Split the current line by space to get individual numeric parts
        let numericParts = textRows[currentIdx].split(' ');

        // Create an object for the current participant's scores
        participantRecords[currentIdx] = {
            // Convert the first number part to a numeric value for player One
            playerOneScore: Number(numericParts[0]),
            // Convert the second number part to a numeric value for player Two
            playerTwoScore: Number(numericParts[1]),
        };
        // Calculate the score difference (player Two minus player One)
        participantRecords[currentIdx].scoreDifference = participantRecords[currentIdx].playerTwoScore - participantRecords[currentIdx].playerOneScore;
    }

    // Sort the participant records array in descending order based on their score difference
    participantRecords.sort((recB, recA) => {
        // The comparison function ensures records with higher differences come first
        return recA.scoreDifference - recB.scoreDifference;
    });

    // Initialize a variable to accumulate the final computed value
    let finalComputedValue = 0;

    // Iterate through the sorted participant records to calculate the cumulative result
    for (let currentIdx = 0; currentIdx < totalCount; currentIdx++) {
        // Check if the current index is an even number
        if (currentIdx % 2 === 0) {
            // If even, add player One's score to the final sum
            finalComputedValue += participantRecords[currentIdx].playerOneScore;
            // Reset player One's score for this record to zero (as per problem logic)
            participantRecords[currentIdx].playerOneScore = 0;
        } else {
            // If odd, subtract player Two's score from the final sum
            finalComputedValue -= participantRecords[currentIdx].playerTwoScore;
            // Reset player Two's score for this record to zero (as per problem logic)
            participantRecords[currentIdx].playerTwoScore = 0;
        }
    }

    // Print the final calculated value to the console output
    console.log(finalComputedValue);
}

// Call the main processing function with data obtained from standard input
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));