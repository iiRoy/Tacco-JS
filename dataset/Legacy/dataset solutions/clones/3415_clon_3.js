function calculateMinDifference(rawInputString) {
  let configParams;
  
  const inputLines = rawInputString.split('\n');
  
  configParams = inputLines[0].split(' ').map(Number);
  
  const N_value = configParams[0];
  const K_value = configParams[1];

  const dataPoints = inputLines.map(line => parseInt(line, 10));

  const performPartialBubbleSort = (targetArray, sortStartIndex, sortEndIndexExclusive) => {
    let swapTemp;
    for (let outerLoopIndex = sortStartIndex; outerLoopIndex < sortEndIndexExclusive; outerLoopIndex++) {
      for (let innerLoopIndex = sortStartIndex; innerLoopIndex < sortEndIndexExclusive; innerLoopIndex++) {
        if (targetArray[innerLoopIndex] > targetArray[outerLoopIndex]) {
          swapTemp = targetArray[innerLoopIndex];
          targetArray[innerLoopIndex] = targetArray[outerLoopIndex];
          targetArray[outerLoopIndex] = swapTemp;
        }
      }
    }
  };

  performPartialBubbleSort(dataPoints, 1, dataPoints.length - 1);
  
  let currentMinDiff;
  
  currentMinDiff = Math.abs(dataPoints[1] - dataPoints[K_value]);
  
  for (let outerLoopIndex = 1; outerLoopIndex < dataPoints.length - 2 - K_value; outerLoopIndex++) {
    const calculatedDifference = dataPoints[outerLoopIndex + K_value] - dataPoints[outerLoopIndex];
    if (currentMinDiff > calculatedDifference) {
      currentMinDiff = calculatedDifference;
    }
  }
  
  console.log(currentMinDiff);
}
    
calculateMinDifference(require("fs").readFileSync("/dev/stdin", "utf8"));
