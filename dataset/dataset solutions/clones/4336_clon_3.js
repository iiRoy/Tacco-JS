function getStdinContent() {
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

function parseProblemParameters(rawInputString) {
    let processedLines = rawInputString.split('\n');
    processedLines.pop();

    const firstLineSegments = processedLines[0].split(' ');

    const nValue = parseInt(firstLineSegments[0], 10);
    const mValue = parseInt(firstLineSegments[1], 10);
    const kValue = parseInt(firstLineSegments[2], 10);

    return { n: nValue, m: mValue, k: kValue };
}

function solveProblem(rawInputString) {
    const { n: valN, m: valM, k: targetValK } = parseProblemParameters(rawInputString);

    if (targetValK % valN === 0 || targetValK % valM === 0) {
        return 'Yes';
    }

    if (targetValK < valM && targetValK < valN) {
        return 'No';
    }

    let solutionFoundInLoops = false;

    for (let outerLoopIdxA = 1; outerLoopIdxA <= valM; outerLoopIdxA++) {
        for (let innerLoopIdxA = 1; innerLoopIdxA <= valN; innerLoopIdxA++) {
            const currentFormulaResultA = (outerLoopIdxA * valM + innerLoopIdxA * (valN - 2 * outerLoopIdxA));
            if (targetValK === currentFormulaResultA) {
                solutionFoundInLoops = true;
                break;
            }
        }
        if (solutionFoundInLoops) {
            break;
        }
    }

    if (!solutionFoundInLoops) {
        for (let outerLoopIdxB = 1; outerLoopIdxB <= valN; outerLoopIdxB++) {
            for (let innerLoopIdxB = 1; innerLoopIdxB <= valM; innerLoopIdxB++) {
                const currentFormulaResultB = (outerLoopIdxB * valN + innerLoopIdxB * (valM - 2 * outerLoopIdxB));
                if (targetValK === currentFormulaResultB) {
                    solutionFoundInLoops = true;
                    break;
                }
            }
            if (solutionFoundInLoops) {
                break;
            }
        }
    }

    return solutionFoundInLoops ? 'Yes' : 'No';
}

console.log(solveProblem(getStdinContent()));
