const fileSystem = require('fs');
const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf-8');

const transformSequence = (currentSequence) => {
    if (currentSequence.length <= 1) {
        return [];
    }
    return Array.from({ length: currentSequence.length - 1 }, (_, idx) =>
        (currentSequence[idx] + currentSequence[idx + 1]) % 10
    );
};

const reduceToFinalValue = (initialSequence) => {
    let workingSequence = [...initialSequence];
    while (workingSequence.length > 1) {
        workingSequence = transformSequence(workingSequence);
    }
    return workingSequence[0];
};

const digitSequences = rawContent.trim().split('\n').map(line => Array.from(line, Number));

const finalResults = digitSequences.map(reduceToFinalValue);

console.log(finalResults);
