const processInput = (rawData) => {
    const lines = rawData.split("\n");
    const numericValues = lines.slice(1).map(Number);

    const parityResult = calculateParitySum(numericValues);

    const outcomeMap = {
        1: "first",
        0: "second"
    };
    console.log(outcomeMap[parityResult]);
};

const calculateParitySum = (numericValues) => {
    return numericValues.reduce((accumulator, currentVal) => (accumulator + currentVal) % 2, 0);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
