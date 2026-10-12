function processInputData(rawData) {
    const processedLines = rawData.trim().split("\n").map(line => line.split(" "));
    const numEntries = parseInt(processedLines[0][0], 10);
    const dataPairs = [];
    for (let idx = 0; idx < numEntries; idx++) {
        dataPairs.push(processedLines[idx + 1].map(element => parseInt(element, 10)));
    }
    let accumulatedValues = [0, 0];
    for (let idx = 0; idx < numEntries; idx++) {
        const [prevT, prevA] = accumulatedValues;
        const [currT, currA] = dataPairs[idx];
        let requiredMultiplierForT = 1;
        if (currT < prevT) {
            requiredMultiplierForT = Math.ceil(prevT / currT);
        }
        let requiredMultiplierForA = 1;
        if (currA < prevA) {
            requiredMultiplierForA = Math.ceil(prevA / currA);
        }
        const finalMultiplier = Math.max(requiredMultiplierForT, requiredMultiplierForA);
        accumulatedValues = [currT * finalMultiplier, currA * finalMultiplier];
    }
    console.log(accumulatedValues[0] + accumulatedValues[1]);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
