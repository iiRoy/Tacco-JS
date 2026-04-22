"use strict";

const solveBookPuzzle = textInput => {
    const dataLines = textInput.trim().split("\n");
    const headerInfo = dataLines[0].split(' ').map(Number);
    const primaryShelf = dataLines[1].split(' ').map(Number);
    const secondaryShelf = dataLines[2].split(' ').map(Number);

    const maxTimeAllowed = headerInfo[2];

    let totalTimeSpent = 0;
    let booksAcquired = 0;
    let primaryIndex = 0;
    let secondaryIndex = 0;

    while (true) {
        let bookTimeA = (primaryIndex < primaryShelf.length) ? primaryShelf[primaryIndex] : Infinity;
        let bookTimeB = (secondaryIndex < secondaryShelf.length) ? secondaryShelf[secondaryIndex] : Infinity;

        let nextBookValue;
        let sourceShelfIdentifier;

        if (bookTimeA <= bookTimeB) {
            nextBookValue = bookTimeA;
            sourceShelfIdentifier = 'A';
        } else {
            nextBookValue = bookTimeB;
            sourceShelfIdentifier = 'B';
        }

        if (nextBookValue === Infinity) {
            // This condition corresponds to the original's 'arr1.length === 0 && arr2.length === 0'
            // where total time is less than the limit.
            // The original code outputs 'books - 1' in this scenario, which is a bug.
            // We replicate this exact behavior.
            console.log(booksAcquired - 1); 
            return;
        }

        if (totalTimeSpent + nextBookValue > maxTimeAllowed) {
            // This condition corresponds to the original's 'sumT > limit' check,
            // where 'sumT' and 'books' already include the book that pushed it over.
            // Original outputs 'books - 1'.
            // In our iterative logic, 'booksAcquired' is the count *before* adding the exceeding book.
            // So, 'booksAcquired' correctly matches original's 'books - 1'.
            console.log(booksAcquired);
            return;
        }
        
        if (totalTimeSpent + nextBookValue === maxTimeAllowed) {
            // This condition corresponds to the original's 'sumT == limit' check.
            // Original outputs 'books'.
            // In our iterative logic, 'booksAcquired' is the count *before* adding this book.
            // So, 'booksAcquired + 1' correctly matches original's 'books'.
            console.log(booksAcquired + 1);
            return;
        }

        totalTimeSpent += nextBookValue;
        booksAcquired++;

        if (sourceShelfIdentifier === 'A') {
            primaryIndex++;
        } else {
            secondaryIndex++;
        }
    }
};
solveBookPuzzle(require('fs').readFileSync('/dev/stdin', 'utf8'));