(function(rawInput){

  let processedLines = rawInput.trim().split('\n');

  const dimensionSize = Number(processedLines.shift());
  const totalCombinations = Math.pow(2, dimensionSize);
  const resultModulus = Math.pow(10, 9) + 7;

  const affinityMatrix = [];
  for (let rowIdx = 0; rowIdx < dimensionSize; rowIdx++) {
      affinityMatrix.push(processedLines[rowIdx].split(' ').map(s => Number(s)));
  }

  const solutionRegistry = new Map();

  function computeArrangementCount(currentStage, allocatedPositionsVector) {
      if (currentStage < 0) {
          return (allocatedPositionsVector === 0) ? 1 : 0;
      }

      const registrationKey = `${currentStage},${allocatedPositionsVector}`;

      if (solutionRegistry.has(registrationKey)) {
          return solutionRegistry.get(registrationKey);
      }

      let cumulativeSum = 0;

      for (let potentialPosition = 0; potentialPosition < dimensionSize; potentialPosition++) {
          const isPositionAvailable = ((allocatedPositionsVector >>> potentialPosition) & 1) === 1;
          const hasAffinity = affinityMatrix[currentStage][potentialPosition] === 1;

          if (isPositionAvailable && hasAffinity) {
              let priorStageCount = computeArrangementCount(
                  currentStage - 1,
                  allocatedPositionsVector ^ (1 << potentialPosition)
              );
              cumulativeSum = (cumulativeSum + priorStageCount) % resultModulus;
          }
      }

      solutionRegistry.set(registrationKey, cumulativeSum);
      return cumulativeSum;
  }

  const finalResult = computeArrangementCount(dimensionSize - 1, totalCombinations - 1);

  console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));