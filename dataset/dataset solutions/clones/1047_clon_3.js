(function executeProcess() {
  const fileSystem = require('fs');
  const inputFilePath = '/dev/stdin';
  const rawInput = fileSystem.readFileSync(inputFilePath, 'utf8');
  const inputLines = rawInput.trim().split("\n");

  const firstLineData = inputLines.shift().split(' ');
  // The original 'n' (numItems) was read but never used, so it's removed.
  const numContainers = Number(firstLineData[1]); // Original 'k'

  const itemWeights = inputLines.map(Number); // Original 'w'
  const totalWeight = itemWeights.reduce((previousValue, currentValue) => previousValue + currentValue, 0); // Original 'sum'

  if (numContainers === 1) {
    console.log(totalWeight);
    return;
  }

  // Initialize container loads and contents arrays
  const containerLoads = new Array(numContainers).fill(0); // Original 't'
  // Using Array.from to ensure each element is a distinct empty array
  const containerContents = Array.from({ length: numContainers }, () => []); // Original 't2'

  containerLoads[0] = totalWeight;
  containerContents[0] = [...itemWeights]; // Shallow copy of itemWeights to the first container

  // The original 'max' and 'min' variables were effectively constant due to a bug
  // in their update logic within the loop. They were initialized to 'sum' and '0'
  // respectively, and never actually changed. We preserve this behavior by making
  // them explicit constants.
  const maxLoadThreshold = totalWeight; // Original 'max'
  const minLoadThreshold = 0; // Original 'min'

  let movementOccurredInIteration = false; // Original 'flg'

  while (true) {
    movementOccurredInIteration = false;
    const lastPossibleContainerIndex = numContainers - 1; // Helper constant for loop boundary

    for (let currentContainerIndex = 0; currentContainerIndex < lastPossibleContainerIndex; currentContainerIndex++) {
      const nextContainerIndex = currentContainerIndex + 1;

      const currentContainerLoad = containerLoads[currentContainerIndex];
      const nextContainerLoad = containerLoads[nextContainerIndex];

      // Retrieve the first and last item weights from the current container.
      // If the container is empty, these will be 'undefined', which implicitly
      // causes conditions involving them (e.g., division by 2 resulting in NaN)
      // to evaluate to false, matching the original code's behavior.
      const firstItemOfCurrentContainer = containerContents[currentContainerIndex][0]; // Original 't0_l'
      const lastItemOfCurrentContainer = containerContents[currentContainerIndex][containerContents[currentContainerIndex].length - 1]; // Original 't0_r'

      // Condition to move an item from the current container to the next container
      // (pop from current, unshift to next)
      // Original: t[i] > t[i+1] + t0_r/2 && t[i+1] + t0_r < max && t[i] > min
      if (currentContainerLoad > nextContainerLoad + lastItemOfCurrentContainer / 2 &&
          nextContainerLoad + lastItemOfCurrentContainer < maxLoadThreshold &&
          currentContainerLoad > minLoadThreshold) {

        const itemToTransfer = containerContents[currentContainerIndex].pop(); // Original 'tmp'
        containerLoads[currentContainerIndex] -= itemToTransfer;
        containerLoads[nextContainerIndex] += itemToTransfer;
        containerContents[nextContainerIndex].unshift(itemToTransfer);
        movementOccurredInIteration = true;
      }
      // Condition to move an item from the next container to the current container
      // (shift from next, push to current)
      // Original: t[i] + t0_l/2 < t[i+1] && t[i] + t0_l < max && t[i+1] > min
      else if (currentContainerLoad + firstItemOfCurrentContainer / 2 < nextContainerLoad &&
               currentContainerLoad + firstItemOfCurrentContainer < maxLoadThreshold &&
               nextContainerLoad > minLoadThreshold) {

        const itemToTransfer = containerContents[nextContainerIndex].shift(); // Original 'tmp'
        containerLoads[nextContainerIndex] -= itemToTransfer;
        containerLoads[currentContainerIndex] += itemToTransfer;
        containerContents[currentContainerIndex].push(itemToTransfer);
        movementOccurredInIteration = true;
      }
      // The original code contained lines attempting to update 'max' and 'min'
      // (e.g., `max = max < t[t] ? t[t] : max;`). These lines were functionally
      // inert due to a bug where `t[t]` evaluates to `undefined`, causing `max`
      // and `min` to retain their initial values. These non-essential, buggy
      // lines have been removed to reflect the actual observable behavior.
    }

    if (!movementOccurredInIteration) {
      break; // Exit loop if no items were moved in the current iteration
    }
  }

  // Calculate the maximum load among all containers.
  // This is an equivalent and more direct way to find the maximum value
  // compared to sorting the array and taking the first element.
  const finalMaximumContainerLoad = Math.max(...containerLoads);
  console.log(finalMaximumContainerLoad);
})();
