function ProcessData(rawDataInput) {
  let numericValues = rawDataInput
    .split("\n")
    .map(Number);
  numericValues.shift();
  let resultFlag = computeOverallSum(numericValues);
  if (resultFlag === numericValues.length) {
    resultFlag = 1;
  }
  if (sumExcludingSpecificValue(numericValues) % 2 === 1) {
    resultFlag = 1;
  }

  if (resultFlag % 2 === 1) {
    console.log("first");
  } else {
    console.log("second");
  }
}
ProcessData(
  require("fs").readFileSync("/dev/stdin", "utf8").trim()
);

function computeOverallSum(inputArray) {
  let currentTotal = 0;
  for (
    let index = 0, arraySize = inputArray.length;
    index < arraySize;
    ++index
  ) {
    currentTotal += inputArray[index];
  }
  return currentTotal;
}

function sumExcludingSpecificValue(valueCollection) {
  let runningTotal = 0;
  for (
    let pointer = 0, collectionSize = valueCollection.length;
    pointer < collectionSize;
    ++pointer
  ) {
    if (valueCollection[pointer] !== 1) {
      runningTotal += valueCollection[pointer];
    }
  }
  return runningTotal;
}