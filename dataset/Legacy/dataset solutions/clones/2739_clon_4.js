const processInput = (inputData) => {
    const lines = inputData.split('\n');
    const limit = parseInt(lines[0], 10);

    const states = new Array(limit).fill(0);
    const activeIndices = [];

    Array.from({ length: limit }, (_, idx) => limit - idx).forEach(
        (currentIdxValue) => {
            const boxPosition = currentIdxValue - 1;
            const expectedParity = parseInt(lines[currentIdxValue], 10);

            const multiples = Array.from(
                { length: Math.floor(limit / currentIdxValue) - 1 },
                (_, k) => (k + 2) * currentIdxValue
            );

            const currentSum = multiples.reduce(
                (accumulator, multiple) => accumulator + states[multiple - 1],
                0
            );

            const currentSumParity = currentSum % 2;

            const stateValue = currentSumParity === expectedParity ? 0 : 1;
            states[boxPosition] = stateValue;

            if (stateValue === 1) {
                activeIndices.push(currentIdxValue);
            }
        }
    );

    const count = activeIndices.length;

    if (count > 0) {
        console.log(count);
        const outputString = activeIndices
            .reverse()
            .map((val) => `${val}${val}`)
            .join(' ');
        console.log(outputString);
    } else {
        console.log(0);
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
