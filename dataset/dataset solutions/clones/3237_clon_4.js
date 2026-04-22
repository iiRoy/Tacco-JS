const processData = (rawData) => {
    const dataLines = rawData.split('\n');
    const primarySequence = Array.from(dataLines[1]);
    const secondarySequence = Array.from(dataLines[2]);
    const tertiarySequence = Array.from(dataLines[3]);

    const determineMismatchValue = (valA, valB, valC) => {
        const areABIdentical = valA === valB;
        const areACIdentical = valA === valC;
        const areBCIdentical = valB === valC;

        if (areABIdentical && areACIdentical) {
            // All three are the same (A=B=C)
            return 0;
        } else if (areABIdentical || areACIdentical || areBCIdentical) {
            // Exactly two are the same, one is different
            return 1;
        } else {
            // All three are different (A!=B, A!=C, B!=C)
            return 2;
        }
    };

    const totalMismatchScore = Array.from({ length: primarySequence.length }, (_, index) => {
        return determineMismatchValue(
            primarySequence[index],
            secondarySequence[index],
            tertiarySequence[index]
        );
    }).reduce((accumulatedScore, currentPositionScore) => accumulatedScore + currentPositionScore, 0);

    console.log(totalMismatchScore);
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));