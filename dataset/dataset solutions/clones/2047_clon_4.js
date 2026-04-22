const processInputAndCompute = (sourceText) => {
    const numericSource = Number(sourceText);

    const cubedSource = numericSource * numericSource * numericSource;

    const denominator = 3 * 3 * 3;

    const finalCalculation = cubedSource / denominator;

    process.stdout.write(finalCalculation.toString() + "\n");
};

const orchestrateExecution = () => {
    const acquiredContent = require("fs").readFileSync("/dev/stdin", "utf8");
    processInputAndCompute(acquiredContent);
};

orchestrateExecution();