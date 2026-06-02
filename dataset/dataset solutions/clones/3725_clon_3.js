function solveProblem(rawData) {
    const numericParts = rawData.split(/\n|\s/).map(Number);

    const nValue = numericParts[0];
    const kValue = numericParts[1];

    let finalAnswer;

    // The problem has a specific rule for kValue being 2
    if (kValue === 2) {
        finalAnswer = nValue - 1;
    } else {
        // For other kValue values, calculate the effective divisor
        const effectiveDivisor = kValue - 1;

        // Perform the initial calculation using ceiling division
        let intermediateResult = Math.ceil(nValue / effectiveDivisor);

        // Apply a specific adjustment if nValue modulo effectiveDivisor is 1
        if ((nValue % effectiveDivisor) === 1) {
            intermediateResult--;
        }
        finalAnswer = intermediateResult;
    }

    console.log(finalAnswer);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
