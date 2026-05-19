function calculateLevenshteinDistance(strA, strB) {
    const lenA = strA.length;
    const lenB = strB.length;

    const distanceMatrix = Array.from({ length: lenA + 1 }, () => new Array(lenB + 1));

    for (let rowIdx = 0; rowIdx <= lenA; ++rowIdx) {
        distanceMatrix[rowIdx][0] = rowIdx;
    }

    for (let colIdx = 0; colIdx <= lenB; ++colIdx) {
        distanceMatrix[0][colIdx] = colIdx;
    }

    for (let rowIdx = 1; rowIdx <= lenA; ++rowIdx) {
        const charA = strA.charCodeAt(rowIdx - 1);
        for (let colIdx = 1; colIdx <= lenB; ++colIdx) {
            const charB = strB.charCodeAt(colIdx - 1);

            if (charA === charB) {
                distanceMatrix[rowIdx][colIdx] = distanceMatrix[rowIdx - 1][colIdx - 1];
            } else {
                const substitutionCost = distanceMatrix[rowIdx - 1][colIdx - 1] + 1;
                const deletionCost = distanceMatrix[rowIdx - 1][colIdx] + 1;
                const insertionCost = distanceMatrix[rowIdx][colIdx - 1] + 1;

                distanceMatrix[rowIdx][colIdx] = Math.min(substitutionCost, deletionCost, insertionCost);
            }
        }
    }
    return distanceMatrix[lenA][lenB];
}

function readAllStdinContent() {
    return new Promise((fulfill, deny) => {
        let inputBuffer = "";
        process.stdin.on("data", chunk => {
            inputBuffer += chunk;
        });
        process.stdin.on("end", () => {
            fulfill(inputBuffer);
        });
        process.stdin.on("error", err => {
            deny(err);
        });
    });
}

readAllStdinContent().then(inputContent => {
    const [firstString, secondString] = inputContent.split("\n");
    const finalDistance = calculateLevenshteinDistance(firstString, secondString);
    process.stdout.write(`${finalDistance}\n`);
});
