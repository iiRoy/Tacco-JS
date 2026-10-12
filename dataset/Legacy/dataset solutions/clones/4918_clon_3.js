function calculatePenaltyScore(inputString) {
  let penaltyCount = 0;
  const PENALTY_CHARACTER = "p";
  for (let charIndex = 0; charIndex < inputString.length; charIndex++) {
    if (inputString[charIndex] === PENALTY_CHARACTER) {
      penaltyCount--;
    }
  }
  return penaltyCount;
}

function processInput(rawInputData) {
  const inputLines = rawInputData.split("\n");
  const targetString = inputLines[0];
  
  const stringLength = targetString.length;
  const baseScoreComponent = Math.floor(stringLength / 2);
  
  const computedPenalty = calculatePenaltyScore(targetString);
  
  const finalCalculatedScore = baseScoreComponent + computedPenalty;
  
  console.log(finalCalculatedScore);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
