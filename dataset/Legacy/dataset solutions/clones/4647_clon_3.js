function displayResult(textToLog) {
  console.log(textToLog);
}

function processData(rawInputContent) {
  const inputLines = rawInputContent.split("\n");

  const firstInputLine = inputLines[0];
  const secondInputLine = inputLines[1];

  let finalResultString = "";

  const commonLength = firstInputLine.length;

  for (let charIndex = 0; charIndex < commonLength; charIndex++) {
    const charFromFirstLine = firstInputLine[charIndex];
    const charFromSecondLine = secondInputLine[charIndex];
    finalResultString += charFromFirstLine + charFromSecondLine;
  }

  displayResult(finalResultString);
}

const stdinContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
processData(stdinContent);
