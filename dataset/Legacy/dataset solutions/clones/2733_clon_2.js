function ProcessInput(rawData) {
  // Split the raw input into lines, filter out the first line and any empty lines.
  const processedLines = rawData.split('\n').filter((currentLine, lineIndex) => lineIndex !== 0 && currentLine !== '');

  // Iterate through each processed line to find the maximum value excluding the current line's index.
  Array.from({ length: processedLines.length }).forEach((_unusedValue, iterationIndex) => {
    // Filter out the element at the current iteration index and then find the maximum among the remaining.
    let maximumValue = processedLines
      .filter((_ignoredItem, lineIdx) => lineIdx !== iterationIndex)
      .reduce((accumulator, currentElement) => Math.max(accumulator, currentElement));

    // Output the calculated maximum value.
    console.log(maximumValue);
  });
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
