function processInput(inputStr) {
  const parsedValues = inputStr.split(" ").map(valStr => parseFloat(valStr));

  let valA = parsedValues[0];
  let valB = parsedValues[1];
  const valC = parsedValues[2];
  let valD = parsedValues[3];
  let valE = parsedValues[4];

  const doubleC = valC * 2;

  let currentResult = (valA * valD) + (valB * valE);

  const sumAB = valA + valB;
  if (sumAB > doubleC) {
    const applicableMin = Math.min(valD, valE);
    const reductionFactor = sumAB - doubleC;
    currentResult -= reductionFactor * applicableMin;
    valD -= applicableMin;
    valE -= applicableMin;
  }

  const diffA_doubleC = valA - doubleC;
  if (valD > 0 && diffA_doubleC > 0) {
    currentResult -= diffA_doubleC * valD;
  }

  const diffB_doubleC = valB - doubleC;
  if (valE > 0 && diffB_doubleC > 0) {
    currentResult -= diffB_doubleC * valE;
  }

  console.log(currentResult);
}

const fileSystem = require("fs");
const inputFilePath = "/dev/stdin";
const fileContent = fileSystem.readFileSync(inputFilePath, "utf8");
processInput(fileContent);
