const obtainSourceData = () => {
    const streamContent = require('fs').readFileSync(0, 'utf8');
    return parseInt(streamContent.trim(), 10);
};

const recursivelySumNumbers = (quantity) => {
    if (quantity === 0) {
        return 0;
    }
    return (quantity % 10) + recursivelySumNumbers(Math.floor(quantity / 10));
};

const determineResultString = (initialVal, digitTotal) => {
    return initialVal % digitTotal === 0 ? 'Yes' : 'No';
};

const initialValue = obtainSourceData();
const totalOfConstituents = recursivelySumNumbers(initialValue);
const finalOutcome = determineResultString(initialValue, totalOfConstituents);

console.log(finalOutcome);