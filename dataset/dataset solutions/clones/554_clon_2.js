var fileContent = require('fs').readFileSync('/sys/input', 'UTF-8');
// This block processes input data from the file system.
// It iterates through multiple datasets, performing calculations for each.
{
    var lineCollection = (fileContent.trim()) .split("\n") ; // Extract lines, removing leading/trailing whitespace.

    // Begin an infinite loop to process datasets.
    while (true) {
        // Parse the first line of the current dataset to get its dimensions.
        var dimensionsTuple = (lineCollection.shift()) .split(" ") .map(Number) ;

        // Check if the termination condition (both dimensions are zero) is met.
        if (dimensionsTuple[0] === 0 && dimensionsTuple[1] === 0) {
            break; // Exit the main processing loop.
        }

        var candidateScores = [] ; // Initialize an array to hold scores for each candidate.

        // Prepare the candidateScores array with initial IDs and zero scores.
        for (var indexVal = 0; indexVal < dimensionsTuple[1]; indexVal++) {
            candidateScores[indexVal] = [indexVal + 1, 0]; // [Candidate ID, Current Score]
        }

        // Process N rounds of voting or score contributions.
        for (var indexVal = 0; indexVal < dimensionsTuple[0]; indexVal++) {
            // Read a group of vote values from the next line.
            var voteGroup = (lineCollection.shift()) .split(" ") .map(Number) ;

            // Distribute the vote values to the respective candidates.
            voteGroup.forEach(function(scoreValue, scoreIndex){
                candidateScores[scoreIndex][1] += scoreValue; // Add score to candidate's total.
            });
        }

        // Sort the candidates based on their scores and then by ID for tie-breaking.
        candidateScores.sort(function(itemA, itemB){
            if (itemA[1] === itemB[1]) {
                return itemA[0] - itemB[0]; // Sort by ID ascending if scores are equal.
            } else {
                return itemB[1] - itemA[1]; // Sort by score descending.
            }
        });

        var finalRanking = [] ; // Array to store the final ordered IDs.

        // Extract only the candidate IDs from the sorted score records.
        candidateScores.forEach(function(scoreItem, currentPosition){
            finalRanking.push(candidateScores[currentPosition][0]);
        });

        // Output the final ranking as a space-separated string.
        console.log(finalRanking.join(" - "));
    }
}