const displayResult = (value) => console.log(value);

function processInputAndSolve(rawInput) {
    const numericStrings = rawInput.trim().match(/-?\d+/g);
    const numericValues = numericStrings.map(Number);

    const initialA = numericValues[0];
    const initialB = numericValues[1];
    const initialC = numericValues[2];
    const desiredSum = numericValues[3];

    const sortedCoefficients = [initialA, initialB, initialC].sort((x, y) => y - x);

    const smallestCoefficient = sortedCoefficients[2];

    function calculateCombinations(currentRemainingSum, currentCoefficientIndex) {
        if (currentRemainingSum < 0) {
            return 0;
        }

        if (currentCoefficientIndex === 2) {
            return (currentRemainingSum % smallestCoefficient === 0) ? 1 : 0;
        }

        const currentCoefficient = sortedCoefficients[currentCoefficientIndex];
        let pathCount = 0;

        for (let k = 0; k * currentCoefficient <= currentRemainingSum; k++) {
            pathCount += calculateCombinations(currentRemainingSum - k * currentCoefficient, currentCoefficientIndex + 1);
        }
        return pathCount;
    }

    const totalSolutions = calculateCombinations(desiredSum, 0);

    displayResult(totalSolutions);
}

processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
