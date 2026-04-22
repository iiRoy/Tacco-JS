const applicationEntry = (environmentContext) => {
    const bigIntegerFactory = (0n).constructor;

    const obtainIntegerFromText = (numericalText) => {
        return bigIntegerFactory(numericalText);
    };

    const deriveScaledInteger = (decimalText) => {
        let wholePart = '';
        let fractionalSegment = '';
        const dotPosition = decimalText.indexOf('.');

        if (dotPosition === -1) {
            wholePart = decimalText;
            fractionalSegment = '00';
        } else {
            wholePart = decimalText.substring(0, dotPosition);
            fractionalSegment = decimalText.substring(dotPosition + 1);
            fractionalSegment = (fractionalSegment + '00').substring(0, 2);
        }
        return obtainIntegerFromText(wholePart + fractionalSegment);
    };

    const processNumericalOperation = (inputSequence) => {
        const componentUnits = inputSequence.match(/(\S+)\s+(\S+)/);
        if (!componentUnits || componentUnits.length < 3) {
            throw new Error("Input string format invalid.");
        }

        const primaryOperandText = componentUnits[1];
        const secondaryOperandText = componentUnits[2];

        const factorOne = obtainIntegerFromText(primaryOperandText);
        const factorTwoScaled = deriveScaledInteger(secondaryOperandText);

        const hundredDivisor = obtainIntegerFromText('100');
        
        const intermediateProduct = factorOne * factorTwoScaled;
        const finalResultant = intermediateProduct / hundredDivisor;

        return String(finalResultant);
    };

    const isTestExecution = environmentContext.devTestFlag;
    if (isTestExecution) {
        // Test function placeholder; original `test()` is undefined.
    } else {
        const fileSystemAccessor = environmentContext.ioModule.readFileSync;
        const rawData = fileSystemAccessor('/dev/stdin', { encoding: 'utf8' });
        const computedOutcome = processNumericalOperation(rawData);
        environmentContext.outputDestination.write(computedOutcome + '\n');
    }
};

applicationEntry({
    devTestFlag: (globalThis.process && globalThis.process.env && globalThis.process.env.PROGRAM_TEST_MODE),
    ioModule: globalThis.require('node:fs'),
    outputDestination: globalThis.process.stdout
});