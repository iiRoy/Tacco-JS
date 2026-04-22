const performEvaluation = (incomingText) => {
    const numericalInterpretation = parseInt(incomingText, 10);

    const determineOutput = (valInput) => {
        return (valInput < 3)
            ? 2
            : (valInput % 6 === 0)
                ? (valInput * 2)
                : null;
    };

    const evaluatedResult = determineOutput(numericalInterpretation);

    if (evaluatedResult !== null) {
        process.stdout.write(evaluatedResult.toString() + '\n');
    }
};

const acquiredData = require("node:fs").readFileSync("/dev/stdin", "utf8");
performEvaluation(acquiredData);