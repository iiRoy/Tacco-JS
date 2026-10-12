"use strict";

const applyModulo = (value, mod) => (value % mod + mod) % mod;

const getCharMultiplier = (char) => (char === '?' ? 3 : 1);

const canMatchPatternSegment = (currentChar, patternSegmentIndex, targetPatternString) => {
    const PATTERN_LENGTH_VAL = targetPatternString.length;
    return patternSegmentIndex < PATTERN_LENGTH_VAL && (currentChar === '?' || currentChar === targetPatternString[patternSegmentIndex]);
};

function processInput(rawData) {
    let inputReader = new DataParser(rawData);
    let inputString = inputReader.readString();
    let stringLength = inputString.length;

    const targetPattern = "ABC";
    const moduloValue = 1000000007;
    const PATTERN_SEGMENTS_COUNT = targetPattern.length;
    const DP_COLUMN_COUNT = PATTERN_SEGMENTS_COUNT + 1;

    let dynamicProgrammingTable = new Array(stringLength + 1);
    for (let rowIdx = 0; rowIdx <= stringLength; ++rowIdx) {
        dynamicProgrammingTable[rowIdx] = new Array(DP_COLUMN_COUNT).fill(0);
    }

    for (let currentIndex = stringLength; currentIndex >= 0; --currentIndex) {
        for (let patternIndex = PATTERN_SEGMENTS_COUNT; patternIndex >= 0; --patternIndex) {
            if (currentIndex === stringLength) {
                dynamicProgrammingTable[currentIndex][patternIndex] = (patternIndex === PATTERN_SEGMENTS_COUNT ? 1 : 0);
            } else {
                let currentCharacter = inputString[currentIndex];

                let countFromSkippingChar = dynamicProgrammingTable[currentIndex + 1][patternIndex];
                let charContributionMultiplier = getCharMultiplier(currentCharacter);
                let resultIfCharSkipped = countFromSkippingChar * charContributionMultiplier;

                let resultIfCharMatched = 0;
                if (canMatchPatternSegment(currentCharacter, patternIndex, targetPattern)) {
                    resultIfCharMatched = dynamicProgrammingTable[currentIndex + 1][patternIndex + 1];
                }

                let combinedTotal = resultIfCharSkipped + resultIfCharMatched;
                dynamicProgrammingTable[currentIndex][patternIndex] = applyModulo(combinedTotal, moduloValue);
            }
        }
    }
    console.log(dynamicProgrammingTable[0][0]);
}

class DataParser {
    constructor(sourceText) {
        this.readCount = 0;
        this.parsedItems = sourceText.split(/\n|\s/);
    }

    readInt() {
        return this.parsedItems[this.readCount++] - 0;
    }

    readIntArray(count) {
        let resultArray = new Array(count);
        for (let elementIndex = 0; elementIndex < count; elementIndex++) {
            resultArray[elementIndex] = this.readInt();
        }
        return resultArray;
    }

    readString() {
        return this.parsedItems[this.readCount++];
    }

    readStringArray(count) {
        let resultArray = new Array(count);
        for (let elementIndex = 0; elementIndex < count; elementIndex++) {
            resultArray[elementIndex] = this.readString();
        }
        return resultArray;
    }
}

if (typeof window === "undefined") {
    processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
