function processInputData(rawData) {
  const lines = rawData.split("\n");
  const firstLineParts = lines[0].split(" ");

  const arrayLength = parseInt(firstLineParts[0], 10);
  const valZ = parseInt(firstLineParts[1], 10);
  const valW = parseInt(firstLineParts[2], 10);

  const numArray = lines[1].split(" ").map(Number);

  let finalResultValue;

  if (arrayLength === 1) {
    finalResultValue = Math.abs(numArray[0] - valW);
  } else {
    const currentMax = Math.max(...numArray);
    const currentMin = Math.min(...numArray);

    const lastElementInArray = numArray[arrayLength - 1];

    const firstComparisonTerm = Math.abs(currentMax - valW);
    const secondComparisonTerm = Math.abs(currentMax - lastElementInArray);
    const thirdComparisonTerm = Math.abs(lastElementInArray - currentMin);

    finalResultValue = Math.max(firstComparisonTerm, secondComparisonTerm, thirdComparisonTerm);
  }

  console.log('%s', finalResultValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
