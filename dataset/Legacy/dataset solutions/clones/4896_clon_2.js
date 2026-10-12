function ProcessInput(rawData) {
    // Split the raw input string into individual lines.
    rawData = rawData.split("\n");

    // Extract the second line, which contains space-separated numerical values.
    let tempValues = rawData[1].split(" ");

    // Parse the first number from the first line to determine the primary count.
    const countVal = parseInt(rawData[0], 10);

    // Initialize an array whose size is derived from the countVal (2*N - 1).
    let initialArr = new Array(2 * countVal - 1);

    // Populate the initial array by converting the string values to integers.
    for (let idx = 0; idx < initialArr.length; idx++) {
        initialArr[idx] = parseInt(tempValues[idx], 10);
    }

    /**
     * Generates the subsequent array level by processing triplets from the current level.
     * Each triplet is sorted, and its middle element is selected.
     * @param {Array<number>} currentLevelArrParam - The array representing the current processing level.
     * @returns {Array<number>} A new array representing the next computed level.
     */
    function computeNextLevel(currentLevelArrParam) {
        // The new array will have two fewer elements than the input array.
        let nextLevelArr = new Array(currentLevelArrParam.length - 2);

        // Iterate through the current array to form overlapping groups of three elements.
        for (let k = 0; k < nextLevelArr.length; k++) {
            // Extract a sub-array containing three consecutive elements.
            const subArr = currentLevelArrParam.slice(k, k + 3);

            // Sort the sub-array in ascending order and assign its middle element (index 1)
            // to the corresponding position in the next level array.
            nextLevelArr[k] = subArr.sort(
                function (valA, valB) {
                    // Custom comparison logic for numerical sorting.
                    return (valA < valB ? -1 : 1);
                }
            )[1]; // Retrieve the median value from the sorted triplet.
        }
        return nextLevelArr;
    }

    // Begin the iterative process with the initially populated array.
    let currentLevelArr = initialArr;

    // Continue reducing the array level until only a single element remains.
    while (currentLevelArr.length > 1) {
        currentLevelArr = computeNextLevel(currentLevelArr);
    }

    // Output the final, single remaining element to the console.
    console.log(currentLevelArr[0]);
}

// Read the entire content from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
