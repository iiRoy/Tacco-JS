function processInput(rawData) {
    const targetValue = Number.parseInt(rawData.split(/\s+/g)[0], 10);
    
    const singleDigitFactors = Array.from({ length: 9 }, (_, index) => index + 1);

    const isProductOfSingleDigits = singleDigitFactors.some(factorOne => {
        if (targetValue % factorOne === 0) {
            const factorTwo = targetValue / factorOne;
            return factorTwo >= 1 && factorTwo <= 9;
        }
        return false;
    });

    if (isProductOfSingleDigits) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
