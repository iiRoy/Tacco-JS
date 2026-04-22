'use strict';
((inputProvider) => {
    const dataStream = inputProvider.call(null, '/dev/stdin', 'utf8');

    const parseInputData = (textualData) => {
        const primaryLine = textualData.split('\n')[0];
        const numericLiterals = primaryLine.split(' ');
        const parsedNumerics = numericLiterals.map(parseFloat);
        return parsedNumerics;
    };

    const processNumericSet = (numberSet) => {
        const firstVal = numberSet[0];
        const secondVal = numberSet[1];
        const thirdVal = numberSet[2];

        const minVal = (firstVal < secondVal)
            ? ((firstVal < thirdVal) ? firstVal : thirdVal)
            : ((secondVal < thirdVal) ? secondVal : thirdVal);

        const maxVal = (firstVal > secondVal)
            ? ((firstVal > thirdVal) ? firstVal : thirdVal)
            : ((secondVal > thirdVal) ? secondVal : thirdVal);

        let interimValue;

        const conditionallyAssign = (conditionExpression, assignedValue) => {
            if (conditionExpression) {
                interimValue = assignedValue;
            }
        };

        conditionallyAssign(firstVal < secondVal, firstVal);
        conditionallyAssign(secondVal < thirdVal, secondVal);
        conditionallyAssign(firstVal <= thirdVal, thirdVal);

        return [minVal, interimValue, maxVal];
    };

    const initialNumbers = parseInputData(dataStream);
    const finalArrangement = processNumericSet(initialNumbers);

    console.log(finalArrangement[0], finalArrangement[1], finalArrangement[2]);

})(require('fs').readFileSync);