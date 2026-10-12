(function() {
    'use strict';

    const inputLinesContainer = [];
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('line', function(currentLine) {
      inputLinesContainer.push(currentLine);
    });
    process.stdin.on('end', function() {
      const firstInputString = inputLinesContainer[0];
      const originalNumericValue = Number(firstInputString);

      const calculatedDigitSum = [...firstInputString].reduce((accumulator, charDigit) => {
        return accumulator + Number(charDigit);
      }, 0);

      const moduloResult = originalNumericValue % calculatedDigitSum;
      const outputMessage = (moduloResult === 0) ? "Yes" : "No";

      console.log(outputMessage);
    });
})();
