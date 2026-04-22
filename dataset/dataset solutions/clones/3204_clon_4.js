function evaluateInput(sourceString) {
    const numericalItems = sourceString.split(/\s+/).filter(Boolean).map(x => Number(x));

    const tally = numericalItems.reduce((acc, value) => {
        if (value < 1 || value > 4 || !Number.isInteger(value)) {
            acc.invalid = true;
        }
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});

    if (tally.invalid) {
        return 'NO';
    }

    const expectedKeys = new Set([1, 2, 3, 4]);
    const actualKeys = new Set(Object.keys(tally).map(Number));

    if (actualKeys.size !== expectedKeys.size || !Array.from(expectedKeys).every(k => actualKeys.has(k))) {
        return 'NO';
    }

    let singleCounts = 0;
    let doubleCounts = 0;

    for (let k = 1; k <= 4; k++) {
        const count = tally[k];
        if (count === 1) {
            singleCounts++;
        } else if (count === 2) {
            doubleCounts++;
        } else {
            return 'NO';
        }
    }

    if (singleCounts === 2 && doubleCounts === 2) {
        return 'YES';
    } else {
        return 'NO';
    }
}

(function runExecution() {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    console.log(evaluateInput(fileContent));
})();