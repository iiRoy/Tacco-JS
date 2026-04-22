const ultimateModulus = 1000000007;
const invFactorial2 = 500000004;
const invFactorial6 = 166666668;

const modProduct = (val1, val2) => {
    return (BigInt(val1) * BigInt(val2)) % BigInt(ultimateModulus);
};

const modAdd = (val1, val2) => {
    return (BigInt(val1) + BigInt(val2)) % BigInt(ultimateModulus);
};

const modSubtract = (val1, val2) => {
    return (BigInt(val1) - BigInt(val2) + BigInt(ultimateModulus)) % BigInt(ultimateModulus);
};

const sumUpToValue = (x) => {
    if (x <= 0) return 0;
    const term1 = BigInt(x);
    const term2 = BigInt(x + 1);
    return modProduct(modProduct(term1, term2), invFactorial2);
};

const sumSquaresUpToValue = (x) => {
    if (x <= 0) return 0;
    const term1 = BigInt(x);
    const term2 = BigInt(x + 1);
    const term3 = BigInt(2 * x + 1);
    return modProduct(modProduct(modProduct(term1, term2), term3), invFactorial6);
};

const processInputData = (incomingText) => {
    const numericals = incomingText.trim().split(' ').map(Number);
    const topNumber = numericals[0];
    const bottomNumber = numericals[1];

    const iterationMaximum = topNumber + 1;
    const iterationMinimum = bottomNumber;

    const sumOfSequentialNumbers = modSubtract(sumUpToValue(iterationMaximum), sumUpToValue(iterationMinimum - 1));
    const sumOfSquaredNumbers = modSubtract(sumSquaresUpToValue(iterationMaximum), sumSquaresUpToValue(iterationMinimum - 1));
    const totalCount = iterationMaximum - iterationMinimum + 1;

    let finalCalculation = modProduct(BigInt(topNumber + 1), sumOfSequentialNumbers);
    finalCalculation = modSubtract(finalCalculation, sumOfSquaredNumbers);
    finalCalculation = modAdd(finalCalculation, BigInt(totalCount));

    console.log(Number(finalCalculation));
};

function test() { /* No specific tests defined for this clone's test branch. */ }

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : processInputData(require('fs').readFileSync('dev/stdin', 'utf8')))
  : processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));