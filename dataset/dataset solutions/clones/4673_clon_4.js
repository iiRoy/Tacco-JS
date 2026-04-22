'use strict';

(function processInputData() {
    const rawContentSource = require("fs").readFileSync("/dev/stdin", "utf8");

    const newlinePosition = rawContentSource.indexOf('\n');
    const targetProcessingLine = (newlinePosition === -1) ? rawContentSource : rawContentSource.substring(0, newlinePosition);

    let currentAccumulatedToken = '';
    const tokenCollection = [];
    
    for (let charIndex = 0; charIndex < targetProcessingLine.length; charIndex++) {
        if (targetProcessingLine[charIndex] === ' ') {
            tokenCollection.push(currentAccumulatedToken);
            currentAccumulatedToken = '';
        } else {
            currentAccumulatedToken += targetProcessingLine[charIndex];
        }
    }
    tokenCollection.push(currentAccumulatedToken);

    const primaryValue = tokenCollection[0];
    const secondaryValue = tokenCollection[1];

    const comparisonOutcome = (primaryValue === secondaryValue);

    const resultMapping = ["D", "H"];
    const finalOutput = resultMapping[Number(comparisonOutcome)];

    console.log(finalOutput);
})();