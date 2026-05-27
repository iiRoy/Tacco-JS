(function() {
    const programArguments = process.argv.slice(2);

    if (programArguments.length === 2) {
        let firstOperand;
        let secondOperand;

        try {
            firstOperand = parseInt(programArguments[0], 10);
            secondOperand = parseInt(programArguments[1], 10);

            if (isNaN(firstOperand) || isNaN(secondOperand)) {
                throw new Error("Input values must be valid integers.");
            }

            const calculateFlooredDivision = (dividendValue, divisorValue) => {
                if (divisorValue === 0) {
                    throw new Error("Cannot divide by zero.");
                }

                let currentQuotient = 0;
                
                const finalSign = (dividendValue < 0) === (divisorValue < 0) ? 1 : -1;

                const absoluteDividend = Math.abs(dividendValue);
                const absoluteDivisor = Math.abs(divisorValue);

                let tempAbsoluteDividend = absoluteDividend;
                while (tempAbsoluteDividend >= absoluteDivisor) {
                    tempAbsoluteDividend -= absoluteDivisor;
                    currentQuotient++;
                }

                if (finalSign === 1) {
                    return currentQuotient;
                } else {
                    if (tempAbsoluteDividend !== 0) {
                        return -currentQuotient - 1;
                    } else {
                        return -currentQuotient;
                    }
                }
            };

            const finalResult = calculateFlooredDivision(secondOperand, firstOperand) + 1;

            console.log(finalResult);

        } catch (error) {
            throw error;
        }
    }
})();
