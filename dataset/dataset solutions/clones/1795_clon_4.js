'use strict';
function ExecuteProcess(sourceData){
  const dataLines = sourceData.trim().split(/\r?\n/g);
  const parameters = dataLines[0].split(' ').map(str => Number(str));
  const dimensionSize = parameters[0];
  const cycleCount = parameters[1];
  let generationValues = dataLines[1].split(' ').map(str => Number(str));

  for(let cycleIndex = 0; cycleIndex < cycleCount; cycleIndex++){
      // Initialize an auxiliary array to track changes at specific points
      // This array will hold increments at start points and decrements at end points + 1
      let changeTracker = new Array(dimensionSize + 1).fill(0);

      // Iterate through the current generation's values to determine their "spread"
      // and mark these changes in the changeTracker array.
      for(let currentIdx = 0; currentIdx < dimensionSize; currentIdx++){
          const spreadingFactor = generationValues[currentIdx];
          const spanStart = Math.max(0, currentIdx - spreadingFactor);
          const spanEnd = Math.min(dimensionSize - 1, currentIdx + spreadingFactor);

          // Increment at the start of the effective span
          changeTracker[spanStart]++;
          // Decrement just after the end of the effective span, if within bounds
          if(spanEnd + 1 < dimensionSize){
              changeTracker[spanEnd + 1]--;
          }
      }

      // Compute the next generation's values by performing a prefix sum (cumulative sum)
      // on the changeTracker array.
      let nextGenerationValues = new Array(dimensionSize);
      let runningSum = 0;
      for(let resultIdx = 0; resultIdx < dimensionSize; resultIdx++){
          runningSum += changeTracker[resultIdx];
          nextGenerationValues[resultIdx] = runningSum;
      }
      // The newly computed values become the input for the next cycle
      generationValues = nextGenerationValues;
  }
  process.stdout.write(generationValues.join(' ') + '\n');
}

ExecuteProcess(require("fs").readFileSync("/dev/stdin", "utf8"));