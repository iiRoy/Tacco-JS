const processInputValues = (rawDataString) => {
    const numericValues = rawDataString.split(" ").map(Number);

    const valX = numericValues[0];
    const valY = numericValues[1];
    const valZ = numericValues[2];

    const calculateAbsoluteDifference = (operandA, operandB) => {
        return operandA > operandB ? operandA - operandB : operandB - operandA;
    };

    const firstDifference = calculateAbsoluteDifference(valX, valY);
    const secondDifference = calculateAbsoluteDifference(valX, valZ);

    const resultMapping = {
        true: "B",
        false: "A"
    };

    console.log(resultMapping[firstDifference > secondDifference]);
};

processInputValues(require("fs").readFileSync("/dev/stdin", "utf8"));
