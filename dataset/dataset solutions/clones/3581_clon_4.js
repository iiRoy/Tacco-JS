(() => {
  const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

  const processedContent = rawInputContent.trim();
  const lineSegments = processedContent.split('\n');
  const targetLine = lineSegments[0];

  const spaceDelimiterPosition = targetLine.indexOf(' ');

  const firstNumericString = targetLine.substring(0, spaceDelimiterPosition);
  const secondNumericString = targetLine.substring(spaceDelimiterPosition + 1);

  const firstOperand = parseInt(firstNumericString, 10);
  const secondOperand = parseInt(secondNumericString, 10);

  const finalCalculationResult = (firstOperand + 1) - secondOperand;

  console.log(finalCalculationResult);
})();
