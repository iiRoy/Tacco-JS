const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputProcessor.on('line', (incomingValueString) => {
    const requiredInteger = parseInt(incomingValueString, 10);
    const maximumBound = 3500;

    const locateSolution = (firstDimension) => {
        if (firstDimension > maximumBound) {
            return false;
        }

        const exploreSecondDimension = (secondDimension) => {
            if (secondDimension > maximumBound) {
                return false;
            }

            const termA = 4 * firstDimension * secondDimension;
            const termB = requiredInteger * (firstDimension + secondDimension);
            const computedDenominator = termA - termB;

            if (computedDenominator > 0) {
                const computedNumerator = requiredInteger * firstDimension * secondDimension;
                const derivedThirdDimension = computedNumerator / computedDenominator;

                if (Number.isInteger(derivedThirdDimension) && derivedThirdDimension > 0 && derivedThirdDimension <= maximumBound) {
                    process.stdout.write(`${firstDimension} ${secondDimension} ${derivedThirdDimension}\n`);
                    return true;
                }
            }
            return exploreSecondDimension(secondDimension + 1);
        };

        if (exploreSecondDimension(1)) {
            return true;
        }

        return locateSolution(firstDimension + 1);
    };

    locateSolution(1);
    inputProcessor.close();
});