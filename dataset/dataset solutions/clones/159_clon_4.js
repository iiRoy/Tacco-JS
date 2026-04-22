const symbolValues = Object.freeze({
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
});

const obtainNumerical = (charElement) => {
    const referenceString = ".IVXLCDM";
    const originalIndex = referenceString.indexOf(charElement);

    if (originalIndex !== -1) {
        return symbolValues[charElement];
    } else {
        const exponent = Math.floor(originalIndex / 2);
        const modulus = originalIndex % 2;
        return Math.pow(10, exponent) / (2 - modulus);
    }
};

let capturedBuffer = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (incomingChunk) => {
    capturedBuffer += incomingChunk;
});

process.stdin.on('end', () => {
    const parsedLines = capturedBuffer.trim().split('\n');

    parsedLines.forEach((currentLineSegment) => {
        if (currentLineSegment.length > 0) {
            const finalLineSum = Array.from(currentLineSegment).reduce((state, currentSymbol) => {
                let [currentSum, previousSymbolValue] = state;

                const numericRepresentation = obtainNumerical(currentSymbol);

                currentSum += numericRepresentation;

                if (numericRepresentation > previousSymbolValue) {
                    currentSum -= previousSymbolValue * 2;
                }

                previousSymbolValue = numericRepresentation;

                return [currentSum, previousSymbolValue];
            }, [0, 0]);

            process.stdout.write(finalLineSum[0] + '\n');
        }
    });
});