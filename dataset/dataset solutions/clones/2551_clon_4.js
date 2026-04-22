function transformCycle(currentElement) {
    const elementSequence = ['Sunny', 'Cloudy', 'Rainy'];
    const foundPosition = elementSequence.indexOf(currentElement);

    if (foundPosition !== -1) {
        const nextPosition = (foundPosition + 1) % elementSequence.length;
        return elementSequence[nextPosition];
    } else {
        return undefined;
    }
}

const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
const resultOutput = transformCycle(sourceData.trim());
console.log(resultOutput);