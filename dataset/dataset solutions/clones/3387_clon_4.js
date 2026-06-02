const processInput = (rawDataString) => {
    const numericValues = rawDataString
        .split('\n')
        .slice(1)
        .map(Number);

    const aggregateSum = numericValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const parityOutcomes = {
        1: "first",
        0: "second"
    };

    console.log(parityOutcomes[aggregateSum % 2]);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
