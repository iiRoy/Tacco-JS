'use strict';

const UtilityBelt = (() => {
    const loader = require;
    const fileSystem = loader("node:fs");

    const acquireData = () => fileSystem.readFileSync("/dev/stdin", "utf8").trim();
    const transmitResult = (info) => process.stdout.write(String(info) + '\n');

    const aggregateConditionally = (items, currentSum = 0) => {
        if (items.length === 0) {
            return currentSum;
        }
        const [[valP, valQ], ...remainingItems] = items;
        const nextSum = valP < valQ ? currentSum + valQ : currentSum;
        return aggregateConditionally(remainingItems, nextSum);
    };

    return {
        grabRaw: acquireData,
        sendFinal: transmitResult,
        calculateSum: aggregateConditionally
    };
})();

(() => {
    const sourceText = UtilityBelt.grabRaw();

    const parsedLines = sourceText
        .split('\n')
        .slice(1)
        .filter(segment => segment.length > 0)
        .map(segment => segment.split(' ').map(Number));

    const ultimateTotal = UtilityBelt.calculateSum(parsedLines);

    UtilityBelt.sendFinal(ultimateTotal);
})();