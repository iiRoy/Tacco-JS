'use strict';

(function() {
    const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
    const numericSegments = rawData.trim().split(/\s+/).map(Number);

    const valA = numericSegments[0];
    const valB = numericSegments[1];
    const valC = numericSegments[2];

    const comparisonPoint = valB + valC + valC;
    const incrementMeasure = valB + valC;

    const outcomeGenerator = {
        'true': (primaryValue, , tertiaryValue, , divisorValue) => {
            // Original: Math.floor((primaryValue - (valB + 2*valC)) / (valB + valC) + 1)
            // Transformed: Math.floor((primaryValue - tertiaryValue) / divisorValue)
            return Math.floor((primaryValue - tertiaryValue) / divisorValue);
        },
        'false': () => 0
    };

    const calculationIsActive = (valA > comparisonPoint);

    const finalResult = outcomeGenerator[calculationIsActive](valA, valB, valC, comparisonPoint, incrementMeasure);

    process.stdout.write(String(finalResult) + '\n');
})();