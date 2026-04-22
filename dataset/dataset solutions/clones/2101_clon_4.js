(function() {
  const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
  const extractedNumbers = rawData.match(/\d+/g);
  const firstNumeric = +extractedNumbers[0];
  const secondNumeric = +extractedNumbers[1];
  const candidateValue = (firstNumeric * 12.5) | 0;
  const finalOutcome = (((candidateValue / 10) | 0) === secondNumeric) ? candidateValue : -1;
  process.stdout.write(finalOutcome + '\n');
})();