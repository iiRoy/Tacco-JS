function processInput(rawData) {
    const inputParts = rawData.split(" ");
    const valA = parseInt(inputParts[0], 10);
    const valB = parseInt(inputParts[1], 10);

    let computedOutcome = null;

    const calculatePairs = (countValue) => {
        return countValue * (countValue - 1);
    };

    const pairsFromA = calculatePairs(valA);
    const pairsFromB = calculatePairs(valB);

    if (valA >= 2) {
        if (valB >= 2) {
            computedOutcome = pairsFromA + pairsFromB;
        } else if (valB <= 0) {
            computedOutcome = valA * (valB - 1);
        }
    } else {
        computedOutcome = pairsFromB;
    }

    if (computedOutcome !== null) {
        console.log(computedOutcome);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
