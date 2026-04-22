const computeUnitDistribution = (amountValue, unitSpecifications) => {
    const unitCounts = new Array(unitSpecifications.length).fill(0);
    let remainingAmount = amountValue;

    const orderedUnits = [...unitSpecifications].sort((a, b) => b.faceValue - a.faceValue);

    for (const { faceValue, positionInPurse } of orderedUnits) {
        if (remainingAmount >= faceValue) {
            const countForUnit = Math.floor(remainingAmount / faceValue);
            unitCounts[positionInPurse] += countForUnit;
            remainingAmount -= countForUnit * faceValue;
        }
    }
    return unitCounts;
};

const handleExchangeScenario = (transactionPrice, clientHoldings) => {
    const currencyDenominations = [
        { faceValue: 10, positionInPurse: 0 },
        { faceValue: 50, positionInPurse: 1 },
        { faceValue: 100, positionInPurse: 2 },
        { faceValue: 500, positionInPurse: 3 }
    ];

    const totalClientValue = clientHoldings.reduce((total, count, idx) => total + count * currencyDenominations[idx].faceValue, 0);

    const changeAmount = totalClientValue - transactionPrice;

    const returnedUnitQuantities = computeUnitDistribution(Math.max(0, changeAmount), currencyDenominations);

    const unusedUnitStatements = [];
    clientHoldings.forEach((initialUnitCount, idx) => {
        const dispensedUnitCount = returnedUnitQuantities[idx];
        if (initialUnitCount > dispensedUnitCount) {
            unusedUnitStatements.push(`${currencyDenominations[idx].faceValue} ${initialUnitCount - dispensedUnitCount}`);
        }
    });
    return unusedUnitStatements;
};

const acquireInputData = require('node:fs').readFileSync;
const rawInputString = acquireInputData('/dev/stdin', 'utf8');
const inputLineSegments = rawInputString.trim().split('\n');

let segmentPointer = 0;
const accumulatedReports = [];

while (true) {
    const costString = inputLineSegments[segmentPointer++];
    const costValue = Number(costString);

    if (costValue === 0) {
        break;
    }

    const holdingsString = inputLineSegments[segmentPointer++];
    const holdingsArray = holdingsString.split(' ').map(Number);

    const reportLinesForScenario = handleExchangeScenario(costValue, holdingsArray);
    accumulatedReports.push(reportLinesForScenario);
}

const formattedOutput = accumulatedReports.map(report => report.join('\n')).join('\n');
console.log(formattedOutput);