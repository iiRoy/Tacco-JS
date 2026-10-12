function processInput(rawData) {
    const [firstLineContent, secondLineContent] = rawData.split('\n');
    const elementCount = Number(firstLineContent);
    const numericValues = secondLineContent.split(' ').map(Number);

    const valueFrequencies = new Map();
    numericValues.forEach(currentValue => {
        valueFrequencies.set(currentValue, (valueFrequencies.get(currentValue) || 0) + 1);
    });

    const expectedParity = (elementCount - 1) % 2;

    const numbersToValidate = Array.from({ length: elementCount - 1 }, (_, index) => index + 1)
                                 .filter(num => num % 2 === expectedParity);

    const allExpectedValuesPresent = numbersToValidate.every(num => valueFrequencies.get(num) === 2);

    const finalOutcome = allExpectedValuesPresent ? (2 ** Math.floor(elementCount / 2)) : 0;

    console.log(finalOutcome);
}

const fileSystemModule = require('fs');
const fileData = fileSystemModule.readFileSync('hoge.txt', 'utf8');
processInput(fileData);
