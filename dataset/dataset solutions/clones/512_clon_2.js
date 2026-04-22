/* This script initializes standard input handling for a Node.js application. */
process.stdin.resume(); // Ensures the standard input stream stays open.

process.stdin.setEncoding('utf8'); // Sets the character encoding for input data.

// An event listener is attached to the standard input stream to process incoming 'data'.
process.stdin.on('data', function (rawInputData) {
    let idxB; // A general-purpose index variable, often used for inner loops.
    // The raw input string is trimmed of leading/trailing whitespace and then split into an array of individual lines.
    let inputRows = rawInputData.trim().split("\n");

    // This loop iterates through each line (or pair of lines, depending on processing) from the input.
    for (let rowIndex = 0; rowIndex < inputRows.length; ++rowIndex) {
        let countValue;     // This variable will hold a numeric count, parsed from an input line.
        let limitIndex;     // Represents an upper bound or size limit for data structures.
        let stringElements; // An array storing individual string components parsed from an input line.
        let differenceArray; // An array specifically designed to store calculated numerical differences.

        // Parses the current line as an integer for 'countValue' and then increments 'rowIndex' to move to the next line.
        countValue = parseInt(inputRows[rowIndex++]);

        // If the parsed 'countValue' is zero, it signifies the end of input or a termination condition.
        if (countValue === 0) {
            break; // Exits the main loop.
        }

        limitIndex = countValue + 1; // Establishes the exclusive upper bound for array indexing based on 'countValue'.

        // Initializes a new array with a predefined size, determined by 'limitIndex'.
        differenceArray = new Array(limitIndex);

        // Takes the next available input line, trims it, and splits it into an array of string-based elements.
        stringElements = inputRows[rowIndex].trim().split(" ");

        // Populates the 'differenceArray' by calculating the difference between consecutive elements from 'stringElements'.
        for (idxB = 1; idxB < limitIndex; ++idxB) {
            differenceArray[idxB] = parseInt(stringElements[idxB]) - parseInt(stringElements[idxB - 1]);
        }

        // --- Extensive Conditional Logic for Pattern Matching and Output ---

        // Checks if the first four calculated differences (from index 1 to 4) are all equal.
        if (differenceArray[1] === differenceArray[2] && differenceArray[2] === differenceArray[3] && differenceArray[3] === differenceArray[4]) {
            // If the initial pattern holds, this loop verifies if the same difference continues for subsequent elements.
            for (idxB = 5; idxB < limitIndex; ++idxB) {
                if (differenceArray[idxB] !== differenceArray[1]) {
                    break; // Breaks if a discrepancy is found.
                }
            }
            console.log(stringElements[idxB]); // Outputs the element at the point where the pattern broke or the last element.
        }
        // Checks if differences at indices 2, 3, and 4 are identical.
        else if (differenceArray[2] === differenceArray[3] && differenceArray[3] === differenceArray[4]) {
            console.log(stringElements[0]); // If this pattern matches, the first string element is logged.
        }
        // Checks if differences at indices 1, 2, and 3 are identical.
        else if (differenceArray[1] === differenceArray[2] && differenceArray[2] === differenceArray[3]) {
            console.log(stringElements[4]); // If this pattern matches, the fifth string element is logged.
        }
        // Evaluates a more complex condition involving a difference of string elements and two difference array elements.
        else if (parseInt(stringElements[2]) - parseInt(stringElements[0]) === differenceArray[3] && differenceArray[3] === differenceArray[4]) {
            console.log(stringElements[1]); // If this specific pattern holds, the second string element is logged.
        }
        // Another complex condition comparing difference array elements with a calculated difference from string elements.
        else if (differenceArray[1] === differenceArray[2] && differenceArray[2] === parseInt(stringElements[4]) - parseInt(stringElements[2])) {
            console.log(stringElements[3]); // If this pattern is met, the fourth string element is logged.
        }
        // A final complex condition, checking a difference from string elements against two difference array elements.
        else if (differenceArray[1] === parseInt(stringElements[3]) - parseInt(stringElements[1]) && differenceArray[1] === differenceArray[4]) {
            console.log(stringElements[2]); // If this last pattern holds, the third string element is logged.
        }
    } // End of the main loop iterating through input rows.
}); // End of the 'data' event handler function.