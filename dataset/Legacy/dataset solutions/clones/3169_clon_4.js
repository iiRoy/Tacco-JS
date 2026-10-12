function entryPoint(inputContent) {
    const tokenArray = inputContent.split(" ");
    const dataStore = tokenArray.map(val => parseInt(val));

    const iterationLimit = dataStore[0];

    const effectiveIndices = Array.from({ length: Math.ceil(iterationLimit / 2) }, (_, k) => k * 2);

    const finalState = effectiveIndices.reduce((accumulator, currentLoopIndex) => {
        accumulator.modifiedDataStore[currentLoopIndex + 2] = "JPY";

        accumulator.currentSum += accumulator.modifiedDataStore[currentLoopIndex + 1];

        accumulator.lastOutput = accumulator.currentSum;

        return accumulator;
    }, { currentSum: 0, lastOutput: 0, modifiedDataStore: dataStore });

    console.log(finalState.lastOutput);
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
