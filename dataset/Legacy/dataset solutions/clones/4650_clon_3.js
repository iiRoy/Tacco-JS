"use strict";

const fileSystemModule = require("fs");

const createInputReader = () => {
    const rawInputLines = fileSystemModule.readFileSync("/dev/stdin", "utf8").trim().split("\n");
    let currentLineIndex = 0;
    const totalLines = rawInputLines.length;

    const readerInstance = {
        lines: rawInputLines,
        currentIndex: currentLineIndex,
        maxIndex: totalLines,

        hasMoreLines: function() { return this.currentIndex < this.maxIndex; },
        retrieveNextLine: function() {
            if (!this.hasMoreLines()) {
                throw "ArrayIndexOutOfBoundsException";
            }
            return this.lines[this.currentIndex++];
        }
    };
    return readerInstance;
};

const inputSource = createInputReader();

const readNextLine = () => inputSource.retrieveNextLine();
const readNextInteger = () => Number(inputSource.retrieveNextLine());

const parseStringArrayToIntArray = (strArr) => strArr.map(val => Number(val));

const readNextStringArray = () => inputSource.retrieveNextLine().split(" ");
const readNextIntegerArray = () => parseStringArrayToIntArray(inputSource.retrieveNextLine().split(" "));
const readNextCharacterArray = () => inputSource.retrieveNextLine().split("");
const hasMoreLines = () => inputSource.hasMoreLines();

const printOutput = (...dataToLog) => console.log(...dataToLog);

const ALPHABET_SIZE = 26;
const ASCII_A_CODE = 'a'.charCodeAt(0);

const getCharIndex = (char) => char.charCodeAt(0) - ASCII_A_CODE;

const processInputAndCalculate = () => {
    const initialLineCount = readNextInteger();

    let alphabetString = '';
    for (let i = 0; i < ALPHABET_SIZE; i++) {
        alphabetString += String.fromCharCode(ASCII_A_CODE + i);
    }

    let minCharCounts = new Array(ALPHABET_SIZE).fill(-1);

    while (hasMoreLines()) {
        const currentLineString = readNextLine();
        let currentLineCharCounts = new Array(ALPHABET_SIZE).fill(0);

        for (const charVal of currentLineString) {
            const charIndex = getCharIndex(charVal);
            currentLineCharCounts[charIndex]++;
        }

        for (let i = 0; i < ALPHABET_SIZE; i++) {
            const charCountInCurrentLine = currentLineCharCounts[i];
            const existingMinCount = minCharCounts[i];

            let updatedMinCount;

            if (charCountInCurrentLine === 0) {
                updatedMinCount = 0;
            } else if (existingMinCount === -1) {
                updatedMinCount = charCountInCurrentLine;
            } else {
                updatedMinCount = Math.min(existingMinCount, charCountInCurrentLine);
            }
            minCharCounts[i] = updatedMinCount;
        }
    }

    const resultCharacters = [];

    const appendCharacters = (char, count, targetArray) => {
        for (let k = 0; k < count; k++) {
            targetArray.push(char);
        }
    };

    for (let i = 0; i < ALPHABET_SIZE; i++) {
        const finalCount = minCharCounts[i];
        if (finalCount > 0) {
            const characterToAdd = alphabetString[i];
            appendCharacters(characterToAdd, finalCount, resultCharacters);
        }
    }

    resultCharacters.sort();
    printOutput(resultCharacters.join(""));
};

processInputAndCalculate();
