"use strict";

function* tokenStreamer(sourceText) {
    const lines = sourceText.split('\n');
    for (const currentLine of lines) {
        const lineTokens = currentLine.trim().split(' ');
        for (const tokenValue of lineTokens) {
            yield tokenValue;
        }
        yield null; // Marker for end of line
    }
}

class DataExtractor {
    constructor(sourceText, defaultParser = Number) {
        this.tokenGenerator = tokenStreamer(sourceText);
        this.currentLineTokens = [];
        this.tokenIndex = 0;
        this.parserFunction = defaultParser;
        this.populateLineBuffer();
    }

    populateLineBuffer() {
        this.currentLineTokens = [];
        this.tokenIndex = 0;
        let nextGeneratedItem = this.tokenGenerator.next();
        while (!nextGeneratedItem.done && nextGeneratedItem.value !== null) {
            this.currentLineTokens.push(nextGeneratedItem.value);
            nextGeneratedItem = this.tokenGenerator.next();
        }
    }

    retrieveSingleValue(customParser) {
        if (this.tokenIndex >= this.currentLineTokens.length) {
            this.populateLineBuffer();
            if (this.currentLineTokens.length === 0 && this.tokenGenerator.next().done) {
                return undefined;
            }
        }

        if (this.currentLineTokens.length === 0) {
            return undefined;
        }

        const tokenString = this.currentLineTokens[this.tokenIndex];
        this.tokenIndex++;
        return (customParser || this.parserFunction)(tokenString);
    }

    retrieveAllLineValues(customParser) {
        if (this.currentLineTokens.length === 0 && this.tokenGenerator.next().done) {
            return undefined;
        }

        const parsedLine = this.currentLineTokens.map(customParser || this.parserFunction);
        this.populateLineBuffer();
        return parsedLine;
    }
}

module.exports = DataExtractor;

function processInput(sourceData) {
    const dataHandler = new DataExtractor(sourceData);

    const numericInput = dataHandler.retrieveSingleValue();
    const firstPart = Math.floor(numericInput / 100);
    const secondPart = numericInput % 100;

    const isValueAMonth = (val) => val >= 1 && val <= 12;

    const firstPartIsMonth = isValueAMonth(firstPart);
    const secondPartIsMonth = isValueAMonth(secondPart);

    const decisionKey = `${firstPartIsMonth}-${secondPartIsMonth}`;

    const outcomeMap = new Map([
        ["true-true", "AMBIGUOUS"],
        ["true-false", "MMYY"],
        ["false-true", "YYMM"],
        ["false-false", "NA"]
    ]);

    console.log(outcomeMap.get(decisionKey));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
