const transformInputAndGenerate = (rawData) => {
    const [lineOne] = rawData.split('\n');
    const [coeff, decrement, startingValue] = lineOne.split(' ').map(Number);

    Array.from({ length: 10 }).reduce((currentCalculatedValue, _, iterationIdx) => {
        const nextCalculatedValue = coeff * currentCalculatedValue - decrement;
        process.stdout.write(nextCalculatedValue + '\n');
        return nextCalculatedValue;
    }, startingValue);
};

transformInputAndGenerate(require('fs').readFileSync('/dev/stdin', 'utf8'));