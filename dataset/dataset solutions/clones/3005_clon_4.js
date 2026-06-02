"use strict";

function processInput(sourceData) {
    const streamHandler = createDataStreamProcessor(sourceData);

    const elementCount = streamHandler.retrieveInteger();
    const valueSet = streamHandler.retrieveIntegerArray(elementCount);
    const costSet = streamHandler.retrieveIntegerArray(elementCount);

    const totalProfit = valueSet.reduce((currentTotal, currentValue, index) => {
        const difference = currentValue - costSet[index];
        return currentTotal + Math.max(0, difference);
    }, 0);

    console.log(totalProfit);
}

function createDataStreamProcessor(sourceText) {
    if (typeof sourceText === 'undefined') {
        throw new Error('引数（stdin）を省略できません！');
    }
    let tokenIndex = 0;
    const parsedTokens = sourceText.split(/\n|\s/);

    const fetchNumericToken = () => {
        return Number(parsedTokens[tokenIndex++]);
    };

    const fetchNumericCollection = (collectionSize) => {
        if (typeof collectionSize === 'undefined') {
            throw new Error('引数（1以上）を省略できません！');
        }
        return Array.from({ length: collectionSize }, fetchNumericToken);
    };

    const fetchStringToken = () => {
        return parsedTokens[tokenIndex++];
    };

    const fetchStringCollection = (collectionSize) => {
        if (typeof collectionSize === 'undefined') {
            throw new Error('引数（1以上）を省略できません！');
        }
        return Array.from({ length: collectionSize }, fetchStringToken);
    };

    return {
        retrieveInteger: fetchNumericToken,
        retrieveIntegerArray: fetchNumericCollection,
        retrieveString: fetchStringToken,
        retrieveStringArray: fetchStringCollection,
    };
}

if (typeof window === "undefined") {
    processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
