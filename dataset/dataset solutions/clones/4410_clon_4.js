const fileSystem = require('fs');

const MOD_CONSTANT = 1000000007;

const PREVIOUS_OUTCOME_STATE = {
    INITIAL: Symbol('INITIAL'),
    LAST_MATCH: Symbol('LAST_MATCH'),
    LAST_MISMATCH: Symbol('LAST_MISMATCH')
};

const FACTOR_MAP = new Map([
    [true, new Map([
        [PREVIOUS_OUTCOME_STATE.INITIAL, 3],
        [PREVIOUS_OUTCOME_STATE.LAST_MATCH, 2],
        [PREVIOUS_OUTCOME_STATE.LAST_MISMATCH, 1]
    ])],
    [false, new Map([
        [PREVIOUS_OUTCOME_STATE.INITIAL, 6],
        [PREVIOUS_OUTCOME_STATE.LAST_MATCH, 2],
        [PREVIOUS_OUTCOME_STATE.LAST_MISMATCH, 3]
    ])]
]);

const NEXT_STATE_TRANSITION = new Map([
    [true, PREVIOUS_OUTCOME_STATE.LAST_MATCH],
    [false, PREVIOUS_OUTCOME_STATE.LAST_MISMATCH]
]);

function computeSequenceValue(currentPosition, accumulatedProduct, priorState, totalElements, sequenceOne, sequenceTwo) {
    if (currentPosition >= totalElements) {
        return accumulatedProduct;
    }

    const charFromOne = sequenceOne.charAt(currentPosition);
    const charFromTwo = sequenceTwo.charAt(currentPosition);
    const areEquivalent = (charFromOne === charFromTwo);

    const multiplier = FACTOR_MAP.get(areEquivalent).get(priorState);
    const nextProduct = (accumulatedProduct * multiplier) % MOD_CONSTANT;
    const nextState = NEXT_STATE_TRANSITION.get(areEquivalent);
    const nextPosition = currentPosition + (areEquivalent ? 1 : 2);

    return computeSequenceValue(nextPosition, nextProduct, nextState, totalElements, sequenceOne, sequenceTwo);
}

const mainProcessor = function() {
    const inputContent = fileSystem.readFileSync("/dev/stdin", "UTF-8");
    const contentLines = inputContent.split('\n');
    const elementCount = Number(contentLines[0]);
    const firstString = contentLines[1];
    const secondString = contentLines[2];

    const finalResult = computeSequenceValue(
        0,
        1,
        PREVIOUS_OUTCOME_STATE.INITIAL,
        elementCount,
        firstString,
        secondString
    );

    console.log(finalResult);
};

module.exports = mainProcessor;
mainProcessor();
