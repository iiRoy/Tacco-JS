const processInput = (rawInput) => {
    const lineSegments = rawInput.split("\n");
    const maxFiveHundreds = Number(lineSegments[0]);
    const maxHundreds = Number(lineSegments[1]);
    const maxFifties = Number(lineSegments[2]);
    const targetSum = Number(lineSegments[3]);
    return { maxFiveHundreds, maxHundreds, maxFifties, targetSum };
};

const calculateCombinations = (remainingAmount, coinDenominations, coinLimits, currentCoinIndex) => {
    if (currentCoinIndex === coinDenominations.length) {
        return remainingAmount === 0 ? 1 : 0;
    }

    const currentDenomination = coinDenominations[currentCoinIndex];
    const maximumAllowedCount = coinLimits[currentCoinIndex];
    let accumulatedWays = 0;

    for (let currentCount = 0; currentCount <= maximumAllowedCount; currentCount++) {
        const valueFromCurrentCoin = currentCount * currentDenomination;
        if (valueFromCurrentCoin > remainingAmount) {
            break;
        }
        accumulatedWays += calculateCombinations(
            remainingAmount - valueFromCurrentCoin,
            coinDenominations,
            coinLimits,
            currentCoinIndex + 1
        );
    }
    return accumulatedWays;
};

const executeMainLogic = (inputContent) => {
    const { maxFiveHundreds, maxHundreds, maxFifties, targetSum } = processInput(inputContent);

    const denominations = [500, 100, 50];
    const limits = [maxFiveHundreds, maxHundreds, maxFifties];

    const resultCount = calculateCombinations(targetSum, denominations, limits, 0);
    console.log(resultCount);
};

executeMainLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
