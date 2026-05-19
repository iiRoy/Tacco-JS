const parseNumericValue = (inputStr) => parseInt(inputStr, 10);

function calculateCombinations(inputString) {
    const valueStrings = inputString.split(' ');

    const redCoinValue = parseNumericValue(valueStrings[0]);
    const greenCoinValue = parseNumericValue(valueStrings[1]);
    const blueCoinValue = parseNumericValue(valueStrings[2]);
    const targetAmount = parseNumericValue(valueStrings[3]);

    const allCoinValues = [redCoinValue, greenCoinValue, blueCoinValue].sort((a, b) => a - b);
    const smallestCoinValue = allCoinValues[0];
    const maxRedCountLimit = Math.floor(targetAmount / smallestCoinValue);

    let totalCombinations = 0;

    for (let redCount = 0; redCount <= maxRedCountLimit; redCount++) {
        const currentRedSum = redCoinValue * redCount;

        if (currentRedSum === targetAmount) {
            totalCombinations++;
            continue;
        }

        const remainingForGreenBlue = targetAmount - currentRedSum;

        for (let greenCount = 0; greenCount <= remainingForGreenBlue; greenCount++) {
            const currentGreenSum = greenCoinValue * greenCount;
            const currentRedGreenSum = currentRedSum + currentGreenSum;

            if (currentRedGreenSum === targetAmount) {
                totalCombinations++;
                continue;
            }

            const remainingForBlue = targetAmount - currentRedGreenSum;

            for (let blueCount = 0; blueCount <= remainingForBlue; blueCount++) {
                const currentTotalSum = currentRedGreenSum + blueCoinValue * blueCount;

                if (currentTotalSum === targetAmount) {
                    totalCombinations++;
                }
            }
        }
    }

    console.log(totalCombinations);
}

calculateCombinations(require('fs').readFileSync('/dev/stdin', 'utf8'));
