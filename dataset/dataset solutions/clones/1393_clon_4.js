(function(incomingData) {
    const numericPattern = /-?\d+(\.\d+)?/g;
    const extractedValues = incomingData.match(numericPattern);

    if (!extractedValues || extractedValues.length < 2) {
        return; // Mimic potential original behavior if input is malformed
    }

    const firstQuantity = Number(extractedValues[0]);
    const secondQuantity = Number(extractedValues[1]);

    const calculateIntegralQuotient = (topNumber, bottomNumber) => {
        if (bottomNumber === 0) throw new Error("Division by zero");
        const negativeResult = (topNumber < 0 && bottomNumber > 0) || (topNumber > 0 && bottomNumber < 0);
        let absoluteTop = Math.abs(topNumber);
        const absoluteBottom = Math.abs(bottomNumber);
        let counter = 0;
        while (absoluteTop >= absoluteBottom) {
            absoluteTop -= absoluteBottom;
            counter++;
        }
        if (negativeResult && absoluteTop !== 0) {
            return -(counter + 1);
        }
        return negativeResult ? -counter : counter;
    };

    const calculateRemainingValue = (topNumber, bottomNumber) => {
        if (bottomNumber === 0) throw new Error("Division by zero");
        const originalSign = Math.sign(topNumber);
        let absoluteTop = Math.abs(topNumber);
        const absoluteBottom = Math.abs(bottomNumber);
        while (absoluteTop >= absoluteBottom) {
            absoluteTop -= absoluteBottom;
        }
        return absoluteTop * originalSign;
    };

    const generatePreciseDecimalString = (valueInput, decimalPlaces) => {
        let signIndicator = '';
        if (valueInput < 0) {
            signIndicator = '-';
            valueInput = -valueInput;
        }

        const scalingFactor = Math.pow(10, decimalPlaces);
        const scaledAndRounded = Math.round(valueInput * scalingFactor);

        const wholePart = Math.floor(scaledAndRounded / scalingFactor);
        let fractionalPart = scaledAndRounded % scalingFactor;

        let fractionalComponent = String(fractionalPart);
        while (fractionalComponent.length < decimalPlaces) {
            fractionalComponent = '0' + fractionalComponent;
        }

        return signIndicator + String(wholePart) + '.' + fractionalComponent;
    };

    const resultWhole = calculateIntegralQuotient(firstQuantity, secondQuantity);
    const resultLeftover = calculateRemainingValue(firstQuantity, secondQuantity);
    const resultFormattedDecimal = generatePreciseDecimalString(firstQuantity / secondQuantity, 6);

    process.stdout.write(resultWhole + ' ' + resultLeftover + ' ' + resultFormattedDecimal + '\n');

}(require('fs').readFileSync('/dev/stdin', 'utf8')));