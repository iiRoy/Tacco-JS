function processInputLines(linesCollection) {
  return linesCollection.map(processSingleEquationLine).filter(Boolean);
}

function processSingleEquationLine(currentEquationString) {
  const normalizedString = currentEquationString.trim();
  if (normalizedString === '') {
    return null;
  }

  const equationMatch = normalizedString.match(/([0-9X]+)\+([0-9X]+)\=([0-9X]+)/);
  const firstOperand = equationMatch[1];
  const secondOperand = equationMatch[2];
  const resultOperand = equationMatch[3];

  const possibleDigitValues = Array.from({ length: 10 }, (_, digitIndex) => digitIndex);

  const solutionDigit = possibleDigitValues.find(currentDigit => {
    const isLeadingXAndZero = (
      currentDigit === 0 &&
      (firstOperand.startsWith('X') || secondOperand.startsWith('X') || resultOperand.startsWith('X'))
    );

    if (isLeadingXAndZero) {
      return false;
    }

    const numericFirst = Number.parseInt(firstOperand.replace(/X/g, currentDigit), 10);
    const numericSecond = Number.parseInt(secondOperand.replace(/X/g, currentDigit), 10);
    const numericResult = Number.parseInt(resultOperand.replace(/X/g, currentDigit), 10);

    return numericFirst + numericSecond === numericResult;
  });

  return solutionDigit !== undefined ? solutionDigit : 'NA';
}

function executeMainLogic() {
  const processedResults = processInputLines(inputData);
  processedResults.forEach(outputValue => console.log(outputValue));
}

var inputData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  inputData += chunk;
});
process.stdin.on('end', function() {
  inputData = inputData.split('\n');
  executeMainLogic();
});
