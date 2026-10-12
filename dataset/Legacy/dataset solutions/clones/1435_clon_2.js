function ProcessInput (rawData) {
    // Initialize an array to hold processed tokens from the input string.
    // The input is trimmed and split by whitespace or newlines.
    var tokenList = rawData.trim().split(/\s|\n/);

    // Begin an infinite loop to process string shuffling operations.
    while (true) {
        // Extract the next string to be shuffled from the beginning of the token list.
        var currentString = tokenList.shift();

        // If the extracted string is a hyphen, it signifies the end of input, so break the loop.
        if (currentString === "-") {
            break;
        }

        // Get the number of shuffle operations for the current string.
        // This value is also taken from the token list.
        var numShuffles = tokenList.shift();

        // Iterate 'numShuffles' times to perform the shuffling.
        for (var shuffleIndex = 0; shuffleIndex < parseInt(numShuffles, 10); shuffleIndex++) {
            // Get the cut point 'h' for the current shuffle operation.
            var cutPoint = tokenList.shift();
            // Convert the cut point to an integer.
            cutPoint = parseInt(cutPoint, 10);

            // Perform the string shuffle:
            // Take the substring from 'cutPoint' to the end,
            // and concatenate it with the substring from the beginning up to 'cutPoint'.
            currentString = currentString.substr(cutPoint) + currentString.slice(0, cutPoint);
        }

        // Output the final shuffled string to the console.
        console.log(currentString);
    }
}

// Read the input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
