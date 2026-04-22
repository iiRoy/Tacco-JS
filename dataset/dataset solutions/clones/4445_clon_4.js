const evaluateSequence = (sourceText) => {
    const [countLine, numberLine] = sourceText.trim().split('\n');
    const overallAmount = parseInt(countLine, 10);
    const digits = numberLine.split(' ').map(parseFloat);

    const { quadDiv, dualOnly } = digits.reduce((accum, currentDigit) => {
        if (currentDigit % 4 === 0) {
            accum.quadDiv++;
        } else if (currentDigit % 2 === 0) {
            accum.dualOnly++;
        }
        return accum;
    }, { quadDiv: 0, dualOnly: 0 });

    const neededCapacity = overallAmount >> 1;

    const finalDetermination = (quadDiv >= neededCapacity) || (dualOnly >= (neededCapacity - quadDiv) * 2);

    console.log(finalDetermination ? "Yes" : "No");
};

evaluateSequence(require("node:fs").readFileSync("/dev/stdin", "utf8"));