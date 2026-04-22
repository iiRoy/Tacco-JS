// Module for file system operations, used for reading standard input
const fileSystem = require("node:fs");

/**
 * Safely retrieves the raw text content from the standard input stream.
 * Includes basic error handling for file reading.
 * @returns {string} The raw content read from /dev/stdin.
 */
const obtainInputContent = () => {
    try {
        // Attempt to read the entire content of stdin as a UTF-8 string
        return fileSystem.readFileSync("/dev/stdin", { encoding: "utf8" });
    } catch (errorDetails) {
        // Log the error if reading fails, and provide a fallback or exit
        console.error("Critical error: Unable to read from standard input.", errorDetails.message);
        // In a production environment, you might exit here: process.exit(1);
        // For demonstration, a dummy input is provided.
        return "7\n10 20 10 30 10 40 10"; // Example dummy data for testing
    }
};

/**
 * Parses the raw string data into structured variables: total count and a numeric sequence.
 * Includes validation for input format.
 * @param {string} rawInputString The raw string content from input.
 * @returns {{count: number, sequence: number[]}} An object containing the total count and the parsed number sequence.
 */
const processRawData = (rawInputString) => {
    // Validate that the input string is not empty or malformed
    if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Input processing failed: Raw input data is empty or invalid.");
        return { count: 0, sequence: [] }; // Return empty data on failure
    }

    // Split the input string into individual lines
    const inputLines = rawInputString.trim().split('\n');

    // Extract the total number of elements from the first line
    const parsedElementCount = parseInt(inputLines[0]?.trim() || '0', 10);
    // Validate the parsed count
    if (isNaN(parsedElementCount) || parsedElementCount < 0) {
        console.error("Input processing failed: Invalid element count detected in the first line.");
        return { count: 0, sequence: [] };
    }

    // Extract and parse the sequence of numbers from the second line
    const numberSeries = inputLines[1]
        ? inputLines[1].trim().split(' ').map(str => parseInt(str, 10))
        : [];

    // Filter out any NaN values that might result from parsing non-numeric strings
    const validNumberSeries = numberSeries.filter(num => !isNaN(num));

    // Optional: Log a warning if the actual series length differs from the declared count
    if (validNumberSeries.length !== parsedElementCount) {
        console.warn(`Input warning: Declared count (${parsedElementCount}) mismatches actual parsed sequence length (${validNumberSeries.length}). Using actual length.`);
        // Depending on requirements, one might throw an error or adjust `parsedElementCount` here.
        // For this solution, we assume the actual length of the valid series is what matters for subsequent logic.
    }
    
    return { count: parsedElementCount, sequence: validNumberSeries };
};

/**
 * Analyzes a numeric array to count frequencies of elements based on their index parity.
 * Elements at even indices go into one frequency map, odd indices into another.
 * @param {number[]} numericArray The array of numbers to analyze.
 * @param {number} totalArrayLength The total number of elements to process.
 * @returns {{even: Map<number, number>, odd: Map<number, number>}} An object containing two Maps:
 *                                                                one for even-indexed frequencies, one for odd.
 */
const tallyFrequenciesByParity = (numericArray, totalArrayLength) => {
    // Initialize Map objects for storing frequencies. Maps are generally preferred for
    // arbitrary keys over plain objects when keys might not be strings or for better performance.
    const evenPositionFrequencyMap = new Map(); // Frequencies for indices 0, 2, 4...
    const oddPositionFrequencyMap = new Map();  // Frequencies for indices 1, 3, 5...

    // Iterate through the array using a standard for loop
    for (let currentArrayIndex = 0; currentArrayIndex < totalArrayLength; currentArrayIndex++) {
        const currentValue = numericArray[currentArrayIndex];

        // Basic validation for the current value
        if (typeof currentValue !== 'number' || isNaN(currentValue)) {
            console.warn(`Frequency analysis: Skipping invalid numeric value at index ${currentArrayIndex}.`);
            continue; // Skip to the next element if current value is not a valid number
        }

        // Determine parity of the current index and update the corresponding frequency map
        if (currentArrayIndex % 2 === 0) { // If index is even
            evenPositionFrequencyMap.set(currentValue, (evenPositionFrequencyMap.get(currentValue) || 0) + 1);
        } else { // If index is odd
            oddPositionFrequencyMap.set(currentValue, (oddPositionFrequencyMap.get(currentValue) || 0) + 1);
        }
    }
    return { even: evenPositionFrequencyMap, odd: oddPositionFrequencyMap };
};

/**
 * Converts a frequency Map into a sorted array of [value, count] pairs.
 * The array is sorted in descending order based on the count.
 * @param {Map<number, number>} frequencyMap The Map containing element frequencies.
 * @returns {[number, number][]} A sorted array where each inner array is [elementValue, frequencyCount].
 */
