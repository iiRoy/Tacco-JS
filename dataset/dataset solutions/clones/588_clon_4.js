let minimumLength = Infinity;

function reduceStringSequences(inputSequence) {
    let currentSequence = inputSequence;
    let previousSequence;

    const filterPass = (seq) => {
        const outputChars = [];
        let cursor = 0;

        while (cursor < seq.length) {
            const char = seq[cursor];
            let count = 0;
            let lookahead = cursor;

            while (lookahead < seq.length && seq[lookahead] === char) {
                count++;
                lookahead++;
            }

            if (count < 4 || !['1', '2', '3'].includes(char)) {
                for (let k = 0; k < count; k++) {
                    outputChars.push(char);
                }
            }
            cursor = lookahead;
        }
        return outputChars.join('');
    };

    do {
        previousSequence = currentSequence;
        currentSequence = filterPass(previousSequence);
    } while (currentSequence.length !== previousSequence.length);

    return currentSequence.length;
}

const processInputAndCalculate = (rawData) => {
    const lines = rawData.trim().split('\n');
    const elementCount = parseInt(lines.shift(), 10);
    const initialElements = lines.map(Number);

    Array.from({ length: elementCount }, (_, index) => index).forEach(idx => {
        const variantA = initialElements.slice();
        if (idx < elementCount - 1) {
            variantA[idx] = variantA[idx + 1];
        }
        minimumLength = Math.min(minimumLength, reduceStringSequences(variantA.join('')));

        const variantB = initialElements.slice();
        if (idx > 0) {
            variantB[idx] = variantB[idx - 1];
        }
        minimumLength = Math.min(minimumLength, reduceStringSequences(variantB.join('')));
    });

    console.log(minimumLength);
};

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
processInputAndCalculate(rawInput);
