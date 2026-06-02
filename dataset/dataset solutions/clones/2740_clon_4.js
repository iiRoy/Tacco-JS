const memoizedDecisions = new Map();

const determineToggleState = (currentBallZeroIndex, totalBallCount, desiredFinalStates) => {
    if (memoizedDecisions.has(currentBallZeroIndex)) {
        return memoizedDecisions.get(currentBallZeroIndex);
    }

    const currentBallOneIndex = currentBallZeroIndex + 1;
    let accumulatedToggleEffect = 0;

    const maxMultiplier = Math.floor(totalBallCount / currentBallOneIndex);
    const relevantMultipliers = Array.from({ length: Math.max(0, maxMultiplier - 1) }, (_, k) => k + 2);

    accumulatedToggleEffect = relevantMultipliers.reduce((sum, multiplier) => {
        const multipleBallZeroIndex = (currentBallOneIndex * multiplier) - 1;
        return sum + determineToggleState(multipleBallZeroIndex, totalBallCount, desiredFinalStates);
    }, 0);

    const currentBallDecision = (desiredFinalStates[currentBallZeroIndex] + accumulatedToggleEffect) % 2;

    memoizedDecisions.set(currentBallZeroIndex, currentBallDecision);
    return currentBallDecision;
};

function Main(programInput) {
    const inputLines = programInput.split('\n');
    const ballQuantity = Number(inputLines[0]);
    const targetStates = inputLines[1].split(' ').map(Number);

    memoizedDecisions.clear();

    const allToggleDecisions = Array.from({ length: ballQuantity }, (_, index) => index)
        .map(ballIdx => determineToggleState(ballIdx, ballQuantity, targetStates));

    const toggledBallIndices = allToggleDecisions.reduce((accumulator, decisionValue, decisionIndex) => {
        if (decisionValue === 1) {
            accumulator.push(decisionIndex + 1);
        }
        return accumulator;
    }, []);

    console.log(toggledBallIndices.length);
    if (toggledBallIndices.length > 0) {
        console.log(toggledBallIndices.join(' '));
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
