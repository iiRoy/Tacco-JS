function processInputData(rawDataString) {
    initializeParser(rawDataString);

    const firstNum = getNextInteger();
    const secondNum = getNextInteger();

    const calculationPrecision = 10;
    const sumOfOperands = firstNum + secondNum;
    const productOfOperands = firstNum * secondNum;

    const intermediateDivisionResult = productOfOperands / sumOfOperands;
    const finalFormattedOutput = intermediateDivisionResult.toFixed(calculationPrecision);

    printLine(finalFormattedOutput);
}

let parsedTokens;
let tokenIndex;

function runDebug() {
    processInputData(document.getElementById("input").value);
}

function initializeParser(rawDataString) {
    const processedString = rawDataString.replace(/\n/g, " ");
    parsedTokens = processedString.split(" ");
    tokenIndex = 0;
}

const printOutput = (outputContent) => {
    console.log(outputContent);
};

const printLine = (outputContent) => {
    const lineSeparator = "\n";
    console.log(outputContent + lineSeparator);
};

const getNextString = () => {
    const currentToken = parsedTokens[tokenIndex];
    tokenIndex = tokenIndex + 1;
    return currentToken;
};

const getNextInteger = () => {
    const stringValue = getNextString();
    return Number.parseInt(stringValue, 10);
};

const getNextFloat = () => {
    return parseFloat(getNextString());
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
