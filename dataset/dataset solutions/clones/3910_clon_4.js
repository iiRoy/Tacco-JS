function processInputData(sourceText) {
    const distinctSymbols = new Set(sourceText.split(''));
    const requiredSymbols = ['a', 'b', 'c'];

    const allPresent = requiredSymbols.every(symbol => distinctSymbols.has(symbol));

    const emitResult = (condition) => {
        console.log(condition ? "Yes" : "No");
    };

    emitResult(allPresent);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));