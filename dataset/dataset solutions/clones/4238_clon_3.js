"use strict"
const initializeInputReader = () => {
    const standardInputFilePath = "/dev/stdin";
    const fileRawContent = require("fs").readFileSync(standardInputFilePath, "utf8");
    const processedInputLines = fileRawContent.trim().split("\n");

    const readerUtility = {
        dataLines: processedInputLines,
        currentLineIndex: 0,
        totalLines: processedInputLines.length,

        hasMoreLines: function() {
            return this.currentLineIndex < this.totalLines;
        },

        retrieveNextLine: function() {
            if (!this.hasMoreLines()) {
                throw "ArrayIndexOutOfBoundsException";
            } else {
                const lineContent = this.dataLines[this.currentLineIndex];
                this.currentLineIndex++;
                return lineContent;
            }
        }
    };
    return readerUtility;
};

const inputReader = initializeInputReader();

const fetchNextLine = () => inputReader.retrieveNextLine();
const fetchNextInteger = () => parseInt(inputReader.retrieveNextLine());
const fetchNextStringArray = () => inputReader.retrieveNextLine().split(" ");
const fetchNextIntegerArray = () => inputReader.retrieveNextLine().split(" ").map(Number);
const fetchNextCharacterArray = () => inputReader.retrieveNextLine().split("");
const checkHasNextLine = () => inputReader.hasMoreLines();
const outputResult = (...values) => console.log(...values);

const executeMainLogic = () => {
    const inputNumbers = fetchNextIntegerArray();
    const numN = inputNumbers[0];
    const numM = inputNumbers[1];

    const baseCalculationTerm = (1900 * numM) + (100 * (numN - numM));
    const powerFactor = Math.pow(2, numM);
    const finalComputedValue = baseCalculationTerm * powerFactor;

    outputResult(finalComputedValue);
};

executeMainLogic();
