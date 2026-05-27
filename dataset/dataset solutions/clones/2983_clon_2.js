"use strict";

/**
 * Processes the raw input data to count specific string patterns.
 * @param {string} rawData - The complete input string, typically from stdin.
 */
function ProcessInput(rawData) {
  // Split the input into individual lines.
  const inputLines = rawData.split('\n');

  // The first line is usually a count of subsequent entries, but not directly used in the core logic here.
  const numberOfStrings = parseInt(inputLines.shift(), 10);

  // Initialize counters for different patterns.
  let totalABOccurrences = 0; // Accumulates the count of "AB" pairs.
  let stringsEndingWithA = 0; // Counts lines that end with 'A'.
  let stringsStartingWithB = 0; // Counts lines that start with 'B'.
  let hasStringStartingWithBAndEndingWithA = false; // Flag if any line starts with 'B' AND ends with 'A'.

  // Iterate over each remaining line in the input.
  inputLines.forEach(currentLine => {
    // Calculate the number of "AB" occurrences within the current line.
    // The length difference after removing all "AB"s, divided by 2, gives the count.
    totalABOccurrences += (currentLine.length - currentLine.replace(/AB/g, '').length) / 2;

    // Output the current running total of AB occurrences. This is behavior-critical.
    console.log(`count: ${totalABOccurrences}`);

    // Check if the current line starts with 'B'.
    let lineStartsB = currentLine.charAt(0) === 'B';
    if (lineStartsB) {
      stringsStartingWithB++;
    }

    // Check if the current line ends with 'A'.
    let lineEndsA = currentLine.charAt(currentLine.length - 1) === 'A';
    if (lineEndsA) {
      stringsEndingWithA++;
    }

    // Update the flag if this line starts with 'B' and ends with 'A'.
    hasStringStartingWithBAndEndingWithA = hasStringStartingWithBAndEndingWithA || (lineEndsA && lineStartsB);
  });

  // Add the maximum possible "AB" pairs that can be formed by concatenating strings.
  // This is limited by the minimum of strings ending with 'A' and strings starting with 'B'.
  totalABOccurrences += stringsEndingWithA < stringsStartingWithB ? stringsEndingWithA : stringsStartingWithB;

  // If there was at least one string that started with 'B' and ended with 'A',
  // it means one potential "AB" pair was already counted within that string,
  // and it also contributed to both `stringsEndingWithA` and `stringsStartingWithB`.
  // This adjustment corrects for overcounting when such a string exists and contributes to the concatenation count.
  totalABOccurrences += hasStringStartingWithBAndEndingWithA ? -1 : 0;

  // Output the final calculated total.
  console.log(totalABOccurrences);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
