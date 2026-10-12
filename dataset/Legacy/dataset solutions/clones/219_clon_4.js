const fileSystem = require('fs');

const processInput = (rawContent) => {
    const lines = rawContent.trim().split('\n');

    lines.forEach((currentLine) => {
        const components = currentLine.split(' ');
        const dividend = Number(components[0]);
        const divisor = Number(components[1]);
        const placesToSum = Number(components[2]);

        const fullQuotientString = (dividend / divisor).toString();
        const partsOfQuotient = fullQuotientString.split('.');
        const fractionalDigitsString = partsOfQuotient[1];

        // This line will throw TypeError if fractionalDigitsString is undefined,
        // replicating the original's behavior for integer quotients.
        const individualDigits = fractionalDigitsString.split('');

        const accumulatedValue = Array.from({ length: placesToSum }).reduce((accumulator, _, index) => {
            const currentDigitChar = individualDigits[index];
            const numericEquivalent = Number(currentDigitChar);
            return accumulator + (numericEquivalent || 0);
        }, 0);

        console.log(accumulatedValue);
    });
};

const standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
processInput(standardInputContent);
