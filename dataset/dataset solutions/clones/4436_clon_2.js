function ProcessInputData(incomingData) {
    // Determine the total character count of the provided string.
    let totalLength = incomingData.length;

    // Extract the very first character from the input.
    let initialCharacter = incomingData.substring(0, 1);

    // Obtain the last character of the input string.
    let finalCharacter = incomingData.substring(incomingData.length - 1, 1);

    // Concatenate the first character, the total length, and the last character.
    let combinedOutput = initialCharacter + totalLength + finalCharacter;

    // Print the generated string to the console, followed by a newline.
    console.log('%s\n', combinedOutput);
}

// Read the entire content from standard input as a UTF-8 string,
// then pass it to our primary processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
