function Solution(rawData) {
  const parsedLines = rawData.trim().split('\n');

  const totalStages = Number(parsedLines[0]);
  const upperPathCandiesStr = parsedLines[1].split(' ');
  const lowerPathCandiesStr = parsedLines[2].split(' ');

  const upperPathValues = upperPathCandiesStr.map(val => parseInt(val, 10));
  const lowerPathValues = lowerPathCandiesStr.map(val => parseInt(val, 10));

  let maxCandiesCollected = 0;

  const lastUpStageIndex = totalStages - 1;

  for (let currentUpStage = 0; currentUpStage <= lastUpStageIndex; currentUpStage++) {
    let currentDownStage = totalStages - currentUpStage - 1;
    let currentPathCandies = 0;

    const sumSegment = (arr, startIdx, endIdx) => {
      let segmentSum = 0;
      for (let idx = startIdx; idx <= endIdx; idx++) {
        segmentSum += arr[idx];
      }
      return segmentSum;
    };

    currentPathCandies += sumSegment(upperPathValues, 0, currentUpStage);
    currentPathCandies += sumSegment(lowerPathValues, currentUpStage, currentUpStage + currentDownStage);

    maxCandiesCollected = Math.max(maxCandiesCollected, currentPathCandies);
  }

  console.log(maxCandiesCollected);
}

Solution(require("fs").readFileSync("/dev/stdin", "utf8"));
