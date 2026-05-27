function processInputData(sourceText) {
    const numericStrings = sourceText.split(' ');
    const limitValue = parseInt(numericStrings[0]);
    const desiredSum = parseInt(numericStrings[1]);

    const indexRange = Array.from({ length: limitValue + 1 }, (_, index) => index);

    const totalCombinations = indexRange.reduce((currentCount, firstComponent) => {
        const validSecondComponents = indexRange.filter(secondComponent => {
            const thirdComponent = desiredSum - (firstComponent + secondComponent);
            return thirdComponent >= 0 && thirdComponent <= limitValue;
        });
        return currentCount + validSecondComponents.length;
    }, 0);

    console.log(totalCombinations);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
