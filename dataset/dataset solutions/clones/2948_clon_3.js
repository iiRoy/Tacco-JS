function ExecuteMedianOperations(dataLinesPayload) {
  // Process the raw input string: split into lines and filter out any empty lines.
  const processedLines = dataLinesPayload.split(/\r?\n/).filter(line => line.trim() !== '');

  // Extract the initial operation count from the first line.
  // Although this value ('Q' in the original problem) is not utilized in subsequent logic,
  // its parsing is retained for structural fidelity.
  const initialOperationCount = processedLines[0].split(' ')[0];

  // Initialize a running aggregate that tracks costs or deviations based on operations.
  let cumulativeCostTracker = 0;

  // This array will store numeric values and is maintained in sorted ascending order.
  const sortedNumericSequence = [];

  // Variables for managing insertion points and binary search bounds.
  let insertionIndex;
  let searchLowerBound, searchUpperBound, searchMidPoint;

  // Temporary variable to hold parsed details of the current operation.
  let currentOperationDetails;

  // Iterate through each operation line, starting from the second line of input.
  // The first line typically contains metadata like the total number of operations.
  for (let lineIterator = 1; lineIterator < processedLines.length; lineIterator++) {
    const currentLine = processedLines[lineIterator]; // Capture the current line for processing.

    // If the current line indicates a query to print the median and current cost.
    if (currentLine === '2') {
      // Calculate the index for the effective median.
      // For an array of length N, this formula gives:
      // - (N/2) - 1 for even N (the first of the two middle elements)
      // - (N-1)/2 for odd N (the single middle element)
      const effectiveMedianIndex = Math.ceil(sortedNumericSequence.length / 2) - 1;
      const currentMedianValue = sortedNumericSequence[effectiveMedianIndex];

      // Output the effective median and the accumulated cost.
      console.log(`${currentMedianValue} ${cumulativeCostTracker}`);
    } else {
      // This block handles operations to insert a new value and update the cost tracker.
      // Parse the line: split by space, take elements from index 1, and convert to numbers.
      currentOperationDetails = currentLine.split(' ').slice(1).map(element => Number(element));

      // Add a basic validation to ensure the parsed operation details are valid numbers.
      if (currentOperationDetails.length < 2 || isNaN(currentOperationDetails[0]) || isNaN(currentOperationDetails[1])) {
        // In a real-world scenario, error logging might occur here. For competitive programming,
        // valid input is usually guaranteed, but this adds a robustness fragment.
        continue; // Skip to the next line if the input is malformed.
      }

      const valueToInsert = currentOperationDetails[0]; // The numeric value to add to the sequence.
      const costComponent = currentOperationDetails[1]; // The cost to add to the aggregate tracker.

      // Special handling for the first element when the sequence is initially empty.
      if (sortedNumericSequence.length === 0) {
        sortedNumericSequence.push(valueToInsert); // Add the first value.
        cumulativeCostTracker += costComponent; // Accumulate its cost.
        continue; // Proceed to the next operation.
      }

      // Determine the correct position to insert 'valueToInsert' to maintain the sorted order.
      // Case 1: If the new value is greater than all existing elements, append it to the end.
      if (sortedNumericSequence[sortedNumericSequence.length - 1] < valueToInsert) {
        insertionIndex = sortedNumericSequence.length;
      }
      // Case 2: If the new value is less than or equal to the first element, prepend it.
      else if (sortedNumericSequence[0] >= valueToInsert) {
        insertionIndex = 0;
      }
      // Case 3: Otherwise, use binary search to find the appropriate insertion point within the array.
      else {
        searchUpperBound = sortedNumericSequence.length - 1;
        searchLowerBound = 0;

        // The binary search finds the index 'searchLowerBound' such that
        // sortedNumericSequence[searchLowerBound] < valueToInsert <= sortedNumericSequence[searchUpperBound].
        while (searchUpperBound - searchLowerBound > 1) {
          searchMidPoint = Math.floor((searchUpperBound + searchLowerBound) / 2);
          if (sortedNumericSequence[searchMidPoint] < valueToInsert) {
            searchLowerBound = searchMidPoint;
          } else {
            searchUpperBound = searchMidPoint;
          }
        }
        insertionIndex = searchLowerBound + 1; // The new value should be inserted after searchLowerBound.
      }

      // Adjust the cumulative cost based on the new value relative to the current median(s).
      // This is a specific cost adjustment logic based on the problem's requirements.
      if (sortedNumericSequence.length % 2 === 0) { // If the sequence length is even before insertion.
        const lowerMedianCandidateIndex = sortedNumericSequence.length / 2 - 1;
        const upperMedianCandidateIndex = sortedNumericSequence.length / 2;

        // If the new value is inserted to the right of the upper median candidate.
        if (insertionIndex > upperMedianCandidateIndex) {
          cumulativeCostTracker += valueToInsert - sortedNumericSequence[upperMedianCandidateIndex];
        }
        // If the new value is inserted to the left of the lower median candidate.
        else if (insertionIndex < upperMedianCandidateIndex) { // Note: this condition is equivalent to original `insert < a.length/2`
          cumulativeCostTracker += sortedNumericSequence[lowerMedianCandidateIndex] - valueToInsert;
        }
        // If insertionIndex == upperMedianCandidateIndex (i.e., between the two median candidates),
        // no additional cost adjustment from median shift occurs in this specific problem formulation.
      } else { // If the sequence length is odd before insertion.
        const currentSingleMedianIndex = Math.floor(sortedNumericSequence.length / 2);
        // Add the absolute difference between the new value and the current single median.
        cumulativeCostTracker += Math.abs(valueToInsert - sortedNumericSequence[currentSingleMedianIndex]);
      }

      // Insert the new value into the sorted sequence at the calculated position.
      sortedNumericSequence.splice(insertionIndex, 0, valueToInsert);

      // Finally, add the second component of the operation (the direct cost) to the tracker.
      cumulativeCostTracker += costComponent;
    }
  }
}

// Standard input reading and function invocation for competitive programming environments.
// This part remains unchanged as per typical problem setup.
ExecuteMedianOperations(require("fs").readFileSync("/dev/stdin", "utf8"));