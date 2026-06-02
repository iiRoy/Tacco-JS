(function(fileSystemModule) {
    const processInputData = (rawTextContent) => {
        const inputSegments = rawTextContent.trim().split(" ");
        
        const firstNumericString = inputSegments[0];
        const secondNumericDecimalString = inputSegments[1];

        const firstFactorBigInt = BigInt(firstNumericString);

        const decimalSeparatorPosition = secondNumericDecimalString.indexOf('.');
        let wholeNumberComponent = secondNumericDecimalString;
        let fractionalNumberComponent = '';

        if (decimalSeparatorPosition !== -1) {
            wholeNumberComponent = secondNumericDecimalString.substring(0, decimalSeparatorPosition);
            fractionalNumberComponent = secondNumericDecimalString.substring(decimalSeparatorPosition + 1);
        }

        if (wholeNumberComponent === '') {
            wholeNumberComponent = '0';
        }

        let normalizedFractional = '';
        if (fractionalNumberComponent.length >= 2) {
            normalizedFractional = fractionalNumberComponent.substring(0, 2);
        } else {
            normalizedFractional = fractionalNumberComponent.padEnd(2, '0');
        }

        const secondFactorScaledBigInt = BigInt(wholeNumberComponent + normalizedFractional);

        const productInCents = firstFactorBigInt * secondFactorScaledBigInt;

        let finalOutputValue;
        if (productInCents < 100n) {
            finalOutputValue = '0';
        } else {
            const integerDivisionResult = productInCents / 100n;
            finalOutputValue = integerDivisionResult.toString();
        }
        
        console.log(finalOutputValue);
    };

    const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    processInputData(standardInputContent);
})(require('fs'));
