'use strict';
const processInput = rawData => {
    const trimmedContent = rawData.trim();
    const firstNumericMatch = trimmedContent.match(/^(\d+)/);
    
    const valueToEvaluate = firstNumericMatch ? +firstNumericMatch[1] : 0;

    const outcomeLabels = ['ABC', 'ARC'];
    
    console.log(outcomeLabels[+(valueToEvaluate >= 1200)]);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
