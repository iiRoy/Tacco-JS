(function() {
    'use strict';

    var inputBuffer = [];
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('line', function(currentLine) {
      inputBuffer.push(currentLine);
    });

    process.stdin.on('end', function() {

      function calculateDigitSumFromString(valueForSummation) {
          // The original code implicitly converts the input array to a string
          // e.g., ["123"] becomes "123", ["12", "34"] becomes "12,34"
          const stringRepresentation = String(valueForSummation);
          let currentDigitSum = 0;
          const digitCount = stringRepresentation.length;

          for (let charIndex = 0; charIndex < digitCount; charIndex++) {
              const char = stringRepresentation[charIndex];
              // parseInt will return NaN for non-numeric characters (like ',')
              // The original logic propagates NaN if any digit parse results in NaN.
              const digitValue = parseInt(char, 10);
              currentDigitSum += digitValue;
          }
          return currentDigitSum;
      }

      const initialInputArray = inputBuffer[0].split(" ");

      const totalDigitSum = calculateDigitSumFromString(initialInputArray);

      // The original code implicitly converts the input array to a number
      // e.g., Number(["123"]) is 123, Number(["12", "34"]) is NaN
      const numericInput = Number(initialInputArray);
      const remainderValue = numericInput % totalDigitSum;

      if (remainderValue === 0) {
          console.log("Yes");
      } else {
          console.log("No");
      }
    });
})();
