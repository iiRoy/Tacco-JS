function processInput(rawData) {
    const lines = rawData.split("\n");
    const [targetX, targetY] = lines[0].split(" ").map(Number);

    if ((targetX + targetY) % 3 !== 0) {
        console.log(0);
        return;
    }

    const diag1Moves = (2 * targetY - targetX) / 3;
    const diag2Moves = (2 * targetX - targetY) / 3;

    if (diag1Moves < 0 || diag2Moves < 0) {
        console.log(0);
        return;
    }

    const totalMoves = diag1Moves + diag2Moves;
    const selectedMoves = Math.min(diag1Moves, diag2Moves);

    const computeCombinations = (nValue, kValue) => {
        if (kValue < 0 || kValue > nValue) {
            return 0;
        }
        if (kValue === 0 || kValue === nValue) {
            return 1;
        }
        if (kValue > nValue / 2) {
            kValue = nValue - kValue;
        }

        let currentProduct = 1;
        for (let iterIndex = 0; iterIndex < kValue; iterIndex++) {
            currentProduct = currentProduct * (nValue - iterIndex) / (iterIndex + 1);
        }
        return currentProduct;
    };

    const finalCount = computeCombinations(totalMoves, selectedMoves);
    console.log(finalCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
