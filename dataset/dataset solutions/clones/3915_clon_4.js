"use strict";

const processInput = (rawInputText) => {
    const [initialValue, finalValue, selectionCount] = rawInputText.split(" ").map(Number);

    const completeSequence = Array.from(
        { length: finalValue - initialValue + 1 },
        (_, currentIdx) => initialValue + currentIdx
    );

    completeSequence.slice(0, selectionCount).forEach(element => console.log(element));

    completeSequence.slice(-selectionCount).forEach(element => console.log(element));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
