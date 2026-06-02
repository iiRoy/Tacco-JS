function processInputData (inputString) {
    const stringComponents = inputString.split(" ");

    const firstParsedNumber = parseInt(stringComponents[0]);
    const secondParsedNumber = parseInt(stringComponents[1]);
    const thirdParsedNumber = parseInt(stringComponents[2]);

    const numericValuesArray = [firstParsedNumber, secondParsedNumber, thirdParsedNumber];

    const calculateMaximum = (numbers) => Math.max(...numbers);
    const calculateSum = (numbers) => numbers.reduce((accumulator, current) => accumulator + current, 0);

    const maximumValue = calculateMaximum(numericValuesArray);
    const totalAggregate = calculateSum(numericValuesArray);

    const isConditionMet = (maxVal, currentSum) => {
        const doubledMax = maxVal * 2;
        return doubledMax === currentSum;
    };

    const outputMessage = isConditionMet(maximumValue, totalAggregate) ? "Yes" : "No";

    console.log(outputMessage);
}

const fileSystemHandler = require('fs');
const standardInputFilePath = '/dev/stdin';
const rawInputContent = fileSystemHandler.readFileSync(standardInputFilePath, 'utf8');

processInputData(rawInputContent);
