function processInputAndDetermineParity(rawDataString) {
    const inputParts = rawDataString.split(' ');

    const firstNumString = inputParts[0];
    const secondNumString = inputParts[1];

    const firstNumValue = parseInt(firstNumString, 10);
    const secondNumValue = parseInt(secondNumString, 10);

    const productResult = firstNumValue * secondNumValue;

    const isValueEven = (num) => {
        return num % 2 === 0;
    };

    if (isValueEven(productResult)) {
        console.log('Even');
    } else {
        console.log('Odd');
    }
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const fileEncoding = 'utf8';

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, fileEncoding);

processInputAndDetermineParity(rawInputContent);
