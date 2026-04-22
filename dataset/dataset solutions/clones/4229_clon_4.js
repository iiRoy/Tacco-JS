const dataSource = require("fs").readFileSync("/dev/stdin", "utf8");

let tokenSet = [];
let currentPiece = '';
for (let iterator = 0; iterator < dataSource.length; iterator++) {
    const characterUnit = dataSource[iterator];
    if (characterUnit === ' ') {
        tokenSet.push(currentPiece);
        currentPiece = '';
    } else {
        currentPiece += characterUnit;
    }
}
tokenSet.push(currentPiece);

const leftItem = tokenSet[0];
const rightItem = tokenSet[1];

const comparisonValue = leftItem.localeCompare(rightItem);

const comparisonMark =
    (comparisonValue === 0)
        ? '='
        : (comparisonValue < 0)
            ? '<'
            : '>';

console.log(comparisonMark);