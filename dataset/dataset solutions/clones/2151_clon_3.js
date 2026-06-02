const evaluateNumberCondition = (candidateValue) => {
    if (candidateValue % 2 === 0) {
        return candidateValue % 3 === 0;
    }
    return false;
};

const processInputData = (rawInputString) => {
    const APPROVED_STATUS_MSG = 'APPROVED';
    const DENIED_STATUS_MSG = 'DENIED';

    const inputLinesArray = rawInputString.split('\n');
    const rawNumberStrings = inputLinesArray[1].split(' ');

    const parsedNumbers = rawNumberStrings.map(str => parseInt(str, 10));

    let isOverallApproved = true;

    const checkDenialRule = (numValue) => {
        const isEven = numValue % 2 === 0;
        const notDivisibleByThree = numValue % 3 !== 0;
        const notDivisibleByFive = numValue % 5 !== 0;

        return isEven && notDivisibleByThree && notDivisibleByFive;
    };

    for (const currentNum of parsedNumbers) {
        if (checkDenialRule(currentNum)) {
            isOverallApproved = false;
        }
    }

    console.log(isOverallApproved ? APPROVED_STATUS_MSG : DENIED_STATUS_MSG);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
