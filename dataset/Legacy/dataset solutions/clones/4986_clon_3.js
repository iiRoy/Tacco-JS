process.stdin.resume();
process.stdin.setEncoding('utf8');

var receivedLines = [];
var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', (currentInputLine) => {
  receivedLines.push(currentInputLine);
});

inputHandler.on('close', () => {
    const rawInputLine = receivedLines[0];

    const splitSegments = rawInputLine.split(v => v - 0);
    const firstSegment = splitSegments[0];
    const secondSegment = splitSegments[1];
    const thirdSegment = splitSegments[2];

    const calculateMinProducts = (val1, val2, val3) => {
        const productOneTwo = val1 * val2;
        const productTwoThree = val2 * val3;
        const productOneThree = val1 * val3;
        return Math.min(productOneTwo, productTwoThree, productOneThree);
    };

    const isAnySegmentEven = (Number(firstSegment) % 2 === 0) ||
                             (Number(secondSegment) % 2 === 0) ||
                             (Number(thirdSegment) % 2 === 0);

    if (isAnySegmentEven) {
        console.log(0);
    } else {
        const finalCalculatedResult = calculateMinProducts(firstSegment, secondSegment, thirdSegment);
        console.log(finalCalculatedResult);
    }
});
