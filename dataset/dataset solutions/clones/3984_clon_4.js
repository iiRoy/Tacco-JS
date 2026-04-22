function ApplicationEntry(externalDataSource) {
    const segments = externalDataSource.split(' ');
    const startValue = Number(segments[0]);
    const endValue = Number(segments[1]);

    const determineIfNumberIsSymmetric = (numberToExamine) => {
        if (numberToExamine < 0) return false;
        if (numberToExamine < 10) return true;

        let originalForm = numberToExamine;
        let invertedForm = 0;
        while (originalForm > 0) {
            const currentDigit = originalForm % 10;
            invertedForm = invertedForm * 10 + currentDigit;
            originalForm = Math.floor(originalForm / 10);
        }
        return numberToExamine === invertedForm;
    };

    const calculateSymmetricInterval = (currentValue, finalValue, accumulativeCount) => {
        if (currentValue > finalValue) {
            return accumulativeCount;
        }
        const newCount = determineIfNumberIsSymmetric(currentValue) ? accumulativeCount + 1 : accumulativeCount;
        return calculateSymmetricInterval(currentValue + 1, finalValue, newCount);
    };

    const finalResult = calculateSymmetricInterval(startValue, endValue, 0);
    console.log(finalResult);
}

ApplicationEntry(require("fs").readFileSync("/dev/stdin", "utf8"));