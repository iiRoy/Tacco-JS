// This function serves as the primary entry point for processing textual data.
function processInput(rawInputData) {

  // First, we segment the entire input string into individual lines based on newline characters.
  let lines = rawInputData.split("\n");

  // The very first line is often metadata (like a count of subsequent lines) that isn't directly used in this specific task,
  // so we discard it from our working set.
  lines.shift();

  // The next line in the sequence contains the main text string that will be analyzed.
  const targetSequence = lines.shift();

  // All subsequent lines represent query parameters or test cases.
  // Each line is split by spaces, and its components are converted into numerical values.
  lines = lines.map(lineContent => lineContent.split(" ").map(Number));

  // Now, we iterate through each of the prepared query parameter sets.
  for (let caseIndex = 0; caseIndex < lines.length; caseIndex++) {

    // For the current query, extract a specific fragment from the main target sequence.
    // The extraction range is determined by the numerical values in the current line,
    // adjusting for 0-based indexing for the start position.
    const fragmentToAnalyze = targetSequence.substring(lines[caseIndex][0] - 1, lines[caseIndex][1]);

    // We then divide this extracted fragment wherever the specific pattern "AC" appears.
    // This effectively gives us an array of substrings that were separated by "AC".
    const partsAfterSplit = fragmentToAnalyze.split("AC");

    // The number of "AC" occurrences is one less than the number of resulting parts after splitting.
    // This calculated count is then outputted.
    console.log(partsAfterSplit.length - 1);
  }
}

// Invoke the main processing function.
// It reads the entire content from standard input, interpreting it as UTF-8 encoded text.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));