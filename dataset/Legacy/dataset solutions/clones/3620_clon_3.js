function parseNumericStringValue(inputSegment) {
  return parseInt(inputSegment, 10);
}

function processInputAndDetermineOutput(fullInputString) {
  const stringParts = fullInputString.split(" ");

  const dividendValue = parseNumericStringValue(stringParts[0]);
  const divisorValue = parseNumericStringValue(stringParts[1]);

  const remainderCalculation = dividendValue % divisorValue;

  const finalOutput = (remainderCalculation === 0) ? 0 : 1;
  console.log(finalOutput);
}

processInputAndDetermineOutput(require("fs").readFileSync("/dev/stdin", "utf8"));
