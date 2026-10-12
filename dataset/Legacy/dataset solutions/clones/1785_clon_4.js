"use strict";

const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");

class InputTokenizer {
    #tokenBuffer;
    #currentPosition;

    constructor(sourceText) {
        this.#tokenBuffer = sourceText.split(/ |\n/);
        this.#currentPosition = 0;
    }

    #retrieveNextToken() {
        if (this.#currentPosition >= this.#tokenBuffer.length) {
            throw new Error("Input stream exhausted.");
        }
        return this.#tokenBuffer[this.#currentPosition++];
    }

    obtainNumericValue() {
        return Number(this.#retrieveNextToken());
    }

    obtainStringValue() {
        return this.#retrieveNextToken();
    }

    obtainBigIntValue() {
        return BigInt(this.#retrieveNextToken());
    }

    obtainTokenArray(count, asStrings) {
        const collectedItems = [];
        for (let i = 0; i < count; i++) {
            collectedItems.push(asStrings ? this.obtainStringValue() : this.obtainNumericValue());
        }
        return collectedItems;
    }

    obtainBigIntArray(count) {
        return Array.from({ length: count }, () => this.obtainBigIntValue());
    }

    obtainTokenMatrix(height, width, asStrings) {
        return Array.from({ length: height }, () =>
            this.obtainTokenArray(width, asStrings)
        );
    }
}

const dataStreamProcessor = new InputTokenizer(rawContent);

function constructNestedArray(baseValue, ...dimensions) {
    if (dimensions.length === 0) {
        return baseValue;
    }

    let dynamicExpression = `(() => ${JSON.stringify(baseValue)})()`;

    for (let i = dimensions.length - 1; i >= 0; i--) {
        const currentDimensionSize = dimensions[i];
        dynamicExpression = `Array.from({ length: ${currentDimensionSize} }, () => ${dynamicExpression})`;
    }
    return eval(dynamicExpression);
}

function executePrimaryLogic() {
    const initialSegment = dataStreamProcessor.obtainStringValue();
    return initialSegment.slice(0, 3);
}

console.log(executePrimaryLogic().toString());
