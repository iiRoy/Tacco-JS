function processData(rawDataString) {
  const inputStringParts = rawDataString.split(" ");

  const parsedNumericValues = inputStringParts.map(currentPart => {
    return parseInt(currentPart, 10);
  });

  let valueA = parsedNumericValues[0];
  let valueB = parsedNumericValues[1];
  const decrementCount = parsedNumericValues[2];

  for (let currentIteration = 0; currentIteration < decrementCount; currentIteration++) {
    const canDecrementA = valueA > 0;
    const canDecrementB = valueB > 0;

    if (canDecrementA) {
      valueA--;
    } else if (canDecrementB) {
      valueB--;
    }
  }

  console.log("%d %d", valueA, valueB);
}

const fileSystemHandler = require("fs");
const standardInputFilePath = "/dev/stdin";
const fileEncoding = "utf8";

const rawInputContent = fileSystemHandler.readFileSync(standardInputFilePath, fileEncoding);
processData(rawInputContent);
