const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const allLines = rawInput.trim().split("\n");

let linePointer = 0;

while (allLines.length - linePointer > 1) {
    const definitionCount = parseInt(allLines[linePointer++], 10);

    const translationMap = new Map(
        Array.from({ length: definitionCount }, () => {
            const pairLine = allLines[linePointer++];
            return pairLine.split(" ");
        })
    );

    const lookupCount = parseInt(allLines[linePointer++], 10);

    const resultString = Array.from({ length: lookupCount }, () => {
        const lookupKey = allLines[linePointer++];
        return translationMap.has(lookupKey) ? translationMap.get(lookupKey) : lookupKey;
    }).join('');

    console.log(resultString);

    if (allLines[linePointer] === "0") {
        break;
    }
}
