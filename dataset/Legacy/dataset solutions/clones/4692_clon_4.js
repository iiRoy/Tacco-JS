const processInputAndCalculate = (sourceData) => {
    const numericalValue = Number.parseInt(sourceData.trim().split(/\s+/)[0], 10);

    const primaryCoefficient = 800;
    const secondaryCoefficient = 200;
    const divisionFactor = 15;

    const finalOutcome = numericalValue * (primaryCoefficient - secondaryCoefficient / divisionFactor);

    return finalOutcome;
};

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

console.log(processInputAndCalculate(fileContent));
