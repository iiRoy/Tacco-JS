function processInputData() {
  let lineCount = parseInt(input[0], 10);
  let dataLines = input.slice(1);

  function determinePartitionPossibility(sequenceOfNumbers) {
    // An explicit stack to manage states for iterative depth-first search.
    // Each state is represented as an array:
    // [current_index_in_sequence, last_element_on_left_subsequence, last_element_on_right_subsequence]
    // The initial state starts at index 0, with 0 as a sentinel for both subsequences,
    // allowing any positive number to be the first element.
    const explorationStack = [[0, 0, 0]];

    // A Set to keep track of visited states to prevent redundant computations and infinite loops.
    // State keys are strings formed by concatenating the index and the last elements.
    const visitedStates = new Set();

    while (explorationStack.length > 0) {
      const [currentIdx, leftPeak, rightPeak] = explorationStack.pop();

      // If all numbers in the sequence have been successfully placed, a valid partition exists.
      if (currentIdx === sequenceOfNumbers.length) {
        return true;
      }

      // Construct a unique identifier for the current state.
      const stateIdentifier = `${currentIdx}-${leftPeak}-${rightPeak}`;

      // If this state has already been explored, skip it.
      if (visitedStates.has(stateIdentifier)) {
        continue;
      }
      visitedStates.add(stateIdentifier);

      const currentNumber = sequenceOfNumbers[currentIdx];

      // Attempt to place the current number onto the left subsequence.
      // It must be strictly greater than the last element currently on the left subsequence.
      if (currentNumber > leftPeak) {
        explorationStack.push([currentIdx + 1, currentNumber, rightPeak]);
      }

      // Attempt to place the current number onto the right subsequence.
      // It must be strictly greater than the last element currently on the right subsequence.
      if (currentNumber > rightPeak) {
        explorationStack.push([currentIdx + 1, leftPeak, currentNumber]);
      }
    }

    // If the exploration stack becomes empty and no solution was found,
    // it means no valid partition into two strictly increasing subsequences exists.
    return false;
  }

  // Iterate through each line of numerical data provided in the input.
  for (let k = 0; k < lineCount; k++) {
    const currentNumbers = dataLines[k].split(' ').map(parseFloat);
    console.log(determinePartitionPossibility(currentNumbers) ? 'YES' : 'NO');
  }
}

let input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  processInputData();
});
