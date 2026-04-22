const { createInterface } = require('readline');

let inputLines = [];
const stdIoHandler = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

stdIoHandler.on('line', (lineContent) => {
    inputLines.push(lineContent);
});

stdIoHandler.on('close', () => {
    runCalculation(inputLines);
});

function runCalculation(receivedData) {
    const targetNumerator = 4;
    const targetDenominator = parseInt(receivedData[0], 10);

    const searchLimit = 3499; 

    const approxEqual = (val1, val2) => Math.abs(val1 - val2) < 1e-9;

    let solutionTriple = [0, 0, 0];
    let solutionAchieved = false;

    const initialTargetVal = targetNumerator / targetDenominator;
    const minPossibleSumOfTwoDenoms = 2 / (searchLimit + 1);
    const minPossibleSumOfOneDenom = 1 / (searchLimit + 1);

    let startX = 1;
    const calcStartX = initialTargetVal - minPossibleSumOfTwoDenoms;
    if (calcStartX > 1e-9) { 
        startX = Math.max(startX, Math.floor(1 / calcStartX));
    }
    
    for (let x = startX; x <= searchLimit; ++x) {
        if (solutionAchieved) break;

        const remainingTargetAfterX = initialTargetVal - (1 / x);

        if (remainingTargetAfterX < minPossibleSumOfTwoDenoms - 1e-9) {
            continue;
        }

        let startY = 1;
        const calcStartY = remainingTargetAfterX - minPossibleSumOfOneDenom;
        if (calcStartY > 1e-9) {
            startY = Math.max(startY, Math.floor(1 / calcStartY));
        }
        
        for (let y = startY; y <= searchLimit; ++y) {
            if (solutionAchieved) break;

            const remainingTargetAfterY = remainingTargetAfterX - (1 / y);

            if (remainingTargetAfterY < minPossibleSumOfOneDenom - 1e-9) {
                continue;
            }

            const calculatedZ = 1 / remainingTargetAfterY;

            if (approxEqual(calculatedZ, Math.round(calculatedZ))) {
                const z = Math.round(calculatedZ);
                if (z >= y && z <= searchLimit) {
                    solutionTriple = [x, y, z];
                    solutionAchieved = true;
                    break;
                }
            }
            if (calculatedZ < y - 1e-9) {
                break;
            }
        }
    }

    console.log(solutionTriple.join(' '));
}