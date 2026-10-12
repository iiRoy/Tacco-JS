"use strict"

const makeInputReader = () => {
    const fileSystemModule = require("fs");
    const rawDataLines = fileSystemModule.readFileSync("/dev/stdin", "utf8").trim().split("\n");
    
    class LineReader {
        constructor(linesContent) {
            this.lineList = linesContent;
            this.currentIndex = 0;
            this.maxLines = linesContent.length;
        }

        hasMoreLines() {
            return this.currentIndex < this.maxLines;
        }

        readNextLine() {
            if (!this.hasMoreLines()) {
                throw "ArrayIndexOutOfBoundsException";
            }
            const currentLine = this.lineList[this.currentIndex];
            this.currentIndex++;
            return currentLine;
        }
    }

    return new LineReader(rawDataLines);
};

const dataStreamInstance = makeInputReader();

const inputParsers = {
    readNextLine: () => dataStreamInstance.readNextLine(),
    readNextInteger: () => parseInt(dataStreamInstance.readNextLine(), 10),
    readNextStringArray: () => dataStreamInstance.readNextLine().split(" "),
    readNextIntegerArray: () => inputParsers.readNextStringArray().map(strVal => parseInt(strVal, 10)),
    readNextCharacterArray: () => dataStreamInstance.readNextLine().split(""),
    hasMoreLines: () => dataStreamInstance.hasMoreLines()
};

const printOutput = (...outputArguments) => console.log(...outputArguments);

const calculateFactorial = (inputNumber) => {
    let factorialResult = 1;
    let currentCounter = 1;
    while(currentCounter <= inputNumber){
        factorialResult *= currentCounter;
        currentCounter++;
    } 
    return factorialResult;
};

const computeFactorialModulo = (valueToFactorial, modulusValue) => {
    let currentProduct = 1;
    for (let loopIndex = 1; loopIndex <= valueToFactorial; loopIndex++) {
        currentProduct = (currentProduct * loopIndex) % modulusValue;
    }
    return currentProduct;
};

const executeMainLogic = () => {
    const [valN, valM] = inputParsers.readNextIntegerArray();

    const absoluteDifference = Math.abs(valN - valM);
    if (absoluteDifference > 1) {
        printOutput(0);
        return;
    }

    const moduloConstant = 1e9 + 7;

    const factorialNMod = computeFactorialModulo(valN, moduloConstant);
    const factorialMMod = computeFactorialModulo(valM, moduloConstant);

    let finalComputedResult = (factorialNMod * factorialMMod) % moduloConstant;

    if (valN === valM) {
        const twoMultiplier = 2;
        finalComputedResult = (finalComputedResult * twoMultiplier) % moduloConstant;
    }
    
    printOutput(finalComputedResult);
};

executeMainLogic();
