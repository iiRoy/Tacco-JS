function myout(text){console.log(text);}

const stateTransitionRules = {
    0: { // previousBlockState: 0 (Vertical)
        0: { factor: 2, nextPrevState: 0 }, // currentBlockType: 0 (Vertical) -> nextPrevState: 0 (Vertical)
        1: { factor: 2, nextPrevState: 1 }, // currentBlockType: 1 (Horizontal) -> nextPrevState: 1 (Horizontal)
    },
    1: { // previousBlockState: 1 (Horizontal)
        0: { factor: 1, nextPrevState: 0 }, // currentBlockType: 0 (Vertical) -> nextPrevState: 0 (Vertical)
        1: { factor: 3, nextPrevState: 1 }, // currentBlockType: 1 (Horizontal) -> nextPrevState: 1 (Horizontal)
    }
};

const initialRules = {
    0: { factor: 3, nextPrevState: 0 }, // currentBlockType: 0 (Vertical) -> nextPrevState: 0 (Vertical)
    1: { factor: 6, nextPrevState: 1 }, // currentBlockType: 1 (Horizontal) -> nextPrevState: 1 (Horizontal)
};

function calculateSequence(currentPosition, previousBlockState, currentAccumulator, totalLength, stringOne, stringTwo, moduloValue) {
    if (currentPosition >= totalLength) {
        return currentAccumulator;
    }

    const isCurrentBlockVertical = (stringOne[currentPosition] === stringTwo[currentPosition]) ? 0 : 1; // 0 for vertical, 1 for horizontal

    let ruleData;
    let positionAdvance;

    if (currentPosition === 0) {
        ruleData = initialRules[isCurrentBlockVertical];
        positionAdvance = (isCurrentBlockVertical === 0) ? 1 : 2;
    } else {
        ruleData = stateTransitionRules[previousBlockState][isCurrentBlockVertical];
        positionAdvance = (isCurrentBlockVertical === 0) ? 1 : 2;
    }

    const nextAccumulator = (currentAccumulator * ruleData.factor) % moduloValue;
    const nextPosition = currentPosition + positionAdvance;
    const nextPreviousBlockState = ruleData.nextPrevState;

    return calculateSequence(nextPosition, nextPreviousBlockState, nextAccumulator, totalLength, stringOne, stringTwo, moduloValue);
}

function Main(inputContent) {
    const lines = inputContent.trim().split("\n");
    const totalLength = parseInt(lines[0]);
    const firstString = lines[1].split("");
    const secondString = lines[2].split("");
    const moduloConstant = 1000000007;

    const finalResult = calculateSequence(0, null, 1, totalLength, firstString, secondString, moduloConstant);
    myout(finalResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
