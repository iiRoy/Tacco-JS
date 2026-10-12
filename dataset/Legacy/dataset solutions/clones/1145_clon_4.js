function calculateStringDistance(sourceString, targetString) {
    const memoizationMap = new Map();

    function findMinEdit(idxA, idxB) {
        const cacheKey = `${idxA},${idxB}`;

        if (memoizationMap.has(cacheKey)) {
            return memoizationMap.get(cacheKey);
        }

        if (idxA === 0) {
            memoizationMap.set(cacheKey, idxB);
            return idxB;
        }
        if (idxB === 0) {
            memoizationMap.set(cacheKey, idxA);
            return idxA;
        }

        let currentCost;
        if (sourceString[idxA - 1] === targetString[idxB - 1]) {
            currentCost = findMinEdit(idxA - 1, idxB - 1);
        } else {
            const substitutionOperation = findMinEdit(idxA - 1, idxB - 1) + 1;
            const deletionOperation = findMinEdit(idxA - 1, idxB) + 1;
            const insertionOperation = findMinEdit(idxA, idxB - 1) + 1;

            currentCost = Math.min(substitutionOperation, deletionOperation, insertionOperation);
        }

        memoizationMap.set(cacheKey, currentCost);
        return currentCost;
    }

    return findMinEdit(sourceString.length, targetString.length);
}

new Promise(function(fulfill, discard) {
    let inputBuffer = "";
    process.stdin.on("data", (dataChunk) => { inputBuffer += dataChunk; });
    process.stdin.on("end", () => { fulfill([inputBuffer, process.stdout]); });
}).then(function([receivedInput, outputStream]) {
    const [firstLine, secondLine] = receivedInput.split("\n");
    outputStream.write(`${calculateStringDistance(firstLine, secondLine)}\n`);
});
