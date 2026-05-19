function compareAscending(valA, valB) {
    return valA - valB;
}

function compareDescending(valA, valB) {
    return valB - valA;
}

function parseNumericString(strVal) {
    return parseInt(strVal, 10);
}

function convertNumberToString(numVal) {
    return numVal.toString(10);
}

function shuffleDeck(deckString, shuffleAmount) {
    return deckString.slice(shuffleAmount) + deckString.slice(0, shuffleAmount);
}

let isDebuggingEnabled = false;

function emitOutput(message) {
    if (isDebuggingEnabled) {
        document.getElementById("Console").value += (message + "\n");
    }
    console.log(message);
}

function executeDebugMode() {
    isDebuggingEnabled = true;
    const debugInput = document.getElementById("Console").value;
    document.getElementById("Console").value += "\n";
    processInput(debugInput);
}

function processInput(rawInputData) {
    const inputLines = rawInputData.split('\n');
    let currentCardDeck = '';
    let lineCursor = 0;
    const TERMINATION_MARKER = '-';

    while (true) {
        const currentLineContent = inputLines[lineCursor];

        if (isNaN(currentLineContent)) {
            if (lineCursor !== 0) {
                emitOutput(currentCardDeck);
            }
            currentCardDeck = currentLineContent;
            if (currentCardDeck === TERMINATION_MARKER) {
                break;
            } else {
                lineCursor++;
            }
        } else {
            const shuffleCountValue = parseNumericString(currentLineContent);
            currentCardDeck = shuffleDeck(currentCardDeck, shuffleCountValue);
        }
        lineCursor++;
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
