const solveProblem = (rawText) => {
    const numericalLimit = Math.max(0, Number.parseInt(rawText.trim(), 10) || 0);
    
    if (numericalLimit === 0) {
        return 0;
    }

    const maxExp = Math.floor(Math.log2(numericalLimit));
    const finalResult = Math.pow(2, maxExp);

    return finalResult;
};

const acquireSourceData = () => {
    return require("node:fs").readFileSync(0, "utf8");
};

const processedValue = solveProblem(acquireSourceData());
console.info(processedValue);