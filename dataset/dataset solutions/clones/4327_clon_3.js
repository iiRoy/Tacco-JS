process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputBuffer = '';
process.stdin.on('data', function(chunk) {
    inputBuffer += chunk;
});

process.stdin.on('end', function() {
    processInputData(inputBuffer.split(/\r?\n/));
});

const MAX_ITERATION_LIMIT = 3500;

function getInitialHValue(targetRatio, constB) {
    return Math.floor(1 / (targetRatio - constB));
}

function getInitialNValue(targetRatio, hVal, constC) {
    return Math.floor(1 / (targetRatio - (1 / hVal) - constC));
}

function verifyEquation(targetRatio, hVal, nVal, wVal) {
    return targetRatio === (1 / hVal + 1 / nVal + 1 / wVal);
}

function processInputData(lines) {
    var targetN = parseInt(lines[0], 10);
    var hVal = 0;
    var nVal = 0;
    var wVal = 0;

    var targetRatio = 4 / targetN;
    var constB = 2 / MAX_ITERATION_LIMIT;
    var constC = 1 / MAX_ITERATION_LIMIT;

    var solutionFound = false;
    var resultH = 0;
    var resultN = 0;
    var resultW = 0;

    for (hVal = getInitialHValue(targetRatio, constB); hVal < MAX_ITERATION_LIMIT; hVal++) {

        if (targetRatio < (1 / hVal + constB)) {
            console.log('a');
            continue;
        }

        for (nVal = getInitialNValue(targetRatio, hVal, constC); nVal < MAX_ITERATION_LIMIT; nVal++) {

            if (targetRatio < (1 / hVal + 1 / nVal + constC)) {
                continue;
            }

            for (wVal = nVal; wVal < MAX_ITERATION_LIMIT; wVal++) {

                if (verifyEquation(targetRatio, hVal, nVal, wVal)) {
                    solutionFound = true;
                    resultH = hVal;
                    resultN = nVal;
                    resultW = wVal;
                    break;
                }
            }

            if (solutionFound) {
                break;
            }
        }

        if (solutionFound) {
            break;
        }
    }

    console.log(resultH + ' ' + resultN + ' ' + resultW);

    return 0;
}
