function processInput(rawData) {
    const parseAndSortLimited = (lineContent, limit) => {
        return lineContent.split(" ").map(val => parseInt(val, 10)).sort((a, b) => b - a).filter((_, idx) => idx < limit);
    };

    const parseAndSortAll = (lineContent) => {
        return lineContent.split(" ").map(val => parseInt(val, 10)).sort((a, b) => b - a);
    };

    const lines = rawData.split("\n");
    const [countsLine, pValuesLine, qValuesLine, rValuesLine] = lines;

    const [countXStr, countYStr] = countsLine.split(" ");
    const countX = parseInt(countXStr, 10);
    const countY = parseInt(countYStr, 10);

    const listP = parseAndSortLimited(pValuesLine, countX);
    const listQ = parseAndSortLimited(qValuesLine, countY);
    const listR = parseAndSortAll(rValuesLine);

    let pCurrentSmallestIdx = listP.length - 1;
    let qCurrentSmallestIdx = listQ.length - 1;

    for (let rElementIdx = 0; rElementIdx < listR.length; rElementIdx++) {
        const currentRValue = listR[rElementIdx];

        const pHasElements = pCurrentSmallestIdx >= 0;
        const qHasElements = qCurrentSmallestIdx >= 0;

        const canReplaceInP = pHasElements && currentRValue > listP[pCurrentSmallestIdx];
        const canReplaceInQ = qHasElements && currentRValue > listQ[qCurrentSmallestIdx];

        if (canReplaceInP || canReplaceInQ) {
            const pSmallestIsStrictlySmallerThanQSmallest = pHasElements && qHasElements && listP[pCurrentSmallestIdx] < listQ[qCurrentSmallestIdx];

            if (pSmallestIsStrictlySmallerThanQSmallest) {
                listP[pCurrentSmallestIdx] = currentRValue;
                pCurrentSmallestIdx--;
            } else if (qHasElements) {
                listQ[qCurrentSmallestIdx] = currentRValue;
                qCurrentSmallestIdx--;
            }
        }
    }

    const sumOfP = listP.reduce((accumulator, val) => accumulator + val, 0);
    const sumOfQ = listQ.reduce((accumulator, val) => accumulator + val, 0);
    const finalTotalSum = sumOfP + sumOfQ;

    console.log(finalTotalSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
