class NimValueError extends Error {
    constructor(originalInput) {
        super(`Error: unhandled exception: invalid integer: ${originalInput} [ValueError]`);
        this.name = "ValueError";
    }
}

function parseStrictInteger(strValue) {
    const trimmedStr = String(strValue).trim();

    if (trimmedStr === '') {
        throw new NimValueError(strValue);
    }

    const parsed = parseInt(trimmedStr, 10);

    if (isNaN(parsed) || String(parsed) !== trimmedStr) {
        throw new NimValueError(strValue);
    }

    return parsed;
}

function processInputData(fullInputString) {
    try {
        const inputLines = fullInputString.split('\n');

        inputLines.forEach(currentLine => {
            const stringNumberTokens = currentLine.split(/\s+/).filter(Boolean);

            const numbers = stringNumberTokens.map(parseStrictInteger);

            if (numbers.length < 2) {
                throw new Error(`Error: unhandled exception: index out of bounds [IndexError]`);
            }

            const firstNum = numbers[0];
            const secondNum = numbers[1];

            console.log(firstNum + secondNum);
        });
    } catch (error) {
        if (error instanceof NimValueError || (error instanceof Error && error.message.startsWith("Error: unhandled exception:"))) {
            console.error(error.message);
        } else {
            const errorName = error.name || "JavaScriptError";
            const errorMessage = error.message || String(error);
            console.error(`Error: unhandled exception: ${errorMessage} [${errorName}]\n${error.stack}`);
        }
        process.exit(1);
    }
}

process.exitCode = 0;

const collectedInputLines = [];
require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', (line) => {
    collectedInputLines.push(line);
});

process.stdin.on('end', () => {
    const combinedInput = collectedInputLines.join('\n');
    processInputData(combinedInput);
});
