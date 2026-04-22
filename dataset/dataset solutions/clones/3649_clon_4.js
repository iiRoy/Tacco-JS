const processInputValues = (sourceData) => {
    const numericSequence = sourceData.split(' ').map(s => parseInt(s, 10));

    if (numericSequence.length <= 1) {
        return 0;
    }

    const { min, max } = numericSequence.reduce((accumulator, currentValue) => {
        return {
            min: Math.min(accumulator.min, currentValue),
            max: Math.max(accumulator.max, currentValue)
        };
    }, { min: numericSequence[0], max: numericSequence[0] });

    return max - min;
};

const dataStream = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' });

process.stdout.write(processInputValues(dataStream).toString() + '\n');