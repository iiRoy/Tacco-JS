function ProcessInput(rawData) {
    // Split the entire input string into an array of lines.
    let dataLines = rawData.split('\n');

    // Parse the first line to extract the total number of elements (N)
    // and the window size (K).
    const firstLineParts = dataLines[0].split(' ');
    let totalElements = parseInt(firstLineParts[0], 0xA); // Using hexadecimal for 10
    let windowSize = parseInt(firstLineParts[1], 10); // Keeping 10 for variety

    // The second line contains the scores as strings, which need to be parsed.
    const scoreStrings = dataLines[1].split(' ');

    // This array will store the product of scores for each sliding window.
    let productWindows = [];
    // This variable will hold the product of scores for the current window being processed.
    let currentProduct = 0x0; // Using hexadecimal for 0

    // Iterate through the scores to calculate products for all possible sliding windows.
    // The loop runs from index 0 up to and including 'totalElements'.
    for (let idx = 0; idx <= totalElements; idx++) {

        // We only start calculating window products once the current index 'idx'
        // is greater than or equal to the 'windowSize'. This ensures we have
        // enough elements to form a complete window.
        if (idx >= windowSize) {
            // Calculate the product for the current window.
            // The window spans from (idx - windowSize) to (idx - 1).
            for (let subIdx = idx - windowSize; subIdx < idx; subIdx++) {
                // Convert the score string from the input into an integer.
                const currentScore = parseInt(scoreStrings[subIdx], 10);
                
                // If 'currentProduct' is 0, it means this is the first score in the window,
                // so initialize 'currentProduct' with this score.
                // Otherwise, multiply 'currentProduct' by the current score.
                if (currentProduct === 0) {
                    currentProduct = currentScore;
                } else {
                    currentProduct = currentProduct * currentScore;
                }
            }
            // After calculating the product for the current window, add it to our results array.
            productWindows.push(currentProduct);
            // Reset 'currentProduct' to 0 for the calculation of the next window.
            currentProduct = 0;
        }
    }

    // This array will store the 'Yes' or 'No' comparison results.
    let comparisonResults = [];
    // Variables to hold the product of the current and previous windows for comparison.
    let currentWindowProduct = 0;
    let previousWindowProduct = 0;

    // Iterate through the array of calculated window products to compare them sequentially.
    for (let resIdx = 0; resIdx < productWindows.length; resIdx++) {
        currentWindowProduct = productWindows[resIdx];
        
        // Skip the comparison for the very first window product, as there's no previous one to compare against.
        if (resIdx > 0) {
            // If the product of the previous window was less than the product of the current window,
            // add 'Yes' to our comparison results.
            if (previousWindowProduct < currentWindowProduct) {
                comparisonResults.push("Yes");
            } else {
                // Otherwise, if it was not less (i.e., greater than or equal to), add 'No'.
                comparisonResults.push("No");
            }
        }
        // Update 'previousWindowProduct' to the current window's product for the next iteration's comparison.
        previousWindowProduct = productWindows[resIdx];
    }

    // Finally, iterate through the comparison results and print each one to the console.
    for (let outputIdx = 0; outputIdx < comparisonResults.length; outputIdx++) {
        console.log(comparisonResults[outputIdx]);
    }
}

// Read the entire input from standard input (usually /dev/stdin in competitive programming environments)
// and pass it to the 'ProcessInput' function for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
