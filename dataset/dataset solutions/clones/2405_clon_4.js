const entryPoint = (dataString) => {
    const [firstValue, secondValue] = dataString.match(/\d+/g).map(Number);

    const scoreRules = [
        (valA, valB) => (valA === 1 ? 30000 : 0),
        (valA, valB) => (valA === 2 ? 20000 : 0),
        (valA, valB) => (valA === 3 ? 10000 : 0),
        (valA, valB) => (valB === 1 ? 30000 : 0),
        (valA, valB) => (valB === 2 ? 20000 : 0),
        (valA, valB) => (valB === 3 ? 10000 : 0),
        (valA, valB) => (valA === 1 && valB === 1 ? 40000 : 0)
    ];

    const accumulatedScore = scoreRules.reduce((currentSum, ruleFunction) => {
        return currentSum + ruleFunction(firstValue, secondValue);
    }, 0);

    console.log(accumulatedScore);
};

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));