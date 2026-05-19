process.stdin.resume();
process.stdin.setEncoding('utf8');

const HASH_SYMBOL = '#';
const LINE_BREAK = '\n';

function processInputChunk(inputBuffer) {
    const numericParts = inputBuffer.split(' ');
    const [gridHeight, gridWidth] = numericParts.map(val => parseInt(val, 10));

    if (gridHeight === 0 && gridWidth === 0) {
        return;
    }

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            process.stdout.write(HASH_SYMBOL + LINE_BREAK);
        }
        process.stdout.write(LINE_BREAK + LINE_BREAK);
    }
    process.stdout.write(LINE_BREAK + LINE_BREAK);
}

process.stdin.on('data', processInputChunk);
