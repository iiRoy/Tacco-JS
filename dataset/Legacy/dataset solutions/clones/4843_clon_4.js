function processSweetData(rawInput) {
    const inputLines = rawInput.split('\n');
    const firstLineElements = inputLines[0].split(' ');
    const containerCount = parseInt(firstLineElements[0], 10);
    const limitPerPair = parseInt(firstLineElements[1], 10);

    let sweetUnits = inputLines[1].split(' ').map(Number);

    const initialProcessingState = {
        currentSweetUnits: sweetUnits,
        consumedTotal: 0
    };

    const finalProcessingState = Array.from({ length: sweetUnits.length - 1 }, (_, k) => k).reduce((accumulator, currentIdx) => {
        const { currentSweetUnits, consumedTotal } = accumulator;

        const firstUnitIndex = currentIdx;
        const secondUnitIndex = currentIdx + 1;

        const firstUnitAmount = currentSweetUnits[firstUnitIndex];
        const secondUnitAmount = currentSweetUnits[secondUnitIndex];

        const currentPairSum = firstUnitAmount + secondUnitAmount;

        if (currentPairSum > limitPerPair) {
            const excessAmount = currentPairSum - limitPerPair;
            const nextSweetUnits = currentSweetUnits.slice(); // Create a new array for modification
            const nextConsumedTotal = consumedTotal + excessAmount;

            if (excessAmount <= nextSweetUnits[secondUnitIndex]) {
                nextSweetUnits[secondUnitIndex] -= excessAmount;
            } else {
                const remainingExcess = excessAmount - nextSweetUnits[secondUnitIndex];
                nextSweetUnits[secondUnitIndex] = 0;
                nextSweetUnits[firstUnitIndex] -= remainingExcess;
            }
            return {
                currentSweetUnits: nextSweetUnits,
                consumedTotal: nextConsumedTotal
            };
        } else {
            return accumulator; // No change needed
        }
    }, initialProcessingState);

    console.log(finalProcessingState.consumedTotal);
}

processSweetData(require("fs").readFileSync("/dev/stdin", "utf8"));
