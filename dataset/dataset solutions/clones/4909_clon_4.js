let inputStore = [];

process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputData) => {
    inputStore.push(inputData);
});

process.stdin.on('end', () => {
    const fullInputContent = inputStore.join('');
    const firstLineContent = fullInputContent.split('\n')[0];

    const numberPattern = /(\d+)\s+(\d+)/;
    const matchElements = firstLineContent.match(numberPattern);

    let firstNumber = 0;
    let secondNumber = 0;

    if (matchElements && matchElements.length >= 3) {
        firstNumber = Number(matchElements[1]);
        secondNumber = Number(matchElements[2]);
    }

    const calculateExponent = (baseForPower, exponentForPower) => {
        if (exponentForPower === 0) {
            return 1;
        }
        if (baseForPower === 0) {
            return 0;
        }
        let resultAccumulator = 1;
        for (let i = 0; i < exponentForPower; i++) {
            resultAccumulator *= baseForPower;
        }
        return resultAccumulator;
    };

    const adjustedFirst = firstNumber - 1;
    const adjustedSecond = secondNumber - 1;

    const interimValue = calculateExponent(adjustedSecond, adjustedFirst);
    const ultimateResult = interimValue * secondNumber;

    process.stdout.write(ultimateResult.toString() + '\n');
});