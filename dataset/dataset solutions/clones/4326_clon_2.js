process.stdin.resume();
process.stdin.setEncoding('utf8');

let receivedDataBuffer = '';

process.stdin.on('data', function(incomingSegment) {
    receivedDataBuffer += incomingSegment;
});

process.stdin.on('end', function() {
    solveEquation(receivedDataBuffer.split(/\r?\n/));
});

function solveEquation(inputLines) {
    const targetN = parseInt(inputLines[0], 10);
    let hVal = 0;
    let nVal = 0;
    let wVal = 0;

    const factorA = 4 / targetN;
    const factorB = 2 / 3500;
    const factorC = 1 / 3500;

    let solutionLocated = false;

    for (hVal = 1; hVal < 3500; hVal++) {

        if (factorA < 1 / hVal + factorB) {
            continue;
        }

        for (nVal = hVal; nVal < 3500; nVal++) {

            if (factorA < 1 / hVal + 1 / nVal + factorC) {
                continue;
            }

            wVal = Math.ceil((targetN * hVal * nVal) / (4 * hVal * nVal - targetN * hVal - targetN * nVal));

            if (factorA === 1 / hVal + 1 / nVal + 1 / wVal) {
                solutionLocated = true;
                break;
            }
        }

        if (solutionLocated) {
            break;
        }
    }

    console.log(hVal + ' ' + nVal + ' ' + wVal);

    return 0;
}
