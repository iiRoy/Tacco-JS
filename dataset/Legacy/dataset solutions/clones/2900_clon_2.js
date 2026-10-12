// This function processes the entire input data provided as a string.
function ProcessInput(rawData) {
    // Split the raw input string into an array of lines.
    rawData = rawData.split("\n");

    // Parse the first line to get the total number of queries.
    let queryCount = parseInt(rawData[0]);

    // Extract query specifications from subsequent lines.
    // Each line is split by space, and its parts are converted to integers.
    const querySpecs = rawData.slice(1, queryCount + 1).map(lineData =>
        lineData.split(" ").map(strVal => parseInt(strVal))
    );

    // Initialize an array to store the computed results for each query.
    let resultsArray = new Array(queryCount);
    // Fill the results array with an initial value of zero.
    resultsArray.fill(0);

    // Iterate through each query specification.
    for (let outerIndex = 0; outerIndex < querySpecs.length; outerIndex++) {
        // Perform calculations based on the current query's parameters.
        // The third element of the query spec determines the number of inner iterations.
        for (let innerCounter = 0; innerCounter < querySpecs[outerIndex][2]; innerCounter++) {
            // For the very first iteration (innerCounter = 0),
            // the result is the first parameter modulo a large prime.
            if (innerCounter === 0) {
                resultsArray[outerIndex] = querySpecs[outerIndex][0] % 1000003;
            } else {
                // For subsequent iterations, update the result using a specific formula.
                // The formula involves the previous result, the first parameter,
                // the inner counter, and the second parameter, all modulo the prime.
                resultsArray[outerIndex] = (resultsArray[outerIndex] * (querySpecs[outerIndex][0] + innerCounter * querySpecs[outerIndex][1])) % 1000003;
            }
        }
        // Output the final computed result for the current query.
        console.log(resultsArray[outerIndex]);
    }
}

// The following line handles standard input/output and should not be modified.
// It reads the entire content from standard input and passes it to the ProcessInput function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
