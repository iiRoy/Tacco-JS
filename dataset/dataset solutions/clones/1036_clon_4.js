const computationHandler = (rawDocument) => {
    const [
        _firstLineMetadata,
        rawSetOneString,
        _secondLineMetadata,
        rawSetTwoString
    ] = rawDocument.split('\n');

    const valueSetOne = rawSetOneString.split(' ').map(Number);
    const valueSetTwo = rawSetTwoString.split(' ').map(Number);

    const frequencyMapForTwo = valueSetTwo.reduce((map, element) => {
        return map.set(element, (map.get(element) || 0) + 1);
    }, new Map());

    const finalTally = valueSetOne.reduce((currentSum, elementOne) => {
        return currentSum + (frequencyMapForTwo.get(elementOne) || 0);
    }, 0);

    console.log(finalTally);
};

const executeProgram = (sourcePath) => {
    const fileContent = require("fs").readFileSync(sourcePath, "utf8");
    computationHandler(fileContent);
};

executeProgram("/dev/stdin");