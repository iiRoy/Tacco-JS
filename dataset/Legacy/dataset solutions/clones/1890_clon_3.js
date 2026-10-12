function getOutputCode(currentInput) {
  const codeMapping = {
    "ABC": "ARC",
    "ARC": "ABC"
  };
  return codeMapping[currentInput];
}

function processInput (sourceData) {
  const processedString = sourceData;

  const outputValue = getOutputCode(processedString);

  if (outputValue !== undefined) {
    console.log(outputValue);
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
