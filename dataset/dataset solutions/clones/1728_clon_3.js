"use strict";

/**
 * Orchestrates the reading and processing of input data to solve the book-reading problem.
 * This function serves as the primary entry point for handling external input.
 * @param {string} rawInputString - The raw string input, typically from a file or standard input.
 */
const processInputData = (rawInputString) => {
    // Normalize input: remove leading/trailing whitespace and split into lines.
    const lineSegments = rawInputString.trim().split("\n");

    // --- Input Validation ---
    // A basic check to ensure the input contains the expected number of lines.
    // We anticipate at least three lines: global settings, shelf A books, shelf B books.
    if (lineSegments.length < 3) {
        console.error("Error: Input structure is incomplete. Expected at least three lines of data.");
        return; // Terminate execution if input is malformed.
    }

    // --- Data Parsing ---
    // The first line contains global parameters. The third element (index 2) is the time limit.
    const globalConfiguration = lineSegments[0].split(' ').map(Number);
    const maximumPermittedReadingDuration = globalConfiguration[2]; // This is our time budget.

    // The second line lists the reading times for books on the first shelf.
    const shelfA_BookTimings = lineSegments[1].split(' ').map(Number);

    // The third line lists the reading times for books on the second shelf.
    const shelfB_BookTimings = lineSegments[2].split(' ').map(Number);

    // Initialize tracking variables for the calculation.
    const startingTime = 0; // We begin with no time elapsed.

    // Invoke the core algorithm to compute the maximum number of books.
    // We pass cloned arrays to ensure the original input data remains untouched,
    // which can be useful if the data needs to be re-processed or for functional purity.
    const finalCountOfBooks = calculateMaxReadableBooks(
        shelfA_BookTimings.slice(), // Create a shallow copy of shelf A's books.
        shelfB_BookTimings.slice(), // Create a shallow copy of shelf B's books.
        startingTime,
        maximumPermittedReadingDuration
    );

    // Display the final result to the console.
    console.log(finalCountOfBooks);
};

/**
 * Iteratively determines the highest possible number of books that can be read
 * from two distinct stacks within a given time constraint. It prioritizes books
 * with shorter reading times to maximize the count.
 *
 * @param {number[]} firstShelfBooks - An array of reading durations for books on the first shelf.
 * @param {number[]} secondShelfBooks - An array of reading durations for books on the second shelf.
 * @param {number} accumulatedReadingTime - The current total time spent reading so far.
 * @param {number} timeLimit - The absolute maximum time allowed for reading.
 * @returns {number} The total count of books successfully read without exceeding the time limit.
 */
const calculateMaxReadableBooks = (
    firstShelfBooks,
    secondShelfBooks,
    accumulatedReadingTime,
    timeLimit
) => {
    let currentTotalDuration = accumulatedReadingTime; // Tracks the running total of time.
    let booksSuccessfullyRead = 0;                    // Counts the books added to the read list.

    // The main loop continues as long as there are books to consider and time remains.
    while (true) {
        // Peek at the top book's duration from each shelf. Use Infinity if a shelf is empty.
        const nextBookTimeFromShelfA = (firstShelfBooks.length > 0) ? firstShelfBooks[0] : Infinity;
        const nextBookTimeFromShelfB = (secondShelfBooks.length > 0) ? secondShelfBooks[0] : Infinity;

        let selectedBookDuration; // The duration of the book chosen for this iteration.
        let sourceShelfIndicator = null; // A flag to remember which shelf the book was taken from.

        // --- Decision Logic for Selecting the Next Book ---
        // 1. If both shelves are entirely empty, no more books can be read.
        if (firstShelfBooks.length === 0 && secondShelfBooks.length === 0) {
            break; // Exit the loop, all potential books have been considered.
        }
        // 2. If only shelf A has books, take from shelf A.
        else if (secondShelfBooks.length === 0) {
            selectedBookDuration = nextBookTimeFromShelfA;
            sourceShelfIndicator = 'A';
        }
        // 3. If only shelf B has books, take from shelf B.
        else if (firstShelfBooks.length === 0) {
            selectedBookDuration = nextBookTimeFromShelfB;
            sourceShelfIndicator = 'B';
        }
        // 4. If both shelves have books, choose the one with the minimum reading time.
        else {
            if (nextBookTimeFromShelfA <= nextBookTimeFromShelfB) {
                selectedBookDuration = nextBookTimeFromShelfA;
                sourceShelfIndicator = 'A';
            } else { // nextBookTimeFromShelfB is strictly less than nextBookTimeFromShelfA
                selectedBookDuration = nextBookTimeFromShelfB;
                sourceShelfIndicator = 'B';
            }
        }

        // --- Time Constraint Check for the Selected Book ---
        // If adding the selected book's duration would push us over the time limit,
        // we cannot read this book. The current count is our maximum.
        if (currentTotalDuration + selectedBookDuration > timeLimit) {
            break; // Time limit would be exceeded; stop reading.
        }

        // --- Process the Selected Book ---
        // Add the book's duration to the cumulative time.
        currentTotalDuration += selectedBookDuration;
        // Increment the counter for successfully read books.
        booksSuccessfullyRead++;

        // Remove the taken book from its respective shelf to simulate reading it.
        if (sourceShelfIndicator === 'A') {
            firstShelfBooks.shift(); // Remove the first element (top book) from shelf A.
        } else if (sourceShelfIndicator === 'B') {
            secondShelfBooks.shift(); // Remove the first element (top book) from shelf B.
        }
        // Note: If sourceShelfIndicator is null, it means both shelves were empty,
        // and the loop would have already broken.
    }

    // Return the final tally of books that were read within the allocated time.
    return booksSuccessfullyRead;
};

// Execution entry point: Reads input from standard input and initiates the processing.
// This pattern is common in environments like competitive programming platforms.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));