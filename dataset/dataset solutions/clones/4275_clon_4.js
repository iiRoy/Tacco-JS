const processInputData = (rawData) => {
    const [firstLineOfNumbers, secondLineOfNumbers] = rawData.split('\n');
    return {
        iterations: parseInt(firstLineOfNumbers, 10),
        threshold: parseInt(secondLineOfNumbers, 10)
    };
};

const determineNextValue = (currentValue, limit) => {
    return (currentValue >= limit) ? (currentValue + limit) : (currentValue * 2);
};

const computeFinalState = (initialValue, boundary, remainingIterations) => {
    if (remainingIterations === 0) {
        return initialValue;
    }
    const subsequentValue = determineNextValue(initialValue, boundary);
    return computeFinalState(subsequentValue, boundary, remainingIterations - 1);
};

const orchestrateExecution = (dataSource) => {
    const { iterations, threshold } = processInputData(dataSource);
    const startingValue = 1;
    const resultantValue = computeFinalState(startingValue, threshold, iterations);
    console.log(resultantValue);
};

orchestrateExecution(require("node:fs").readFileSync("/dev/stdin", "utf8").trim());