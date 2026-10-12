const MOD_VAL = 1000000007;

function calculateProductSeries(limit) {
    let result = 1;
    for (let i = 1; i <= limit; i++) {
        result = (result * i) % MOD_VAL;
    }
    return result;
}

function processInputData(rawData) {
    const [valA, valB] = rawData.trim().split(' ').map(Number);
    const absoluteDifference = Math.abs(valA - valB);

    let finalOutputValue;

    if (absoluteDifference >= 2) {
        finalOutputValue = 0;
    } else {
        const productA = calculateProductSeries(valA);
        const productB = calculateProductSeries(valB);
        const intermediateProduct = (productA * productB) % MOD_VAL;

        finalOutputValue = (absoluteDifference === 0)
            ? (intermediateProduct * 2) % MOD_VAL
            : intermediateProduct;
    }
    console.log(finalOutputValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
