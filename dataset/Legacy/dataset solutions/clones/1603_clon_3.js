function processInputValues(rawInputString) {
    const numericValues = rawInputString.split(" ").map(Number);

    const valA = numericValues[0];
    const valB = numericValues[1];
    const valC = numericValues[2];

    const productOfBAndC = valB * valC;

    if (valA > productOfBAndC) {
        console.log(valA - productOfBAndC);
    } else {
        const roundedRatioOfAAndC = Math.round(valA / valC);

        const valBModuloTwo = valB % 2;
        const roundedRatioModuloTwo = roundedRatioOfAAndC % 2;

        if (roundedRatioModuloTwo === valBModuloTwo) {
            const intermediateDifference = valA - valB * roundedRatioOfAAndC;
            console.log(Math.abs(intermediateDifference));
        } else {
            const currentDifference = valA - valB * roundedRatioOfAAndC;

            if (currentDifference < 0) {
                const nextTermMultiplier = roundedRatioOfAAndC + 1;
                const calculationWithPositiveOffset = valA - valC * nextTermMultiplier;
                console.log(Math.abs(calculationWithPositiveOffset));
            } else {
                const previousTermMultiplier = roundedRatioOfAAndC - 1;
                const calculationWithNegativeOffset = valA - valC * previousTermMultiplier;
                console.log(Math.abs(calculationWithNegativeOffset));
            }
        }
    }
}

processInputValues(`10 4 3`);
