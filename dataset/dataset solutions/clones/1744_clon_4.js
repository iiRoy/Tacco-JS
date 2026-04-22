function performCalculation(dataPayload) {
    const contentLines = dataPayload.split('\n');
    
    const [sizeMarker, quantityStr] = contentLines[0].split(' ');
    const desiredQuantity = Number(quantityStr);

    const numericValues = contentLines[1].match(/\d+/g).map(parseFloat);

    numericValues.sort((firstVal, secondVal) => firstVal - secondVal);

    const resultingSum = numericValues.slice(0, desiredQuantity).reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    return resultingSum;
}

const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
const computedResult = performCalculation(sourceData);
console.log(computedResult);