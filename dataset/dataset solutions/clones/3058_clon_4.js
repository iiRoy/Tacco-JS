var inputLines = [];

var standardInput = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

standardInput.on('line', function (lineContent) {
    inputLines.push(lineContent);
});

standardInput.on('close', function () {
    var firstLineParts = inputLines.shift().split(" ");
    var numVal = Number(firstLineParts[0]);
    var flipLimit = Number(firstLineParts[1]);

    var charSequence = inputLines[0];

    const initialGroups = charSequence.split('').reduce((accumulator, char) => {
        const lastGroup = accumulator.length > 0 ? accumulator[accumulator.length - 1] : null;
        if (lastGroup && lastGroup.char === char) {
            lastGroup.count++;
        } else {
            accumulator.push({ char: char, count: 1 });
        }
        return accumulator;
    }, []);

    let processedCounts = [];
    if (initialGroups.length > 0 && initialGroups[0].char === '0') {
        processedCounts.push(0);
    }

    initialGroups.forEach(group => {
        processedCounts.push(group.count);
    });

    if (processedCounts.length % 2 === 0) {
        processedCounts.push(0);
    }

    const windowSpan = 2 * flipLimit + 1;

    const windowTotals = Array.from({ length: processedCounts.length }, (_, idx) => idx)
        .filter(idx => idx % 2 === 0)
        .map(startIdx => {
            let currentWindowTotal = 0;
            for (let offset = 0; offset < windowSpan; offset++) {
                currentWindowTotal += processedCounts[startIdx + offset];
            }
            return currentWindowTotal;
        });

    let maxConsecutiveOnes = 1;
    const validWindowTotals = windowTotals.filter(val => !Number.isNaN(val));

    if (validWindowTotals.length > 0) {
        maxConsecutiveOnes = Math.max(1, ...validWindowTotals);
    }

    console.log(maxConsecutiveOnes);
});
