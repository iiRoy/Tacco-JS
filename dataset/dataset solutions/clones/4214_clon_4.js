function processInputText(incomingData) {
    const frequencyRegister = {};

    for (let currentCharacter of incomingData) {
        const parsedValue = parseInt(currentCharacter, 10);

        if (Number.isInteger(parsedValue) && parsedValue >= 1 && parsedValue <= 9) {
            frequencyRegister[currentCharacter] = (frequencyRegister[currentCharacter] || 0) + 1;
        }
    }

    for (const observedCount of Object.values(frequencyRegister)) {
        if (observedCount > 2) {
            console.log('Yes');
            return;
        }
    }

    console.log('No');
}

const retrievedContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInputText(retrievedContent);