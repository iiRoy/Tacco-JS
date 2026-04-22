const acquireData = () => {
    return require("node:fs").readFileSync(0, "utf8").trim();
};

const sendResult = (outcome) => {
    console.log(outcome);
};

const transformTextToNumbers = (textInput) => {
    return textInput.split(" ").map(Number);
};

const calculateMinimumMoves = (numericalValues) => {
    let operatingValues = [...numericalValues].sort((valA, valB) => valA - valB);

    let moveCount = 0;

    const parityA = operatingValues[0] & 1;
    const parityB = operatingValues[1] & 1;
    const parityC = operatingValues[2] & 1;

    if (!(parityA === parityB && parityB === parityC)) {
        moveCount++;

        const parityOccurrences = [parityA, parityB, parityC];
        let predominantParity;
        if (parityOccurrences.filter(p => p === 0).length > 1) {
            predominantParity = 0;
        } else {
            predominantParity = 1;
        }

        for (let k = 0; k < operatingValues.length; k++) {
            if ((operatingValues[k] & 1) === predominantParity) {
                operatingValues[k]++;
            }
        }
    }

    const maximalValue = Math.max(...operatingValues);

    moveCount += operatingValues.reduce((totalDiffMoves, currentVal) => {
        return totalDiffMoves + (maximalValue - currentVal) / 2;
    }, 0);

    return moveCount;
};

sendResult(calculateMinimumMoves(transformTextToNumbers(acquireData())));