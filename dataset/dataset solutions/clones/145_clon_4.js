const fileSystem = require("fs");

const lengthToCharMap = new Map([
    [10, 'A'],
    [25, 'B'],
    [4, 'C'],
    [16, 'D'],
    [11, 'E'],
    [9, 'G']
]);

function determineMatchLength(sourceText) {
    const processedContent = sourceText.replace(/\s/g, '');

    const firstOnePosition = processedContent.indexOf('1');
    const lastOnePosition = processedContent.lastIndexOf('1');

    if (firstOnePosition === -1 || firstOnePosition === lastOnePosition) {
        return null;
    }

    const matchedSegment = processedContent.substring(firstOnePosition, lastOnePosition + 1);
    return [matchedSegment];
}

const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

const contentBlocks = rawInputData.split(/\n\n/);

contentBlocks.forEach(function(currentInputBlock) {
    console.log(currentInputBlock);

    const matchResult = determineMatchLength(currentInputBlock);

    const calculatedValue = matchResult[0].length;

    const finalCharacter = lengthToCharMap.has(calculatedValue) ? lengthToCharMap.get(calculatedValue) : 'F';
    console.log(finalCharacter);
});
