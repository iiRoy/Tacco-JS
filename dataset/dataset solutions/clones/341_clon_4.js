const pricingRegistry = (() => {
    const generator = (limitA, limitB, limitC) => {
        const rangeA = Array.from({ length: limitA + 1 }, (_, index) => index);
        const rangeB = Array.from({ length: limitB + 1 }, (_, index) => index);
        const rangeC = Array.from({ length: limitC + 1 }, (_, index) => index);

        const calculateItemCostA = (count) => (380 * 5 * 0.8 * Math.floor(count / 5)) + (380 * (count % 5));
        const calculateItemCostB = (count) => (550 * 4 * 0.85 * Math.floor(count / 4)) + (550 * (count % 4));
        const calculateItemCostC = (count) => (850 * 3 * 0.88 * Math.floor(count / 3)) + (850 * (count % 3));

        const storedValues = new Map();

        rangeA.forEach(valA => {
            rangeB.forEach(valB => {
                rangeC.forEach(valC => {
                    const currentTotalWeight = (200 * valA) + (300 * valB) + (500 * valC);
                    if (currentTotalWeight > 5000) return;

                    const currentTotalCost = calculateItemCostA(valA) + calculateItemCostB(valB) + calculateItemCostC(valC);

                    if (!storedValues.has(currentTotalWeight) || currentTotalCost < storedValues.get(currentTotalWeight)) {
                        storedValues.set(currentTotalWeight, currentTotalCost);
                    }
                });
            });
        });
        return storedValues;
    };

    return generator(25, 16, 10);
})();

const queryProcessor = (dataMap) => {
    const systemInput = require('fs').readFileSync('/dev/stdin', 'utf8');
    const linesOfInput = systemInput.trim().split("\n");
    let currentIndex = 0;
    const resultBuffer = [];

    while (true) {
        const currentLineValue = linesOfInput[currentIndex++];
        if (currentLineValue === undefined) break;
        const numericValue = Number(currentLineValue);
        if (numericValue === 0) break;
        resultBuffer.push(dataMap.get(numericValue));
    }
    console.log(resultBuffer.join("\n"));
};

queryProcessor(pricingRegistry);