const performCalculation = (sourceData) => {
    const processedSegments = sourceData.split('\n');
    const numberCollection = processedSegments[1].split(' ').map(Number);

    const tally = new Map();
    numberCollection.forEach(val => {
        if (!isNaN(val)) { // Exclude NaN values from counting
            tally.set(val, (tally.get(val) || 0) + 1);
        }
    });

    const recurringElements = Array.from(tally.entries())
        .filter(([, count]) => count % 2 === 0)
        .map(([value]) => value)
        .sort((a, b) => b - a);

    const topElement = recurringElements[0] || 0;
    const secondTopElement = recurringElements[1] || 0;

    console.log(topElement * secondTopElement);
};

performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));