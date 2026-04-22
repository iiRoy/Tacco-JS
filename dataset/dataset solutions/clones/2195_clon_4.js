const documentStream = require("fs").readFileSync("/dev/stdin", "utf8");
const documentLines = documentStream.trim().split('\n');

const dimensions = documentLines[0].split(' ').map(Number);
const numericalValues = documentLines[1].split(' ').map(Number);

const itemCount = dimensions[0];
const removalCount = dimensions[1];

if (itemCount <= removalCount) {
    console.log(0);
} else {
    const sortedValues = numericalValues.slice().sort((valueA, valueB) => valueA - valueB);
    
    const remainingElementsCount = itemCount - removalCount + 1;

    const aggregateSum = sortedValues.slice(0, remainingElementsCount).reduce((runningTotal, currentElement) => runningTotal + currentElement, 0);
    
    console.log(aggregateSum);
}