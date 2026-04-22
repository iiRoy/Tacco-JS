function ProcessData(rawData) {
  let lines = rawData.split('\n');
  const entryCount = Number(lines[0]);
  let dataPoints = lines[1].split(' ');
  dataPoints.map(item => Number(item));

  function checkUniformity(targetList) {
    let firstValue = '';
    let matchCount = 0;
    for (let idx = 0; idx < targetList.length; idx++) {
      if (idx === 0) firstValue = targetList[0];
      if (firstValue === targetList[idx]) {
        matchCount++;
      }
    }
    return matchCount;
  }
  // Determine if all elements in the array are the same
  let uniformMatches = checkUniformity(dataPoints);
  if (uniformMatches === dataPoints.length) {
    console.log("%d", parseInt(dataPoints.length / 2, 10));
    return;
  }

  if (uniformMatches === 1 && dataPoints.length >= 4) {
    console.log("%d", parseInt(dataPoints.length / 2, 10));
    return;
  }

  let evenPositionCounts = new Map();
  let oddPositionCounts = new Map();
  for (let idx = 0; idx < dataPoints.length; idx++) {
    if (idx % 2 === 0) {
      let currentCount = evenPositionCounts.get(dataPoints[idx]);
      if (!currentCount) {
        currentCount = 0;
        evenPositionCounts.set(dataPoints[idx], currentCount);
      }
      currentCount++;
      evenPositionCounts.set(dataPoints[idx], currentCount);
    } else {
      let currentCount = oddPositionCounts.get(dataPoints[idx]);
      if (!currentCount) {
        currentCount = 0;
        oddPositionCounts.set(dataPoints[idx], currentCount);
      }
      currentCount++;
      oddPositionCounts.set(dataPoints[idx], currentCount);
    }
  }

  function calculateReducedSum(frequencyMap) {
    let valueList = [];
    let reducedSum = 0;
    for (let entryPair of frequencyMap) {
      valueList.push(entryPair[1]); // Extract count from key-value pair
    }
    if (valueList.length >= 2) {
      valueList.sort((valA, valB) => valB - valA); // Sort in descending order
      for (let idx = 1; idx < valueList.length; idx++) {
        reducedSum += valueList[idx];
      }
    } else if (valueList.length <= 1) {
      reducedSum = 0;
    }
    return reducedSum;
  }

  let finalResult = calculateReducedSum(evenPositionCounts);
  finalResult += calculateReducedSum(oddPositionCounts);

  console.log("%d", finalResult);
}
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));