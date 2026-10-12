(function() {
    'use strict';

    var collectedInputLines = [];

    const parseInputStringAsInteger = (inputString) => {
        return parseInt(inputString, 10);
    };

    const readlineUtility = require('readline');

    const ioInterface = readlineUtility.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    ioInterface.on('line', function(currentInputLine) {
      collectedInputLines.push(currentInputLine);
    });

    process.stdin.on('end', function() {
      const firstInputString = collectedInputLines[0];
      const secondInputString = collectedInputLines[1];

      const baseValueForCalculation = parseInputStringAsInteger(firstInputString);
      const valueToSubtract = parseInputStringAsInteger(secondInputString);

      const squaredBaseResult = baseValueForCalculation * baseValueForCalculation;

      const finalComputedResult = squaredBaseResult - valueToSubtract;

      console.log(finalComputedResult);
    });

})();
