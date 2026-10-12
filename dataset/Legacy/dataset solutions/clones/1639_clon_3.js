const parseNumericValue = (strValue) => parseInt(strValue, 10);

const parseSpaceSeparatedIntegers = (lineContent) => lineContent.split(" ").map(parseNumericValue);

function processInputData(rawInputString) {
  const inputLinesArray = rawInputString.split("\n");

  const [totalElements, numQueries] = parseSpaceSeparatedIntegers(inputLinesArray[0]);

  const elementColors = inputLinesArray[1].split(" ");

  for (let queryIndex = 0; queryIndex < numQueries; queryIndex++) {
    const [queryStartOneBased, queryEndOneBased] = parseSpaceSeparatedIntegers(inputLinesArray[queryIndex + 2]);

    const uniqueColorsTracker = new Set();

    const zeroBasedStartIndex = queryStartOneBased - 1;
    const zeroBasedEndIndexExclusive = queryEndOneBased; // Loop condition is <, so this is correct

    for (let currentElementPosition = zeroBasedStartIndex; currentElementPosition < zeroBasedEndIndexExclusive; currentElementPosition++) {
      const currentElementColor = elementColors[currentElementPosition];
      uniqueColorsTracker.add(currentElementColor);
    }

    console.log(uniqueColorsTracker.size);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