const sortFrequenciesDescending = (frequencyMap) => {
    // Convert the Map's entries (key-value pairs) into an array of arrays
    const sortedFrequencyList = Array.from(frequencyMap.entries());

    // Sort the list. The sorting criterion is the frequency (second element of the pair)
    // in descending order (highest frequency first).
    sortedFrequencyList.sort((pairOne, pairTwo) => pairTwo[1] - pairOne[1]);

    return sortedFrequencyList;
};

/**
 * Calculates the maximum possible sum of counts from two sorted frequency lists,
 * ensuring the selected values from each list are distinct.
 * This is the core logic to find the maximum number of elements that can remain unchanged.
 * @param {[number, number][]} firstSortedList A list of [value, count] pairs, sorted by count descending.
 * @param {[number, number][]} secondSortedList A list of [value, count] pairs, sorted by count descending.
 * @returns {number} The maximum sum of counts adhering to the distinct value constraint.
 */
const calculateMaxDistinctPairSum = (firstSortedList, secondSortedList) => {
    // Handle edge cases where one or both lists might be empty
    if (firstSortedList.length === 0 && secondSortedList.length === 0) {
        return 0; // No elements in either list, sum is 0
    }
    // If only one list has elements, the maximum sum is simply the count of its most frequent element
    if (firstSortedList.length === 0) {
        return secondSortedList[0][1];
    }
    if (secondSortedList.length === 0) {
        return firstSortedList[0][1];
    }

    // Retrieve the most frequent element and its count from each list
    const mostFrequentInFirst = firstSortedList[0];  // [value, count]
    const mostFrequentInSecond = secondSortedList[0]; // [value, count]

    let currentBestSum = 0; // Variable to store the highest sum found

    // Condition: The most frequent values from both lists are different
    if (mostFrequentInFirst[0] !== mostFrequentInSecond[0]) {
        // If they are different, we can simply sum their counts
        currentBestSum = mostFrequentInFirst[1] + mostFrequentInSecond[1];
    } else {
        // Condition: The most frequent values from both lists are the same.
        // We must choose a different value from at least one of the lists.
        // This means considering the second most frequent element from one list.

        let sumOptionA = 0; // Option: (Top from first) + (Second Top from second)
        let sumOptionB = 0; // Option: (Second Top from first) + (Top from second)

        // Calculate sum for Option A: Use the top element from the first list
        // and the second top element from the second list (if available, otherwise 0)
        const secondTopCountSecondList = (secondSortedList.length > 1) ? secondSortedList[1][1] : 0;
        sumOptionA = mostFrequentInFirst[1] + secondTopCountSecondList;

        // Calculate sum for Option B: Use the second top element from the first list
        // (if available, otherwise 0) and the top element from the second list
        const secondTopCountFirstList = (firstSortedList.length > 1) ? firstSortedList[1][1] : 0;
        sumOptionB = secondTopCountFirstList + mostFrequentInSecond[1];

        // The maximum sum when top elements are identical is the greater of these two options
        currentBestSum = Math.max(sumOptionA, sumOptionB);
    }
    return currentBestSum;
};

// Main execution wrapper (Immediately Invoked Function Expression - IIFE)
(() => {
    // Step 1: Obtain the raw input string from the system's standard input.
    const rawDataContent = obtainInputContent();

    // Step 2: Parse the raw string into a usable structure (total count and sequence of numbers).
    const { count: totalElementCount, sequence: valueSeries } = processRawData(rawDataContent);

    // Guard clause: If no elements were successfully parsed, output 0 changes as no operation is needed.
    if (totalElementCount === 0 || valueSeries.length === 0) {
        console.log(0);
        return; // Exit the execution flow
    }

    // Step 3: Analyze the frequencies of numbers at even and odd positions within the sequence.
    const { even: evenFrequenciesMap, odd: oddFrequenciesMap } = tallyFrequenciesByParity(valueSeries, totalElementCount);

    // Step 4: Convert the frequency maps into sorted lists (descending by frequency).
    const sortedEvenPositionFrequencies = sortFrequenciesDescending(evenFrequenciesMap);
    const sortedOddPositionFrequencies = sortFrequenciesDescending(oddFrequenciesMap);

    // Step 5: Calculate the maximum count of elements that can be kept, given the distinct value constraint.
    const maximumRetainableElements = calculateMaxDistinctPairSum(sortedEvenPositionFrequencies, sortedOddPositionFrequencies);

    // Step 6: The final result is the total number of elements minus the maximum number of retainable elements.
    // This represents the minimum number of changes required to satisfy the problem's conditions.
    const minimumRequiredChanges = totalElementCount - maximumRetainableElements;

    // Output the final computed result.
    console.log(minimumRequiredChanges);
})();