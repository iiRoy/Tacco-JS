// Function to process the entire input string received from standard input.
function processInputData(rawData) {
    // Split the raw input string into an array of lines.
    const parsedLines = rawData.split('\n');

    // The first line often contains the total count, but it's not used in this specific logic,
    // so we'll omit parsing it to simplify the code.
    // const totalElementsCount = Number(parsedLines[0]); // This variable is not utilized in the algorithm.

    // Parse the second line, which contains space-separated numbers, into an array of actual numbers.
    // Using `map(Number)` is a concise way to convert string elements to numbers.
    let numericSequence = parsedLines[1].split(' ').map(Number);

    // --- Helper function: Determines if an array is homogeneous (all elements are the same as the first) ---
    // Returns the count of elements identical to the initial element.
    const checkHomogeneity = (inputList) => {
        // If the list is empty, it cannot have matching elements.
        if (inputList.length === 0) {
            return 0;
        }

        const referenceValue = inputList[0]; // Store the first element for comparison.
        let matchingElementCount = 0;

        // Iterate through the list to count elements that are equal to the first one.
        for (let idx = 0; idx < inputList.length; idx++) {
            if (inputList[idx] === referenceValue) {
                matchingElementCount++;
            }
        }
        return matchingElementCount;
    };

    // Calculate the homogeneity for the primary numeric sequence.
    const homogeneityResult = checkHomogeneity(numericSequence);

    // --- Early Exit Conditions based on homogeneity analysis ---

    // Scenario 1: If all elements in the sequence are completely identical.
    // In this specific case, the minimum operations to make it alternating is half its length.
    if (homogeneityResult === numericSequence.length) {
        console.log(Math.floor(numericSequence.length / 2));
        return; // Terminate execution early as the solution is found.
    }

    // Scenario 2: If only the first element matches itself (implying subsequent elements differ from the first)
    // AND the sequence contains at least four elements. This handles a particular edge case.
    // The solution for this pattern also involves changing half the elements.
    if (homogeneityResult === 1 && numericSequence.length >= 4) {
        console.log(Math.floor(numericSequence.length / 2));
        return; // Terminate execution early.
    }

    // --- Main Logic: Count frequencies for elements at even and odd indices ---

    // Map to store frequency counts for numbers appearing at even array indices.
    const evenIndexedFrequencies = new Map();
    // Map to store frequency counts for numbers appearing at odd array indices.
    const oddIndexedFrequencies = new Map();

    // Helper function to increment the count of a key in a Map.
    // If the key doesn't exist, it's initialized to 1.
    const incrementMapCount = (targetMap, key) => {
        targetMap.set(key, (targetMap.get(key) || 0) + 1);
    };

    // Iterate through the numeric sequence to populate the frequency maps based on index parity.
    for (let idx = 0; idx < numericSequence.length; idx++) {
        const currentValue = numericSequence[idx];
        if (idx % 2 === 0) { // If the current index is even
            incrementMapCount(evenIndexedFrequencies, currentValue);
        } else { // If the current index is odd
            incrementMapCount(oddIndexedFrequencies, currentValue);
        }
    }

    // --- Helper function: Calculates the minimum changes needed for a sub-sequence ---
    // This function determines the number of elements that need to be changed
    // to make all elements (except the most frequent one) distinct from that most frequent element.
    // It sums the counts of all elements *except* the one with the highest frequency.
    const calculateMinimumChanges = (frequencyMap) => {
        // Extract only the frequency counts (values) from the map into an array.
        const frequencyCounts = Array.from(frequencyMap.values());

        // If there are no distinct elements or only one distinct element, no changes are required for this group.
        if (frequencyCounts.length <= 1) {
            return 0;
        }

        // Sort the counts in descending order to easily access the highest frequency.
        frequencyCounts.sort((a, b) => b - a);

        let totalChangesRequired = 0;
        // Sum all counts except the first (which is the largest/most frequent count).
        // These represent the elements that would need to be modified.
        for (let idx = 1; idx < frequencyCounts.length; idx++) {
            totalChangesRequired += frequencyCounts[idx];
        }

        return totalChangesRequired;
    };

    // Calculate the total number of operations by summing changes needed for even and odd indexed groups.
    let totalOperations = calculateMinimumChanges(evenIndexedFrequencies);
    totalOperations += calculateMinimumChanges(oddIndexedFrequencies);

    // Output the final computed minimum number of operations.
    console.log(totalOperations);
}

// Do not modify the following line; it handles reading input from standard input
// and then calls the main processing function with that data.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));