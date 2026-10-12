// This function is designed to process a given input string and compute a specific numerical result.
function ProcessInput(rawData) {
    // The raw input string is first cleaned: leading/trailing whitespace removed,
    // then split into individual lines, and each line is further split by spaces.
    const parsedData = rawData.trim().split("\n").map(function(lineSegment) {
        return lineSegment.split(" ");
    });

    // The first numerical value from the input's first line determines the total number of iterations.
    const totalElements = parseInt(parsedData[0][0], 10);

    // An array is initialized to keep track of certain counts, starting with specific values.
    let colorTallies = [1, 0, 0];

    // Declare several variables that will be used as temporary storage during calculations.
    let currentElementValue, matchingTally, aFlag; // 'aFlag' is declared but remains unused, mirroring the original structure.

    // The final cumulative product is initialized with a starting value.
    let cumulativeProduct = 3;

    // A loop iterates from the second element up to, but not including, the total number of elements.
    for (let idx = 1; idx < totalElements; idx++) {
        // Reset the counter for matching tallies at the beginning of each major iteration.
        matchingTally = 0;

        // Extract and parse the current element's value from the second line of the processed data.
        currentElementValue = parseInt(parsedData[1][idx], 10);

        // Iterate through the 'colorTallies' array to count occurrences of the 'currentElementValue'.
        for (let tallyValue of colorTallies) {
            if (tallyValue === currentElementValue) {
                matchingTally++;
            }
        }

        // Update the cumulative product: multiply by the count of matching tallies,
        // then apply a modulo operation to keep the number within a specific range.
        cumulativeProduct *= matchingTally;
        cumulativeProduct %= (1e9 + 7); // The modulo constant is 1,000,000,007.

        // Another inner loop updates the 'colorTallies' array.
        // It finds the first tally that matches 'currentElementValue' and increments it.
        for (let innerIdx = 0; innerIdx < 3; innerIdx++) {
            if (colorTallies[innerIdx] === currentElementValue) {
                colorTallies[innerIdx]++;
                break; // Once a match is found and updated, exit this inner loop.
            }
        }
    }

    // The final calculated cumulative product is printed to the console.
    console.log(cumulativeProduct);
}

// The program reads its input from standard input, using Node.js's file system module,
// and then passes this input string to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
