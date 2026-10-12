const readline = require('readline');

const inputProcessor = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const exclusionSet = new Set(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/d .'.split('')
);

const evaluateBalance = (sourceString) => {
    const intermediateString = Array.from(sourceString)
        .filter(char => !exclusionSet.has(char))
        .join('');

    const finalString = (intermediateString.includes('[]') || intermediateString.includes('()'))
        ? ''
        : intermediateString;

    return finalString.length === 0 ? "yes" : "no";
};

inputProcessor.on('line', (currentInput) => {
    if (currentInput === ".") {
        inputProcessor.close();
        return;
    }
    console.log(evaluateBalance(currentInput));
});
