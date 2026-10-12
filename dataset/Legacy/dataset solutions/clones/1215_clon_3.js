'use strict';
(function(rawInputContent) {
  const trimmedInput = rawInputContent.trim();
  const inputLines = trimmedInput.split('\n');

  const firstLineOfInput = inputLines[0];
  const parsedNumbers = firstLineOfInput.split(' ').map(Number);

  (function(firstOperand, secondOperand) {
      const determineComparisonResult = (valA, valB) => {
          let comparisonOutcome;
          if (valA > valB) {
              comparisonOutcome = 'a > b';
          } else if (valA < valB) {
              comparisonOutcome = 'a < b';
          } else {
              comparisonOutcome = 'a == b';
          }
          return comparisonOutcome;
      };

      console.log(determineComparisonResult(firstOperand, secondOperand));

  }(parsedNumbers[0], parsedNumbers[1]));

}(require('fs').readFileSync('/dev/stdin', 'utf8')));
