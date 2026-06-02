function processInputData(rawData) {
  const INITIAL_MIN_VALUE = 1000000000;

  let lines = rawData.split("\n");
  let firstLineTokens = lines[0].split(" ");
  let elementCount = parseInt(firstLineTokens[0]);

  let dataArray = new Array(elementCount);

  let currentMinVal = INITIAL_MIN_VALUE;
  let maxDifference = 0;
  let countMaxDiffPairs = 0;

  let secondLineTokens = lines[1].split(" ");

  for (let idx = 0; idx < elementCount; idx++) {
    let currentElementStr = secondLineTokens[idx];
    let currentElementVal = parseInt(currentElementStr);

    dataArray[idx] = currentElementVal;

    if (currentMinVal > dataArray[idx]) {
      currentMinVal = dataArray[idx];
    }

    let calculatedDifference = dataArray[idx] - currentMinVal;

    if (calculatedDifference > maxDifference) {
      maxDifference = calculatedDifference;
      countMaxDiffPairs = 1;
    } else if (calculatedDifference === maxDifference) {
      countMaxDiffPairs++;
    }
  }

  console.log('%s', countMaxDiffPairs);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
