process.stdin.resume();
process.stdin.setEncoding('utf8');

// Buffer to accumulate all incoming standard input data.
let dataBuffer = '';

// Event listener for incoming data chunks.
process.stdin.on('data', function(incomingSegment) {
    dataBuffer += incomingSegment;
});

// Event listener for the end of standard input stream.
process.stdin.on('end', function() {
    // Process the accumulated data, splitting it by newlines.
    // Handles both Windows (\r\n) and Unix (\n) line endings.
    executePalindromeSolver(dataBuffer.split(/\r?\n/));
});

/**
 * Solves the palindrome problem by counting minimum 'x' removals.
 * @param {string[]} lineSegments - An array of input lines, where the first element is the target string.
 * @returns {void} Outputs the result to the console.
 */
function executePalindromeSolver(lineSegments) {
    // Extract the primary string for analysis.
    const targetString = lineSegments[0];

    // Handle edge case: an empty string is already a palindrome with 0 removals.
    if (!targetString || targetString.length === 0) {
        console.log(0);
        return;
    }

    // Initialize pointers for two-way traversal.
    let leftPointer = 0;
    let rightPointer = targetString.length - 1;
    // Counter for 'x' characters removed.
    let xRemovalCount = 0;

    // Iterate while the pointers haven't crossed.
    while (leftPointer < rightPointer) {
        const charAtLeft = targetString[leftPointer];
        const charAtRight = targetString[rightPointer];

        // Case 1: Characters match. Move both pointers inward.
        if (charAtLeft === charAtRight) {
            leftPointer++;
            rightPointer--;
        }
        // Case 2: Characters don't match. Check for 'x' to remove.
        else {
            if (charAtLeft === 'x') {
                // Remove 'x' from the left, increment count.
                leftPointer++;
                xRemovalCount++;
            } else if (charAtRight === 'x') {
                // Remove 'x' from the right, increment count.
                rightPointer--;
                xRemovalCount++;
            } else {
                // If characters don't match and neither is 'x', it's impossible.
                xRemovalCount = -1;
                break; // Exit the loop as solution is impossible.
            }
        }
    }

    // Display the final count of 'x' removals or -1 if impossible.
    console.log(xRemovalCount);
}