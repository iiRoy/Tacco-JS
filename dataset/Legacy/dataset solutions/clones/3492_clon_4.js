'use strict';

const processEntries = (sourceLines) => {
    const [configLine, ...itemDataLines] = sourceLines;

    const [totalEntriesStr, timeConstraintStr] = configLine.split(' ');
    const timeConstraint = parseInt(timeConstraintStr, 10);
    const numberOfItems = parseInt(totalEntriesStr, 10);

    const availableOptions = itemDataLines.slice(0, numberOfItems).map(line => {
        const [priceStr, durationStr] = line.split(' ');
        return {
            itemPrice: parseInt(priceStr, 10),
            itemDuration: parseInt(durationStr, 10)
        };
    });

    const optimalCost = availableOptions.reduce((currentMinimumPrice, option) => {
        if (option.itemDuration <= timeConstraint) {
            return Math.min(currentMinimumPrice, option.itemPrice);
        }
        return currentMinimumPrice;
    }, 10000);

    return optimalCost === 10000 ? 'TLE' : optimalCost;
};

const executeProgram = (rawInputContent) => {
    const allInputLines = rawInputContent.split('\n');
    console.log(processEntries(allInputLines));
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
