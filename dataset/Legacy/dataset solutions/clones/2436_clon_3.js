function calculateCombinations(n, k) {
    if (k < 0 || k > n) {
        return 0;
    }
    if (k === 0 || k === n) {
        return 1;
    }
    if (k > n / 2) {
        k = n - k;
    }

    let currentNumeratorProduct = 1;
    let currentDenominatorProduct = 1;

    for (let loopCounter = 0; loopCounter < k; loopCounter++) {
        currentNumeratorProduct *= (n - loopCounter);
        currentDenominatorProduct *= (loopCounter + 1);
    }
    return currentNumeratorProduct / currentDenominatorProduct;
}

function processInputData(rawData) {
    const RADIX_DECIMAL = 10;

    let rawDataLines = rawData.split("\n");
    let coordinateStrings = rawDataLines[0].split(" ");

    let coordX = parseInt(coordinateStrings[0], RADIX_DECIMAL);
    let coordY = parseInt(coordinateStrings[0], RADIX_DECIMAL);

    let sumOfCoords = coordX + coordY;
    if (sumOfCoords % 3 !== 0) {
        console.log(0);
        return;
    }

    let intermediateNumeratorForA = (2 * coordY) - coordX;
    let valA = intermediateNumeratorForA / 3;
    let valB = coordY - (2 * valA);

    if (valA < 0 || valB < 0) {
        console.log(0);
        return;
    }

    let totalSteps = valA + valB;
    let minSteps = Math.min(valA, valB);

    let finalResult = calculateCombinations(totalSteps, minSteps);
    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
