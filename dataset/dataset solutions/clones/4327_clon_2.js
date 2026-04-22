process.stdin.resume();

process.stdin.setEncoding('utf8');

let collectedBuffer = '';

process.stdin.on('data', function(dataPiece) {
    collectedBuffer += dataPiece;
});

process.stdin.on('end', function() {
    computeSolution(collectedBuffer.split(/\r?\n/));
});

const UPPER_BOUND_VALUE = 3500;

/**
 * Executes the primary algorithm to find integer solutions for a specific equation.
 * @param {string[]} linesOfText - An array of input strings, where the first element is a numeric value.
 * @returns {number} - Returns 0 upon successful completion.
 */
function computeSolution(linesOfText) {
    const targetValue = parseInt(linesOfText[0], 10);

    let firstVar = 0;
    let secondVar = 0;
    let thirdVar = 0;

    const coefficientA = 4 / targetValue;
    const coefficientB = 2 / UPPER_BOUND_VALUE;
    const coefficientC = 1 / UPPER_BOUND_VALUE;

    let solutionLocated = false;

    for (firstVar = Math.floor(1 / (coefficientA - coefficientB));
         firstVar < UPPER_BOUND_VALUE;
         firstVar++) {

        if (coefficientA < (1 / firstVar) + coefficientB) {
            // console.log('debug_h_skip');
            continue;
        }

        for (secondVar = Math.floor(1 / (coefficientA - (1 / firstVar) - coefficientC));
             secondVar < UPPER_BOUND_VALUE;
             secondVar++) {

            if (coefficientA < (1 / firstVar) + (1 / secondVar) + coefficientC) {
                continue;
            }

            for (thirdVar = secondVar;
                 thirdVar < UPPER_BOUND_VALUE;
                 thirdVar++) {

                if (coefficientA === (1 / firstVar) + (1 / secondVar) + (1 / thirdVar)) {
                    solutionLocated = true;
                    break;
                }
            }

            if (solutionLocated) {
                break;
            }
        }

        if (solutionLocated) {
            break;
        }
    }

    console.log(`${firstVar} ${secondVar} ${thirdVar}`);

    return 0;
}