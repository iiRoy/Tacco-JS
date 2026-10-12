const fileSystem = require('fs');

const sourceData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const numericEntries = sourceData
    .trim()
    .split('\n')
    .map(val => Number(val))
    .filter(val => val !== 0);

const sequenceMemo = new Map();

const obtainSequenceValue = (termIndex) => {
    if (sequenceMemo.has(termIndex)) {
        return sequenceMemo.get(termIndex);
    }

    let calculatedValue;
    if (termIndex === 0) {
        calculatedValue = 1;
    } else if (termIndex === 1) {
        calculatedValue = 2;
    } else if (termIndex === 2) {
        calculatedValue = 4;
    } else {
        calculatedValue = obtainSequenceValue(termIndex - 1) +
                          obtainSequenceValue(termIndex - 2) +
                          obtainSequenceValue(termIndex - 3);
    }

    sequenceMemo.set(termIndex, calculatedValue);
    return calculatedValue;
};

for (let idx = 0; idx <= 31; idx++) {
    obtainSequenceValue(idx);
}

numericEntries.forEach(entryValue => {
    const targetSequenceIndex = entryValue - 1;
    const sequenceTerm = sequenceMemo.get(targetSequenceIndex);
    const finalResult = Math.ceil(sequenceTerm / 3650);
    console.log(finalResult);
});
