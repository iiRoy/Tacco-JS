function ProcessInput(rawData) {
    // This section prepares the raw input string for numerical processing.
    // It first removes leading/trailing whitespace, then splits the string
    // into an array of lines, and finally converts each line into an integer.
    let parsedNumbers = rawData.trim().split('\n').map(currentVal => parseInt(currentVal, 10));

    // We calculate a specific remainder using the first number from the input.
    // This remainder is obtained by taking the first parsed number modulo 500.
    const remainderValue = parsedNumbers[0] % 500;

    // A conditional check is performed to compare the calculated remainder
    // with the second number provided in the input.
    if (remainderValue <= parsedNumbers[1]) {
        // If the remainder is less than or equal to the second number,
        // the program outputs a positive confirmation.
        console.log('Yes');
    } else {
        // Otherwise, if the condition is not met,
        // the program outputs a negative confirmation.
        console.log('No');
    }
}

// The main execution flow starts here.
// It reads the entire content of the standard input as a UTF-8 string,
// and then passes this string to our primary processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
