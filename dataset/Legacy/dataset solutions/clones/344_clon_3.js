const productSpecs = [
    { unitWeight: 500 * 3, unitPrice: 850 * 3 * 0.88, maxQuantity: 4 },
    { unitWeight: 300 * 4, unitPrice: 550 * 4 * 0.85, maxQuantity: 5 },
    { unitWeight: 200 * 5, unitPrice: 380 * 5 * 0.8, maxQuantity: 6 },
    { unitWeight: 500, unitPrice: 850, maxQuantity: 11 },
    { unitWeight: 300, unitPrice: 550, maxQuantity: 17 },
    { unitWeight: 200, unitPrice: 380, maxQuantity: 26 }
];

const NUM_PRODUCT_TYPES = productSpecs.length;

const calculateMinPrice = function(targetWeight) {
    let minimumCost = Number.MAX_SAFE_INTEGER;
    const itemCounts = Array(NUM_PRODUCT_TYPES).fill(0);

    const computeCurrentTotals = (counts, specs) => {
        let currentWeightSum = 0;
        let currentPriceSum = 0;
        for (let productIndex = 0; productIndex < NUM_PRODUCT_TYPES; productIndex++) {
            currentWeightSum += counts[productIndex] * specs[productIndex].unitWeight;
            currentPriceSum += counts[productIndex] * specs[productIndex].unitPrice;
        }
        return { weight: currentWeightSum, price: currentPriceSum };
    };

    for (itemCounts[0] = 0; itemCounts[0] < productSpecs[0].maxQuantity; itemCounts[0]++) {
    for (itemCounts[1] = 0; itemCounts[1] < productSpecs[1].maxQuantity; itemCounts[1]++) {
    for (itemCounts[2] = 0; itemCounts[2] < productSpecs[2].maxQuantity; itemCounts[2]++) {
    for (itemCounts[3] = 0; itemCounts[3] < productSpecs[3].maxQuantity; itemCounts[3]++) {
    for (itemCounts[4] = 0; itemCounts[4] < productSpecs[4].maxQuantity; itemCounts[4]++) {
    for (itemCounts[5] = 0; itemCounts[5] < productSpecs[5].maxQuantity; itemCounts[5]++) {
        const { weight: currentWeightSum, price: currentPriceSum } = computeCurrentTotals(itemCounts, productSpecs);

        if (currentWeightSum === targetWeight) {
            minimumCost = Math.min(currentPriceSum, minimumCost);
        }
    }
    }
    }
    }
    }
    }
    return minimumCost;
};

const inputLines = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (dataChunk) {
    dataChunk.trim().split('\n').forEach(function(singleLine) {
        inputLines.push(singleLine);
    });
});

process.stdin.on('end', function(){
    for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
        const parsedWeight = parseInt(inputLines[lineIndex].trim(), 10);
        if (parsedWeight === 0) {
            return;
        }
        console.log(calculateMinPrice(parsedWeight));
    }
});
