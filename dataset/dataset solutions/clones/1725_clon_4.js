function solveBookProblem(rawData) {
    const lines = rawData.trim().split('\n');

    const [bookCountA, bookCountB, totalTimeLimit] = lines[0].match(/\d+/g).map(Number);

    let currentSumA = 0;
    const cumulativeTimesA = lines[1].match(/\d+/g).map(Number).map(val => (currentSumA += val));

    let currentSumB = 0;
    const cumulativeTimesB = lines[2].match(/\d+/g).map(Number).map(val => (currentSumB += val));

    let maxTotalBooks = 0;
    let jPointer = bookCountB;

    for (let iPointer = 0; iPointer <= bookCountA; iPointer++) {
        const currentATime = (iPointer === 0) ? 0 : cumulativeTimesA[iPointer - 1];

        if (currentATime > totalTimeLimit) {
            break;
        }

        while (jPointer > 0 && currentATime + cumulativeTimesB[jPointer - 1] > totalTimeLimit) {
            jPointer--;
        }

        maxTotalBooks = Math.max(maxTotalBooks, iPointer + jPointer);
    }

    console.log(maxTotalBooks);
}

solveBookProblem(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
