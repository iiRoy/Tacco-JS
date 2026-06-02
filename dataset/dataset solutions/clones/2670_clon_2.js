var rawData = require('fs').readFileSync('/dev/stdin', 'utf8')
  .split("\n").map((lineStr) => {
    return lineStr.split(" ").map((numStr) => {
      return Number(numStr);
    });
  });

var nodeCount = rawData[0][0];
var penaltyValue = rawData[0][2];
rawData.shift();

var adjacencyList = {};
for (var idx = 1; idx <= nodeCount; idx++) {
  adjacencyList[idx] = [];
}
rawData.forEach((edgeData) => {
  adjacencyList[edgeData[0]].push([edgeData[1], edgeData[2]]);
});

var maxScore = -1;

(() => {

  var currentPathNodes = [1];
  var currentPathGains = [0];
  var backtrackStack = [Array.from(adjacencyList[1])];
  var currentOptions = backtrackStack.pop();

  do {
    var option = currentOptions.pop();
    var currentNode = option[0];

    if (currentNode === nodeCount) {
      var calculatedScore = currentPathGains.reduce((prevSum, currentGain) => {
        return prevSum + currentGain;
      }, 0) + option[1] - penaltyValue * (currentPathNodes.length + 1);
      maxScore = Math.max(calculatedScore, maxScore);
    }

    if (currentPathNodes.indexOf(currentNode) === -1) {
      if (adjacencyList[currentNode].length > 0) {
        backtrackStack.push(currentOptions);
        currentOptions = Array.from(adjacencyList[currentNode]);
        currentPathNodes.push(currentNode);
        currentPathGains.push(option[1]);
        continue;
      }
    } else {
      console.log("loop detected");
    }

    while (currentOptions.length === 0) {
      currentPathNodes.pop();
      currentPathGains.pop();
      if (backtrackStack.length > 0) {
        currentOptions = backtrackStack.pop();
      } else {
        return;
      }
    }
  } while (true);

})();

console.log(maxScore);
