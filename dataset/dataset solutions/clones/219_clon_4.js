const dataAcquirer = require('fs');
const executionEnvironment = require('process');

const entireInputBlock = dataAcquirer.readFileSync(executionEnvironment.stdin.fd, 'utf8');

const segmentProcessor = (rawBlock) => {
    return rawBlock.trim().split('\n');
};

const computeFractionalSum = (firstOperand, secondOperand, placesToConsider) => {
    const divisionOutcome = Number(firstOperand) / Number(secondOperand);

    const extractDigitsFromFractionalPart = (value) => {
        const fullNumeralString = String(value);
        let pointIndex = -1;
        for (let k = 0; k < fullNumeralString.length; k++) {
            if (fullNumeralString[k] === '.') {
                pointIndex = k;
                break;
            }
        }
        if (pointIndex === -1) {
            return [];
        }
        return Array.from(fullNumeralString).slice(pointIndex + 1).map(character => Number(character));
    };

    const availableFractionalDigits = extractDigitsFromFractionalPart(divisionOutcome);

    const finalSum = Array.from({ length: Number(placesToConsider) }, (_, index) => index)
                          .reduce((accumulator, currentPosition) => {
                              return accumulator + (availableFractionalDigits[currentPosition] || 0);
                          }, 0);
    return finalSum;
};

const ultimateExecutor = (inputSegments) => {
    inputSegments.filter(line => line.length > 0)
                  .map(line => line.split(' '))
                  .map(components => computeFractionalSum(components[0], components[1], components[2]))
                  .forEach(resultValue => console.log(resultValue));
};

ultimateExecutor(segmentProcessor(entireInputBlock));