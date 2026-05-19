const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

(function(processedInput) {
    // This function analyzes a sequence of numbers to determine the number of "waves" or trend changes.
    // A wave is considered to start when the direction of the sequence changes (e.g., from increasing to decreasing).

    // Split the entire input string into an array of lines.
    const dataRows = processedInput.split('\n');

    // The first line contains the total count of numbers in the sequence.
    // Convert this string representation to an integer.
    const arraySize = Number(dataRows[0]);

    // The second line contains the actual sequence of numbers, space-separated.
    // Split this line by spaces and convert each part to a numeric value.
    const numericArray = dataRows[1].split(' ').map(valueItem => parseFloat(valueItem));

    // Initialize a counter for the number of detected trend changes (peaks or valleys).
    let peakValleyCount = 0;

    // Initialize a variable to keep track of the current trend direction:
    // 0: No established trend (e.g., at the beginning or a flat segment).
    // 1: The sequence is currently increasing.
    // -1: The sequence is currently decreasing.
    let currentTrend = 0;

    // Iterate through the numeric array, starting from the second element (index 1).
    // We compare each element with its immediate predecessor to detect changes in trend.
    for (let idx = 1; idx < arraySize; ++idx) {
        // Check if the current number is strictly greater than the previous one.
        // This indicates an upward movement or an increasing trend.
        if (numericArray[idx] > numericArray[idx - 1]) {
            // If the previous trend was decreasing, it means we have just passed a "valley".
            if (currentTrend === -1) {
                currentTrend = 0; // Reset the trend state, as a new segment begins.
                peakValleyCount++; // Increment the count of trend changes.
            } else {
                currentTrend = 1; // Set or maintain the trend as increasing.
            }
        }
        // Check if the current number is strictly less than the previous one.
        // This indicates a downward movement or a decreasing trend.
        else if (numericArray[idx] < numericArray[idx - 1]) {
            // If the previous trend was increasing, it means we have just passed a "peak".
            if (currentTrend === 1) {
                currentTrend = 0; // Reset the trend state.
                peakValleyCount++; // Increment the count of trend changes.
            } else {
                currentTrend = -1; // Set or maintain the trend as decreasing.
            }
        }
        // If numericArray[idx] === numericArray[idx - 1], the sequence is flat.
        // In this case, the 'currentTrend' variable retains its previous value,
        // or remains 0 if no trend was established yet.
    }

    // The problem defines the total number of "waves" as the number of trend changes plus one.
    // For example, a purely increasing or decreasing sequence has 0 changes but 1 wave.
    // A sequence with one peak/valley has 1 change but 2 waves.
    console.log(peakValleyCount + 1);

})(rawData);
