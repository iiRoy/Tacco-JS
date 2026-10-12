function calculateNextPowerOfTwo(value) {
  if (value <= 0) {
    return 1;
  }
  let powerOfTwo = 1;
  while (powerOfTwo < value) {
    powerOfTwo <<= 1;
  }
  return powerOfTwo;
}

function ProcessInput(rawData) {
  const INITIAL_SEGMENT_VALUE = 0;

  let inputLines = rawData.split("\n");
  let itemCount = Number.parseInt(inputLines[0]);
  let heightValues = inputLines[1].split(" ").map(val => Number.parseInt(val));
  let associatedValues = inputLines[2].split(" ").map(val => Number.parseInt(val));

  let treeSize = calculateNextPowerOfTwo(itemCount);
  let segmentTreeData = new Array(treeSize * 2 - 1).fill(INITIAL_SEGMENT_VALUE);

  function retrieveMaxRange(queryStart, queryEnd, nodeIdx, rangeStart, rangeEnd) {
    if (rangeEnd <= queryStart || queryEnd <= rangeStart) {
      return INITIAL_SEGMENT_VALUE;
    } else if (queryStart <= rangeStart && rangeEnd <= queryEnd) {
      return segmentTreeData[nodeIdx];
    } else {
      let midPoint = (rangeStart + rangeEnd) / 2;
      let leftChildIdx = nodeIdx * 2 + 1;
      let rightChildIdx = nodeIdx * 2 + 2;
      let leftMax = retrieveMaxRange(queryStart, queryEnd, leftChildIdx, rangeStart, midPoint);
      let rightMax = retrieveMaxRange(queryStart, queryEnd, rightChildIdx, midPoint, rangeEnd);
      return Math.max(leftMax, rightMax);
    }
  }

  function modifyTreeValue(targetIdx, newValue) {
    let currentTreeIdx = targetIdx + treeSize - 1;
    segmentTreeData[currentTreeIdx] = newValue;
    while (currentTreeIdx > 0) {
      let parentIdx = Math.floor((currentTreeIdx - 1) / 2);
      let leftSiblingIdx = parentIdx * 2 + 1;
      let rightSiblingIdx = parentIdx * 2 + 2;
      segmentTreeData[parentIdx] = Math.max(segmentTreeData[leftSiblingIdx], segmentTreeData[rightSiblingIdx]);
      currentTreeIdx = parentIdx;
    }
  }

  let finalResult = INITIAL_SEGMENT_VALUE;
  for (let loopVar = 0; loopVar < itemCount; loopVar++) {
    let currentHeight = heightValues[loopVar];
    let currentAssociatedValue = associatedValues[loopVar];

    let maxValFromPreviousHeights = retrieveMaxRange(0, currentHeight, 0, 0, treeSize);
    let valueToUpdate = maxValFromPreviousHeights + currentAssociatedValue;
    
    let treeTargetIndex = currentHeight - 1;
    modifyTreeValue(treeTargetIndex, valueToUpdate);
    
    finalResult = Math.max(finalResult, valueToUpdate);
  }

  console.log('%s', finalResult);
  return finalResult;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
