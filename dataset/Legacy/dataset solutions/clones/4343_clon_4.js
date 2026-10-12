(function() {
    'use strict';

    let inputValues = [];
    let lineIndex = 0;

    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('line', function(currentInputLine) {
      inputValues[lineIndex++] = currentInputLine;
    });

    process.stdin.on('end', function() {
      const firstLineContent = inputValues[0];
      const secondLineContent = inputValues[1];

      const numericBase = Number.parseInt(firstLineContent, 10);
      const numericSubtrahend = Number.parseInt(secondLineContent, 10);

      const baseSquared = numericBase * numericBase;

      const finalComputedValue = baseSquared - numericSubtrahend;

      console.log(finalComputedValue);
    });
})();
