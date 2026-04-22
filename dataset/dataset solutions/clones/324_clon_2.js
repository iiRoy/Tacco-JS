// This script manages input from a system source, then performs a series of textual transformations.
let rawData = require('node:fs').readFileSync('/dev/stdin', 'utf-8');

// The incoming raw content is first cleaned by removing outer whitespace,
// and then divided into distinct textual segments based on newline characters.
let processedLines = rawData.trim().split('\n');

// The initial segment in the array specifies how many subsequent segments
// are intended for processing. This value is extracted and converted to a numeric type.
const loopIterations = Number(processedLines.shift());

// A sequential processing loop is initiated, running for the number of specified iterations.
for (let lineIndex = 0; lineIndex < loopIterations; lineIndex++) {
    // Each iteration retrieves one textual segment from the processed collection.
    let currentText = processedLines[lineIndex];

    // Within the retrieved text, all occurrences of the specific pattern "Hoshino"
    // are replaced with "Hoshina". The 'gu' flags ensure global and Unicode-aware replacement.
    let modifiedText = currentText.replace(/Hoshino/gu, 'Hoshina');

    // The transformed textual segment is then outputted to the console for display.
    console.info(modifiedText);
}