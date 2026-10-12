const fileSystem = require('fs');
const cubicPower = (base) => Math.pow(base, 3);

const processInputData = (inputString) => {
    const lines = inputString.trim().split('\n');
    const computedResults = [];

    function* numberSequenceGenerator(dataLines) {
        let currentLineValue;
        while ((currentLineValue = dataLines.shift()) !== undefined) {
            const parsedNumber = Number(currentLineValue);
            if (parsedNumber === 0) {
                return;
            }
            yield parsedNumber;
        }
    }

    for (const currentNumber of numberSequenceGenerator(lines)) {
        const targetCubicValue = cubicPower(currentNumber);

        const potentialDifferences = Array.from({ length: currentNumber - 1 }, (_, iIndex) => currentNumber - 1 - iIndex)
            .flatMap(firstVal =>
                Array.from({ length: firstVal }, (_, jIndex) => firstVal - jIndex)
                    .map(secondVal => targetCubicValue - cubicPower(firstVal) - cubicPower(secondVal))
            )
            .filter(differenceValue => differenceValue > 0);

        computedResults.push(Math.min(...potentialDifferences));
    }

    return computedResults;
};

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const finalOutputs = processInputData(rawInputContent);

finalOutputs.forEach(outputValue => console.log(outputValue));
