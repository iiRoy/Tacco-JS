function processInput(rawInputStr) {
  var parseLineOfNumbers = function(lineContent) {
    return lineContent.split(" ").map(Number);
  };

  var inputLines = rawInputStr.split("\n");

  var firstLineValues = parseLineOfNumbers(inputLines[0]);
  var numStones = firstLineValues[0];
  var maxJumpDist = firstLineValues[1];

  var stoneHeights = parseLineOfNumbers(inputLines[1]);

  var minCost = new Array(numStones).fill(Infinity);
  minCost[0] = 0;

  for (var currentStoneIdx = 1; currentStoneIdx < numStones; currentStoneIdx++) {
    var minReachablePrevIdx = Math.max(0, currentStoneIdx - maxJumpDist);

    for (var prevStoneIdx = currentStoneIdx - 1; prevStoneIdx >= minReachablePrevIdx; prevStoneIdx--) {
      var heightDifference = Math.abs(stoneHeights[prevStoneIdx] - stoneHeights[currentStoneIdx]);
      var costFromPrevStone = minCost[prevStoneIdx] + heightDifference;

      minCost[currentStoneIdx] = Math.min(minCost[currentStoneIdx], costFromPrevStone);
    }
  }

  console.log(minCost[numStones - 1]);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
