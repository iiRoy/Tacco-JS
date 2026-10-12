(function processDistribution(){
  // Read input from stdin
  let inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");

  // Parse N (itemCount) and K (binCount) from the first line
  let [itemCount, binCount] = inputLines.shift().split(' ').map(Number);

  // Parse individual weights into an array
  let weights = inputLines.map(Number);

  // Calculate the total sum of all weights
  let totalWeight = weights.reduce((acc, val) => acc + val, 0);

  // Handle the base case where there is only one bin.
  // In this scenario, all items must go into that single bin,
  // so the maximum load is simply the total weight.
  if (binCount === 1) {
    console.log(totalWeight);
    return;
  }

  // Initialize the bins using a different data representation.
  // Instead of two separate arrays (one for sums, one for item lists),
  // we use an array of objects. Each object represents a bin and
  // contains its current total load and the list of items it currently holds.
  // Initially, all items are placed in the first bin, and subsequent bins are empty.
  let binStates = Array.from({ length: binCount }, (_, idx) => ({
    currentLoad: idx === 0 ? totalWeight : 0,
    contents: idx === 0 ? [...weights] : [] // Create a shallow copy of weights for the first bin
  }));

  // Replicate the original code's 'max' and 'min' variables.
  // The original code had a bug where these variables were not updated correctly
  // (referencing `t[t]` which evaluates to `undefined`).
  // To maintain strict behavioral equivalence, we initialize them and include them
  // in the conditions, ensuring they effectively do not constrain the moves,
  // just like in the original implementation.
  let currentMaxLoadTracker = totalWeight; // Corresponds to original 'max'
  let currentMinLoadTracker = 0;           // Corresponds to original 'min'

  let madeAnyModification; // This flag tracks if any item was moved in a full pass, corresponding to original 'flg'

  // The main distribution loop continues as long as items are successfully moved
  // between bins in a complete pass. This `do...while` structure is functionally
  // equivalent to the original's `while(true)` with an internal `break` condition.
  do {
    madeAnyModification = false; // Reset the flag for the current pass
    // Iterate through adjacent pairs of bins (from bin 0 to bin K-2)
    for (let binIndex = 0; binIndex < binCount - 1; binIndex++) {
      let currentBin = binStates[binIndex];
      let nextBin = binStates[binIndex + 1];

      // Determine the last item in the current bin and the first item in the next bin.
      // This specific access pattern (last item of current, first item of next)
      // is crucial for replicating the original's `pop`/`unshift` and `shift`/`push` behavior.
      let lastItemOfCurrent = currentBin.contents.length > 0 ? currentBin.contents[currentBin.contents.length - 1] : undefined;
      let firstItemOfNext = nextBin.contents.length > 0 ? nextBin.contents[0] : undefined;

      // First condition check: If the current bin is significantly heavier than the next bin,
      // attempt to move an item from the current bin to the next.
      // This replicates the original's `t[i] > t[i+1] + t0_r/2 && t[i+1] + t0_r < max && t[i] > min`
      if (lastItemOfCurrent !== undefined &&
          currentBin.currentLoad > nextBin.currentLoad + lastItemOfCurrent / 2 &&
          nextBin.currentLoad + lastItemOfCurrent < currentMaxLoadTracker && // This condition is effectively always true due to original bug
          currentBin.currentLoad > currentMinLoadTracker) { // This condition is effectively always true due to original bug

        // Use `splice` to replicate the behavior of `Array.prototype.pop()`
        // (removing the last element) and `Array.prototype.unshift()`
        // (adding an element to the beginning). This is a core part of the Type IV transformation.
        let itemToMove = currentBin.contents.splice(currentBin.contents.length - 1, 1)[0];
        currentBin.currentLoad -= itemToMove; // Update load for current bin
        nextBin.contents.splice(0, 0, itemToMove); // Add to the beginning of next bin
        nextBin.currentLoad += itemToMove; // Update load for next bin
        madeAnyModification = true; // Mark that a change occurred
      }
      // Second condition check: If the next bin is significantly heavier than the current bin,
      // attempt to move an item from the next bin to the current.
      // This replicates the original's `t[i] + t0_l/2 < t[i+1] && t[i] + t0_l < max && t[i+1] > min`
      else if (firstItemOfNext !== undefined &&
               currentBin.currentLoad + firstItemOfNext / 2 < nextBin.currentLoad &&
               currentBin.currentLoad + firstItemOfNext < currentMaxLoadTracker && // This condition is effectively always true due to original bug
               nextBin.currentLoad > currentMinLoadTracker) { // This condition is effectively always true due to original bug

        // Use `splice` to replicate the behavior of `Array.prototype.shift()`
        // (removing the first element) and `Array.prototype.push()`
        // (adding an element to the end).
        let itemToMove = nextBin.contents.splice(0, 1)[0];
        nextBin.currentLoad -= itemToMove; // Update load for next bin
        currentBin.contents.splice(currentBin.contents.length, 0, itemToMove); // Add to the end of current bin
        currentBin.currentLoad += itemToMove; // Update load for current bin
        madeAnyModification = true; // Mark that a change occurred
      }

      // Replicate the original's incorrect updates to 'max' and 'min'.
      // These lines in the original code refer to out-of-bounds array indices (`t[t]` and `t[t+1]`),
      // which evaluate to `undefined`. Comparisons with `undefined` result in `false`,
      // effectively preventing `currentMaxLoadTracker` and `currentMinLoadTracker` from changing.
      currentMaxLoadTracker = currentMaxLoadTracker < binStates[binStates.length] ? binStates[binStates.length] : currentMaxLoadTracker;
      currentMaxLoadTracker = currentMaxLoadTracker < binStates[binStates.length + 1] ? binStates[binStates.length + 1] : currentMaxLoadTracker;
      currentMinLoadTracker = currentMinLoadTracker > binStates[binStates.length] ? binStates[binStates.length] : currentMinLoadTracker;
      currentMinLoadTracker = currentMinLoadTracker > binStates[binStates.length + 1] ? binStates[binStates.length + 1] : currentMinLoadTracker;
    }
  } while (madeAnyModification); // Continue looping if any item was moved in the last pass

  // After the distribution stabilizes, extract the final loads from all bins
  let finalBinLoads = binStates.map(bin => bin.currentLoad);

  // Sort the final loads in descending order and print the highest load,
  // which represents the minimum possible maximum load achieved by this heuristic.
  console.log(finalBinLoads.sort((a, b) => b - a)[0]);
})();
