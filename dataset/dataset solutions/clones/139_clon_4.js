const processInputLine = (inputLine) => {
  const rawValues = inputLine.split(',');
  const numericValues = rawValues.map(Number);

  const elementsToTransform = Array.from({ length: 11 }, (_, index) => numericValues[index]);

  const { transformedArray: transformedPrefix, currentSum: finalSFromFirstLoop } = elementsToTransform.reduceRight((accumulator, currentValue, currentIndex) => {
    accumulator.currentSum -= currentValue;
    accumulator.transformedArray[currentIndex] = accumulator.currentSum;
    return accumulator;
  }, { currentSum: 0, transformedArray: Array(11).fill(0) });

  const originalJ11 = numericValues[11];
  const aValue = -originalJ11;

  const transformedJ10 = transformedPrefix[10];
  const denominator = aValue - transformedJ10;

  const newSValue = finalSFromFirstLoop * (aValue / denominator);

  const finalResult = transformedPrefix.reduceRight((foundIndex, elementValue, elementIndex) => {
    if (foundIndex !== null) return foundIndex;
    if (elementValue < newSValue) {
      return elementIndex + 1;
    }
    return null;
  }, null);

  return finalResult !== null ? finalResult : 0;
};

const inputData = require("fs").readFileSync("/dev/stdin", 'utf8').trim();
const lines = inputData.split(/\s/);

lines.map(lineContent => {
  console.log(processInputLine(lineContent));
});
