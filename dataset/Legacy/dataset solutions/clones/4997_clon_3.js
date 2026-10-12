function processInput(rawStr) {
  const inputLines = rawStr.split("\n");

  const firstLineParts = inputLines[0].split(" ");
  const numElements = Number.parseInt(firstLineParts[0], 10);
  const targetVal = Number.parseInt(firstLineParts[1], 10);

  const valList = inputLines[1].split(" ").map((itemStr) => Number.parseInt(itemStr, 10));

  let resultCounter = 0;

  for (let idx1 = 0; idx1 < numElements; ++idx1) {
    const currentVal = valList[idx1];
    if (targetVal === currentVal) {
      resultCounter++;
    }
  }

  for (let outerIdx = 0; outerIdx < numElements; ++outerIdx) {
    const outerFactorPlusTwo = outerIdx + 2;
    const outerFactorPlusOne = outerIdx + 1;

    for (let middleIdx = 0; middleIdx < numElements; ++middleIdx) {
      for (let innerIdx = 0; innerIdx < numElements; ++innerIdx) {
        const valK = valList[innerIdx];
        const valJ = valList[middleIdx];
        const combinedSum = valK + valJ;

        if (outerFactorPlusTwo * targetVal === combinedSum * outerFactorPlusOne) {
          resultCounter++;
        }
      }
    }
  }

  console.log(resultCounter);
}

const fileSystem = require("fs");
const stdinContent = fileSystem.readFileSync("/dev/stdin", "utf8");
processInput(stdinContent);
