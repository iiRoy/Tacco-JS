function Main(input) {
    const inputLines = input.split("\n");
    const elementCount = parseInt(inputLines[0], 10);
    const numericSequence = inputLines[1].split(" ").map(s => parseInt(s, 10));

    if (elementCount === 1) {
        console.log(numericSequence[0]);
        return;
    }
    if (elementCount === 0) {
        console.log(0);
        return;
    }

    const obtainNextNextSign = (value) => (value >= 0 ? 1 : -1);

    const classifyState = (currentValue, nextValue, nextNextValue) => {
        const currentSign = currentValue >= 0 ? 1 : -1;
        const nextSign = nextValue >= 0 ? 1 : -1;
        const nextNextSign = obtainNextNextSign(nextNextValue);

        if (currentSign === nextSign) {
            return 'SAME_SIGN_CASE';
        } else if (currentSign === 1 && nextSign === -1) {
            return currentValue > Math.abs(nextValue) ? 'POS_NEG_CURRENT_GREATER' : `POS_NEG_CURRENT_LESS_EQ_${nextNextSign === 1 ? 'NN_POSITIVE' : 'NN_NEGATIVE'}`;
        } else {
            return Math.abs(currentValue) > nextValue ? 'NEG_POS_CURRENT_GREATER' : `NEG_POS_CURRENT_LESS_EQ_${nextNextSign === 1 ? 'NN_POSITIVE' : 'NN_NEGATIVE'}`;
        }
    };

    const stateActionMap = {
        'SAME_SIGN_CASE': (cVal, nVal) => ({ sumModification: Math.abs(cVal), nextIterationValue: Math.abs(nVal) }),
        'POS_NEG_CURRENT_GREATER': (cVal, nVal) => ({ sumModification: cVal, nextIterationValue: nVal }),
        'POS_NEG_CURRENT_LESS_EQ_NN_POSITIVE': (cVal, nVal) => ({ sumModification: cVal, nextIterationValue: nVal }),
        'POS_NEG_CURRENT_LESS_EQ_NN_NEGATIVE': (cVal, nVal) => ({ sumModification: -cVal, nextIterationValue: -nVal }),
        'NEG_POS_CURRENT_GREATER': (cVal, nVal) => ({ sumModification: -cVal, nextIterationValue: -nVal }),
        'NEG_POS_CURRENT_LESS_EQ_NN_NEGATIVE': (cVal, nVal) => ({ sumModification: -cVal, nextIterationValue: -nVal }),
        'NEG_POS_CURRENT_LESS_EQ_NN_POSITIVE': (cVal, nVal) => ({ sumModification: cVal, nextIterationValue: nVal }),
    };

    const finalAccumulatedState = Array.from({ length: elementCount - 1 }).reduce(
        ([currentTotalSum, previousNextValue], _, iterationIndex) => {
            const currentProcessedValue = previousNextValue;
            const nextProcessedValue = numericSequence[iterationIndex + 1];
            const lookAheadValue = numericSequence[iterationIndex + 2];

            const stateKey = classifyState(currentProcessedValue, nextProcessedValue, lookAheadValue);
            const { sumModification, nextIterationValue } = stateActionMap[stateKey](currentProcessedValue, nextProcessedValue);

            return [currentTotalSum + sumModification, nextIterationValue];
        },
        [0, numericSequence[0]]
    );

    console.log(finalAccumulatedState[0] + finalAccumulatedState[1]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
