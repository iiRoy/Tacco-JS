const fileSystem = require("fs");

const inputLines = fileSystem.readFileSync("/dev/stdin", "utf8").split("\n");

const gridDimension = parseInt(inputLines[0], 10);
const charMatrix = inputLines.slice(1);

const checkGridSymmetry = (rowOffset, colOffset, dimension, sourceGrid) => {
    return Array.from({ length: dimension }, (_, rowIdx) => {
        return Array.from({ length: dimension }, (_, colIdx) => {
            const charA = sourceGrid[(rowIdx + rowOffset) % dimension][(colIdx + colOffset) % dimension];
            const charB = sourceGrid[(colIdx + rowOffset) % dimension][(rowIdx + colOffset) % dimension];
            return charA === charB;
        }).every(Boolean);
    }).every(Boolean) ? 1 : 0;
};

const totalCount = Array.from({ length: gridDimension }, (_, rShift) =>
    Array.from({ length: gridDimension }, (_, cShift) =>
        checkGridSymmetry(rShift, cShift, gridDimension, charMatrix)
    )
).flat().reduce((accumulator, value) => accumulator + value, 0);

console.log(totalCount);
