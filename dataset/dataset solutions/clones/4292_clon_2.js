// Establish the standard input stream's operational state
process.stdin.resume();
// Set the character encoding for data received from standard input
process.stdin.setEncoding('utf8');

// Declare a variable to accumulate all incoming data chunks from the stream
let entireStreamData = '';

// Attach an event handler for the 'data' event on the standard input stream
process.stdin.on('data', function(dataSegment) {
    // Append each new data segment to the accumulated string
    entireStreamData += dataSegment;
});

// Attach an event handler for the 'end' event on the standard input stream
process.stdin.on('end', function() {
    // Once all input has been received, split the entire content into lines
    // and pass this array of lines to the primary processing function
    solvePalindromeProblem(entireStreamData.split(/\r?\n/));
});

/**
 * Executes the core logic to determine the minimum insertions of 'x'
 * required to make the first input string a palindrome.
 * @param {string[]} processedLines - An array where the first element is the string for analysis.
 * @returns {number} A status code indicating completion (always 0).
 */
function solvePalindromeProblem(processedLines) {

    // Retrieve the specific character sequence to be evaluated, which is the first line of input
    const targetString = processedLines[0];

    // Initialize a pointer for the start of the string
    let leftPtr = 0;
    // Initialize a pointer for the end of the string
    let rightPtr = targetString.length - 1;

    // Initialize a counter to track the necessary modifications or operations
    let operationCount = 0;

    // Continue iterating as long as the left pointer has not crossed the right pointer
    while (leftPtr < rightPtr) {
        // Check if the characters at both pointer positions are identical
        if (targetString.charAt(leftPtr) === targetString.charAt(rightPtr)) {
            // If they match, move both pointers towards the center
            leftPtr++;
            rightPtr--;
        }
        // Otherwise, if the character at the left pointer is an 'x'
        else if (targetString.charAt(leftPtr) === 'x') {
            // Treat 'x' as a removable character, increment the operation count, and advance the left pointer
            leftPtr++;
            operationCount++;
        }
        // Otherwise, if the character at the right pointer is an 'x'
        else if (targetString.charAt(rightPtr) === 'x') {
            // Treat 'x' as a removable character, increment the operation count, and retract the right pointer
            rightPtr--;
            operationCount++;
        }
        // If characters do not match and neither is an 'x', it's impossible to form a palindrome
        else {
            // Set the operation count to -1 to signify an impossible scenario
            operationCount = -1;
            // Terminate the loop immediately as a solution cannot be found
            break;
        }
    }

    // Display the final calculated number of operations or the impossibility indicator
    console.log(operationCount);

    // Return a value indicating the function's completion
    return 0;
}