function processInput(inputStr) {
    let processedText = inputStr.trim();
    const insertionIndices = [0, 4, 6, 8];

    let currentChars = Array.from(processedText);

    insertionIndices.forEach(position => {
        const charAtPosition = currentChars[position];
        console.log(charAtPosition);

        if (charAtPosition !== 'A') {
            currentChars.splice(position, 0, 'A');
        }
    });

    processedText = currentChars.join('');

    console.log(processedText === "AKIHABARA" ? "YES" : "NO");
}

const fileSystem = require('fs');
const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
processInput(inputData);
