'use strict'
const createInputProcessor = (rawContent) => {
    let contentLines = rawContent.split('\n');
    if (contentLines[contentLines.length - 1] === '') {
        contentLines.pop();
    }
    let linePointer = 0;

    const extractNumbers = () => {
        const currentLine = contentLines[linePointer++];
        return currentLine.split(' ').map(Number);
    };

    const extractAllNumbers = () => {
        const startIdx = linePointer;
        linePointer = contentLines.length;
        return contentLines.slice(startIdx).map(Number);
    };

    const extractAllStrings = () => {
        const startIdx = linePointer;
        linePointer = contentLines.length;
        return contentLines.slice(startIdx);
    };

    const extractNStrings = (count) => {
        const startIdx = linePointer;
        linePointer += count;
        return contentLines.slice(startIdx, startIdx + count);
    };

    return {
        ints: extractNumbers,
        intv: extractAllNumbers,
        strv: extractAllStrings,
        strn: extractNStrings,
    };
};

const $ = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));
(() => {
    const totalCount = $.ints()[0];
    const numberSequence = $.ints();

    const sumOfSequence = numberSequence.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const averageValue = sumOfSequence / totalCount;

    const candidates = numberSequence.map((value, index) => ({
        originalValue: value,
        originalIndex: index,
        differenceFromAverage: Math.abs(value - averageValue),
    }));

    candidates.sort((itemA, itemB) => {
        if (itemA.differenceFromAverage !== itemB.differenceFromAverage) {
            return itemA.differenceFromAverage - itemB.differenceFromAverage;
        }
        return itemA.originalIndex - itemB.originalIndex;
    });

    const targetIndex = candidates[0].originalIndex;

    console.log(targetIndex);
})();
