let inputStr; // Variable to store the raw input line from stdin.
let charArr;    // Variable to store the input line as an array of characters.

// Define a constant for the modulo operation, commonly used in problems to prevent integer overflow.
const moduloVal = 1_000_000_007; // This is equivalent to 10^9 + 7.

// Import the 'readline' module, which provides an interface for reading data from a Readable stream
// (like process.stdin) one line at a time.
const readline = require('readline');

// Create an instance of the readline interface.
// It takes an options object specifying the input and output streams.
const inputHandler = readline.createInterface({
    input: process.stdin,   // Use standard input as the source.
    output: process.stdout, // Use standard output (though not directly written to by this script).
});

// Attach an event listener for the 'line' event.
// This event is emitted whenever the input stream receives a new line of data.
inputHandler.on('line', (currentLine) => {
    inputStr = currentLine; // Assign the received line to our inputStr variable.
});

// Attach an event listener for the 'close' event.
// This event is emitted when the input stream has ended (e.g., user presses Ctrl+D or EOF is reached).
inputHandler.on('close', () => {
    // Once all input is received, process the stored line.
    charArr = inputStr.split(""); // Convert the input string into an array of individual characters.

    // Initialize a 2D array for dynamic programming.
    // The number of rows will be one more than the length of the character array.
    let dynamicProgTable = Array(charArr.length + 1);

    // Populate each row of the DP table with an array of zeros.
    // Each inner array will have 4 elements (representing states 0, 1, 2, 3).
    for (let rowIdx = 0; rowIdx <= charArr.length; rowIdx++) {
        dynamicProgTable[rowIdx] = Array(4).fill(0);
    }

    // Iterate through the DP table in reverse order.
    // The outer loop goes from the end of the string (charArr.length) down to 0.
    for (let rowIdx = charArr.length; rowIdx >= 0; rowIdx--) {
        // The inner loop goes from state 3 (meaning 'ABC' is complete) down to 0 (meaning looking for 'A').
        for (let colIdx = 3; colIdx >= 0; colIdx--) {
            // Base case: If we are at the end of the string (rowIdx equals charArr.length).
            if (rowIdx === charArr.length) {
                // If the current state is 3 (meaning we successfully formed 'ABC'), then there's 1 way.
                // Otherwise, if we're at the end and haven't formed 'ABC', there are 0 ways.
                dynamicProgTable[rowIdx][colIdx] = (colIdx === 3 ? 1 : 0);
            } else {
                // Recursive step: Calculate the number of ways for the current state.

                // Part 1: Consider the case where the current character (charArr[rowIdx]) is NOT used
                // to form the 'ABC' sequence.
                // If charArr[rowIdx] is '?', it can be any of the 3 characters *other than* the one
                // we might be looking for to form 'ABC'. So, it contributes 3 ways to skip.
                // If it's a specific character, it contributes 1 way to skip.
                dynamicProgTable[rowIdx][colIdx] = dynamicProgTable[rowIdx + 1][colIdx] * (charArr[rowIdx] === '?' ? 3 : 1);

                // Part 2: Consider the case where the current character (charArr[rowIdx]) IS used
                // to form the 'ABC' sequence.
                // This is only possible if we haven't completed 'ABC' yet (colIdx < 3)
                // AND the current character is either '?' OR it matches the character required for the current state.
                if (colIdx < 3 && (charArr[rowIdx] === '?' || charArr[rowIdx] === "ABC"[colIdx])) {
                    // Add the number of ways from the next state (colIdx + 1) in the next row (rowIdx + 1).
                    dynamicProgTable[rowIdx][colIdx] += dynamicProgTable[rowIdx + 1][colIdx + 1];
                }

                // Apply the modulo operation to keep the result within the specified range.
                dynamicProgTable[rowIdx][colIdx] %= moduloVal;
            }
        }
    }

    // The final result is stored at dynamicProgTable[0][0], representing the start of the string
    // and the initial state of looking for the first character ('A') of the sequence.
    console.log(dynamicProgTable[0][0]);
});
