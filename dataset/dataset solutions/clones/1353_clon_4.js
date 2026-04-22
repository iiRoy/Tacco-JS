(function(rawInputData) {
    function calculateSum(firstOperand, secondOperand) {
        while (secondOperand !== 0) {
            let carryDigits = (firstOperand & secondOperand);
            firstOperand = (firstOperand ^ secondOperand);
            secondOperand = (carryDigits << 1);
        }
        return firstOperand;
    }

    function calculateProduct(factorOne, factorTwo) {
        if (factorTwo === 0) {
            return 0;
        }
        if (factorTwo < 0) {
            return -calculateProduct(factorOne, -factorTwo);
        }
        return calculateSum(factorOne, calculateProduct(factorOne, factorTwo - 1));
    }

    const numericalStrings = rawInputData.match(/\d+/g);
    const initialDimension = parseInt(numericalStrings[0], 10);
    const secondaryDimension = parseInt(numericalStrings[1], 10);

    const surfaceCoverage = calculateProduct(initialDimension, secondaryDimension);
    const totalSpan = calculateSum(initialDimension, secondaryDimension);
    const outlineLength = calculateProduct(2, totalSpan);

    console.log(`${surfaceCoverage} ${outlineLength}`);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));