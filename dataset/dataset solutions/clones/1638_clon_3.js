function ProcessData(rawData) {
  // This function processes numerical data to answer queries about distinct elements in ranges.
  // It uses a Fenwick tree (Binary Indexed Tree) for efficient range queries.

  // 1. Initial Input Parsing and Setup
  // Split the entire raw input string into an array of individual lines.
  let inputLines = rawData.split("\n");
  // A cursor to keep track of which line is currently being processed.
  let linePointer = 0;

  // Helper utility to parse a string line into an array of numbers.
  // This uses `Number()` which is concise for converting strings to numbers.
  const convertLineToNumbers = (lineContent) => lineContent.split(" ").map(Number);

  // Extract the main parameters: total count of elements (N) and number of queries (Q).
  const [totalElements, queryCount] = convertLineToNumbers(inputLines[linePointer++]);

  // Implement a basic sanity check for input parameters.
  // Although competitive programming inputs are usually valid, this demonstrates a Type III addition.
  if (totalElements <= 0 || queryCount < 0) {
    // In a production system, this might throw an error or log a warning.
    // For this context, an early return is sufficient.
    return;
  }

  // Extract the primary sequence of numbers that will be analyzed.
  const numericSequence = convertLineToNumbers(inputLines[linePointer++]);

  // 2. Preprocessing: Mapping Next Occurrences
  // `lastSeenTracker` stores the most recent index where each number appeared.
  // Initialized with -1, indicating no element has been seen yet.
  // Array size `totalElements + 1` to accommodate numbers up to N (assuming 1-based values potentially).
  let lastSeenTracker = Array.from({ length: totalElements + 1 }, () => -1);

  // `subsequentAppearances` maps an index `j` to a list of indices `k` where `numericSequence[j]`
  // reappears. This is crucial for identifying non-distinct elements.
  const subsequentAppearances = Array.from({ length: totalElements + 1 }, () => []);

  // Iterate through the `numericSequence` to populate `subsequentAppearances`.
  for (let currentIdx = 0; currentIdx < totalElements; currentIdx++) {
    const valueAtCurrentIdx = numericSequence[currentIdx];
    const previousKnownIdx = lastSeenTracker[valueAtCurrentIdx];

    // If this value has been observed before, record the current index as a subsequent appearance
    // for its previous observation point.
    if (previousKnownIdx > -1) { // Equivalent to `!== -1` but slightly different syntax.
      subsequentAppearances[previousKnownIdx].push(currentIdx);
    }
    // Update the tracker with the current index as the latest appearance for this value.
    lastSeenTracker[valueAtCurrentIdx] = currentIdx;
  }

  // 3. Query Preloading and Structuring
  // `queriesGroupedByStart` stores all queries, grouped by their starting index (L).
  // Each query is stored as an object for better readability.
  const queriesGroupedByStart = Array.from({ length: totalElements + 1 }, () => []);

  // Process each query from the input.
  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    let [queryLeftBound, queryRightBound] = convertLineToNumbers(inputLines[linePointer++]);

    // Adjust query boundaries to be 0-indexed (original problem often uses 1-indexed).
    queryLeftBound--;
    queryRightBound--;

    // Store the query information, associating it with its starting index.
    queriesGroupedByStart[queryLeftBound].push({
      rightBoundary: queryRightBound,
      originalQueryIndex: queryIndex
    });
  }

  // `finalResults` will store the computed answer for each query, ordered by their original index.
  const finalResults = new Array(queryCount);

  // 4. Fenwick Tree (BIT) Implementation
  // `bitStructure` is our Fenwick tree, used for efficient range sums.
  // Size `totalElements + 2` to accommodate 1-based indexing for `totalElements` and a zero-th element.
  const bitStructure = new Array(totalElements + 2).fill(0);

  // Helper function to update a value in the Fenwick tree.
  // `targetIdx` is 0-indexed, `deltaValue` is the amount to add or subtract.
  const modifyFenwick = (targetIdx, deltaValue) => {
    // Convert to 1-indexed for BIT operations.
    let bitPosition = targetIdx + 1;
    // Traverse up the tree, updating parent nodes.
    while (bitPosition <= totalElements + 1) { // Upper bound for 1-indexed BIT.
      bitStructure[bitPosition] += deltaValue;
      bitPosition += (bitPosition & -bitPosition); // Move to the next parent node.
    }
  };

  // Helper function to retrieve the cumulative sum up to a specific index from the Fenwick tree.
  // `targetIdx` is 0-indexed.
  const retrieveFenwickSum = (targetIdx) => {
    let currentTotal = 0;
    // Convert to 1-indexed for BIT operations.
    let bitPosition = targetIdx + 1;
    // Traverse down the tree, summing up relevant nodes.
    while (bitPosition > 0) {
      currentTotal += bitStructure[bitPosition];
      bitPosition -= (bitPosition & -bitPosition); // Move to the next component.
    }
    return currentTotal;
  };

  // 5. Main Processing Loop: Iterate Backwards
  // Processing from right to left allows us to use the Fenwick tree to efficiently
  // count distinct elements by adding 'next occurrences' as we move left.
  for (let currentProcessingPosition = totalElements - 1; currentProcessingPosition >= 0; currentProcessingPosition--) {

    // For the current `currentProcessingPosition`, add all its 'subsequentAppearances' to the BIT.
    // These subsequent appearances mark elements that are NOT distinct if they fall within a query range.
    for (const nextAppearanceIndex of subsequentAppearances[currentProcessingPosition]) {
      modifyFenwick(nextAppearanceIndex, 1); // Increment count for this non-distinct element.
    }

    // Now, process all queries that have their starting point at `currentProcessingPosition`.
    // This is a guard clause: only iterate if there are queries to process.
    if (queriesGroupedByStart[currentProcessingPosition].length > 0) {
      for (const currentQueryData of queriesGroupedByStart[currentProcessingPosition]) {
        const { rightBoundary, originalQueryIndex } = currentQueryData;

        // Query the Fenwick tree to find how many 'subsequent appearances' (non-distinct elements)
        // exist within the range [currentProcessingPosition, rightBoundary].
        const countOfNonDistinct = retrieveFenwickSum(rightBoundary);

        // Calculate the number of distinct elements:
        // (Total elements in the range) - (Count of non-distinct elements).
        // Total elements in range: (rightBoundary - currentProcessingPosition + 1).
        finalResults[originalQueryIndex] = (rightBoundary - currentProcessingPosition + 1) - countOfNonDistinct;
      }
    }
  }

  // 6. Output Final Results
  // Iterate through the `finalResults` array and print each answer.
  finalResults.forEach(queryAnswer => console.log(queryAnswer));

  // The function implicitly returns `undefined` as no explicit value is needed.
}

// Entry point: Read input from standard input and invoke the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));