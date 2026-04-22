function processDataSeries(inputBundle) {
    const dataRows = inputBundle.trim().split('\n');
    const quantityIndicator = Number(dataRows[0].split(' ')[0]);
    const numericElements = dataRows.slice(1, quantityIndicator + 1).map(Number);

    const cumulativeSummation = numericElements.reduce((acc, val) => acc + val, 0);

    let lowestNonTenDivisible = 1000;
    const nonTenDivisibleCollection = numericElements.filter(val => val % 10 !== 0);
    if (nonTenDivisibleCollection.length > 0) {
        lowestNonTenDivisible = Math.min(...nonTenDivisibleCollection);
    }

    const checkAllSecondaryCharsAreZero = (entries) => {
        if (entries.length === 0) return true;
        return entries.every(item => {
            const textVersion = String(item);
            return textVersion.length > 1 && textVersion.charAt(1) === '0';
        });
    };

    const allSecondaryCharsAreZero = checkAllSecondaryCharsAreZero(numericElements);

    let finalOutput;
    if (cumulativeSummation % 10 !== 0) {
        finalOutput = cumulativeSummation;
    } else {
        if (lowestNonTenDivisible === 1000) {
            if (allSecondaryCharsAreZero) {
                finalOutput = 0;
            } else {
                finalOutput = cumulativeSummation - 1000;
            }
        } else {
            finalOutput = cumulativeSummation - lowestNonTenDivisible;
        }
    }

    console.log(finalOutput);
}

processDataSeries(require("fs").readFileSync("/dev/stdin", "utf8"));