function processInputData(rawInputString) {
  const inputLines = rawInputString.split('\n');
  let differenceCounter = 0;

  const firstString = inputLines[0];
  const secondString = inputLines[1];
  const comparisonLength = firstString.length;

  for (let charPosition = 0; charPosition < comparisonLength; charPosition++) {
    const charFromLine1 = firstString[charPosition];
    const charFromLine2 = secondString[charPosition];

    if (charFromLine1 !== charFromLine2) {
      differenceCounter += 1;
    }
  }
  console.log(differenceCounter);
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const fileContent = fileSystemModule.readFileSync(standardInputPath, "utf8");

processInputData(fileContent);
