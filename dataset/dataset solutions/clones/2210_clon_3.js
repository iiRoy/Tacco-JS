function processInputData(rawDataString) {
  const tokenizedInput = rawDataString.split(" ");

  const parseNumericValue = (strSegment) => {
    return Number(strSegment);
  };

  const firstNumericValue = parseNumericValue(tokenizedInput[0]);
  const secondNumericValue = parseNumericValue(tokenizedInput[1]);

  const areValuesIdentical = firstNumericValue === secondNumericValue;

  const finalOutputMessage = areValuesIdentical ? 'Yes' : 'No';
  console.log(finalOutputMessage);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
