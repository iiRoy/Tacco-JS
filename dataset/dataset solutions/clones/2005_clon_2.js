// Activate the standard input stream for data reception.
process.stdin.resume();
// Configure the encoding for the incoming data from standard input.
process.stdin.setEncoding('utf8');

// An array to accumulate all received lines from the input.
let inputLines = [];
// Initialize a readline interface to process input line by line.
const inputProcessor = require('readline').createInterface({
  input: process.stdin,  // Direct input from the standard input stream.
  output: process.stdout // Direct output to the standard output stream (not directly used for printing here).
});

// Attach an event listener for each new line of input.
inputProcessor.on('line', (currentLine) => {
  inputLines.push(currentLine); // Store the current line in our collection.
});

// Attach an event listener for when the input stream concludes.
inputProcessor.on('close', () => {
    // Process the very first line of input:
    // It's expected to contain two space-separated numbers.
    // These are converted to BigInts for arbitrary precision arithmetic.
    let [initialValue, divisorValue] = inputLines[0].split(" ").map(stringValue => BigInt(stringValue));

    // An object to keep track of remainders encountered during the process.
    // This helps in detecting cycles to prevent infinite loops.
    const remainderTracker = {};
    // Initialize the variable that will hold the smallest remainder found.
    let minimumRemainder = initialValue;

    // Begin a loop that continues as long as the current 'initialValue'
    // has not been seen before in the 'remainderTracker' (indicating a cycle).
    while (!remainderTracker[initialValue]) {
        // Calculate the remainder when 'initialValue' is divided by 'divisorValue'.
        const currentRemainder = initialValue % divisorValue;

        // Mark the 'currentRemainder' as seen in our tracker.
        // The actual value of the key doesn't matter, just its presence.
        remainderTracker[currentRemainder] = true;

        // Update 'minimumRemainder' if 'currentRemainder' is smaller.
        minimumRemainder = minimumRemainder > currentRemainder ? currentRemainder : minimumRemainder;

        // Calculate the next 'initialValue'. This operation is equivalent to
        // finding the absolute difference between 'divisorValue' and 'currentRemainder'.
        initialValue = divisorValue > currentRemainder ? divisorValue - currentRemainder : currentRemainder - divisorValue;

        // If the 'minimumRemainder' has reached 0, it's the smallest possible,
        // so we can terminate the loop early.
        if (minimumRemainder === 0n) {
            break;
        }
    }
    // Output the final smallest remainder found, converted to a string.
    console.log(minimumRemainder.toString());
});
