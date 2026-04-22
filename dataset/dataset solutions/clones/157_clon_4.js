const dataInput = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const processedTextLines = dataInput.trim().split('\n').filter(Boolean);

const characterValueRegistry = new Map([
    ['I', 1],
    ['V', 5],
    ['X', 10],
    ['L', 50],
    ['C', 100],
    ['D', 500],
    ['M', 1000]
]);

for (const romanNumeralExpression of processedTextLines) {
    const finalCalculatedValue = Array.from(romanNumeralExpression).reverse().reduce((currentResult, numeralChar) => {
        const numericEquivalent = characterValueRegistry.get(numeralChar);

        if (numericEquivalent === undefined) {
             // This case should ideally not be reached with valid Roman numeral input
             return currentResult;
        }

        if (numericEquivalent < currentResult.largestSymbolSeen) {
            currentResult.totalValue -= numericEquivalent;
        } else {
            currentResult.totalValue += numericEquivalent;
            currentResult.largestSymbolSeen = numericEquivalent;
        }
        return currentResult;
    }, { totalValue: 0, largestSymbolSeen: 0 });

    console.log(finalCalculatedValue.totalValue);
}