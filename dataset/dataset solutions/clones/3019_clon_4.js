"use strict";

class TokenStream {
    constructor(sourceText, typeTransform) {
        this.allTokens = [];
        this.readIndex = 0;
        this.transformFn = typeTransform;

        const lines = sourceText.split("\n");
        for (const line of lines) {
            const parts = line.trim().split(" ");
            for (const part of parts) {
                if (part !== "") {
                    this.allTokens.push(part);
                }
            }
        }
    }

    getNext() {
        if (this.readIndex >= this.allTokens.length) {
            return undefined;
        }
        const token = this.allTokens[this.readIndex];
        this.readIndex++;
        return this.transformFn(token);
    }
}

function processSequence(inputData) {
    const dataReader = new TokenStream(inputData, String);

    const sequenceLength = Number(dataReader.getNext());
    const characterSequence = dataReader.getNext();

    const totalLength = characterSequence.length;

    const blackPrefixCounts = new Array(totalLength + 1).fill(0);
    for (let k = 0; k < totalLength; k++) {
        blackPrefixCounts[k + 1] = blackPrefixCounts[k] + (characterSequence[k] === '#' ? 1 : 0);
    }

    const whiteSuffixCounts = new Array(totalLength + 1).fill(0);
    for (let k = totalLength - 1; k >= 0; k--) {
        whiteSuffixCounts[k] = whiteSuffixCounts[k + 1] + (characterSequence[k] === '.' ? 1 : 0);
    }

    let minimalTransformations = Infinity;

    for (let k = 0; k <= totalLength; k++) {
        const currentCost = blackPrefixCounts[k] + whiteSuffixCounts[k];
        if (currentCost < minimalTransformations) {
            minimalTransformations = currentCost;
        }
    }

    console.log(minimalTransformations);
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
