function processInputData(rawData) {
  const inputDelimiter = " ";
  const numericBase = 10;

  const dataSegments = rawData.split(inputDelimiter);

  const extractAndParse = (segmentIndex) => {
    const segmentString = dataSegments[segmentIndex];
    return parseInt(segmentString, numericBase);
  };

  const valueFromIndexTwo = extractAndParse(2);
  const valueFromIndexZero = extractAndParse(0);
  const valueFromIndexOne = extractAndParse(1);

  const outputSeparator = " ";
  const finalOutput = `${valueFromIndexTwo}${outputSeparator}${valueFromIndexZero}${outputSeparator}${valueFromIndexOne}`;

  console.log(finalOutput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
