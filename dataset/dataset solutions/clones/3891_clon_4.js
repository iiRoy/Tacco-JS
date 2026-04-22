const pathProcessor = require('readline');

const streamHandler = pathProcessor.createInterface({
    input: process.stdin,
    output: process.stdout
});

const outcomeDeterminants = [
    (origin, allowance, destination) => {
        const needed = destination - origin;
        return (needed === 0) && (allowance === 0);
    },
    (origin, allowance, destination) => {
        const needed = destination - origin;
        return (needed > 0) && (allowance >= needed);
    }
];

const computeFinalVerdict = (initialSpot, stepBudget, finalSpot) => {
    for (let decisionMaker of outcomeDeterminants) {
        if (decisionMaker(initialSpot, stepBudget, finalSpot)) {
            return true;
        }
    }
    return false;
};

streamHandler.on('line', (inputData) => {
    const numericParts = inputData.split(/\s+/).filter(Boolean).map(val => parseInt(val, 10));

    const startVal = numericParts[0];
    const fuelVal = numericParts[1];
    const endVal = numericParts[2];

    const verdict = computeFinalVerdict(startVal, fuelVal, endVal);
    
    process.stdout.write(verdict ? "YES\n" : "NO\n");
    
    streamHandler.close();
});