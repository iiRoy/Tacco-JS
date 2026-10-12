function Main(inputString) {
  const allNumbers = inputString.match(/\d+/g).map(Number);

  const countK = allNumbers[0];
  const thresholdT = allNumbers[1];
  const dataElements = allNumbers.slice(2);

  let maximumValue = -Infinity;
  let totalSummation = 0;

  for (const currentElement of dataElements) {
    if (currentElement > maximumValue) {
      maximumValue = currentElement;
    }
    totalSummation += currentElement;
  }

  const intermediateResult = (2 * maximumValue) - 1 - totalSummation;
  const finalOutput = Math.max(intermediateResult, 0);

  console.log(finalOutput);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
