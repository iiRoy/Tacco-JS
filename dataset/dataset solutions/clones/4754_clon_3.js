function processInput(rawData) {
    const stringTokens = rawData.split(" ");

    const numericValues = stringTokens.slice(0, 4).map(token => parseInt(token, 10));

    const firstProduct = numericValues[0] * numericValues[1];
    const secondProduct = numericValues[2] * numericValues[3];

    const maximumProduct = Math.max(firstProduct, secondProduct);

    console.log(maximumProduct);
}

const fileSystemModule = require('fs');
const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
processInput(standardInputContent);
