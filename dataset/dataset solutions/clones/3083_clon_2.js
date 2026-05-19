// This function processes the entire input data received.
function ProcessInput(rawData) {
    // The original code had a commented-out line for space-separated integers.
    // rawData = rawData.split(' ').map(item => parseInt(item, 10));

    // Split the raw input into an array of lines.
    let parsedLines = rawData.split("\n");

    // Parse the first line as an integer, representing the total number of items.
    let totalItems = parseInt(parsedLines[0], 10);

    // Get the second line, which is a string representing item types.
    let itemString = parsedLines[1];

    // Count the occurrences of 'R' in the item string.
    // Splitting by 'R' creates an array where the length is one more than the count of 'R's.
    let redCount = itemString.split('R').length - 1;

    // Determine if the count of 'R' items is greater than half of the total items.
    // Output 'Yes' if true, 'No' otherwise.
    console.log((totalItems / 2) < redCount ? 'Yes' : 'No');
}

// Do not modify the code below this line. It handles reading from standard input and invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
