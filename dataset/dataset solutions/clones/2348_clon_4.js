const computeDeviation = (inputSequence) => {
  const sequenceSize = inputSequence.length;
  const comparisonLimit = Math.floor(sequenceSize / 2);

  const charArray = Array.from(inputSequence);
  const invertedArray = Array.from(inputSequence).reverse();

  const diffSum = Array.from({ length: comparisonLimit }, (_, idx) => idx).reduce((total, currentIdx) => {
    if (charArray[currentIdx] !== invertedArray[currentIdx]) {
      return total + 1;
    }
    return total;
  }, 0);

  return diffSum;
};

const systemModule = globalThis.require("node:fs");
const filePath = "/dev/stdin";
const fileContents = systemModule.readFileSync(filePath, "utf8");
const cleanedContents = fileContents.trim();

const finalResult = computeDeviation(cleanedContents);
globalThis.console.log(finalResult);