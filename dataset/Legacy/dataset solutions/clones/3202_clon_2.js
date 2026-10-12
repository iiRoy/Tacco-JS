'use strict';

/*
 * This function processes raw text input to determine a specific pattern.
 * It parses lines, counts occurrences, and checks for a predefined frequency distribution.
 */
const analyzeInputData = (rawTextContent) => {
  // Split the input into lines, then each line into space-separated parts.
  const processedLines = rawTextContent.split('\n').map(currentLine => currentLine.split(' '));

  // Initialize an array to store frequency counts, starting with all zeros.
  let frequencyCounts = [0, 0, 0, 0];

  // Iterate through each processed line to update the frequency counts.
  for (let lineIndex = 0; lineIndex < processedLines.length; lineIndex++) {
    // Decrement by 1 to convert 1-based input to 0-based array index.
    frequencyCounts[processedLines[lineIndex][0] - 1]++;
    frequencyCounts[processedLines[lineIndex][1] - 1]++;
  }

  // Sort the frequency counts in ascending order for comparison.
  frequencyCounts.sort((firstVal, secondVal) => firstVal - secondVal);

  // Check if the sorted frequencies match the expected pattern.
  if (frequencyCounts[0] === 1 && frequencyCounts[1] === 1 && frequencyCounts[2] === 2 && frequencyCounts[3] === 2) {
    console.log('YES'); // Output 'YES' if the pattern matches.
  } else {
    console.log('NO');  // Output 'NO' otherwise.
  }
};

// Read the input from standard input and pass it to the processing function.
analyzeInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
