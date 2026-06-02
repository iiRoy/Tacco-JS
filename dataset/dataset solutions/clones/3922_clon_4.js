"use strict";

function ExecuteProgram(sourceText) {
    const dataParser = createDataStream(sourceText);
    const queryCount = dataParser.fetchInt();

    const results = Array.from({ length: queryCount }, () => {
        const valA = dataParser.fetchInt();
        const valB = dataParser.fetchInt();
        return determineValue(valA, valB);
    });

    console.log(results.join('\n'));
}

function createDataStream(sourceContent) {
    if (typeof sourceContent === 'undefined') {
        throw new Error('引数（stdin）を省略できません！');
    }

    const tokenSequence = sourceContent.split(/\n|\s/);
    let currentPosition = 0;

    const retrieveInteger = () => {
        if (currentPosition >= tokenSequence.length) {
            throw new Error("Data stream exhausted.");
        }
        return tokenSequence[currentPosition++] - 0;
    };

    const retrieveIntegerArray = (count) => {
        if (typeof count === 'undefined' || count < 1) {
            throw new Error('Count must be a positive integer!');
        }
        const resultArr = new Array(count);
        for (let k = 0; k < count; k++) {
            resultArr[k] = retrieveInteger();
        }
        return resultArr;
    };

    const retrieveString = () => {
        if (currentPosition >= tokenSequence.length) {
            throw new Error("Data stream exhausted.");
        }
        return tokenSequence[currentPosition++];
    };

    const retrieveStringArray = (count) => {
        if (typeof count === 'undefined' || count < 1) {
            throw new Error('Count must be a positive integer!');
        }
        const resultArr = new Array(count);
        for (let k = 0; k < count; k++) {
            resultArr[k] = retrieveString();
        }
        return resultArr;
    };

    return {
        fetchInt: retrieveInteger,
        fetchInts: retrieveIntegerArray,
        fetchStr: retrieveString,
        fetchStrs: retrieveStringArray
    };
}

function determineValue(valA, valB) {
    const absoluteDifference = Math.abs(valA - valB);

    if (absoluteDifference <= 1) {
        return 2 * Math.min(valA, valB) - 2;
    } else {
        const productOfValues = valA * valB;
        const calculatedK = Math.floor(Math.sqrt(productOfValues - 1));
        
        return 2 * calculatedK - (calculatedK * (calculatedK + 1) >= productOfValues ? 2 : 1);
    }
}

if (typeof window === "undefined") {
    ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
}
