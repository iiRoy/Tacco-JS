function calculatePairProduct(valueArray, indexOne, indexTwo) {
    return valueArray[indexOne] * valueArray[indexTwo];
}

function processData(rawDataString) {
    const parsedValues = rawDataString.split(" ");

    const firstProductResult = calculatePairProduct(parsedValues, 0, 1);
    const secondProductResult = calculatePairProduct(parsedValues, 2, 3);

    const maximumValue = Math.max(firstProductResult, secondProductResult);

    console.log('%d', maximumValue);
}

processData(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
