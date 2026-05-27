function solveProblem(inputString) {
    function parseParameters(data) {
        const parts = data.split(' ');
        const nValue = parseInt(parts[0], 10);
        const kValue = parseInt(parts[1], 10);
        return { upperBound: nValue, moduloDivisor: kValue };
    }

    const { upperBound, moduloDivisor } = parseParameters(inputString);

    let validTripletCount = 0;

    const minimumPossibleSum = 2 * upperBound;
    if (minimumPossibleSum < moduloDivisor) {
        console.log(0);
        return;
    }

    for (let valA = 1; valA <= upperBound; valA++) {
        const initialValBRemainder = valA % moduloDivisor;
        const startingValB = initialValBRemainder === 0 ? moduloDivisor : initialValBRemainder;

        for (let valB = startingValB; valB <= upperBound; valB += moduloDivisor) {
            const currentSumAB = valA + valB;

            if (currentSumAB % moduloDivisor === 0) {
                const initialValCRemainder = valA % moduloDivisor;
                const startingValC = initialValCRemainder === 0 ? moduloDivisor : initialValCRemainder;

                for (let valC = startingValC; valC <= upperBound; valC += moduloDivisor) {
                    const currentSumAC = valA + valC;
                    const currentSumCB = valC + valB;

                    if (currentSumAC % moduloDivisor === 0 && currentSumCB % moduloDivisor === 0) {
                        validTripletCount++;
                    } else {
                        const shouldBreakInnerC = currentSumAC >= moduloDivisor && currentSumCB >= moduloDivisor;
                        if (shouldBreakInnerC) {
                            break;
                        }
                    }
                }
            } else {
                const shouldBreakInnerB = currentSumAB >= moduloDivisor;
                if (shouldBreakInnerB) {
                    break;
                }
            }
        }
    }

    console.log(validTripletCount);
}

solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
