function processInputData(sourceText) {
  const dataSegments = sourceText.split('\x0A');
  const upperLimit = parseInt(dataSegments[0], 10);
  const numericValues = dataSegments[1].split(/\s+/).map(val => parseInt(val, 10));

  const valueFrequencies = numericValues.reduce((accumulator, currentVal) => {
    accumulator[currentVal] = (accumulator[currentVal] || 0) + 1;
    return accumulator;
  }, {});

  const resultLines = Array.from({ length: upperLimit }, (_, idx) => idx + 1)
    .map(targetVal => (valueFrequencies[targetVal] || 0));

  console.log(resultLines.join('\n'));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
