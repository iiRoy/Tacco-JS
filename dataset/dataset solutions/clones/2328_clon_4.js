(function() {
    const InputGatherer = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    const computeBinaryGreatestCommonDivisor = (firstValueArgument, secondValueArgument) => {
        if (firstValueArgument === 0) return secondValueArgument;
        if (secondValueArgument === 0) return firstValueArgument;

        let powerOfTwoFactor = 0;
        while (((firstValueArgument | secondValueArgument) & 1) === 0) {
            firstValueArgument >>= 1;
            secondValueArgument >>= 1;
            powerOfTwoFactor++;
        }

        while ((firstValueArgument & 1) === 0) {
            firstValueArgument >>= 1;
        }

        while (secondValueArgument !== 0) {
            while ((secondValueArgument & 1) === 0) {
                secondValueArgument >>= 1;
            }
            if (firstValueArgument > secondValueArgument) {
                let interchangedValue = firstValueArgument;
                firstValueArgument = secondValueArgument;
                secondValueArgument = interchangedValue;
            }
            secondValueArgument = secondValueArgument - firstValueArgument;
        }
        return firstValueArgument << powerOfTwoFactor;
    };

    const calculateLeastCommonMultiple = (valueX, valueY) => {
        if (valueX === 0 || valueY === 0) {
            return 0;
        }
        const productOfNumbers = Math.abs(valueX * valueY);
        const commonDivisor = computeBinaryGreatestCommonDivisor(valueX, valueY);
        return productOfNumbers / commonDivisor;
    };

    InputGatherer.on('line', (receivedLine) => {
        const stringFragments = receivedLine.split(' ');
        const numericalElements = stringFragments.map(Number);

        if (numericalElements.length >= 2) {
            const firstNumericInput = numericalElements[0];
            const secondNumericInput = numericalElements[1];
            const finalCalculatedOutcome = calculateLeastCommonMultiple(firstNumericInput, secondNumericInput);
            process.stdout.write(finalCalculatedOutcome.toString() + '\n');
        }
        InputGatherer.close();
    });
})();