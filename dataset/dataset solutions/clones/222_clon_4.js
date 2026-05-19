const fileSystem = require('fs');

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const numericInputs = rawData.trim().split("\n").map(Number);

function* sequenceProducer(initialElement) {
    let currentElement = initialElement;
    yield 0;
    yield currentElement;

    for (let position = 2; position <= 10; ++position) {
        if (position % 2 === 0) {
            currentElement *= 2;
        } else {
            currentElement /= 3;
        }
        yield currentElement;
    }
}

for (const currentInput of numericInputs) {
    let totalAccumulation = 0;
    for (const generatedValue of sequenceProducer(currentInput)) {
        totalAccumulation += generatedValue;
    }
    console.log(totalAccumulation.toFixed(8));
}
