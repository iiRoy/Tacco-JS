process.stdin.resume();
process.stdin.setEncoding('utf8');

// Variable to accumulate all incoming standard input data
let receivedInputData = '';
// Variable to hold processed segments of the input
let dataSegments = '';

// Event listener for 'data' chunks from stdin
process.stdin.on('data', function (incomingPayload) {
    receivedInputData += incomingPayload; // Append new data to the accumulated string
});

// Event listener for 'end' of standard input stream
process.stdin.on('end', function () {
    // Once input ends, split the accumulated data into individual characters
    dataSegments = receivedInputData.split('');
    // Initiate the main processing function
    beginProcessing();
});

/**
 * Main function to process the input data.
 * This function is called once all standard input has been received.
 */
function beginProcessing() {
    // Parse the first character of the input as an integer, representing 'n'
    const itemCount = parseInt(dataSegments[0], 10);
    // Split the entire input string by spaces and convert each part to a number
    const numericValues = dataSegments.join('').split(' ').map(Number);
    // Initialize a dynamic programming array of size 'n' with zeros
    const dynamicProgrammingArray = Array(itemCount).fill(0);

    // The following block is commented out in the original code,
    // so it remains commented out here.
    // const sourceArray = dataSegments[1].split(' ').map(Number);

    // for (let index = 1; index < dataSegments[0]; index++) {
    // 	for (let subIndex = 0; subIndex < 2; subIndex++) {
    // 		dynamicProgrammingArray[subIndex] = Math.min(dynamicProgrammingArray[subIndex] || 0, Math.abs(sourceArray[index] - sourceArray[subIndex]));
    // 	}
    // }

    // Output the first element of the processed numeric values array to the console
    console.log(numericValues[0]);
}
