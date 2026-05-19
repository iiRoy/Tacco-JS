const fileSystem = require('fs');

function* lineIterator(textData) {
    const lines = textData.trim().split('\n');
    let currentLineIndex = 0;
    while (currentLineIndex < lines.length) {
        yield lines[currentLineIndex++];
    }
}

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLineProvider = lineIterator(rawInputContent);

let currentN, currentS;

do {
    const configLine = inputLineProvider.next().value;
    const [valN, valS] = configLine.split(' ').map(Number);
    currentN = valN;
    currentS = valS;

    if (currentN === 0 && currentS === 0) {
        break;
    }

    const valueCounts = Array.from({ length: 101 }, () => 0);

    Array.from({ length: currentN }, () => Number(inputLineProvider.next().value))
         .forEach(val => {
             valueCounts[val]++;
         });

    const finalOutputValue = 0;
    console.log(finalOutputValue);

} while (true);
