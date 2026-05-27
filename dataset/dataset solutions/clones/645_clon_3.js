const calculateRequiredPacks = (totalAmount, packUnitSize) => {
    return Math.ceil(totalAmount / packUnitSize);
};

(function processCostComparison() {
    const commandLineArguments = process.argv.slice(2);
    const EXPECTED_INPUT_COUNT = 5;

    if (commandLineArguments.length !== EXPECTED_INPUT_COUNT) {
        return;
    }

    const totalQuantity = parseInt(commandLineArguments[0], 10);
    const packSizeOptionA = parseInt(commandLineArguments[1], 10);
    const pricePerPackA = parseInt(commandLineArguments[2], 10);
    const packSizeOptionC = parseInt(commandLineArguments[3], 10);
    const pricePerPackC = parseInt(commandLineArguments[4], 10);

    const packsNeededA = calculateRequiredPacks(totalQuantity, packSizeOptionA);
    const totalPriceOptionA = pricePerPackA * packsNeededA;

    const packsNeededC = calculateRequiredPacks(totalQuantity, packSizeOptionC);
    const totalPriceOptionC = pricePerPackC * packsNeededC;

    const minimumOverallCost = Math.min(totalPriceOptionA, totalPriceOptionC);

    console.log(minimumOverallCost);
})();
