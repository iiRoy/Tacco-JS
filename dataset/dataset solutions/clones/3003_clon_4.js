const acquireExternalModule = (moduleAlias) => globalThis.require(moduleAlias);
const filesystemAccess = acquireExternalModule('fs');

const performArithmeticOperation = (receivedDataLines) => {
    const primaryDataString = receivedDataLines[0];
    const numericalTokens = primaryDataString.split(' ');

    const value_A = parseInt(numericalTokens[0], 10);
    const value_B = parseInt(numericalTokens[1], 10);
    const value_C = parseInt(numericalTokens[2], 10);

    const intermediateQuotient = parseInt(value_C / value_A, 10);
    const finalProduct = intermediateQuotient * value_B;

    globalThis.console.log(finalProduct);
};

performArithmeticOperation(
    filesystemAccess.readFileSync('/dev/stdin', 'utf8')
        .split('\n')
);