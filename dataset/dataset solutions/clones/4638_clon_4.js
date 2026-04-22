const inputAcquirer = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let processedDataSource;
const receivedTextLines = [];

inputAcquirer.on('line', (lineContent) => { receivedTextLines.push(lineContent); });
inputAcquirer.on('close', () => {
  processedDataSource = createDataProcessor(receivedTextLines);
  performCalculation();
});

function createDataProcessor(rawLines) {
  const processorEntity = {
    contentList: rawLines,
    currentIndex: 0,
    listBoundary: rawLines.length,
    isNextAvailable: function() { return (this.currentIndex < this.listBoundary); },
    fetchNextEntry: function() {
      if (!this.isNextAvailable()) {
        throw new Error("Input stream exhausted.");
      }
      const entry = this.contentList[this.currentIndex];
      this.currentIndex++;
      return entry;
    }
  };
  return processorEntity;
}

function retrieveParsedNumbers() {
  return fetchNextSegment().split(' ').map(Number);
}

function fetchNextSegment() { return processedDataSource.fetchNextEntry(); }

function emitResult(value) { console.log(value); }

const performCalculation = () => {
    const [numStructures, minRequiredSelection] = retrieveParsedNumbers();
    const structureHeights = retrieveParsedNumbers();

    if (minRequiredSelection === 1) {
        emitResult(0);
        return;
    }

    // Recursive function to explore all subsets of structures and determine the minimum cost.
    // 'currentStructureIdx': The index of the structure currently being considered.
    // 'accumulatedExpense': The total cost incurred for selected structures in the current path.
    // 'runningMaxElevation': Represents the `maxH` variable from the original code. This keeps track
    //                        of the highest elevation encountered so far (either original height or raised height)
    //                        which dictates the minimum height for subsequent selected structures.
    // 'chosenCount': The number of structures selected in the current path.
    const evaluateElevationCost = (currentStructureIdx, accumulatedExpense, runningMaxElevation, chosenCount) => {
        // Base case: All structures have been processed.
        if (currentStructureIdx === numStructures) {
            // If we have chosen at least the minimum required number of structures,
            // this path is valid, return its accumulated expense. Otherwise, it's invalid.
            return (chosenCount >= minRequiredSelection) ? accumulatedExpense : Number.MAX_SAFE_INTEGER;
        }

        // Step 1: Calculate potential `runningMaxElevation` if the current structure's original height
        //         updates it, regardless of whether the current structure is selected.
        // This mirrors `maxH = Math.max(list[j], maxH);` from the original.
        const potentialNextMaxElevation = Math.max(structureHeights[currentStructureIdx], runningMaxElevation);

        // Option A: Do not select the current structure.
        // The accumulated expense and chosen count remain unchanged.
        // The `runningMaxElevation` for the next step is `potentialNextMaxElevation`.
        const costWithoutCurrent = evaluateElevationCost(
            currentStructureIdx + 1,
            accumulatedExpense,
            potentialNextMaxElevation,
            chosenCount
        );

        // Option B: Select the current structure.
        let additionalCostForCurrent = 0;
        let newRunningMaxElevationIfSelected = potentialNextMaxElevation;

        // Step 2: If selected, determine if the current structure needs to be raised
        //         and update `runningMaxElevation` accordingly.
        // This mirrors `if(maxH >= list[j]) { sum += ...; maxH++; }` from the original.
        if (potentialNextMaxElevation >= structureHeights[currentStructureIdx]) {
            additionalCostForCurrent = (potentialNextMaxElevation + 1) - structureHeights[currentStructureIdx];
            newRunningMaxElevationIfSelected++; // Increment `runningMaxElevation` as the structure was raised.
        }
        // If `potentialNextMaxElevation < structureHeights[currentStructureIdx]`, it means
        // `structureHeights[currentStructureIdx]` was already greater, so it becomes the
        // new `runningMaxElevation` without needing an additional increment.

        const costWithCurrent = evaluateElevationCost(
            currentStructureIdx + 1,
            accumulatedExpense + additionalCostForCurrent,
            newRunningMaxElevationIfSelected, // Pass the potentially incremented `runningMaxElevation`.
            chosenCount + 1
        );

        // Return the minimum expense from these two options.
        return Math.min(costWithoutCurrent, costWithCurrent);
    };

    // Initiate the recursive calculation starting from the first structure (index 0),
    // with no initial expense, an initial `runningMaxElevation` of 0, and 0 structures chosen.
    const finalMinimumCost = evaluateElevationCost(0, 0, 0, 0);

    emitResult(finalMinimumCost);
};