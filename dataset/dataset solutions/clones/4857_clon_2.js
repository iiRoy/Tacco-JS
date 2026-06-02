function ProcessInput(rawData) {
    // Split the raw input string into an array of lines using the newline character as a delimiter.
    let parsedLines = rawData.split("\n");

    // The first element of the parsed lines array represents the number of iterations.
    let numIterations = parsedLines[0];

    // The remaining elements of the parsed lines array form the initial working array.
    // We use slice(1) to exclude the first element (numIterations).
    let currentArray = parsedLines.slice(1);

    // This outer loop executes 'numIterations' times, transforming the array in each pass.
    for (let outerLoopIndex = 0; outerLoopIndex < numIterations; ++outerLoopIndex) {
        // Initialize a new array to store the results of the current transformation.
        let nextArray = [];

        // The inner loop iterates through the 'currentArray' in steps of two,
        // processing elements in pairs (j and j+1).
        // The loop continues as long as there's at least one pair left to process.
        for (let innerLoopIndex = 0; innerLoopIndex < currentArray.length - 1; innerLoopIndex += 2) {
            // Compare the two elements in the current pair.
            if (currentArray[innerLoopIndex] > currentArray[innerLoopIndex + 1]) {
                // If the first element is greater, push their difference (first - second) to the new array.
                nextArray.push(currentArray[innerLoopIndex] - currentArray[innerLoopIndex + 1]);
            } else if (currentArray[innerLoopIndex] == currentArray[innerLoopIndex + 1]) {
                // If the elements are equal, push the value of the first element (or second, as they are identical).
                nextArray.push(currentArray[innerLoopIndex]);
            } else {
                // If the second element is greater, push their difference (second - first) to the new array.
                nextArray.push(currentArray[innerLoopIndex + 1] - currentArray[innerLoopIndex]);
            }
        }
        // After completing an iteration of the outer loop, the 'nextArray' becomes the 'currentArray'
        // for the subsequent transformation.
        currentArray = nextArray;
    }

    // After all transformations are complete, print the first element of the final 'currentArray'.
    console.log(currentArray[0]);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
