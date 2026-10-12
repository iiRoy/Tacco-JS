// This function processes the provided text data.
function ProcessInput(rawData) {
    // The rawData variable contains the entire input string.
    // We'll split it into two parts based on character count.

    let initialSegment = rawData.slice(0, 4); // Extract the first four characters.
    let trailingSegment = rawData.slice(4);   // Get the rest of the string from the fifth character onwards.

    // Display the combined segments to standard output.
    console.log(initialSegment + ' ' + trailingSegment);
}

// This line handles reading input from standard input and passing it to the processing function.
// It should not be modified to ensure proper execution environment interaction.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
