function extractNumericTokens(sourceData) {
  return sourceData.split('\n').reduce((accumulator, currentLine) => {
    return accumulator.concat(currentLine.split(' '));
  }, []);
}

function fetchProgramInput() {
  const fileSystem = require('fs');
  const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
  return extractNumericTokens(rawContent);
}

(function executeCalculation() {
  const programArguments = fetchProgramInput();
  const firstOperand = Number(programArguments[0]);
  const secondOperand = Number(programArguments[1]);

  const finalOutcome = (1000 - (firstOperand * 100)) + secondOperand;
  console.log(finalOutcome);
})();
