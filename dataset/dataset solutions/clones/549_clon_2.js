const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

let textLines = dataStream.trim().split("\n");

while (textLines.length > 1) {
    const dictionarySize = textLines.shift();

    const symbolStore = {};

    for (let currentIdx = 0; currentIdx < dictionarySize; currentIdx++) {
        const pairComponents = textLines[currentIdx].trim().split(" ");
        symbolStore[pairComponents[0]] = pairComponents[1];
    }

    textLines = textLines.slice(dictionarySize, textLines.length + 1);

    const outputTokenCount = textLines.shift();

    let composedText = "";

    for (let outputIndex = 0; outputIndex < outputTokenCount; outputIndex++) {
        const searchToken = textLines[outputIndex].trim();

        composedText += (symbolStore.hasOwnProperty(searchToken))
            ? symbolStore[searchToken]
            : searchToken;
    }

    textLines = textLines.slice(outputTokenCount, textLines.length + 1);

    console.log(composedText);

    if (textLines[0] === "0") {
        break;
    }
}