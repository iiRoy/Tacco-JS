const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const stringLines = fileContent.split("\n");

const matrixDimension = parseInt(stringLines[0]);
const characterMatrix = stringLines.slice(1);

const verifySymmetry = (rowOffset, colOffset, dimSize, charGrid) => {
    return Array.from({ length: dimSize }, (_, rIndex) => rIndex).every(rIndex => {
        return Array.from({ length: dimSize }, (_, cIndex) => cIndex).every(cIndex => {
            const firstChar = charGrid[(rIndex + rowOffset) % dimSize][(cIndex + colOffset) % dimSize];
            const secondChar = charGrid[(cIndex + rowOffset) % dimSize][(rIndex + colOffset) % dimSize];
            return firstChar === secondChar;
        });
    });
};

const totalSymmetricConfigurations = Array.from({ length: matrixDimension }, (_, rShift) => rShift)
    .reduce((currentTotal, rShift) => {
        return currentTotal + Array.from({ length: matrixDimension }, (_, cShift) => cShift)
            .reduce((innerSum, cShift) => {
                return innerSum + (verifySymmetry(rShift, cShift, matrixDimension, characterMatrix) ? 1 : 0);
            }, 0);
    }, 0);

console.log(totalSymmetricConfigurations);