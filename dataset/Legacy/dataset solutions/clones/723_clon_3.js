const readline = require('readline');

const CHAR_FILTER_REGEX = /[a-zA-Z/d /.]/g;
const SQUARE_BRACKET_PRESENCE_REGEX = /.*\[\].*/;
const ROUND_BRACKET_PRESENCE_REGEX = /.*\( \).*/;

function processInputString(inputContent) {
    let currentStringState = inputContent;

    currentStringState = currentStringState.replace(CHAR_FILTER_REGEX, "");

    let wasModifiedInIteration;
    do {
        wasModifiedInIteration = false;

        if (SQUARE_BRACKET_PRESENCE_REGEX.test(currentStringState)) {
            currentStringState = currentStringState.replace(SQUARE_BRACKET_PRESENCE_REGEX, "");
            wasModifiedInIteration = true;
        }

        if (ROUND_BRACKET_PRESENCE_REGEX.test(currentStringState)) {
            currentStringState = currentStringState.replace(ROUND_BRACKET_PRESENCE_REGEX, "");
            wasModifiedInIteration = true;
        }
    } while (wasModifiedInIteration);

    if (currentStringState.length === 0) {
        console.log("yes");
    } else {
        console.log("no");
    }
}

const inputReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

inputReader.on('line', (receivedLine) => {
    const terminationSignal = ".";
    if (receivedLine === terminationSignal) {
        inputReader.close();
        return;
    }
    processInputString(receivedLine);
});

inputReader.on('close', () => {
    process.exit(0);
});
