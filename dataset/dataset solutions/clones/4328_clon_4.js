const dataReader = require('readline');
const inputProcessor = dataReader.createInterface({
    input: process.stdin,
    output: process.stdout
});

let accumulatedBuffer = '';

inputProcessor.on('line', (dataSegment) => {
    accumulatedBuffer += dataSegment;
});

inputProcessor.on('close', () => {
    processNumericalInput(parseInt(accumulatedBuffer, 10));
});

function processNumericalInput(targetVal) {
    const iterationCeiling = 3500;
    let calculatedSolution = null;

    function findFractionalComponents(currentX) {
        if (calculatedSolution !== null) {
            return true;
        }

        if (currentX < 1 || currentX > iterationCeiling) {
            return false;
        }

        const commonDenominatorX = targetVal * currentX;
        const numeratorForYandZReciprocal = (4 * currentX) - targetVal;

        if (numeratorForYandZReciprocal <= 0) {
            return findFractionalComponents(currentX + 1);
        }

        function findSecondComponent(currentY) {
            if (calculatedSolution !== null) {
                return true;
            }

            if (currentY < currentX || currentY > iterationCeiling) {
                return false;
            }

            // Optimization for y: 4/targetVal - 1/currentX = 1/y + 1/z <= 2/y
            // So, y <= 2 / (4/targetVal - 1/currentX)
            // y <= 2 * (targetVal * currentX) / (4 * currentX - targetVal)
            const maxPossibleY = Math.floor(2 * commonDenominatorX / numeratorForYandZReciprocal);
            if (currentY > maxPossibleY) {
                return false;
            }

            const commonDenominatorXYZ = commonDenominatorX * currentY;
            const numeratorForZReciprocal = (numeratorForYandZReciprocal * currentY) - commonDenominatorX;

            if (numeratorForZReciprocal <= 0) {
                return findSecondComponent(currentY + 1);
            }

            if (commonDenominatorXYZ % numeratorForZReciprocal !== 0) {
                return findSecondComponent(currentY + 1);
            }

            const candidateZ = commonDenominatorXYZ / numeratorForZReciprocal;

            if (candidateZ >= currentY && candidateZ <= iterationCeiling) {
                calculatedSolution = [currentX, currentY, candidateZ];
                return true;
            }

            return findSecondComponent(currentY + 1);
        }

        if (findSecondComponent(currentX)) {
            return true;
        }

        return findFractionalComponents(currentX + 1);
    }

    findFractionalComponents(1);

    if (calculatedSolution) {
        console.log(calculatedSolution.join(' '));
    }
}