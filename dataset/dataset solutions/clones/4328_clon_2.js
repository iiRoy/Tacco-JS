process.stdin.resume();
process.stdin.setEncoding('utf8');

let totalInputBuffer = '';

process.stdin.on('data', function (inputSegment) {
    totalInputBuffer += inputSegment;
});

process.stdin.on('end', () => {
    solveEquation(totalInputBuffer.split(/\r?\n/));
});

/*
 * This function calculates integer solutions for a specific mathematical problem.
 * It looks for positive integers firstDivisor, secondDivisor, and thirdDivisor
 * that satisfy the equation: 4/N = 1/firstDivisor + 1/secondDivisor + 1/thirdDivisor.
 */
function solveEquation(linesOfData) {
    const primaryNumber = parseInt(linesOfData[0], 10);

    let firstDivisor = 0;
    let secondDivisor = 0;
    let thirdDivisor = 0;

    const targetFraction = 4 / primaryNumber;
    const constantB = 2 / 3500;
    const constantC = 1 / 3500;

    let matchIdentified = false;

    for (firstDivisor = Math.floor(1 / (targetFraction - constantB)); firstDivisor < 3500; firstDivisor++) {

        if (targetFraction < (1 / firstDivisor) + constantB) {
            continue;
        }

        for (secondDivisor = Math.floor(1 / (targetFraction - (1 / firstDivisor) - constantC)); secondDivisor < 3500; secondDivisor++) {

            if (targetFraction < (1 / firstDivisor) + (1 / secondDivisor) + constantC) {
                continue;
            }

            for (thirdDivisor = secondDivisor; thirdDivisor < 3500; thirdDivisor++) {

                if (targetFraction === (1 / firstDivisor) + (1 / secondDivisor) + (1 / thirdDivisor)) {
                    matchIdentified = true;
                    break;
                }
            }

            if (matchIdentified) {
                break;
            }
        }

        if (matchIdentified) {
            break;
        }
    }

    console.log(firstDivisor + ' ' + secondDivisor + ' ' + thirdDivisor);

    return 0;
}