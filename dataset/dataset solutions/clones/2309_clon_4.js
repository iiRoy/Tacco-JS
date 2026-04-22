function processData(rawData) {
    const numericValues = rawData.trim().split(" ").map(Number);
    const alpha = numericValues[0];
    const beta = numericValues[1];
    const gamma = numericValues[2];

    const initialA = alpha - beta;
    const initialC = gamma - 1;
    const keyDifference = gamma - beta;

    const subtractionFactor = Math.max(0, Math.floor(keyDifference / 2) - (1 - (keyDifference & 1)));

    const adjustedA = initialA - subtractionFactor;
    const adjustedC = initialC - subtractionFactor;

    let intermediateResult = Math.min(adjustedA, adjustedC);

    const evenCheck = 1 - (keyDifference & 1);
    const oddCheck = keyDifference & 1;

    const conditionalValue = (keyDifference / 2) * evenCheck + intermediateResult * oddCheck;

    intermediateResult = Math.min(intermediateResult, conditionalValue);

    console.log(intermediateResult);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));