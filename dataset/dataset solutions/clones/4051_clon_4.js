function processFinancialData(dataSource) {
    const numericData = dataSource.split('\n').map(str => Number(str.trim()));

    const maxQuantityA = numericData[0];
    const maxQuantityB = numericData[1];
    const maxQuantityC = numericData[2];
    const targetSum = numericData[3];

    const denominationSet = [500, 100, 50];
    const upperBounds = [maxQuantityA, maxQuantityB, maxQuantityC];

    const computeArrangements = (remainingAmount, indexInDenominationSet) => {
        if (remainingAmount === 0) {
            return 1;
        }

        if (remainingAmount < 0 || indexInDenominationSet === denominationSet.length) {
            return 0;
        }

        let accumulatedWays = 0;
        const currentCoinValue = denominationSet[indexInDenominationSet];
        const maxAllowedForType = upperBounds[indexInDenominationSet];

        for (let numCoinsOfCurrentType = 0; numCoinsOfCurrentType <= maxAllowedForType; numCoinsOfCurrentType++) {
            const valueFromCurrentType = numCoinsOfCurrentType * currentCoinValue;
            if (remainingAmount - valueFromCurrentType >= 0) {
                accumulatedWays += computeArrangements(
                    remainingAmount - valueFromCurrentType,
                    indexInDenominationSet + 1
                );
            } else {
                break;
            }
        }
        return accumulatedWays;
    };

    const totalValidConfigurations = computeArrangements(targetSum, 0);

    console.log(totalValidConfigurations);
}

const entryPoint = (fileContent) => processFinancialData(fileContent);
entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));