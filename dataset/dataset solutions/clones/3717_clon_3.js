"use strict"
function calculateCharacterEffect(charSymbol) {
    let effectValue = 0;
    if (charSymbol === "+") {
        effectValue = 1;
    } else if (charSymbol === "-") {
        effectValue = -1;
    }
    return effectValue;
}

function processInput(rawData) {
    let currentTally = 0;
    const inputCharacters = rawData.split("");

    for (const charItem of inputCharacters) {
        const delta = calculateCharacterEffect(charItem);
        currentTally += delta;
    }

    console.log(currentTally);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
