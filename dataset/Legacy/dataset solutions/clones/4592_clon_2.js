function ProcessInput(rawData) {
    // The input string is split by spaces and each part is converted to a numeric value.
    let numArray = rawData.split(" ").map(Number);

    // A variable to count iterations, initialized to zero.
    let counter = 0;

    // This loop continues as long as all three numbers in the array are even
    // and the iteration counter has not reached a specific limit (1000).
    for (counter = 0; numArray[0] % 2 === 0 && numArray[1] % 2 === 0 && numArray[2] % 2 === 0 && counter !== 1000; counter++) {
        // The original code had a commented-out debug line here, e.g., console.log(numArray);

        // Store the current values of the array elements before they are modified.
        // This ensures that all new values are calculated based on the same set of old values.
        const tempValues = [numArray[0], numArray[1], numArray[2]];

        // Update the first element of the array.
        numArray[0] = tempValues[1] / 2 + tempValues[2] / 2;
        // Update the second element of the array.
        numArray[1] = tempValues[0] / 2 + tempValues[2] / 2;
        // Update the third element of the array.
        numArray[2] = tempValues[1] / 2 + tempValues[2] / 2;
    }

    // If the loop terminated because the counter reached 1000,
    // the counter's value is reset to -1 as per problem specification.
    if (counter === 1000) {
        counter = -1;
    }

    // The final value of the counter is printed to the console.
    console.log(counter);
}

// The program reads input from standard input,
// removes any leading or trailing whitespace, and then passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
