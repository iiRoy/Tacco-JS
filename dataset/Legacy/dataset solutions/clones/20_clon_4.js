const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(/\s/).map(Number);

function* valueIterator(dataArray, chunkSize) {
    let currentPosition = 0;
    while (currentPosition < dataArray.length) {
        yield dataArray.slice(currentPosition, currentPosition + chunkSize);
        currentPosition += chunkSize;
    }
}

const formatValue = (num) => (Math.round(num * 1000) / 1000).toFixed(3);

for (const currentSet of valueIterator(sourceData, 6)) {
    const [firstCoeffX, firstCoeffY, firstConst, secondCoeffX, secondCoeffY, secondConst] = currentSet;

    const determinantMain = firstCoeffX * secondCoeffY - firstCoeffY * secondCoeffX;
    const determinantX = firstConst * secondCoeffY - firstCoeffY * secondConst;
    const determinantY = firstCoeffX * secondConst - firstConst * secondCoeffX;

    const solutionX = determinantX / determinantMain;
    const solutionY = determinantY / determinantMain;

    console.log(`${formatValue(solutionX)} ${formatValue(solutionY)}`);
}
