const readline = require('readline');

const processInputLogic = (initialStringA, initialStringB, valueA, valueB, comparisonString) => {
    const decrementUnit = 1;
    let modifiedValueA = valueA;
    let modifiedValueB = valueB;

    const isMatch = (str1, str2) => str1 === str2;

    if (isMatch(initialStringA, comparisonString)) {
        modifiedValueA -= decrementUnit;
    } else {
        modifiedValueB -= decrementUnit;
    }

    return `${modifiedValueA} ${modifiedValueB}`;
};

const inputProcessor = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

inputProcessor.on('line', (receivedLine) => {
    const lineSegments = receivedLine.split(' ');

    const stringOne = lineSegments[0];
    const stringTwo = lineSegments[1];
    const integerOne = parseInt(lineSegments[2], 10);
    const integerTwo = parseInt(lineSegments[3], 10);
    const stringThree = lineSegments[4];

    const computedResult = processInputLogic(
        stringOne,
        stringTwo,
        integerOne,
        integerTwo,
        stringThree
    );

    console.log(computedResult);
    inputProcessor.close();
});
