const processInputData = (rawInputString) => {
    const trimmedContent = rawInputString.trim();
    const stringSegments = trimmedContent.split(' ');

    const parseStringArrayToNumbers = (strArr) => {
        const numericResults = [];
        for (let i = 0; i < strArr.length; i++) {
            const currentNum = parseInt(strArr[i], 10);
            numericResults.push(currentNum);
        }
        return numericResults;
    };

    const numericValues = parseStringArrayToNumbers(stringSegments);

    const firstOperand = numericValues[0];
    const secondOperand = numericValues[1];
    const calculatedSum = firstOperand + secondOperand;

    const isSumDivisibleByThree = (calculatedSum % 3 === 0);

    if (isSumDivisibleByThree) {
        console.log('Possible');
    } else {
        console.log('Impossible');
    }
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
