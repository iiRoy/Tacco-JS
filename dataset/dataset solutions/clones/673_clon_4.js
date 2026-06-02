const fileSystem = require('fs');
const inputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

inputContent
    .split('\n')
    .filter(Boolean)
    .forEach(currentLineString => {
        const parsedNumbers = currentLineString.split(' ').map(Number);

        const totalSumOfSix = parsedNumbers.slice(0, 6).reduce((accumulator, currentVal) => accumulator + currentVal, 0);

        const finalResult = Math.floor(totalSumOfSix / 3);

        console.log(finalResult);
    });
