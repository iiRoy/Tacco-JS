const processNumericalValue = (inputVal) => Math.floor(inputVal / 2);

const transformForOddPass = (currentPairState) => {
    const [leftValue, rightValue] = currentPairState;
    const modifiedLeft = processNumericalValue(leftValue);
    return [modifiedLeft, rightValue + modifiedLeft];
};

const transformForEvenPass = (currentPairState) => {
    const [leftValue, rightValue] = currentPairState;
    const modifiedRight = processNumericalValue(rightValue);
    return [leftValue + modifiedRight, modifiedRight];
};

function orchestrateCalculations(sourceData) {
    const initialLineContent = sourceData.split('\n')[0];
    const parsedNumericalInputs = initialLineContent.split(/\s/).map(Number);

    let [startingLeft, startingRight, totalRounds] = parsedNumericalInputs;

    const roundOperations = Array.from({ length: totalRounds }, (_, iterationIndex) => {
        return (iterationIndex + 1) % 2 !== 0 ? transformForOddPass : transformForEvenPass;
    });

    const finalConfiguration = roundOperations.reduce((currentConfiguration, operationFunction) => {
        return operationFunction(currentConfiguration);
    }, [startingLeft, startingRight]);

    return `${finalConfiguration[0]} ${finalConfiguration[1]}`;
}

const dataPayload = require("node:fs").readFileSync("/dev/stdin", "utf8");
console.log(orchestrateCalculations(dataPayload));