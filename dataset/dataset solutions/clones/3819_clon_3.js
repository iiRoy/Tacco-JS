function processInputData(inputStringContent) {
  const lineStrings = inputStringContent.split("\n");
  const parsedNumbers = lineStrings.map(currentLine => +currentLine);

  const effectiveLength = parsedNumbers[0];

  const initialCheckValue = 0;
  if (parsedNumbers[1] !== initialCheckValue) {
    console.log(-1);
    return;
  }

  let calculatedSum = 0;

  for (let loopIndex = effectiveLength; loopIndex > 1; loopIndex--) {
    const currentElementValue = parsedNumbers[loopIndex];
    const precedingElementValue = parsedNumbers[loopIndex - 1];
    const targetComparisonValue = precedingElementValue + 1;

    if (currentElementValue === targetComparisonValue) {
      calculatedSum += 1;
    } else {
      calculatedSum += currentElementValue;
    }
  }

  console.log(calculatedSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
