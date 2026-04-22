const retrieveSource = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const parseInputLines = (rawInput) => rawInput.split('\n').slice(0, 2);

const assessStringMagnitude = (leftStr, rightStr) => {
    const lenLeft = leftStr.length;
    const lenRight = rightStr.length;

    const lengthOutcomeMap = new Map([
        [-1, 'LESS'],
        [1, 'GREATER']
    ]);

    const lengthComparisonResult = Math.sign(lenLeft - lenRight);

    if (lengthOutcomeMap.has(lengthComparisonResult)) {
        return lengthOutcomeMap.get(lengthComparisonResult);
    }

    let index = 0;
    while (index < lenLeft) {
        const charValA = leftStr.charCodeAt(index);
        const charValB = rightStr.charCodeAt(index);

        if (charValA > charValB) {
            return 'GREATER';
        }
        if (charValA < charValB) {
            return 'LESS';
        }
        index++;
    }

    return 'EQUAL';
};

const executeComparisonProcess = () => {
    const [operandA, operandB] = parseInputLines(retrieveSource());
    const finalVerdict = assessStringMagnitude(operandA, operandB);
    console.log(finalVerdict);
};

executeComparisonProcess();