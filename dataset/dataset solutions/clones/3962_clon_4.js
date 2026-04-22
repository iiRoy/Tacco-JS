function computeMaximumBalance(rawSequence) {
    const parsedLines = rawSequence.split('\n');

    const firstBlockSize = Number(parsedLines[0]);
    const secondBlockSize = Number(parsedLines[firstBlockSize + 1]);

    const positiveEntries = parsedLines.slice(1, firstBlockSize + 1);
    const negativeEntries = parsedLines.slice(firstBlockSize + 2, firstBlockSize + 2 + secondBlockSize);

    const itemBalanceMap = positiveEntries.reduce((accumulator, currentItem) => {
        accumulator.set(currentItem, (accumulator.get(currentItem) || 0) + 1);
        return accumulator;
    }, new Map());

    negativeEntries.forEach(currentItem => {
        itemBalanceMap.set(currentItem, (itemBalanceMap.get(currentItem) || 0) - 1);
    });

    let highestBalanceValue = -Infinity;

    if (itemBalanceMap.size > 0) {
        highestBalanceValue = Math.max(...itemBalanceMap.values());
    } else {
        highestBalanceValue = 0;
    }

    if (highestBalanceValue < 0) {
        console.log(0);
    } else {
        console.log(highestBalanceValue);
    }
}

const fileSystemAccess = require('fs');
computeMaximumBalance(fileSystemAccess.readFileSync('/dev/stdin', 'utf8'));