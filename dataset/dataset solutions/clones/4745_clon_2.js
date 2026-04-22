// This function processes incoming data to identify unique items and apply a specific counting rule.
function processInput(rawData) {
    // The first line of the raw data is extracted, although its value isn't utilized in subsequent steps.
    var firstLineVal = rawData.split("\n")[0];

    // The second line of the raw data is split by spaces to form an array of individual tokens.
    var tokenArray = rawData.split("\n")[1].split(" ");

    // An empty array is initialized to keep track of all distinct elements encountered.
    var uniqueElements = [];
    // A counter is initialized to tally the number of unique elements.
    var distinctCount = 0;

    // A loop iterates through each token present in the tokenArray.
    for (var idx = 0; idx < tokenArray.length; idx++) {
        // It checks if the current token has not yet been added to the uniqueElements collection.
        if (uniqueElements.indexOf(tokenArray[idx]) === -1) {
            // If the token is found to be new, it's added to uniqueElements.
            uniqueElements.push(tokenArray[idx]);
            // The distinct element counter is then incremented.
            distinctCount++;
        }
    }

    // After processing all tokens, a conditional check is performed on the final distinct count.
    if (distinctCount % 2 === 1) {
        // If the total number of distinct elements is odd, that count is printed to the console.
        console.log(distinctCount);
    } else {
        // Otherwise, if the count is even, the count minus one is printed.
        console.log(distinctCount - 1);
    }
}

// The main processing function is invoked with data read from standard input.
// This involves reading the file system, specifically from "/dev/stdin", and decoding it as UTF-8.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));