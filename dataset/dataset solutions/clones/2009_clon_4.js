function obtainNthValidSequence(sequenceOrdinal) {
    const expandingSequences = [];

    for (let singleDigit = 1; singleDigit <= 9; singleDigit++) {
        expandingSequences.push(singleDigit);
    }

    let queuePosition = 0;
    let collectedSequences = [];

    while (collectedSequences.length < sequenceOrdinal && queuePosition < expandingSequences.length) {
        const currentSequence = expandingSequences[queuePosition++];
        collectedSequences.push(currentSequence);

        if (collectedSequences.length === sequenceOrdinal) {
            break;
        }

        const lastValue = currentSequence % 10;

        if (lastValue > 0) {
            expandingSequences.push(currentSequence * 10 + (lastValue - 1));
        }
        expandingSequences.push(currentSequence * 10 + lastValue);
        if (lastValue < 9) {
            expandingSequences.push(currentSequence * 10 + (lastValue + 1));
        }
    }

    return collectedSequences[sequenceOrdinal - 1];
}

const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
const parsedOrdinal = parseInt(rawInput);
const finalResult = obtainNthValidSequence(parsedOrdinal);
console.log(finalResult);