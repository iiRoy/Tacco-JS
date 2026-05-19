function processInputData(rawDataContent) {
  const allNumericStrings = rawDataContent.split(/\s+/).filter(Boolean);

  const elementCount = Number(allNumericStrings[0]);

  const actualNumbers = allNumericStrings.slice(1, elementCount + 1).map(Number);

  const lowestValue = Math.min(...actualNumbers);
  const highestValue = Math.max(...actualNumbers);

  const valueSpan = highestValue - lowestValue;

  if (valueSpan % 2 === 0) {
    console.log('first');
  } else {
    console.log('second');
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
