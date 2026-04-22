const standardInput = process.stdin;
const standardOutput = process.stdout;

let accumulatedText = '';

standardInput.setEncoding('utf8');

const digitTransformer = new Map([
  ['0', 0],
  ['1', 1],
  ['2', 2],
  ['3', 3],
  ['4', 5],
  ['5', 7],
  ['6', 8],
  ['7', 9]
]);

function recursiveOctalProcessor(valueToConvert, substitutionTable) {
  if (valueToConvert === 0) {
    return String(substitutionTable.get('0'));
  }

  const resultSegments = [];
  function processRemainder(currentDividend) {
    if (currentDividend === 0) {
      return;
    }
    const remainderDigit = currentDividend % 8;
    processRemainder(Math.floor(currentDividend / 8));
    const transformedDigit = substitutionTable.get(String(remainderDigit));
    resultSegments.push(String(transformedDigit));
  }
  processRemainder(valueToConvert);
  return resultSegments.join('');
}

standardInput.on('data', (chunk) => {
  accumulatedText += chunk;
});

standardInput.on('end', () => {
  const numericLines = accumulatedText.trim().split('\n');

  for (const lineEntry of numericLines) {
    const currentNumericalValue = Number.parseInt(lineEntry, 10);

    if (!Number.isNaN(currentNumericalValue) && currentNumericalValue !== 0) {
      const transformedDigits = recursiveOctalProcessor(currentNumericalValue, digitTransformer);
      standardOutput.write(transformedDigits + '\n');
    }
  }
});