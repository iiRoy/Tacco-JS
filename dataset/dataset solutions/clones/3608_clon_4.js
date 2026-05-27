const computeDivisorCount = (targetNumber) => {
    return Array.from({ length: targetNumber + 1 }, (_, indexValue) => indexValue)
                .filter(potentialDivisor => targetNumber % potentialDivisor === 0)
                .length;
};

const executeSolution = (inputData) => {
    const numericValue = Number(inputData);

    const finalTally = Array.from({ length: numericValue + 1 }, (_, currentIteration) => currentIteration)
        .filter(valueCandidate => valueCandidate % 2 !== 0)
        .filter(oddCandidate => computeDivisorCount(oddCandidate) === 8)
        .length;

    console.log(finalTally);
};

executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
