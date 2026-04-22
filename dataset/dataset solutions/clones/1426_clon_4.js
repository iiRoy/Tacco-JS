const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

const letterTally = dataSource.split('').reduce((accumulator, currentSymbol) => {
    const processedSymbol = currentSymbol.toLowerCase();
    if (processedSymbol >= 'a' && processedSymbol <= 'z') {
        accumulator[processedSymbol] = (accumulator[processedSymbol] || 0) + 1;
    }
    return accumulator;
}, {});

const alphaSequence = Array.from({ length: 26 }, (_, index) => String.fromCharCode('a'.charCodeAt(0) + index));

alphaSequence.forEach(alphaChar => {
    const tallyValue = letterTally[alphaChar] || 0;
    console.log(`${alphaChar} : ${tallyValue}`);
});