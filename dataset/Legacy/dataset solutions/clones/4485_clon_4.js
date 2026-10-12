function processInputAndCalculate(rawInput) {
    const inputLines = rawInput.split('\n');

    const controlParameters = inputLines[0].split(' ').map(Number);

    const processedBinarySequence = inputLines[1].split(' ').map(val => Number(val) % 2);

    const finalState = processedBinarySequence.reduce((currentPair, currentBit) => {
        const [stateA, stateB] = currentPair;
        return currentBit === 0
            ? [stateA * 2n, stateB * 2n]
            : [stateA + stateB, stateA + stateB];
    }, [1n, 0n]);

    console.log(finalState[controlParameters[1]].toString());
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8").trim());
