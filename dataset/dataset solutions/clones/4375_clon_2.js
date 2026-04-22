// Initialize the standard input stream for reading data.
process.stdin.resume();

// Set the character encoding for the input stream to UTF-8.
process.stdin.setEncoding('utf8');

// This function encapsulates the main computational logic of the program.
function processInputAndCalculate(incomingDataString) {
    // Divide the received string into an array of substrings using space as a delimiter.
    let parsedNumericalElements = incomingDataString.split(" ");

    // Extract the first element from the array, which represents the primary numerical component.
    let primaryNum = parsedNumericalElements[0];

    // Extract the second element from the array, representing the secondary numerical component.
    let secondaryNum = parsedNumericalElements[1];

    // Declare a variable to store the ultimate computed value, initializing it to zero.
    let finalOutcome = 0;

    // Evaluate a condition: if the secondary number is greater than or equal to the primary number.
    if (secondaryNum >= primaryNum) {
        // Should the condition be met, the final result is set to zero.
        finalOutcome = 0;
    }
    else {
        // Otherwise, calculate the difference between the primary and secondary numbers.
        finalOutcome = primaryNum - secondaryNum;
    }

    // Display the final computed outcome to the console.
    console.log(finalOutcome);
}

// Read the entire content from the standard input file path (/dev/stdin),
// decode it as UTF-8, and then pass this content to the primary processing function.
processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));