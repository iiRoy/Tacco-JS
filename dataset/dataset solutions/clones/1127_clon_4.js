const makeSpot = (valH, valV) => ({ valH, valV });

let collectedData = '';

process.stdin.on('data', fragment => {
    collectedData += fragment.toString();
});

process.stdin.on('end', () => {
    const lines = collectedData.trim().split('\n');
    const entityQuantity = parseInt(lines[0], 10);

    const initialCollection = Array.from({ length: entityQuantity }, (_, idx) => {
        const numericValues = lines[idx + 1].split(' ').map(Number);
        return makeSpot(numericValues[0], numericValues[1]);
    });

    const primarySpot = initialCollection.reduce((currentBest, potentialSpot) => {
        if (potentialSpot.valV < currentBest.valV) {
            return potentialSpot;
        }
        if (potentialSpot.valV === currentBest.valV && potentialSpot.valH < currentBest.valH) {
            return potentialSpot;
        }
        return currentBest;
    }, initialCollection[0]);

    const orderedCollection = [
        primarySpot,
        ...initialCollection.filter(item => item !== primarySpot)
    ];

    console.log(orderedCollection);
});