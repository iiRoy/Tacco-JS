const productSpecs = [
    { unitCost: 500 * 3, unitPrice: 850 * 3 * 0.88, maxCount: 4 },
    { unitCost: 300 * 4, unitPrice: 550 * 4 * 0.85, maxCount: 5 },
    { unitCost: 200 * 5, unitPrice: 380 * 5 * 0.8, maxCount: 6 },
    { unitCost: 500, unitPrice: 850, maxCount: 11 },
    { unitCost: 300, unitPrice: 550, maxCount: 17 },
    { unitCost: 200, unitPrice: 380, maxCount: 26 }
];

const calculateMinPrice = (targetCost) => {
    const priceMap = new Array(targetCost + 1).fill(Number.POSITIVE_INFINITY);
    priceMap[0] = 0;

    for (const product of productSpecs) {
        const { unitCost, unitPrice, maxCount } = product;

        for (let currentCost = targetCost; currentCost >= 0; --currentCost) {
            if (priceMap[currentCost] === Number.POSITIVE_INFINITY) {
                continue;
            }

            for (let count = 1; count <= maxCount; ++count) {
                const nextCost = currentCost + count * unitCost;
                if (nextCost <= targetCost) {
                    const potentialPrice = priceMap[currentCost] + count * unitPrice;
                    priceMap[nextCost] = Math.min(priceMap[nextCost], potentialPrice);
                }
            }
        }
    }

    const finalPrice = priceMap[targetCost];
    return finalPrice === Number.POSITIVE_INFINITY ? 100000000 : finalPrice;
};

const receivedData = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputChunk) => {
    inputChunk.trim().split('\n').forEach((singleLine) => {
        receivedData.push(singleLine);
    });
});

process.stdin.on('end', () => {
    for (let currentIdx = 0; currentIdx < receivedData.length; ++currentIdx) {
        const targetAmount = parseInt(receivedData[currentIdx].trim(), 10);
        if (targetAmount === 0) {
            return;
        }
        console.log(calculateMinPrice(targetAmount));
    }
});
