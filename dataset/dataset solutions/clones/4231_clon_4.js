'use strict';

const processContentForComparison = (sourceContent) => {
    const initialLine = sourceContent.split('\n')[0];
    const lineComponents = initialLine.split(' ');

    const firstComponent = lineComponents[0];
    const secondComponent = lineComponents[1];

    const comparisonSymbols = ['<', '=', '>'];

    const outcomeIndex = firstComponent === secondComponent
        ? 1
        : (firstComponent > secondComponent
            ? 2
            : 0);

    console.log(comparisonSymbols[outcomeIndex]);
};

const fileSystemHandler = require('fs');
const acquiredContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf-8');
processContentForComparison(acquiredContent);