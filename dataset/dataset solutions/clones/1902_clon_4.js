function processInput(rawInput) {
    const inputNumber = parseInt(rawInput.trim());

    let resultantA;
    let resultantB;
    let solutionFound = false;

    for (let iterA = -120; iterA <= 120; iterA++) {
        const aPowerFive = Math.pow(iterA, 5);

        for (let iterB = -120; iterB <= 120; iterB++) {
            const bPowerFive = Math.pow(iterB, 5);

            if (aPowerFive - bPowerFive === inputNumber) {
                resultantA = iterA;
                resultantB = iterB;
                solutionFound = true;
                break;
            }
        }
        if (solutionFound) {
            break;
        }
    }

    console.log(resultantA + " " + resultantB);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
