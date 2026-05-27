process.stdin.resume();
process.stdin.setEncoding('utf8');

// This event listener processes incoming data from standard input.
process.stdin.on('data', function(receivedData) {
    let idx; // Loop counter for array processing
    // Clean up the input string and split it into individual lines.
    const inputLines = receivedData.trim().split("\n");

    // Iterate through each line of the provided input.
    for (let lineIndex = 0; lineIndex < inputLines.length; ++lineIndex) {
        let countVal; // Stores the number of elements in the sequence
        let finalIndex; // Upper bound for array indexing
        let dataCollection; // Array holding the sequence elements as strings
        let diffArray; // Array to store differences between consecutive elements

        // Parse the first number on the current line, which indicates the size of the sequence.
        countVal = parseInt(inputLines[lineIndex++]);

        // If the count value is zero, it signifies the end of input processing.
        if (countVal === 0) {
            break;
        }

        // Determine the final index for array allocation (n + 1 for 1-based indexing).
        finalIndex = countVal + 1;
        // Initialize an array to store the calculated differences.
        diffArray = new Array(finalIndex);

        // Split the next line (which contains the sequence) into an array of string numbers.
        dataCollection = inputLines[lineIndex].trim().split(" ");

        // Calculate the differences between adjacent elements and store them in diffArray.
        // The loop starts from 1 because diffArray[0] is unused, and we compare dataset[ii] with dataset[ii-1].
        for (idx = 1; idx < finalIndex; ++idx) {
            diffArray[idx] = parseInt(dataCollection[idx]) - parseInt(dataCollection[idx - 1]);
        }

        // Check for various patterns in the differences to identify the missing number.

        // Case 1: The first four differences are identical.
        if (diffArray[1] === diffArray[2] && diffArray[2] === diffArray[3] && diffArray[3] === diffArray[4]) {
            // Verify if this pattern holds for all subsequent differences.
            for (idx = 5; idx < finalIndex; ++idx) {
                if (diffArray[idx] !== diffArray[1]) {
                    break; // Found a mismatch, so the missing number is at this position.
                }
            }
            // Output the element at the identified position.
            console.log(dataCollection[idx]);
        }
        // Case 2: The second, third, and fourth differences are identical.
        else if (diffArray[2] === diffArray[3] && diffArray[3] === diffArray[4]) {
            // The missing number is likely the first one.
            console.log(dataCollection[0]);
        }
        // Case 3: The first, second, and third differences are identical.
        else if (diffArray[1] === diffArray[2] && diffArray[2] === diffArray[3]) {
            // The missing number is likely the fifth one (index 4).
            console.log(dataCollection[4]);
        }
        // Case 4: The difference between dataset[2] and dataset[0] matches the third and fourth differences.
        else if (parseInt(dataCollection[2]) - parseInt(dataCollection[0]) === diffArray[3] && diffArray[3] === diffArray[4]) {
            // The missing number is likely the second one (index 1).
            console.log(dataCollection[1]);
        }
        // Case 5: The first and second differences are identical, and they match the difference between dataset[4] and dataset[2].
        else if (diffArray[1] === diffArray[2] && diffArray[2] === parseInt(dataCollection[4]) - parseInt(dataCollection[2])) {
            // The missing number is likely the fourth one (index 3).
            console.log(dataCollection[3]);
        }
        // Case 6: The first difference matches the difference between dataset[3] and dataset[1], and also matches the fourth difference.
        else if (diffArray[1] === parseInt(dataCollection[3]) - parseInt(dataCollection[1]) && diffArray[1] === diffArray[4]) {
            // The missing number is likely the third one (index 2).
            console.log(dataCollection[2]);
        }
    }
});
