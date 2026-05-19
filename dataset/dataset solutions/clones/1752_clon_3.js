"use strict";

const createInputReader = () => {
    const rawInputLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    let currentLineIndex = 0;

    const readerInstance = {
        _dataLines: rawInputLines,
        _totalLines: rawInputLines.length,

        hasMoreLines: function() {
            return currentLineIndex < this._totalLines;
        },

        readNextLine: function() {
            if (!this.hasMoreLines()) {
                throw "ArrayIndexOutOfBoundsException";
            }
            return this._dataLines[currentLineIndex++];
        },

        readNextInt: function() {
            return parseInt(this.readNextLine());
        },

        readNextStringArray: function() {
            return this.readNextLine().split(" ");
        },

        readNextIntArray: function() {
            return this.readNextLine().split(" ").map(Number);
        },

        readNextCharArray: function() {
            return this.readNextLine().split("");
        }
    };
    return readerInstance;
};

const inputProcessor = createInputReader();

const readNextLine = () => inputProcessor.readNextLine();
const readNextInt = () => inputProcessor.readNextInt();
const readNextStringArray = () => inputProcessor.readNextStringArray();
const readNextIntArray = () => inputProcessor.readNextIntArray();
const readNextCharArray = () => inputProcessor.readNextCharArray();
const hasMoreLines = () => inputProcessor.hasMoreLines();

const executeMainLogic = () => {
    const initialCount = readNextInt();
    const initialNumbers = readNextIntArray();

    const numberFrequencyMap = {};
    for (const numValue of initialNumbers) {
        numberFrequencyMap[numValue] = (numberFrequencyMap[numValue] || 0) + 1;
    }

    const queryCount = readNextInt();

    const queryFromValues = [];
    const queryToValues = [];

    for (let i = 0; i < queryCount; i++) {
        const [sourceVal, targetVal] = readNextIntArray();
        queryFromValues.push(sourceVal);
        queryToValues.push(targetVal);
    }

    let currentTotalSum = 0;
    for (const keyString in numberFrequencyMap) {
        if (Object.prototype.hasOwnProperty.call(numberFrequencyMap, keyString)) {
            currentTotalSum += parseInt(keyString) * numberFrequencyMap[keyString];
        }
    }

    for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
        const sourceValue = queryFromValues[queryIndex];
        const targetValue = queryToValues[queryIndex];

        const frequencyOfSource = numberFrequencyMap[sourceValue] || 0;

        if (frequencyOfSource > 0) {
            currentTotalSum += frequencyOfSource * (targetValue - sourceValue);

            numberFrequencyMap[targetValue] = (numberFrequencyMap[targetValue] || 0) + frequencyOfSource;
            numberFrequencyMap[sourceValue] = 0;
        }
        console.log(currentTotalSum);
    }
};

executeMainLogic();
