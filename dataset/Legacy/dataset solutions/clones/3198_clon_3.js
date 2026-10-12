function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const firstLineSegments = inputLines[0].split(" ");

  const parseIntegerFromString = (strValue) => parseInt(strValue, 10);

  const totalItems = parseIntegerFromString(firstLineSegments[0]);
  const targetCount = parseIntegerFromString(firstLineSegments[1]);

  const halfDivisor = 2;
  const initialOutcome = "NO";
  const positiveOutcome = "YES";

  // Equivalent to Math.ceil(totalItems / halfDivisor) using integer arithmetic
  const minimumRequiredCount = Math.floor((totalItems + (halfDivisor - 1)) / halfDivisor);

  let finalResultString = initialOutcome;

  if (minimumRequiredCount >= targetCount) {
    finalResultString = positiveOutcome;
  }

  console.log('%s', finalResultString);
}

// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function runDebugSimulation(){
  var debugInputContent = document.getElementById("input").value;
  processInputData(debugInputContent);
}

(function executeMainProgram() {
  const fileSystemModule = require("fs");
  const programInput = fileSystemModule.readFileSync("/dev/stdin", "utf8");
  processInputData(programInput);
})();
