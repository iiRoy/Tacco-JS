const parseRawInput = (inputString) => {
    const lines = inputString.split("\n");
    return lines.map(line => line.split(" "));
};

const convertStringMatrixToInt = (strMatrix) => {
    return strMatrix.map(row => row.map(str => parseInt(str, 10)));
};

const calculateCombinations = (totalItems, itemsToChoose) => {
    console.log(totalItems + "," + itemsToChoose);
    let numeratorProduct = 1;
    let denominatorProduct = 1;
    const iterationCount = itemsToChoose;

    for (let i = 0; i < iterationCount; i++) {
        numeratorProduct *= (totalItems - i);
        denominatorProduct *= (i + 1);
    }
    console.log(numeratorProduct + "/" + denominatorProduct + "=" + (numeratorProduct / denominatorProduct));
    return numeratorProduct / denominatorProduct;
};

function processInput(rawData) {
    const moduloValue = 1000000007;
    const processedData = convertStringMatrixToInt(parseRawInput(rawData));

    const elementCount = processedData[0][0];
    const selectionSize = processedData[0][1];
    const numberArray = processedData[1];

    numberArray.sort((a, b) => b - a); //降順に並べ替える

    let maxAccumulator = 0;
    let minAccumulator = 0;

    const kMinusOne = selectionSize - 1;

    const maxLoopEndIndex = numberArray.length - selectionSize;
    for (let currentIdx = 0; currentIdx <= maxLoopEndIndex; currentIdx++) {
        maxAccumulator += numberArray[currentIdx] * calculateCombinations(elementCount - currentIdx - 1, kMinusOne);
    }

    const minLoopStartIndex = kMinusOne;
    for (let currentIdx = minLoopStartIndex; currentIdx < numberArray.length; currentIdx++) {
        minAccumulator += numberArray[currentIdx] * calculateCombinations(currentIdx, kMinusOne);
    }

    console.log((maxAccumulator - minAccumulator) % moduloValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
//processInput("6 3\n10 10 10 -10 -10 -10")//標準入力サンプル
//processInput("10 6\n1000000000 1000000000 1000000000 1000000000 1000000000 0 0 0 0 0")
