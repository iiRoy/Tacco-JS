function processInput(inputData) {
  // Clean up the raw input string: remove leading/trailing whitespace and split into lines.
  inputData = inputData.trim().split("\n");

  // Discard the first line, which often contains metadata like the number of test cases.
  inputData.shift();

  // Extract the main string to be analyzed from the second line of the original input.
  const targetString = inputData.shift();

  // Process the remaining lines, which represent query ranges.
  // Each line is split by space, converted to numbers, and then decremented by 1
  // to make them 0-indexed for array access.
  inputData = inputData.map(element =>
    element.split(" ").map(Number).map(val => val - 1)
  );

  // Initialize an array to store cumulative counts of 'AC' pairs.
  // Its length corresponds to the number of queries.
  const cumulativeCounts = new Array(targetString.length).fill(0);

  // Initialize a counter for 'AC' pairs.
  let acPairCount = 0;

  // This array is declared but not used in the original logic.
  // It's kept for structural equivalence.
  const queryIndices = new Array(inputData.length);
  for (let idx = 0; idx < inputData.length; idx++) {
    queryIndices[idx] = idx;
  }

  // Iterate through the target string to calculate cumulative 'AC' pair counts.
  // The loop goes up to the second-to-last character to allow checking s[idx+1].
  for (let idx = 0; idx < targetString.length - 1; idx++) {
    // Check if the current character and the next form an 'AC' pair.
    if (targetString[idx] === 'A' && targetString[idx + 1] === 'C') {
      acPairCount++; // Increment the counter if an 'AC' pair is found.
    }
    // Store the cumulative count at the next index.
    // This means cumulativeCounts[k] holds the count of 'AC' pairs in s[0...k-1].
    cumulativeCounts[idx + 1] = acPairCount;
  }

  // Process each query to find the number of 'AC' pairs within a given range.
  for (let idx = 0; idx < inputData.length; idx++) {
    // Extract the 0-indexed left and right bounds for the current query.
    const leftBound = inputData[idx][0];
    const rightBound = inputData[idx][1];

    // The number of 'AC' pairs in the range [leftBound, rightBound]
    // is cumulativeCounts[rightBound] - cumulativeCounts[leftBound].
    // This works because cumulativeCounts[k] stores the count up to index k-1.
    // So, cumulativeCounts[rightBound] has counts up to rightBound-1.
    // cumulativeCounts[leftBound] has counts up to leftBound-1.
    // Subtracting them gives counts from leftBound to rightBound-1.
    console.log(cumulativeCounts[rightBound] - cumulativeCounts[leftBound]);
  }
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
