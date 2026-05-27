'use strict';
(function() {
    const { readFileSync } = require('node:fs');
    const rawData = readFileSync('/dev/stdin', 'utf8');

    const [valA, valB, valC] = rawData
        .split('\n')[0]
        .split(' ')
        .map(Number);

    const numericCollection = [valA, valB, valC];
    const smallestNum = numericCollection.reduce((acc, current) => Math.min(acc, current), Infinity);
    const largestNum = numericCollection.reduce((acc, current) => Math.max(acc, current), -Infinity);

    let middleNum = undefined;

    const conditionActionMap = [
        { test: (x, y, z) => x < y, result: (x, y, z) => x },
        { test: (x, y, z) => y < z, result: (x, y, z) => y },
        { test: (x, y, z) => x <= z, result: (x, y, z) => z }
    ];

    conditionActionMap.forEach(operation => {
        if (operation.test(valA, valB, valC)) {
            middleNum = operation.result(valA, valB, valC);
        }
    });

    console.log(smallestNum, middleNum, largestNum);
})();
