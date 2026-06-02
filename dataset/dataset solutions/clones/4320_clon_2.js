function ProcessInput(rawData) {
    // Remove leading/trailing whitespace from the input string
    rawData = rawData.trim();

    // Initialize a counter for occurrences of '1'
    let countOnes = 0;

    // Iterate through each character of the processed input string
    for (let idx = 0; idx < rawData.length; idx++) {
        // Check if the current character is '1'
        if (rawData.slice(idx, idx + 1) === "1") {
            // Increment the counter if '1' is found
            countOnes++;
        }
    }

    // Output the final count to the console
    console.log(countOnes);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
