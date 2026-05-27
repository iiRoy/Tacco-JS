function parseInteger(s) { return parseInt(s, 10); }

class EarlyExitSignal extends Error {
    constructor(finalValue) {
        super("Program terminated early with value: " + finalValue);
        this.name = "EarlyExitSignal";
        this.exitValue = finalValue;
    }
}

let rawInputData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => rawInputData += chunk);
process.stdin.on('end', () => {
  let processedLines = rawInputData.split('\n').map(line => line.trim());
  if (processedLines[processedLines.length - 1] === '') {
    processedLines = processedLines.slice(0, -1);
  }
  executeMainLogic(processedLines);
});

function executeMainLogic(inputContent) {
  const initialParameters = inputContent[0].split(' ').map(parseInteger);
  const targetItemCount = initialParameters[0];
  const maxCapacity = initialParameters[1];

  const itemData = inputContent.slice(1).map(line => line.split(' ').map(parseInteger));

  let maxAchievedValue = 0;

  // Use an explicit stack for iterative depth-first search (DFS)
  // Each element in the stack: [nextConsiderIndex, currentAccumulatedWeight, currentAccumulatedValue, currentItemsPickedCount]
  const searchStack = [[0, 0, 0, 0]];

  try {
    while (searchStack.length > 0) {
      const [nextConsiderIndex, currentAccumulatedWeight, currentAccumulatedValue, currentItemsPickedCount] = searchStack.pop();

      // Check for early exit condition: exactly 'targetItemCount' items picked
      if (currentItemsPickedCount === targetItemCount) {
        // Ensure the current path's value is considered for the global maximum before exiting
        maxAchievedValue = Math.max(maxAchievedValue, currentAccumulatedValue);
        throw new EarlyExitSignal(maxAchievedValue);
      }

      // Iterate through available items from 'nextConsiderIndex' up to 'targetItemCount - 1'
      // To match the original's DFS exploration order (leftmost branch first),
      // push items onto the stack in reverse order of iteration.
      for (let itemIndex = targetItemCount - 1; itemIndex >= nextConsiderIndex; itemIndex--) {
        const itemWeight = itemData[itemIndex][0];
        const itemValue = itemData[itemIndex][1];

        // If adding this item does not exceed max capacity
        if (currentAccumulatedWeight + itemWeight <= maxCapacity) {
          const newWeight = currentAccumulatedWeight + itemWeight;
          const newValue = currentAccumulatedValue + itemValue;
          const newItemsPickedCount = currentItemsPickedCount + 1;

          // Update global maximum value found so far, matching original's timing
          maxAchievedValue = Math.max(maxAchievedValue, newValue);

          // Push new state onto stack for further exploration
          searchStack.push([
            itemIndex + 1, // Start considering from the next item
            newWeight,
            newValue,
            newItemsPickedCount
          ]);
        }
      }
    }
  } catch (e) {
    if (e instanceof EarlyExitSignal) {
      console.log(e.exitValue);
      process.exit(0);
    } else {
      throw e; // Re-throw any other unexpected errors
    }
  }

  // If the search completes without an early exit, print the final max value
  console.log(maxAchievedValue);
}
