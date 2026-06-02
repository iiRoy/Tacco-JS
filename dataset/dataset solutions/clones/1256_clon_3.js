(function() {
    'use strict';

    var fileSystem = require('fs');
    var inputData = fileSystem.readFileSync('/dev/stdin', 'utf-8');

    const parseNumberArray = (numberStringSegment) => {
        return numberStringSegment.trim().split(" ").map(Number);
    };

    var processNumbers = function(rawDataContent) {
        var dataLines = rawDataContent.trim().split("\n");
        // The original code parsed 'n' (lines[0]) but did not utilize it.
        // var elementCount = parseInt(dataLines[0].trim());

        var numberSequenceString = dataLines[1];
        var numericValues = parseNumberArray(numberSequenceString);

        let minimumValue = Infinity;
        let maximumValue = -Infinity;
        let totalSum = 0;

        // Using a single loop for min, max, and sum, but with a slightly different structure
        // and explicit temporary variable for clarity, as an alternative to array methods.
        // This is still a structural modification from the original's combined if-statements.
        for (let idx = 0; idx < numericValues.length; idx++) {
            let currentNum = numericValues[idx];
            
            if (currentNum < minimumValue) {
                minimumValue = currentNum;
            }
            
            if (currentNum > maximumValue) {
                maximumValue = currentNum;
            }
            
            totalSum += currentNum;
        }
        
        console.log(minimumValue + " " + maximumValue + " " + totalSum);
    };

    processNumbers(inputData);
})();
