function ProcessInput(rawData) {
    // The input string is split into an array of substrings using space as a delimiter.
    let parsedData = rawData.split(" ");

    // Initialize boolean flags to track the presence of specific numeric strings.
    let hasOne = false;
    let hasSeven = false;
    let hasNine = false;
    let hasFour = false;

    // Iterate through the first four elements of the parsed data array.
    // The loop variable 'idx' is declared with 'let' for block-scoping.
    for (let idx = 0; idx < 4; idx++) {
        // Check if the current element is exactly the string "1" using strict equality.
        if (parsedData[idx] === "1") {
            hasOne = true;
        }
        // Check if the current element is the string "7" using loose equality.
        if (parsedData[idx] == "7") {
            hasSeven = true;
        }
        // Check if the current element is the string "4" using loose equality.
        if (parsedData[idx] == "4") {
            hasFour = true;
        }
        // Check if the current element is the string "9" using loose equality.
        if (parsedData[idx] == "9") {
            hasNine = true;
        }
    }

    // After checking all relevant elements, evaluate if all four specific strings were found.
    if (hasOne && hasSeven && hasNine && hasFour) {
        // If all conditions are met, print the string 'YES' to the standard output.
        console.log('YES');
    }
    // No action is taken if the condition is not met, preserving the original behavior.
}

// Read the entire content of the standard input file synchronously as a UTF-8 string.
// Then, pass this raw string content to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
