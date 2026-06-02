console.log(function(inputStr) {
  // Trim leading/trailing whitespace and split the input into individual lines.
  const lineData = inputStr.trim().split('\n');
  // The first line contains the number of entries; parse it as an integer.
  const numEntries = parseInt(lineData.shift(), 10);

  // An array to store processed details for each entry string.
  const entryDetails = [];
  // Variables to track the overall balance of parentheses and counts of specific characters.
  let overallBalance = 0;
  let leadingOpenCount = 0;
  let trailingCloseCount = 0;

  // Iterate through each input line to extract and calculate its properties.
  for (let idx = 0; idx < numEntries; idx++) {
    // Store the first and last characters of the string, and initialize its balance.
    entryDetails[idx] = {
      initialChar: lineData[idx][0],
      finalChar: lineData[idx][lineData[idx].length - 1],
      balanceValue: 0
    };

    // Calculate the balance value for the current string: +1 for '(', -1 for ')'.
    for (let charIdx = 0, strLen = lineData[idx].length; charIdx < strLen; charIdx++) {
      if (lineData[idx][charIdx] === '(') {
        entryDetails[idx].balanceValue++;
      } else if (lineData[idx][charIdx] === ')') {
        entryDetails[idx].balanceValue--;
      }
    }

    // Accumulate the overall balance and count specific starting/ending characters.
    overallBalance += entryDetails[idx].balanceValue;
    if (entryDetails[idx].initialChar === '(') {
      leadingOpenCount++;
    }
    if (entryDetails[idx].finalChar === ')') {
      trailingCloseCount++;
    }
  }

  // Perform initial checks for impossible scenarios.
  // If the total balance is not zero, or if there are no leading '(' or trailing ')',
  // it's impossible to form a valid sequence.
  if (overallBalance !== 0 || !leadingOpenCount || !trailingCloseCount) {
    return 'No';
  }

  // If there's only one entry, and it passed the initial checks, it must be valid.
  if (numEntries === 1) {
    return 'Yes';
  }

  // Sort the entries by their balance value in descending order.
  // This heuristic might help find a solution faster, but doesn't change correctness.
  entryDetails.sort((firstEntry, secondEntry) => secondEntry.balanceValue - firstEntry.balanceValue);

  // Calculate the bitmask representing all entries being used.
  const allMask = (1 << numEntries) - 1;

  // Initialize a stack for DFS-like exploration and a memoization array to track visited states.
  const processingQueue = [];
  // The visitedStates array needs to be sized to accommodate all possible bitmasks up to 'allMask'.
  const visitedStates = Array(allMask + 1).fill(false);

  // Populate the initial processing queue with valid starting entries.
  for (let idx = 0; idx < numEntries; idx++) {
    const { initialChar, balanceValue } = entryDetails[idx];
    // An entry can only start a sequence if it begins with '(' and its balance doesn't immediately go negative.
    if (initialChar === ')' || balanceValue < 0) {
      continue;
    }
    // Push the initial state: a bitmask indicating this entry is used, and its current balance.
    processingQueue.push({ maskUsed: 1 << idx, currentBalance: balanceValue });
  }

  // Main loop for exploring possible combinations using a stack (DFS).
  while (processingQueue.length > 0) {
    const currentPath = processingQueue.pop(); // Get the current state to expand.

    // Iterate through all entries to find one to append to the current path.
    for (let idx = 0; idx < numEntries; idx++) {
      // Skip this entry if it's already part of the current path (indicated by the bitmask).
      if ((currentPath.maskUsed & (1 << idx)) !== 0) {
        continue;
      }

      // Calculate the new bitmask and the new cumulative balance.
      const newMask = currentPath.maskUsed | (1 << idx);
      const newBalance = currentPath.currentBalance + entryDetails[idx].balanceValue;

      // If all entries have now been used in this path.
      if (newMask === allMask) {
        // Check if the last added entry ends with ')' and the final balance is zero.
        if (entryDetails[idx].finalChar === ')' && newBalance === 0) {
          return 'Yes'; // A valid combination is found.
        }
        // If not a valid final state, continue to the next iteration (try other entries).
        continue;
      }

      // If this specific state (combination of used entries and current balance) has been visited,
      // or if the balance goes negative (invalid intermediate state), skip.
      if (visitedStates[newMask] && newBalance < 0) {
        continue;
      }

      // Mark this new state as visited to avoid redundant computations.
      visitedStates[newMask] = true;
      // Add the new state to the queue for further exploration.
      processingQueue.push({ maskUsed: newMask, currentBalance: newBalance });
    }
  }

  // If the loop completes without finding any valid combination.
  return 'No';
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
