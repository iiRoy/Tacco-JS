const acquireRawInput = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();

const printOutputMessage = (content) => {
    console.log(content);
};

const logDiagnosticInfo = (message) => {
    // This function is for internal diagnostics or error reporting
    // In a production environment, this might write to a log file or a specific error stream.
    console.error(message);
};

/**
 * Parses raw input strings into various data types.
 * @param {string} data - The raw string data to parse.
 * @param {string} type - The desired parsing type ('lines', 'integers', 'space_separated_numbers', 'characters_as_numbers').
 * @returns {*} The parsed data.
 */
function parseInputString(data, type) {
    switch (type) {
        case 'lines':
            return data.split('\n').map(s => s.trim()).filter(s => s.length > 0);
        case 'integers':
            // Ensure the base is explicitly 10 for safety
            return parseInt(data.trim(), 10);
        case 'space_separated_numbers':
            // Convert string parts to numbers, filtering out any non-numeric results
            return data.split(' ').map(Number).filter(val => !isNaN(val));
        case 'characters_as_numbers':
            // Convert individual characters to numbers, filtering out non-numeric
            return data.split('').map(Number).filter(val => !isNaN(val));
        default:
            // If no specific type is matched, return the data as-is
            return data;
    }
}

/**
 * Increments the count for a given key in a Map.
 * If the key doesn't exist, it initializes its count to 1.
 * @param {Map<any, number>} targetMap - The map to update.
 * @param {any} key - The key whose count needs to be incremented.
 */
function updateFrequency(targetMap, key) {
    targetMap.set(key, (targetMap.get(key) || 0) + 1);
}

/**
 * Retrieves the top two most frequent elements and their counts from a frequency map.
 * @param {Map<any, number>} frequencyMap - The map containing element frequencies.
 * @param {any} [defaultKey=null] - A default key to use if the map is empty or has fewer than two elements.
 * @returns {Array<Array<any, number>>} An array containing two [key, frequency] pairs.
 *                                        If fewer than two elements exist, the missing pairs will have frequency 0.
 */
function getTopTwoFrequent(frequencyMap, defaultKey = null) {
    // Convert map entries to an array and sort by frequency in descending order
    const sortedEntries = Array.from(frequencyMap.entries()).sort((a, b) => b[1] - a[1]);

    // Get the most frequent element and its count
    const topMostFrequent = sortedEntries.length > 0 ? sortedEntries[0] : [defaultKey, 0];
    // Get the second most frequent element and its count
    const secondMostFrequent = sortedEntries.length > 1 ? sortedEntries[1] : [defaultKey, 0];

    return [topMostFrequent, secondMostFrequent];
}

/**
 * Executes the primary logic to solve the problem.
 * It analyzes a sequence of numbers to determine the minimum modifications
 * required to make alternating elements distinct.
 * @param {string} rawStreamData - The raw string input from the data stream.
 */
function processDataStream(rawStreamData) {
    // Parse the incoming data stream into structured components
    const [firstInputLine, secondInputLine] = parseInputString(rawStreamData, 'lines');
    const totalElementCount = parseInputString(firstInputLine, 'integers');
    const numericSequence = parseInputString(secondInputLine, 'space_separated_numbers');

    // It's assumed for this problem that totalElementCount will always be even
    // as operations involve N/2 for two groups. An explicit check could be added:
    /*
    if (totalElementCount % 2 !== 0) {
        logDiagnosticInfo("Warning: Input element count is not even. Logic might need adjustment.");
        // Decide how to handle odd N if it were a valid scenario
        // For this problem, we proceed assuming it's even.
    }
    */

    // Initialize frequency maps for numbers at even and odd indices respectively
    const evenPositionValueCounts = new Map(); // For indices 0, 2, 4...
    const oddPositionValueCounts = new Map();  // For indices 1, 3, 5...

    // Iterate through the numeric sequence to populate the frequency maps
    for (let currentIdx = 0; currentIdx < totalElementCount; currentIdx++) {
        const valueAtCurrentIndex = numericSequence[currentIdx];
        if (currentIdx % 2 === 0) {
            updateFrequency(evenPositionValueCounts, valueAtCurrentIndex);
        } else {
            updateFrequency(oddPositionValueCounts, valueAtCurrentIndex);
        }
    }

    // Determine the target size for each half of the array (N/2)
    const targetHalfSize = totalElementCount / 2;

    // Retrieve the top two most frequent elements and their counts for both groups
    // Using a placeholder -1 for keys if a group is empty or has fewer than two unique elements
    const [[mostFreqEvenVal, mostFreqEvenCount], [secondMostFreqEvenVal, secondMostFreqEvenCount]] =
        getTopTwoFrequent(evenPositionValueCounts, -1);
    const [[mostFreqOddVal, mostFreqOddCount], [secondMostFreqOddVal, secondMostFreqOddCount]] =
        getTopTwoFrequent(oddPositionValueCounts, -1);

    // Output diagnostic information about the frequency analysis
    logDiagnosticInfo(`Even position frequencies: ${JSON.stringify(Object.fromEntries(evenPositionValueCounts))}`);
    logDiagnosticInfo(`Odd position frequencies: ${JSON.stringify(Object.fromEntries(oddPositionValueCounts))}`);
    logDiagnosticInfo(`Top even: ${mostFreqEvenVal} (${mostFreqEvenCount}), Second even: ${secondMostFreqEvenVal} (${secondMostFreqEvenCount})`);
    logDiagnosticInfo(`Top odd: ${mostFreqOddVal} (${mostFreqOddCount}), Second odd: ${secondMostFreqOddVal} (${secondMostFreqOddCount})`);

    let totalRequiredModifications = 0;

    // Logic to calculate the minimum number of replacements
    // Scenario 1: The most frequent values in even and odd positions are already different.
    // In this ideal case, we aim to make all even positions `mostFreqEvenVal` and all odd positions `mostFreqOddVal`.
    if (mostFreqEvenVal !== mostFreqOddVal) {
        totalRequiredModifications = (targetHalfSize - mostFreqEvenCount) + (targetHalfSize - mostFreqOddCount);
    } else {
        // Scenario 2: The most frequent values in both even and odd positions are the same.
        // We cannot make both groups the same value. Therefore, one of the groups
        // must be changed to its second most frequent value (or a completely new value if only one unique exists).
        // We evaluate two options and choose the one requiring fewer modifications.

        // Option A: Change even positions to their second most frequent value,
        // while odd positions remain their most frequent value.
        // If `secondMostFreqEvenCount` is 0, it means all even positions already had `mostFreqEvenVal`.
        const costIfEvenChanges = (targetHalfSize - secondMostFreqEvenCount) + (targetHalfSize - mostFreqOddCount);

        // Option B: Change odd positions to their second most frequent value,
        // while even positions remain their most frequent value.
        // Similarly, if `secondMostFreqOddCount` is 0, all odd positions already had `mostFreqOddVal`.
        const costIfOddChanges = (targetHalfSize - mostFreqEvenCount) + (targetHalfSize - secondMostFreqOddCount);

        // The minimum modifications will be the better of these two options.
        totalRequiredModifications = Math.min(costIfEvenChanges, costIfOddChanges);
    }

    // Display the final computed result
    printOutputMessage(totalRequiredModifications);
}

// Initiate the data processing by acquiring input and running the main function
processDataStream(acquireRawInput());