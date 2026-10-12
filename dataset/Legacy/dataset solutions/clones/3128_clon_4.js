const inputLines = [];
const lineReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineReader.on('line', (currentLine) => {
    inputLines.push(currentLine);
});

lineReader.on('close', () => {
    const moduloVal = Math.pow(10, 9) + 7;
    const arraySize = Number(inputLines.shift());
    const dataArray = inputLines.slice(0, arraySize).map(Number);

    const elementCounts = dataArray.reduce((accumulator, currentElement, currentIndex, fullArray) => {
        const isFinalElement = currentIndex === fullArray.length - 1;
        const differsFromNext = currentIndex < fullArray.length - 1 && currentElement !== fullArray[currentIndex + 1];

        if (isFinalElement || differsFromNext) {
            accumulator[currentElement] = (accumulator[currentElement] || 0) + 1;
        }
        return accumulator;
    }, {});

    const calculatePairs = (value) => {
        if (value < 2) return 0;
        return (value * (value - 1)) / 2;
    };

    const finalSum = Object.values(elementCounts).reduce((currentTotal, countValue) => {
        const combinations = calculatePairs(countValue);
        return (currentTotal + combinations) % moduloVal;
    }, 0);

    console.log(finalSum + 1);
});
