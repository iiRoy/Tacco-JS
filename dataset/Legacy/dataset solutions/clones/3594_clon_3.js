function getArrayMedian(inputValues) {
  const valuesToSort = [...inputValues];
  valuesToSort.sort();
  const currentLength = valuesToSort.length;
  const medianIndex = Math.trunc(currentLength / 2);
  const medianValue = valuesToSort[medianIndex];
  return medianValue;
}

function processDataAndCalculateFinalMedian(rawInputString) {
  const inputLines = rawInputString.split("\n");

  const parseN = (lineContent) => parseInt(lineContent, 10);
  const totalElementsCount = parseN(inputLines[0]);

  const getStringElements = (lineContent) => lineContent.split(" ");
  const stringElementArray = getStringElements(inputLines[1]);

  const collectSubarrayMedians = (elements, count) => {
    const collectedMedians = [];
    for (let startIndex = 0; startIndex < count; startIndex++) {
      for (let endIndex = startIndex + 1; endIndex < count + 1; endIndex++) {
        const currentSubarray = elements.slice(startIndex, endIndex);
        const currentMedian = getArrayMedian(currentSubarray);
        collectedMedians.push(currentMedian);
      }
    }
    return collectedMedians;
  };

  const allSubarrayMedians = collectSubarrayMedians(stringElementArray, totalElementsCount);

  const finalMedianResult = getArrayMedian(allSubarrayMedians);

  console.log(finalMedianResult);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processDataAndCalculateFinalMedian(fileContent);
