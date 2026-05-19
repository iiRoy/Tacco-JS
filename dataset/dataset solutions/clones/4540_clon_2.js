function processInput(rawData) {
    // Remove any leading or trailing whitespace from the input string.
    rawData = rawData.trim();

    // Split the cleaned string by spaces and convert each resulting part into a number.
    const numArray = rawData.split(" ").map(Number);

    // Calculate the total by adding the first two numbers from the array.
    const sumResult = numArray[0] + numArray[1];

    // Output the sum if it's less than 10, otherwise output the string "error".
    console.log(sumResult < 10 ? sumResult : "error");
}

// Read the entire content from standard input, decode it as UTF-8, and then pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
