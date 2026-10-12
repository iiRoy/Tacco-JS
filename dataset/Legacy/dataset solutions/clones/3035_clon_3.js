"use strict";

function determineOutputChar(sourceChar, matchChar) {
    return sourceChar === matchChar ? matchChar : "*";
}

function ProcessInput(rawData) {
    const inputReader = new DataParser(rawData);

    const stringLength = inputReader.readInt();
    const sourceString = inputReader.readString();
    const targetIndex = inputReader.readInt();

    const zeroBasedTargetIndex = targetIndex - 1;
    const charToMatch = sourceString.charAt(zeroBasedTargetIndex);

    const resultChars = Array.from({ length: stringLength }, (_, idx) => {
        const currentSourceChar = sourceString.charAt(idx);
        return determineOutputChar(currentSourceChar, charToMatch);
    });

    console.log(resultChars.join(''));
}

class DataParser {
    constructor(inputContent) {
        this.currentIndex = 0;
        this.parsedTokens = inputContent.split(/\n|\s/);
    }

    _getNextToken() {
        if (this.currentIndex >= this.parsedTokens.length) {
            throw new Error("Input token stream exhausted.");
        }
        const token = this.parsedTokens[this.currentIndex];
        this.currentIndex++;
        return token;
    }

    readInt() {
        const tokenValue = this._getNextToken();
        return parseInt(tokenValue, 10);
    }

    readIntArray(count) {
        const outputArray = [];
        let elementsRead = 0;
        while (elementsRead < count) {
            outputArray.push(this.readInt());
            elementsRead++;
        }
        return outputArray;
    }

    readString() {
        return this._getNextToken();
    }

    readStringArray(count) {
        const outputArray = [];
        let elementsRead = 0;
        while (elementsRead < count) {
            outputArray.push(this.readString());
            elementsRead++;
        }
        return outputArray;
    }
}

if (typeof window === "undefined") {
    const fs = require("fs");
    const inputData = fs.readFileSync("/dev/stdin", "utf8");
    ProcessInput(inputData);
}
