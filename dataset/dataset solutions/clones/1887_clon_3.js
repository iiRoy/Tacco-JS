console.log(function(rawInputString){
  // Parse the raw input string into individual lines representing bracket sequences.
  const processedLines = rawInputString.trim().split('\n');
  
  // Extract the total number of bracket sequences from the first line.
  const totalBracketSequences = parseInt(processedLines.shift(), 10);

  // Validate the initial input: if no valid number or zero/negative sequences, return 'No'.
  if (isNaN(totalBracketSequences) || totalBracketSequences <= 0) {
    return 'No';
  }

  // Array to store detailed properties for each bracket sequence.
  const sequenceProperties = [];
  
  // Accumulators for overall statistical checks.
  let cumulativeBalanceSum = 0;
  let initialOpenBracketCount = 0;
  let finalClosingBracketCount = 0;

  // Iterate through each sequence to analyze its properties.
  for (let sequenceIndex = 0; sequenceIndex < totalBracketSequences; sequenceIndex++) {
    const currentSequenceText = processedLines[sequenceIndex];
    let currentSequenceBalance = 0;
    let minimumBalanceDuringScan = 0; // Tracks lowest balance achieved within this sequence.
    const sequenceLength = currentSequenceText.length;

    // Calculate the net balance and the minimum balance encountered while scanning the sequence.
    for (let charPosition = 0; charPosition < sequenceLength; charPosition++) {
      const character = currentSequenceText[charPosition];
      if (character === '(') {
        currentSequenceBalance++;
      } else if (character === ')') {
        currentSequenceBalance--;
      }
      minimumBalanceDuringScan = Math.min(minimumBalanceDuringScan, currentSequenceBalance);
    }

    // Store the computed properties for the current sequence.
    sequenceProperties[sequenceIndex] = {
      firstChar: currentSequenceText[0],
      lastChar: currentSequenceText[sequenceLength - 1],
      netBalance: currentSequenceBalance,
      minPathBalance: minimumBalanceDuringScan
    };

    // Update overall statistics.
    cumulativeBalanceSum += sequenceProperties[sequenceIndex].netBalance;
    if (sequenceProperties[sequenceIndex].firstChar === '(') {
      initialOpenBracketCount++;
    }
    if (sequenceProperties[sequenceIndex].lastChar === ')') {
      finalClosingBracketCount++;
    }
  }

  // Apply early exit conditions based on aggregated properties.
  // A valid final string must have a total balance of zero, and must start/end correctly.
  if (cumulativeBalanceSum !== 0 || initialOpenBracketCount === 0 || finalClosingBracketCount === 0) {
    return 'No';
  }

  // Special handling for a single bracket sequence.
  if (totalBracketSequences === 1) {
    // For a single sequence, it must be perfectly balanced and never dip below zero internally.
    if (sequenceProperties[0].netBalance === 0 && sequenceProperties[0].minPathBalance >= 0) {
        return 'Yes';
    } else {
        return 'No';
    }
  }

  // Heuristically sort the sequences by their net balance in descending order.
  // This can help the search find solutions faster but is not strictly required for correctness.
  sequenceProperties.sort((a, b) => b.netBalance - a.netBalance);

  // Setup for a state-space search using a stack (DFS-like).
  // The 'mask' represents the set of sequences already used in a path.
  const allItemsProcessedMask = (1 << totalBracketSequences) - 1;
  const pathExplorationStack = [];
  
  // Memoization array to track visited masks and prune redundant paths.
  // Stores true if a mask has been visited (with a non-negative balance path).
  const visitedMasksForPruning = new Array(1 << totalBracketSequences).fill(false);

  // Initialize the exploration stack with valid starting sequences.
  for (let currentSeqIdx = 0; currentSeqIdx < totalBracketSequences; currentSeqIdx++) {
    const currentSeqDetails = sequenceProperties[currentSeqIdx];

    // A valid starting sequence must begin with an opening bracket
    // and its internal balance should never drop below zero.
    if (currentSeqDetails.firstChar === '(' && currentSeqDetails.minPathBalance >= 0) {
      const initialMask = (1 << currentSeqIdx);
      pathExplorationStack.push({
        currentUsedMask: initialMask,
        currentAccumulatedBalance: currentSeqDetails.netBalance
      });
      visitedMasksForPruning[initialMask] = true; // Mark this initial state as visited.
    }
  }
  
  // If no valid starting points are found, it's impossible to form a balanced string.
  if (pathExplorationStack.length === 0) {
      return 'No';
  }

  // Main loop for exploring all possible concatenations.
  while (pathExplorationStack.length > 0) {
    const currentState = pathExplorationStack.pop();
    const { currentUsedMask, currentAccumulatedBalance } = currentState;

    // Attempt to append each remaining (unused) sequence to the current path.
    for (let nextSeqIdx = 0; nextSeqIdx < totalBracketSequences; nextSeqIdx++) {
      const nextSeqDetails = sequenceProperties[nextSeqIdx];
      const nextSequenceBit = (1 << nextSeqIdx);

      // Skip if this sequence is already part of the current path.
      if ((currentUsedMask & nextSequenceBit) !== 0) {
        continue;
      }

      // Calculate the new state (mask and total balance) after appending the next sequence.
      const newUsedMask = currentUsedMask | nextSequenceBit;
      const newTotalBalance = currentAccumulatedBalance + nextSeqDetails.netBalance;

      // Pruning: If adding this sequence causes the balance to drop below zero
      // at any point *during* the new sequence itself (relative to the current accumulated balance),
      // then this path is immediately invalid.
      if (currentAccumulatedBalance + nextSeqDetails.minPathBalance < 0) {
          continue;
      }

      // Check if all sequences have been combined in this path.
      if (newUsedMask === allItemsProcessedMask) {
        // A successful combination must end with a closing bracket and have a total balance of zero.
        if (nextSeqDetails.lastChar === ')' && newTotalBalance === 0) {
          return 'Yes'; // Solution found!
        }
        // If not a solution, this path ends here.
        continue;
      }

      // Memoization and Pruning for intermediate states:
      // If this specific set of used sequences (mask) has been visited before,
      // AND the new path's total balance is negative, then this path is considered redundant/unpromising.
      if (visitedMasksForPruning[newUsedMask] && newTotalBalance < 0) {
        continue;
      }
      
      // If the mask hasn't been visited before, or if it has but the new total balance is non-negative,
      // mark this state as visited and add it to the stack for further exploration.
      // This allows paths with non-negative balances to re-explore masks, which is a heuristic.
      if (!visitedMasksForPruning[newUsedMask] || newTotalBalance >= 0) {
          visitedMasksForPruning[newUsedMask] = true;
          pathExplorationStack.push({
              currentUsedMask: newUsedMask,
              currentAccumulatedBalance: newTotalBalance
          });
      }
    }
  }

  // If the loop completes without finding a solution, no valid combination exists.
  return 'No';
}(require('fs').readFileSync('/dev/stdin', 'utf8')));