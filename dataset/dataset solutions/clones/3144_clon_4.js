function calculateMinCost(sourceData) {
    const lines = sourceData.trim().split('\n');

    const firstLineValues = lines[0].split(' ').map(Number);
    let targetQuantity = firstLineValues[1];

    const merchandiseOfferings = lines.slice(1).map(line => {
        const parts = line.split(' ').map(Number);
        return { pricePerUnit: parts[0], availableUnits: parts[1] };
    });

    merchandiseOfferings.sort((a, b) => a.pricePerUnit - b.pricePerUnit);

    const finalResult = merchandiseOfferings.reduce((accumulator, currentItem) => {
        if (accumulator.remainingToAcquire === 0) {
            return accumulator;
        }

        const unitsToPurchase = Math.min(currentItem.availableUnits, accumulator.remainingToAcquire);
        
        accumulator.accumulatedValue += unitsToPurchase * currentItem.pricePerUnit;
        accumulator.remainingToAcquire -= unitsToPurchase;

        return accumulator;
    }, { accumulatedValue: 0, remainingToAcquire: targetQuantity });

    return finalResult.accumulatedValue;
}