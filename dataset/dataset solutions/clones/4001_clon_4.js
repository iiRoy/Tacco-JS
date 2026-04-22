const performCalculation = (sourceText) => {
    const cleansedText = sourceText.replace(/^\s+|\s+$/g, '');
    const numericalInterpretation = parseInt(cleansedText, 10);

    if (isNaN(numericalInterpretation) || (0 | numericalInterpretation) !== numericalInterpretation) {
        throw new Error("Input data is not a valid whole number.");
    }

    const resultantQuotient = Math.trunc(numericalInterpretation / 3);

    return `${resultantQuotient}\n`;
};

const activateSequence = async () => {
    let gatheredContent = '';

    process.stdin.setEncoding('utf8');
    try {
        for await (const fragment of process.stdin) {
            gatheredContent += fragment;
        }

        const finalOutcome = performCalculation(gatheredContent);
        process.stdout.write(finalOutcome);

    } catch (incident) {
        process.stderr.write(`Operation halted due to an issue: ${incident.message}\n`);
        process.exit(1);
    }
};

activateSequence();