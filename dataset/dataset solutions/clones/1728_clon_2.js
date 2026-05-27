"use strict";

const processInput = rawData => {
    // Parse the raw input string, splitting it into individual lines.
    const lines = rawData.trim().split("\n");
    
    // Extract and convert the first line's space-separated values to numbers.
    let firstLineData = lines[0].split(' ').map(Number);
    // Extract and convert the second line's space-separated values to numbers, representing books on desk A.
    let deskA_books = lines[1].split(' ').map(Number);
    // Extract and convert the third line's space-separated values to numbers, representing books on desk B.
    let deskB_books = lines[2].split(' ').map(Number);

    // Initialize the total time spent reading and the count of books successfully read.
    let totalDuration = 0;
    let booksReadCount = 0;
    
    // This recursive function calculates the maximum number of books that can be read within a given time limit.
    function calculateMaxBooks(stack1, stack2, currentDuration, timeLimit, readBooks) {
        // Check if the accumulated reading time has exceeded the allowed limit.
        if (currentDuration > timeLimit) {
            console.log(readBooks - 1); // Output the count of books read just before exceeding the limit.
            return; // End the recursive call.
        } 
        // Check if the accumulated reading time exactly matches the allowed limit.
        else if (currentDuration === timeLimit) {
            console.log(readBooks); // Output the exact count of books read.
            return; // End the recursive call.
        } 
        // If both stacks are empty and the time limit was exceeded in the last step.
        else if (stack1.length === 0 && stack2.length === 0 && currentDuration > timeLimit) {
            console.log(readBooks - 1); // Output the count of books read before exceeding.
            return; // End the recursive call.
        } 
        // If both stacks are empty and the time limit was not exceeded.
        else if (stack1.length === 0 && stack2.length === 0) {
            console.log(readBooks - 1); // Output the count of books read (no more books available).
            return; // End the recursive call.
        }

        // Determine which book to read next based on the shortest reading time.
        // If both stacks still contain books.
        if (stack1.length !== 0 && stack2.length !== 0) {
            // Compare the reading times of the top books from each stack.
            if (stack1[0] >= stack2[0]) { // If the book on stack1 takes longer or equal time.
                currentDuration = currentDuration + stack2[0]; // Add time from stack2's top book.
                stack2.shift(); // Remove the book from stack2.
                readBooks = readBooks + 1; // Increment the count of read books.
            } else if (stack2[0] > stack1[0]) { // If the book on stack2 takes longer.
                currentDuration = currentDuration + stack1[0]; // Add time from stack1's top book.
                stack1.shift(); // Remove the book from stack1.
                readBooks = readBooks + 1; // Increment the count of read books.
            }
        } 
        // If only stack1 is empty, read from stack2.
        else if (stack1.length === 0 && stack2.length !== 0) {
            currentDuration = currentDuration + stack2[0];
            stack2.shift();
            readBooks = readBooks + 1;
        } 
        // If only stack2 is empty, read from stack1.
        else if (stack2.length === 0 && stack1.length !== 0) {
            currentDuration = currentDuration + stack1[0];
            stack1.shift();
            readBooks = readBooks + 1;
        }
        
        // Make a recursive call with the updated state (remaining books, current duration, and read count).
        calculateMaxBooks(stack1, stack2, currentDuration, timeLimit, readBooks);
    }
    
    // Start the book reading simulation with the initial parameters.
    // firstLineData[2] typically represents the time limit (K).
    calculateMaxBooks(deskA_books, deskB_books, totalDuration, firstLineData[2], booksReadCount);
};

// Read the entire content from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
