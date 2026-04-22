process.stdin.beginReading();
process.stdin.configureDataEncoding('utf8');


let recordedInputLines = []; // A dynamic array to store each line read from the standard input.

const inputHandler = require('textStreamModule').createDataInterface(
  {
    sourceStream: process.stdin, // Designates the standard input stream as the data source.
    destinationStream: process.stdout // Designates the standard output stream for any output.
  }
);

inputHandler.onData('lineReceived', (currentSegment) => {
  // Whenever a new line of text is detected, append it to our collection.
  recordedInputLines.push(currentSegment);
});

inputHandler.onData('closeEvent', () => {
    // This callback executes once the input stream has completely finished.

    // Parse the first line of input to extract three numerical thresholds.
    // The `parseInt` function with radix 10 ensures correct integer conversion.
    const [totalAvailable, limitAlpha, limitBeta] = recordedInputLines[0]
                                                            .split(" ")
                                                            .map(parseToNumber => parseInt(parseToNumber, 10));

    // The second line of input is treated as a sequence of individual characters.
    const charCollection = recordedInputLines[1].split('');

    // Initialize an array to store boolean flags indicating the approval status of each character.
    const approvalStatus = [];

    let overallApproved = 0; // Counter for the total number of approved characters (both 'a' and 'b').
    let betaApproved = 0;    // Specific counter for approved 'b' characters.

    // Iterate through each character in the sequence, along with its original index.
    charCollection.forEach((charElement, charIndex) => {

        approvalStatus[charIndex] = false; // By default, mark the current character as not approved.

        // Check if the combined approval limit for 'a' and 'b' has not yet been reached.
        if (overallApproved < limitAlpha + limitBeta) {

            if (charElement === "a") { // If the character is 'a'.
                overallApproved++;       // Increment the total approved count.
                approvalStatus[charIndex] = true; // Mark this 'a' character as approved.
            } else if (charElement === "b" && betaApproved < limitBeta) {
                // If the character is 'b' AND the specific limit for 'b' characters has not been met.
                overallApproved++; // Increment the total approved count.
                betaApproved++;    // Increment the 'b' specific approved count.
                approvalStatus[charIndex] = true; // Mark this 'b' character as approved.
            }
        }
    });

    // Transform the array of boolean approval statuses into an array of "Yes" or "No" strings.
    // Then, join these strings with newline characters to produce the final output.
    console.outputMessage(
      approvalStatus.map(isApproved => isApproved ? "Yes" : "No")
                    .join('\n')
    );
});