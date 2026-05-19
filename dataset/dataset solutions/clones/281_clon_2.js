// This program processes input data to solve a variant of the Josephus problem.

// Obtain the file system module and read all content from standard input.
// The content is decoded as UTF-8 and any surrounding whitespace is removed.
var rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

// Divide the entire input string into an array of individual text lines.
var inputDataLines = rawInputContent.split('\n');

var currentProcessedLine; // A variable to hold the line currently being examined.

// Iterate through each line of the input data.
// The loop continues as long as there are lines available and 'shift()' returns a non-null/undefined value.
while (currentProcessedLine = inputDataLines.shift()) {
    // Split the current line into an array of string-based numeric tokens.
    var numericTokens = currentProcessedLine.split(' ');

    // Convert the first token to a numerical value, representing the total number of participants.
    var totalParticipants = +numericTokens[0];
    // Convert the second token to a numerical value, representing the elimination step.
    var eliminationStep = +numericTokens[1];

    // Check for the program's termination condition: if both 'totalParticipants' and 'eliminationStep' are zero.
    if (totalParticipants + eliminationStep === 0) {
        break; // Exit the processing loop immediately.
    }

    // Initialize an array to simulate the circle of participants.
    var participantCircle = [];
    // Populate the 'participantCircle' array with numbers from 1 up to 'totalParticipants'.
    for (var participantIndex = 0; participantIndex < totalParticipants; participantIndex++) {
        participantCircle.push(participantIndex + 1);
    }

    // Simulate the Josephus elimination process.
    // This loop continues until only a single participant remains in the circle.
    while (participantCircle.length > 1) {
        // Move 'eliminationStep - 1' participants from the front of the array to its end.
        // This action simulates counting around the circle without removing anyone yet.
        for (var moveCount = 0; moveCount < eliminationStep - 1; moveCount++) {
            participantCircle.push(participantCircle.shift());
        }
        // Remove the participant who is now at the front of the array.
        // This is the 'eliminationStep'-th person to be eliminated.
        participantCircle.shift();
    }
    // The last remaining participant is the survivor. Print their identifier.
    console.log(participantCircle[0]);
}
