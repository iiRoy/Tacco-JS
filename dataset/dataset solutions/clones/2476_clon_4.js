function calculateFactorialDifferenceSum(inputNumericalValue) {
    let optimumFirstFactor = 1;
    let optimumSecondFactor = inputNumericalValue;
    let minimalFactorDifference = Math.abs(optimumFirstFactor - optimumSecondFactor);

    for (let trialFactor = 2; trialFactor * trialFactor <= inputNumericalValue; trialFactor++) {
        if (inputNumericalValue % trialFactor === 0) {
            let complementaryFactor = inputNumericalValue / trialFactor;
            let currentFactorDifference = Math.abs(trialFactor - complementaryFactor);

            if (currentFactorDifference < minimalFactorDifference) {
                minimalFactorDifference = currentFactorDifference;
                optimumFirstFactor = trialFactor;
                optimumSecondFactor = complementaryFactor;
            }
        }
    }

    return (optimumFirstFactor - 1) + (optimumSecondFactor - 1);
}

const commandLineArgument = process.argv[2];
const processedInput = parseInt(commandLineArgument, 10);

const finalOutcome = calculateFactorialDifferenceSum(processedInput);

console.log(finalOutcome);