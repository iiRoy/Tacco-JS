// Enable standard input stream for data reception.
process.stdin.resume();

// Configure the encoding for incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Declare a variable to hold the numerical value parsed from input.
let inputNumber = 0;

// Define a constant for the modulo operation, preventing overflow.
const modulusConstant = 1000000007;

// A temporary array to store all received lines of input.
const collectedInputLines = [];

// Event listener: triggered when data is received from standard input.
process.stdin.on('data', function (dataBuffer) {
    // Trim whitespace from the chunk and split it into individual lines.
    const processedLines = dataBuffer.trim().split('\n');

    // Iterate over each line received in the current data chunk.
    for (const currentLine of processedLines) {
        // Skip processing if the line is empty after trimming.
        if (currentLine.trim().length === 0) {
            continue;
        }
        // Attempt to parse the line into an integer.
        const parsedValue = parseInt(currentLine, 10);
        // If parsing is successful and results in a valid number, store it.
        if (!isNaN(parsedValue)) {
            collectedInputLines.push(parsedValue);
        }
    }
});

// Event listener: triggered when the end of the standard input stream is reached (EOF).
process.stdin.on('end', function () {
    // Ensure that at least one valid number was collected.
    if (collectedInputLines.length > 0) {
        // For this specific problem, we assume the last valid number is the one we need.
        inputNumber = collectedInputLines[collectedInputLines.length - 1];
    } else {
        // If no valid input was provided, default to a sensible value (e.g., 0 for factorial).
        // Or, alternatively, log an error and exit. For now, let's default to 0.
        console.error("Warning: No valid number received. Defaulting input to 0.");
        inputNumber = 0;
    }

    // Validate the input number; ensure it's non-negative.
    if (inputNumber < 0) {
        console.error("Error: Input number cannot be negative for factorial calculation. Exiting.");
        return; // Terminate execution if input is invalid.
    }

    // Initialize the accumulator for the factorial calculation.
    // Factorial of 0 is 1, so this is a correct starting point.
    let finalProduct = 1;

    // Handle the special case for factorial of 0 directly.
    if (inputNumber === 0) {
        console.log(finalProduct);
        return; // Exit early as calculation is complete.
    }

    // Define the upper limit for the loop, making the condition clearer.
    const loopUpperLimit = inputNumber;

    // Calculate the factorial value, applying modulo at each step to prevent large number overflow.
    // The loop iterates from 1 up to and including the input number.
    for (let iterationIndex = 1; iterationIndex <= loopUpperLimit; iterationIndex++) {
        finalProduct *= iterationIndex;
        // Apply the modulo operation to keep the product within manageable bounds.
        finalProduct %= modulusConstant;
    }

    // Output the final calculated factorial value.
    console.log(finalProduct);
});