function processInput(rawInputData) {
    const inputLines = rawInputData.split("\n");
    const N_val = parseInt(inputLines[0], 10);
    const referenceString = inputLines[1];

    const sequenceNumbers = [];
    for (let currentNum = 1; currentNum <= N_val; currentNum++) {
        sequenceNumbers.push(currentNum);
    }

    let validTripletCount = 0;

    const areAllDifferent = (val1, val2, val3) => {
        const distinctPair1 = val1 !== val2;
        const distinctPair2 = val2 !== val3;
        const distinctPair3 = val3 !== val1;
        return distinctPair1 && distinctPair2 && distinctPair3;
    };

    sequenceNumbers.forEach(idxA => {
        sequenceNumbers.forEach(idxB => {
            sequenceNumbers.forEach(idxC => {
                const charA = referenceString[idxA - 1];
                const charB = referenceString[idxB - 1];
                const charC = referenceString[idxC - 1];

                const charsAreDistinct = areAllDifferent(charA, charB, charC);

                const indicesAreOrdered = idxA < idxB && idxB < idxC;

                const notArithmeticProgression = (idxB - idxA !== idxC - idxB);

                if (charsAreDistinct && indicesAreOrdered && notArithmeticProgression) {
                    console.log(idxA, idxB, idxC);
                    validTripletCount++;
                }
            });
        });
    });

    console.log(validTripletCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
