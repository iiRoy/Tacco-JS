// This function is designed to process incoming text data, extracting numeric values
// and computing their sum until a specific termination condition is met.
function ProcessData(rawData) {
    // Break down the raw input string into an array, using the newline character
    // as the delimiter for individual text entries.
    var textRows = rawData.split('\n');

    // Initialize a variable to accumulate the total sum of parsed numeric values.
    var totalSum = 0;

    // Iterate through each element in the collection of text rows.
    // The 'in' operator iterates over property names (indices for arrays).
    for (var rowIndex in textRows) {
        // Evaluate if the current text row is exactly a newline character.
        // If this specific condition is met, it signifies the end of the relevant data stream.
        if (textRows[rowIndex] === "\n") {
            // Terminate the loop prematurely upon encountering the break condition.
            break;
        }

        // Convert the current text row from a string representation to an integer,
        // using base 10 for the conversion, and add it to the running total.
        totalSum += parseInt(textRows[rowIndex], 10);
    }

    // Display the final computed sum to the standard output console.
    console.log(totalSum);
}

// Execute the data processing function by reading content from standard input.
// The 'fs' module is used to synchronously read the file at '/dev/stdin'
// and the content is decoded as UTF-8 before being passed to the function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));