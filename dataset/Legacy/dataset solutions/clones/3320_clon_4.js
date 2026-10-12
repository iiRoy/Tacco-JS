'use strict';

function main(inputTxt) {
    const dataLines = inputTxt.split('\n');
    const [dimH, dimW] = dataLines[0].split(' ').map(Number);

    const terrainMap = dataLines.slice(1, dimH + 1).map(rowStr => rowStr.split(''));

    const pathModulus = 1000000007;

    const memoizationTable = Array.from({ length: dimH }, () => Array(dimW).fill(null));

    function calculatePathCount(currentR, currentC) {
        if (currentR < 0 || currentC < 0 || currentR >= dimH || currentC >= dimW || terrainMap[currentR][currentC] === '#') {
            return 0;
        }

        if (currentR === 0 && currentC === 0) {
            return 1;
        }

        if (memoizationTable[currentR][currentC] !== null) {
            return memoizationTable[currentR][currentC];
        }

        const pathsFromAbove = calculatePathCount(currentR - 1, currentC);
        const pathsFromLeft = calculatePathCount(currentR, currentC - 1);

        const totalPaths = (pathsFromAbove + pathsFromLeft) % pathModulus;

        memoizationTable[currentR][currentC] = totalPaths;
        return totalPaths;
    }

    const finalResult = calculatePathCount(dimH - 1, dimW - 1);
    console.log(finalResult);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
