const fileSystem = require('fs');
const sourceText = fileSystem.readFileSync('/dev/stdin', 'utf8');

const separatorChars = new Set([' ', '.', ',']);
const trimmedSource = sourceText.trim();

const wordProcessor = Array.from(trimmedSource).reduce((accumulator, currentSymbol, charPosition, charIterator) => {
    const isSeparator = separatorChars.has(currentSymbol);
    const isFinalChar = charPosition === charIterator.length - 1;

    if (isSeparator) {
        if (accumulator.currentFragment.length >= 3 && accumulator.currentFragment.length <= 6) {
            accumulator.resultCollection.push(accumulator.currentFragment);
        }
        accumulator.currentFragment = '';
    } else {
        accumulator.currentFragment += currentSymbol;
    }

    if (isFinalChar && !isSeparator && accumulator.currentFragment.length > 0) {
        if (accumulator.currentFragment.length >= 3 && accumulator.currentFragment.length <= 6) {
            accumulator.resultCollection.push(accumulator.currentFragment);
        }
    }

    return accumulator;
}, { currentFragment: '', resultCollection: [] });

console.log(wordProcessor.resultCollection.join(" "));
