function ProcessInput(inputString) {
    // Determine the length of the provided string.
    const strLength = inputString.length;

    // Extract and parse the initial character as an integer.
    const firstDigitVal = parseInt(inputString.substring(0, 1));

    // Get the very last character of the string.
    const lastChar = inputString.slice(-1);

    // This variable will hold our computed outcome.
    let finalResult;

    // Check if the input string consists of a single character.
    if (strLength === 1) {
        finalResult = parseInt(inputString);
    }
    // Otherwise, if the last character is '9'...
    else if (lastChar.match(/9/g)) {
        // And if the count of '9's in the last character (which will be 1 if it's '9')
        // is equal to the string length minus one (implying strLength must be 2 for this to be true).
        if (lastChar.match(/9/g).length === strLength - 1) {
            finalResult = (strLength - 1) * 9 + firstDigitVal;
        }
    }
    // For all other cases not covered above.
    else {
        finalResult = (strLength - 1) * 9 + firstDigitVal - 1;
    }

    // Display the calculated value to the console.
    console.log(finalResult);
}

// Read input from standard input and pass it to our processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
