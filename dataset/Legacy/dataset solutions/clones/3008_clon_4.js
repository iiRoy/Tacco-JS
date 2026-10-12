function calculateNetValue(sourceData) {
    const contentSegments = sourceData.split('\n');

    const assetValues = contentSegments[1].split(' ').map(Number);
    const expenseValues = contentSegments[2].split(' ').map(Number);

    const accumulatedBenefit = assetValues.reduce((currentAccumulator, currentAsset, indexPosition) => {
        const correspondingExpense = expenseValues[indexPosition];
        const differential = currentAsset - correspondingExpense;
        return currentAccumulator + Math.max(0, differential);
    }, 0);

    console.log(accumulatedBenefit);
}

calculateNetValue(require('fs').readFileSync('/dev/stdin', 'utf8'));
