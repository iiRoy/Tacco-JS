const primeModulo = 1000000007;

const seriesProduct = (limit) => {
    let currentAccumulation = 1;
    for (let idx = 1; idx <= limit; ++idx) {
        currentAccumulation = (currentAccumulation * idx) % primeModulo;
    }
    return currentAccumulation;
};

const performComputation = (rawData) => {
    const dataLines = rawData.split('\n');
    const firstLineNumbers = dataLines[0].trim().split(' ').map(Number);

    const valA = firstLineNumbers[0];
    const valB = firstLineNumbers[1];

    const absoluteGap = Math.abs(valA - valB);

    const outputValue = (absoluteGap >= 2)
        ? 0
        : (absoluteGap === 1)
            ? (seriesProduct(valA) * seriesProduct(valB)) % primeModulo
            : (seriesProduct(valA) * seriesProduct(valB) * 2) % primeModulo;
            
    console.log(outputValue);
};

performComputation(require("fs").readFileSync("/dev/stdin", "utf8"));