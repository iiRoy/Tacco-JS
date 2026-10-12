function processInputData(rawInputString) {
  let finalDecision = "Yes";

  const trimmedInput = rawInputString.trim();
  const lines = trimmedInput.split("\n");

  const firstLineParts = lines[0].split(" ");
  const totalItemsCount = parseInt(firstLineParts[0], 10);
  const requiredSelectionCount = parseInt(firstLineParts[1], 10);

  const allItemScores = lines[1].split(" ").map((scoreStr) => parseInt(scoreStr, 10));
  allItemScores.sort((scoreA, scoreB) => scoreB - scoreA);

  const topSelectedScores = allItemScores.slice(0, requiredSelectionCount);

  const totalSumOfAllScores = computeSumOfScores(allItemScores);

  const thresholdDivisorFactor = 4;
  const effectiveDenominator = thresholdDivisorFactor * requiredSelectionCount;

  const minimumThreshold = totalSumOfAllScores / effectiveDenominator;

  const lowestScoreInTopSelection = topSelectedScores[topSelectedScores.length - 1];

  if (lowestScoreInTopSelection < minimumThreshold) {
    finalDecision = "No";
  }

  function computeSumOfScores(scoreArray) {
    return scoreArray.reduce((currentSum, scoreValue) => currentSum + scoreValue, 0);
  }

  console.log(finalDecision);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
