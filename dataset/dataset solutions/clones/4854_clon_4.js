let tokenBuffer;
let tokenIndex;

function out(resultMessage) {
    console.log(resultMessage);
}

function inS() {
    return tokenBuffer[tokenIndex++];
}

function inI() {
    return parseInt(inS(), 10);
}

function inF() {
    return parseFloat(inS());
}

const charTransformationRegistry = new Map([
    ['d', 'b'],
    ['b', 'd'],
    ['p', 'q']
]);

function retrieveMappedCharacter(sourceChar) {
    return charTransformationRegistry.get(sourceChar);
}

function Main(fullInputString) {
    tokenBuffer = fullInputString.replace(/\n/g, " ").split(" ");
    tokenIndex = 0;

    const currentSequence = inS();

    const validationSet = [
        { primary: currentSequence[0], secondary: currentSequence[3] },
        { primary: currentSequence[1], secondary: currentSequence[2] }
    ];

    const allConditionsSatisfied = validationSet.every(pair =>
        retrieveMappedCharacter(pair.primary) === pair.secondary
    );

    if (allConditionsSatisfied) {
        out("Yes");
    } else {
        out("No");
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
