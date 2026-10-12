const fileSystem = require('fs');

const processInputData = () => {
    const rawContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
    const numericStrings = rawContent.trim().split(/\s+/);

    const firstValue = Number(numericStrings[0]);
    const secondValue = Number(numericStrings[1]);
    const thirdValue = Number(numericStrings[2]);

    const uniqueNumberSet = new Set();
    uniqueNumberSet.add(firstValue);
    uniqueNumberSet.add(secondValue);
    uniqueNumberSet.add(thirdValue);

    if (uniqueNumberSet.size === 2) {
        console.log('Yes');
    } else {
        console.log('No');
    }
};

processInputData();
