function determineResult(valueToProcess) {
  const isEvenNumber = (valueToProcess % 2 === 0);
  const baseDivision = Math.floor(valueToProcess / 2);

  if (isEvenNumber) {
    return baseDivision - 1;
  } else {
    return baseDivision;
  }
}

function executePrimaryLogic(sourceData) {
  const finalOutput = determineResult(sourceData);
  console.log(finalOutput);
}

const fileSystemAccess = require("fs");
const standardInputData = fileSystemAccess.readFileSync("/dev/stdin", "utf8");
executePrimaryLogic(standardInputData);
