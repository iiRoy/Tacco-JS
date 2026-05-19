const fileSystem = require('fs');

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const numericEntries = rawInputData.trim().split('\n').map(Number);

const currencyUnits = [
    { unitValue: 500, isSingleUnit: true },
    { unitValue: 100, isSingleUnit: false },
    { unitValue: 50, isSingleUnit: true },
    { unitValue: 10, isSingleUnit: false },
    { unitValue: 5, isSingleUnit: true },
    { unitValue: 1, isSingleUnit: false }
];

function determineCoinTotal(currentValue, unitIndex = 0) {
    if (currentValue === 0 || unitIndex >= currencyUnits.length) {
        return 0;
    }

    const activeUnit = currencyUnits[unitIndex];
    let unitCount = 0;
    let remainingValue = currentValue;

    if (activeUnit.isSingleUnit) {
        if (currentValue >= activeUnit.unitValue) {
            unitCount = 1;
            remainingValue -= activeUnit.unitValue;
        }
    } else {
        unitCount = Math.floor(currentValue / activeUnit.unitValue);
        remainingValue %= activeUnit.unitValue;
    }

    return unitCount + determineCoinTotal(remainingValue, unitIndex + 1);
}

let processingActive = true;
numericEntries.forEach(currentPayment => {
    if (processingActive) {
        if (currentPayment === 0) {
            processingActive = false;
        } else {
            const changeAmount = 1000 - currentPayment;
            const totalUnits = determineCoinTotal(changeAmount);
            console.log(totalUnits);
        }
    }
});
