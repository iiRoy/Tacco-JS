// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
    // The raw input string is first split into an array of lines.
    rawData = rawData.split("\n");

    // The first line is parsed to determine the number of elements, though this variable
    // 'countElements' is not directly utilized in the subsequent core algorithm.
    const countElements = parseInt(rawData[0]);

    // The second line contains space-separated integers, which are parsed into an array.
    // Each string element 'val' is converted to an integer.
    const initialValues = rawData[1].split(" ").map(val => parseInt(val));

    // 'currentArray' holds the array of numbers that will be iteratively modified.
    let currentArray = initialValues;

    // The main processing loop continues until a specific condition is met.
    while (true) {
        // 'minIndex' will store the index of the element chosen for merging in the current iteration.
        let minIndex = -1;
        // 'nextArray' is a temporary array to build the state for the subsequent iteration.
        const nextArray = [];

        // This loop iterates through the 'currentArray', excluding the very first and last elements.
        // Its purpose is to identify a candidate element for a merge operation.
        for (let idx = 1; idx < currentArray.length - 1; idx++) {
            // If 'minIndex' has not been set yet (is -1) or if the element at 'idx' is smaller
            // than the element currently pointed to by 'minIndex', then 'idx' becomes the new 'minIndex'.
            if (minIndex === -1 || currentArray[minIndex] > currentArray[idx]) {
                minIndex = idx;
            }
            // This condition checks if the current 'minIndex' (which is an index) is equal to the
            // value of the element at 'currentArray[idx]'. If this unusual comparison is true,
            // and the sum of neighbors of 'currentArray[idx]' is less than the sum of neighbors
            // of 'currentArray[minIndex]', then 'minIndex' is updated to 'idx'.
            // Note: This preserves the exact behavior of the original code, including potential quirks.
            if (minIndex === currentArray[idx] && currentArray[idx - 1] + currentArray[idx + 1] < currentArray[minIndex - 1] + currentArray[minIndex + 1]) {
                minIndex = idx;
            }
        }

        // Additional logic to adjust 'minIndex' based on comparisons involving the second element
        // and the second-to-last element of the 'currentArray'.
        if (currentArray[minIndex] * 2 > currentArray[1]) {
            // If the condition is met, 'minIndex' is set to the index of the second element.
            minIndex = 1;
            // A further check: if the element at this new 'minIndex' is greater than the
            // second-to-last element, 'minIndex' is then set to the index of the second-to-last element.
            if (currentArray[minIndex] > currentArray[currentArray.length - 2]) {
                minIndex = currentArray.length - 2;
            }
        }
        // If the previous condition was false, this checks if twice the value at 'minIndex'
        // is greater than the second-to-last element.
        else if (currentArray[minIndex] * 2 > currentArray[currentArray.length - 2]) {
            // If true, 'minIndex' is set to the index of the second-to-last element.
            minIndex = currentArray.length - 2;
        }

        // This loop constructs 'nextArray' by applying the merging logic around 'minIndex'.
        for (let idx = 0; idx < currentArray.length; idx++) {
            // If 'idx' is the element immediately preceding 'minIndex', it is merged with 'currentArray[minIndex]'.
            if (idx === minIndex - 1) {
                nextArray.push(currentArray[minIndex - 1] + currentArray[minIndex]);
            }
            // If 'idx' is 'minIndex' itself, this element is skipped as it's conceptually merged into its neighbors.
            else if (idx === minIndex) {
                // No action needed; this element is effectively removed.
            }
            // If 'idx' is the element immediately following 'minIndex', it is merged with 'currentArray[minIndex]'.
            else if (idx === minIndex + 1) {
                nextArray.push(currentArray[minIndex + 1] + currentArray[minIndex]);
            }
            // For all other elements, they are simply copied to 'nextArray' without modification.
            else {
                nextArray.push(currentArray[idx]);
            }
        }

        // The 'currentArray' is updated to 'nextArray' for the next iteration of the loop.
        currentArray = nextArray;

        // The loop terminates when the 'currentArray' has been reduced to exactly two elements.
        if (currentArray.length === 2) {
            break;
        }
    }

    // Finally, the sum of the two remaining elements in 'currentArray' is printed to the console.
    console.log(currentArray[0] + currentArray[1]);
}

// This line is responsible for reading input from standard input (e.g., from a file or pipe)
// and then invoking the 'ProcessInput' function with the obtained data.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
