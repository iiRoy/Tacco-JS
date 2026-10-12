const parseInteger = (str) => Number.parseInt(str, 10);

let rawInputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (rawInputBuffer += chunk));
process.stdin.on('end', () => {
  let processedLines = rawInputBuffer.split('\n').map((line) => line.trim());
  if (processedLines[processedLines.length - 1] === '') {
    processedLines = processedLines.slice(0, -1);
  }
  executeLogic(processedLines);
});

function executeLogic(allInputLines) {
  const firstLineValues = allInputLines[0].split(' ').map(parseInteger);
  const itemCount = firstLineValues[0];
  const capacityLimit = firstLineValues[1];

  let maxAchievedValue = 0;

  const itemData = allInputLines.slice(1).map((line) => line.split(' ').map(parseInteger));

  // Iterative Depth-First Search (DFS) simulation of the original recursive function.
  // Each element in the stack represents a 'frame' of the original recursive call.
  // A frame stores: [
  //   startingIndexForLoop,     // Corresponds to 'ai' in the original 'iter' function
  //   currentTotalWeight,       // Corresponds to 'aw'
  //   currentTotalValue,        // Corresponds to 'av'
  //   nextLoopIterationIndex    // Corresponds to 'i' in the original 'for' loop,
  //                             // indicating the next item to try from 'startingIndexForLoop'
  // ]
  const explorationStack = [];

  // Initialize the stack with the equivalent of the initial call: iter(0, 0, 0)
  // The 'nextLoopIterationIndex' for the initial frame starts at its 'startingIndexForLoop'.
  explorationStack.push([0, 0, 0, 0]);

  while (explorationStack.length > 0) {
    // Get the current frame from the top of the stack to process its state.
    // We use a reference to mutate the loop counter in place.
    const currentFrame = explorationStack[explorationStack.length - 1];
    const [currentStartingIndex, currentTotalWeight, currentTotalValue, nextLoopIterationIndex] = currentFrame;

    // Check the base case: if the 'ai' (currentStartingIndex) has reached 'itemCount' (N).
    // This check happens at the very beginning of the original recursive function.
    if (currentStartingIndex === itemCount) {
      console.log(maxAchievedValue);
      process.exit();
    }

    // If the 'for' loop for the current frame has exhausted all its iterations (i.e., 'i' >= N),
    // then this frame is complete. Pop it from the stack to simulate returning from recursion.
    if (nextLoopIterationIndex >= itemCount) {
      explorationStack.pop();
      continue;
    }

    // Extract weight and value for the item at 'nextLoopIterationIndex' (which is 'i' in the original loop).
    const currentItemWeight = itemData[nextLoopIterationIndex][0];
    const currentItemValue = itemData[nextLoopIterationIndex][1];

    // Increment the 'nextLoopIterationIndex' for the *current* frame.
    // This prepares the current frame for its next loop iteration if it's revisited,
    // or ensures it's correctly positioned if a new frame is pushed on top.
    currentFrame[3]++;

    // Check if adding the current item keeps the total weight within the capacity limit.
    if (currentItemWeight + currentTotalWeight <= capacityLimit) {
      // Update the global maximum value found so far.
      maxAchievedValue = Math.max(maxAchievedValue, currentItemValue + currentTotalValue);

      // Simulate the recursive call: iter(i+1, w + aw, v + av)
      // Push a new frame onto the stack.
      // The new frame's 'startingIndexForLoop' is 'i+1' (nextLoopIterationIndex + 1).
      // Its 'nextLoopIterationIndex' also starts from 'i+1' to begin its own loop.
      explorationStack.push([
        nextLoopIterationIndex + 1,
        currentItemWeight + currentTotalWeight,
        currentItemValue + currentTotalValue,
        nextLoopIterationIndex + 1,
      ]);
    }
  }

  // This line is reached only if `process.exit()` is never called.
  // In the context of the original problem's logic, if `itemCount` is non-negative,
  // the `process.exit()` within the base case will always be triggered.
  // Therefore, this line is effectively dead code, but its presence is preserved
  // to maintain exact observable behavior.
  console.log(maxAchievedValue);
}
