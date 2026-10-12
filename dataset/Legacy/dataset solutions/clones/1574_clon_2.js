function ProcessInput(inputString) {
    // Split the incoming raw data by newline characters.
    // The problem's context suggests the primary data is on the first line.
    let lineSegments = inputString.split("\n");

    // Extract the first line and then break it into an array of individual characters.
    let characterDigits = lineSegments[0].split("");

    // Obtain the total count of elements in the character array.
    let dataLength = characterDigits.length;

    // Iterate through the array of character digits.
    // Convert each character representation of a digit into its actual integer value.
    for (let index = 0; index < dataLength; index++) {
        characterDigits[index] = parseInt(characterDigits[index], 10);
    }

    // Initialize a variable to store the cumulative sum of the digits.
    let totalSumValue = 0;

    // Re-evaluate the length of the digit array. This step maintains structural similarity
    // to the original code's variable re-declaration.
    let currentDataLength = characterDigits.length;

    // Loop through the array containing the integer digits.
    // Add each digit's value to the running total.
    for (let index = 0; index < currentDataLength; index++) {
        totalSumValue += characterDigits[index];
    }

    // Determine the final outcome string based on a divisibility rule.
    let finalVerdict;
    if (totalSumValue % 9 === 0) {
        // If the sum of digits is perfectly divisible by nine, the result is "Yes".
        finalVerdict = "Yes";
    } else {
        // Otherwise, if not divisible by nine, the result is "No".
        finalVerdict = "No";
    }

    // Output the determined verdict to the console.
    console.log(finalVerdict);
}

// The script initiates by reading input from the standard input stream.
// The input is read synchronously and interpreted as a UTF-8 encoded string.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
