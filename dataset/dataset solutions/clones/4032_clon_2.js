var inputMatrix = require('fs').readFileSync('/dev/stdin', 'utf8')
    .split('\n')
    .map(lineContent => lineContent.split(' ').map(valStr => parseInt(valStr)));

var minimumsPerRow = [
    Math.min(inputMatrix[0][0], inputMatrix[0][1], inputMatrix[0][2]),
    Math.min(inputMatrix[1][0], inputMatrix[1][1], inputMatrix[1][2]),
    Math.min(inputMatrix[2][0], inputMatrix[2][1], inputMatrix[2][2])
];

var minimumsPerColumn = [
    Math.min(inputMatrix[0][0], inputMatrix[1][0], inputMatrix[2][0]),
    Math.min(inputMatrix[0][1], inputMatrix[1][1], inputMatrix[2][1]),
    Math.min(inputMatrix[0][2], inputMatrix[1][2], inputMatrix[2][2])
];

var finalVerdict = 'Yes';

for (var rIdx = 0; finalVerdict != 'No' && rIdx < 3; rIdx++)
    for (var cIdx = 0; finalVerdict != 'No' && cIdx < 3; cIdx++)
        inputMatrix[rIdx][cIdx] != (minimumsPerRow[rIdx] + minimumsPerColumn[cIdx]) ? finalVerdict = 'No' : '';

console.log(finalVerdict);
