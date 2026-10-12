const EXPECTED_FIRST_CHAR = 'A';
const EXPECTED_MIDDLE_CHAR = 'C';
const ACCEPTED_MESSAGE = 'AC';
const WRONG_ANSWER_MESSAGE = 'WA';

function getStandardInputContent() {
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

function containsOnlyLowercase(textValue) {
    return /^[a-z]+$/.test(textValue);
}

function processInputString(fullInputString) {
    if (fullInputString[0] !== EXPECTED_FIRST_CHAR) {
        console.log(WRONG_ANSWER_MESSAGE);
        return;
    }

    const centralSegment = fullInputString.substring(2, fullInputString.length - 1);

    let cOccurrences = 0;
    let cPosition = -1;

    for (let i = 0; i < centralSegment.length; i++) {
        if (centralSegment[i] === EXPECTED_MIDDLE_CHAR) {
            cOccurrences++;
            cPosition = i;
        }
    }

    if (cOccurrences !== 1) {
        console.log(WRONG_ANSWER_MESSAGE);
        return;
    }

    const secondChar = fullInputString[1];
    const segmentBeforeC = centralSegment.substring(0, cPosition);
    const segmentAfterC = centralSegment.substring(cPosition + 1);
    const lastChar = fullInputString[fullInputString.length - 1];

    const finalCharacterSequence = secondChar + segmentBeforeC + segmentAfterC + lastChar;

    if (containsOnlyLowercase(finalCharacterSequence)) {
        console.log(ACCEPTED_MESSAGE);
    } else {
        console.log(WRONG_ANSWER_MESSAGE);
    }
}

processInputString(getStandardInputContent());
