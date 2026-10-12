console.log((inputData => {
    const processedString = inputData.trim();
    const stringLength = processedString.length;

    const leftPropagatedValues = processedString.split('').reduce((valueList, currentChar) => {
        const previousValue = valueList[valueList.length - 1];
        valueList.push(currentChar === '<' ? previousValue + 1 : 0);
        return valueList;
    }, [0]);

    const rightPropagatedValues = Array(stringLength + 1).fill(0);
    for (let i = stringLength - 1; i >= 0; i--) {
        const charAtCurrentPosition = processedString[i];
        rightPropagatedValues[i] = charAtCurrentPosition === '>' ? rightPropagatedValues[i + 1] + 1 : 0;
    }

    const finalValues = leftPropagatedValues.map((leftScore, index) => Math.max(leftScore, rightPropagatedValues[index]));

    const overallSum = finalValues.reduce((accumulator, currentScore) => accumulator + currentScore, 0);

    return `${overallSum}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
