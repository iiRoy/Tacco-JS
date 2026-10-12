function ProcessInput(rawData) {
  rawData = rawData.split("\n");
  var itemCount = parseInt(rawData[0]);
  var heightsArr = rawData[1].split(" ").map(val => parseInt(val));
  var valuesArr = rawData[2].split(" ").map(val => parseInt(val));

  var powerExp = 0;
  for(var idx=0;itemCount/Math.pow(2,idx)>0.5;idx++){
    powerExp = idx;
  }
  var treeBaseSize = Math.pow(2,powerExp);
  var segmentTreeData = new Array(treeBaseSize * 2 - 1).fill(0);

  function fetchRangeMaximum(queryStart, queryEnd, baseSize) {
    let currentMax = 0;
    let traversalStack = [{ nodeIndex: 0, nodeRangeStart: 0, nodeRangeEnd: baseSize }];

    while (traversalStack.length > 0) {
      let { nodeIndex, nodeRangeStart, nodeRangeEnd } = traversalStack.pop();

      if (nodeRangeEnd <= queryStart || queryEnd <= nodeRangeStart) {
        continue;
      } else if (queryStart <= nodeRangeStart && nodeRangeEnd <= queryEnd) {
        currentMax = Math.max(currentMax, segmentTreeData[nodeIndex]);
      } else {
        let midPoint = (nodeRangeStart + nodeRangeEnd) / 2;
        traversalStack.push({ nodeIndex: 2 * nodeIndex + 2, nodeRangeStart: midPoint, nodeRangeEnd: nodeRangeEnd });
        traversalStack.push({ nodeIndex: 2 * nodeIndex + 1, nodeRangeStart: nodeRangeStart, nodeRangeEnd: midPoint });
      }
    }
    return currentMax;
  }

  function adjustNodeValue(targetIndex, newValue) {
    let treePosition = targetIndex + (treeBaseSize - 1);
    segmentTreeData[treePosition] = newValue;

    while (treePosition > 0) {
      treePosition = Math.floor((treePosition - 1) / 2);
      segmentTreeData[treePosition] = Math.max(segmentTreeData[2 * treePosition + 1], segmentTreeData[2 * treePosition + 2]);
    }
  }

  var finalResult = 0;
  for(var idx=0; idx < itemCount; idx++){
    var currentMax = 0;
    currentMax = fetchRangeMaximum(0, heightsArr[idx] - 1, treeBaseSize);
    adjustNodeValue(heightsArr[idx] - 1, currentMax + valuesArr[idx]);
    finalResult = Math.max(finalResult, currentMax + valuesArr[idx]);
  }
  console.log('%s', finalResult);
  return finalResult;
}

function testSolution(testCaseNumber){
  var rawData = document.getElementById("input"+testCaseNumber).value;
  var computedAnswer = ProcessInput(rawData);
  var expectedAnswer = document.getElementById("output"+testCaseNumber).value.split("\n")[0];
  var evaluationStatus = "WA";
  if(computedAnswer == expectedAnswer){
    evaluationStatus = "AC";
  }
  document.getElementById("result"+testCaseNumber).innerHTML = evaluationStatus;
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
