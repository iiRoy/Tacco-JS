const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split('\n');

let wordPagePairs = [];

const parseInputLineToPair = (lineContent) => {
    const lineParts = lineContent.split(' ');
    // The second part is expected to be a number
    return [lineParts[0], Number(lineParts[1])];
};

for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
    const currentInputLine = inputLines[lineIndex];
    // Skip empty lines, consistent with original d.shift() behavior for falsy values
    if (!currentInputLine) {
        continue;
    }
    const parsedPair = parseInputLineToPair(currentInputLine);
    wordPagePairs.push(parsedPair);
}

wordPagePairs.sort((pairA, pairB) => {
    // Compare words lexicographically
    const wordComparisonResult = pairA[0].localeCompare(pairB[0]);
    if (wordComparisonResult !== 0) {
        return wordComparisonResult;
    }
    // If words are identical, compare page numbers numerically
    return pairA[1] - pairB[1];
});

let lastProcessedWord = '';
let currentPageNumbers = [];

// Helper function to print a group of page numbers, but only if there are pages to print.
// This is used for intermediate groups.
const printPageGroupIfNotEmpty = (pagesToOutput) => {
    if (pagesToOutput.length > 0) {
        console.log(pagesToOutput.join(' '));
    }
};

for (let entryIndex = 0; entryIndex < wordPagePairs.length; entryIndex++) {
    const currentEntry = wordPagePairs[entryIndex];
    const currentWord = currentEntry[0];
    const currentPage = currentEntry[1];

    // Check if the word has changed, indicating a new group
    if (lastProcessedWord !== currentWord) {
        // If it's not the very first entry, print the pages collected for the previous word
        if (entryIndex !== 0) {
            printPageGroupIfNotEmpty(currentPageNumbers);
            currentPageNumbers = []; // Reset for the new word group
        }
        console.log(currentWord); // Print the new word
        lastProcessedWord = currentWord; // Update the tracker for the current word
    }
    currentPageNumbers.push(currentPage); // Add the current page number to the group
}

// After iterating through all entries, print the last group of page numbers.
// This must always execute, even if currentPageNumbers is empty (to print an empty line if no data).
console.log(currentPageNumbers.join(' '));
