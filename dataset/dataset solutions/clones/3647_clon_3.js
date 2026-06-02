"use strict";
function ProcessInput(rawData) {
    let inputParser = new DataStreamReader(rawData);
    let inputString = inputParser.readString();
    let stringLength = inputString.length;

    const targetChars = "ABC";
    const moduloVal = 1e9 + 7;
    const targetMatchLength = 3;
    const questionMarkChar = '?';

    let dynamicProgTable = [];
    for (let k = 0; k <= stringLength; k++) {
        dynamicProgTable.push(new Array(targetMatchLength + 1).fill(0));
    }

    for (let currIdx = stringLength; currIdx >= 0; --currIdx) {
        for (let charMatchCount = targetMatchLength; charMatchCount >= 0; --charMatchCount) {
            if (currIdx === stringLength) {
                dynamicProgTable[currIdx][charMatchCount] = (charMatchCount === targetMatchLength ? 1 : 0);
            } else {
                const currentChar = inputString[currIdx];
                const nextRowSameCount = dynamicProgTable[currIdx + 1][charMatchCount];

                let passThroughMultiplier = (currentChar === questionMarkChar) ? targetMatchLength : 1;
                let currentWays = (nextRowSameCount * passThroughMultiplier) % moduloVal;

                if (charMatchCount < targetMatchLength) {
                    const targetCharForMatch = targetChars[charMatchCount];
                    const canMatchCurrentChar = (currentChar === questionMarkChar || currentChar === targetCharForMatch);

                    if (canMatchCurrentChar) {
                        const nextRowNextCount = dynamicProgTable[currIdx + 1][charMatchCount + 1];
                        currentWays = (currentWays + nextRowNextCount) % moduloVal;
                    }
                }
                dynamicProgTable[currIdx][charMatchCount] = currentWays;
            }
        }
    }
    console.log(dynamicProgTable[0][0]);
}

class DataStreamReader {
    constructor(sourceText) {
        this.readCount = 0;
        this.parsedItems = sourceText.split(/\n|\s/);
    }

    readInt() {
        const value = this.parsedItems[this.readCount++];
        return parseInt(value, 10);
    }

    readIntArray(count) {
        let intArray = new Array(count);
        for (let idx = 0; idx < count; idx++) {
            intArray[idx] = this.readInt();
        }
        return intArray;
    }

    readString() {
        return this.parsedItems[this.readCount++];
    }

    readStringArray(count) {
        let strArray = new Array(count);
        for (let idx = 0; idx < count; idx++) {
            strArray[idx] = this.readString();
        }
        return strArray;
    }
}

if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
