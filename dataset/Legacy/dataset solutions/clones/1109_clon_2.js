function ProcessInput(rawData) {
    // Split the entire input string by newline characters to get individual lines.
    rawData = rawData.split('\n');

    // Parse the first line to determine the total number of elements.
    let elementCount = parseInt(rawData[0], 10);

    // Split the second line by spaces to obtain the individual numeric strings.
    rawData[1] = rawData[1].split(' ');

    // Initialize an array to store the heap elements.
    // We use `elementCount + 1` to allow for 1-based indexing, common in heap representations.
    const heapElements = new Array(elementCount + 1);

    // Populate the heapElements array from the parsed input numbers.
    // The input is 0-indexed, but we store it 1-indexed in `heapElements`.
    for (let idx = 0; idx < elementCount; idx++) {
        heapElements[idx + 1] = parseInt(rawData[1][idx], 10);
    }

    // Iterate through each element of the heap (from index 1 to elementCount)
    // to print its properties (key, parent, left child, right child).
    for (let currentIdx = 1; currentIdx <= elementCount; currentIdx++) {
        // Start constructing the output string for the current node.
        let outputLine = "node " + currentIdx + ": key = " + heapElements[currentIdx] + ", ";

        // Check if the current node has a parent (i.e., its index is greater than 1).
        if (currentIdx > 1) {
            // Calculate the parent's index (floor(currentIdx / 2)) and append its key.
            outputLine += "parent key = " + heapElements[Math.floor(currentIdx / 2)] + ", ";
        }

        // Check if the current node has a left child (i.e., its index * 2 is within bounds).
        if (currentIdx * 2 <= elementCount) {
            // Calculate the left child's index (currentIdx * 2) and append its key.
            outputLine += "left key = " + heapElements[currentIdx * 2] + ", ";
        }

        // Check if the current node has a right child (i.e., its index * 2 + 1 is within bounds).
        if (currentIdx * 2 + 1 <= elementCount) {
            // Calculate the right child's index (currentIdx * 2 + 1) and append its key.
            outputLine += "right key = " + heapElements[currentIdx * 2 + 1] + ", ";
        }

        // Print the complete output line for the current node.
        console.log(outputLine);
    }
}

// Read the entire input from standard input (stdin) as a UTF-8 string,
// then pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
