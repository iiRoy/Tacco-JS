function ProcessInput(inputString) {
    // This function takes a multi-line string as input and processes it
    // to determine a specific count based on a sequential pattern.

    // Extract the first number from the input string, which represents
    // the total number of elements to consider. The '- 0x0' ensures
    // a numeric conversion.
    let countElements = inputString.split("\n")[0] - 0x0;

    // Extract the second line, split it by spaces, and convert each
    // resulting substring into a number. This forms the array of data.
    const dataArray = inputString.split("\n")[1].split(" ").map(val => val - +0);

    // Initialize a variable to track the expected sequential value,
    // starting from one.
    let expectedValue = 1.0;
    // Initialize a counter for elements that do not match the expected sequence.
    let mismatchedCount = 0;

    // Iterate through the data array from the first element up to
    // the total number of elements specified by 'countElements'.
    for (let idx = 0; idx < countElements; idx++) {
        // Compare the current array element with the 'expectedValue'.
        if (expectedValue !== dataArray[idx]) {
            // If they are not equal, increment the 'mismatchedCount'.
            mismatchedCount++;
        } else {
            // If they are equal, increment 'expectedValue' for the
            // next iteration, as the sequence continues.
            expectedValue++;
        }
    }

    // Apply a special condition: if all elements were mismatches
    // AND the 'expectedValue' never advanced beyond its initial state (1),
    // then set 'mismatchedCount' to negative one.
    if (mismatchedCount === countElements && expectedValue === 0b1) {
        mismatchedCount = -1;
    }

    // Output the final calculated 'mismatchedCount' to the console.
    console.log(mismatchedCount);

    // The function completes its execution.
    return;
}

// Read the entire content of standard input synchronously,
// interpreting it as UTF-8 text, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
