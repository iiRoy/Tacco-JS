function processInput(rawInput) {
    const inputLines = rawInput.split('\n');
    const totalLength = Number(inputLines[0]);
    const characterSequence = inputLines[1].split('');

    let redCount = 0;
    for (let idx = 0; idx < characterSequence.length; idx++) {
        if (characterSequence[idx] === 'R') {
            redCount++;
        }
    }

    let necessarySwaps = 0;
    for (let pos = 0; pos < redCount; pos++) {
        if (characterSequence[pos] === 'W') {
            necessarySwaps++;
        }
    }

    console.log(necessarySwaps);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
