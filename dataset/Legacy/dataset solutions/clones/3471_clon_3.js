let dataArray;
function processPair(idxA, idxB) {
  let currentValA = dataArray[idxA];
  if (currentValA % 2 === 1) {
    currentValA--;
  }
  let halvedValA = currentValA / 2;
  dataArray[idxA] = halvedValA;
  dataArray[idxB] += halvedValA;
}
function executeProgram(rawData) {
    const inputLines = rawData.split("\n");
    const firstLineContent = inputLines[0];
    const stringValues = firstLineContent.split(/\s/);
    dataArray = stringValues.map(strVal => parseInt(strVal, 10));
    const totalIterations = dataArray[2];
    const applyOperationBasedOnCounter = (counterValue) => {
        if (counterValue % 2 !== 0) {
            processPair(0, 1);
        } else {
            processPair(1, 0);
        }
    };
    for (let loopCounter = 1; loopCounter <= totalIterations; loopCounter++) {
        applyOperationBasedOnCounter(loopCounter);
    }
    console.log('%d %d', dataArray[0], dataArray[1]);
}
const fileSystemModule = require("fs");
executeProgram(fileSystemModule.readFileSync("/dev/stdin", "utf8"));
