function computeEditDistance(rawData) {
    const lineSegments = rawData.split("\n");
    const sourceString = lineSegments[0];
    const targetString = lineSegments[1];

    const lenSource = sourceString.length;
    const lenTarget = targetString.length;

    const distanceVector = new Array(lenTarget + 1);

    for (let k = 0; k <= lenTarget; k++) {
        distanceVector[k] = k;
    }

    for (let rowIdx = 1; rowIdx <= lenSource; rowIdx++) {
        let diagValue = distanceVector[0];
        distanceVector[0] = rowIdx;

        for (let colIdx = 1; colIdx <= lenTarget; colIdx++) {
            const tempDiag = distanceVector[colIdx];
            const charMatchCost = (sourceString[rowIdx - 1] === targetString[colIdx - 1] ? 0 : 1);

            distanceVector[colIdx] = Math.min(
                distanceVector[colIdx] + 1,
                distanceVector[colIdx - 1] + 1,
                diagValue + charMatchCost
            );

            diagValue = tempDiag;
        }
    }

    console.log(distanceVector[lenTarget]);
}

computeEditDistance(require("fs").readFileSync("/dev/stdin", "utf8"));
