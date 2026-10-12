const processInput = (inputString) => {
    const numericValue = Number(inputString.split("\n")[0]);

    if (numericValue === 0) {
        console.log(BigInt(2).toString());
        return;
    }

    if (numericValue === 1) {
        console.log(BigInt(1).toString());
        return;
    }

    const sequencePair = Array.from({ length: numericValue - 1 }).reduce(
        (accumulatorPair) => {
            const [previousPreviousTerm, previousTerm] = accumulatorPair;
            const currentTerm = previousPreviousTerm + previousTerm;
            return [previousTerm, currentTerm];
        },
        [BigInt(2), BigInt(1)]
    );

    console.log(sequencePair[1].toString());
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
