const processInput = (rawData) => {
  // Trim leading/trailing whitespace from the raw input string
  const trimmedData = rawData.trim();

  // Find all occurrences of consecutive 'A', 'T', 'C', or 'G' characters
  // The 'g' flag ensures all matches are found, not just the first
  const sequenceMatches = trimmedData.match(/[ATCG]+/g);

  // Initialize a variable to store the length of the longest segment found
  let longestSegmentLength = 0;

  // Iterate through the found matches, if any exist
  for (let idx = 0; sequenceMatches && idx < sequenceMatches.length; idx++) {
    // Update the longest segment length if the current match is longer
    longestSegmentLength = Math.max(sequenceMatches[idx].length, longestSegmentLength);
  }

  // Output the final calculated longest segment length to the console
  console.log(longestSegmentLength);
};

// Read the input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
