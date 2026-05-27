process.stdin.resume();

process.stdin.setEncoding('utf8');

let rawInputData = ''; // Accumulates all input chunks

process.stdin.on('data', function (dataSegment) {
    // Appends each received data segment to the main input string
    rawInputData += dataSegment;
});

process.stdin.on('end', function () {
    // Once all input is received, process it
    const inputLines = rawInputData.split("\n"); // Divides the input into an array of lines

    const countElements = parseInt(inputLines[0]); // Parses the first line as the total number of elements

    const stringNumbers = inputLines[1].split(" "); // Splits the second line into an array of string representations of numbers

    const numericArray = []; // Initializes an empty array to hold integer values

    // Converts string numbers to integers and populates the numeric array
    for (let idx = 0; idx < countElements; idx++) {
        numericArray[idx] = parseInt(stringNumbers[idx]);
    }

    let totalOperations = 0; // Counter for the total number of operations performed

    let hasModifications = true; // Flag to control the main processing loop

    // Continues looping as long as modifications are made in an iteration
    while (hasModifications) {
        hasModifications = false; // Resets the flag at the beginning of each iteration

        // Iterates through each element of the numeric array
        for (let outerIdx = 0; outerIdx < countElements; outerIdx++) {
            // Checks if the current element is positive
            if (numericArray[outerIdx] > 0) {
                // Inner loop: processes elements after the current one
                // Continues as long as the inner index is valid and the current element is less than or equal to the inner element
                for (let innerIdx = outerIdx + 1; innerIdx < countElements && numericArray[outerIdx] <= numericArray[innerIdx]; innerIdx++) {
                    numericArray[innerIdx]--; // Decrements the value of the inner element
                }
                numericArray[outerIdx]--; // Decrements the value of the current element
                totalOperations++; // Increments the operations counter
                hasModifications = true; // Sets the flag to true, indicating a modification occurred
            }
        }
    }

    // Prints the final count of total operations to the console
    console.log(totalOperations);
});
