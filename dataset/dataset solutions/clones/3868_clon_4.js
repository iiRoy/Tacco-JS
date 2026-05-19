const fileSystem = require("fs");
const inputLines = fileSystem.readFileSync("/dev/stdin", "utf8").split("\n");

const dimension = Number.parseInt(inputLines[0], 10);
const charMatrix = inputLines.slice(1);

const checkSymmetryCondition = (rowOffset, colOffset) => {
    const rowIndices = Array.from({ length: dimension }, (_, idx) => idx);

    const isSymmetric = rowIndices.every(currentI => {
        const colIndices = Array.from({ length: dimension }, (_, idx) => idx);
        return colIndices.every(currentJ => {
            const charA = charMatrix[(currentI + rowOffset) % dimension][(currentJ + colOffset) % dimension];
            const charB = charMatrix[(currentJ + rowOffset) % dimension][(currentI + colOffset) % dimension];
            return charA === charB;
        });
    });
    return isSymmetric ? 1 : 0;
};

const offsetRange = Array.from({ length: dimension }, (_, idx) => idx);

const totalSymmetricCount = offsetRange.reduce((accumulator, currentOffset) => {
    const conditionResult = checkSymmetryCondition(currentOffset, 0);
    return accumulator + (conditionResult * dimension);
}, 0);

console.log(totalSymmetricCount);
