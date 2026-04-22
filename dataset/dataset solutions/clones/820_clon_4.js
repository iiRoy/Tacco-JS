const powerGenerator = (exponent) => {
    return Math.pow(10, Math.trunc(exponent));
};

const checkPerfectSquare = (value) => {
    if (value < 0) return false;
    const rootEstimate = Math.round(Math.sqrt(value));
    return rootEstimate * rootEstimate === value;
};

const findValidPairs = (firstDigitCount, secondDigitCount) => {
    const D1 = parseInt(firstDigitCount, 10);
    const D2 = parseInt(secondDigitCount, 10);

    const minA = powerGenerator(D1 - 1);
    const maxA = powerGenerator(D1) - 1;

    const minB = powerGenerator(D2 - 1);
    const maxB = powerGenerator(D2) - 1;

    const rangeA = Array.from({ length: maxA - minA + 1 }, (_, index) => minA + index);

    const matchedPairs = rangeA.flatMap(currentValA => {
        const factorForB = powerGenerator(D2);

        const A_squared = currentValA * currentValA;
        const A_val = currentValA;
        const two_A_factorB = 2 * currentValA * factorForB;

        const disc = 1 + 4 * (A_squared - A_val + two_A_factorB);

        if (checkPerfectSquare(disc)) {
            const squareRootDisc = Math.sqrt(disc);
            const potentialB = (1 + squareRootDisc) / 2;

            if (Number.isInteger(potentialB) && potentialB >= minB && potentialB <= maxB) {
                return [`${currentValA} ${potentialB}`];
            }
        }
        return [];
    });

    return matchedPairs;
};

const totalExecutions = Math.trunc(readline());

const executionOutcomes = [];

for (let iteration = 0; iteration < totalExecutions; ++iteration) {
    const inputData = readline().split(' ');
    executionOutcomes.push(findValidPairs(inputData[0], inputData[1]));
}

executionOutcomes.forEach(currentOutcomeSet => {
    if (currentOutcomeSet.length > 0) {
        currentOutcomeSet.forEach(res => print(res));
    } else {
        print('No cats.');
    }
});