function processInput(inputString) {
    const lines = inputString.split('\n');
    const numericalValues = lines[1].split(' ').map(Number);

    if (numericalValues.length < 2) {
        console.log(0);
        return;
    }

    const resultAccumulator = numericalValues.slice(1).reduce((state, currentVal, idx) => {
        const priorVal = numericalValues[idx];

        if (currentVal <= priorVal) {
            state.currentDescentLength++;
            if (state.currentDescentLength > state.maxDescentLength) {
                state.maxDescentLength = state.currentDescentLength;
            }
        } else {
            state.currentDescentLength = 0;
        }
        return state;
    }, { maxDescentLength: 0, currentDescentLength: 0 });

    console.log(resultAccumulator.maxDescentLength);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));