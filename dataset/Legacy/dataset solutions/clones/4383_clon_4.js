const fsys = require("fs");

const processInput = (inputContent) => {
    const lines = inputContent.split("\n");
    const elementCount = Number.parseInt(lines[0], 10);
    const numericSequence = lines[1].split(" ").map(Number.parseInt);

    const valueFrequencies = numericSequence.reduce((accumulator, currentNumber) => {
        accumulator[currentNumber] = (accumulator[currentNumber] || 0) + 1;
        return accumulator;
    }, {});

    const retrieveFrequency = (map, key) => map[key] || 0;

    const candidateValues = new Set();
    for (const keyString in valueFrequencies) {
        const num = Number.parseInt(keyString, 10);
        candidateValues.add(num - 1);
        candidateValues.add(num);
        candidateValues.add(num + 1);
    }

    const maximumTripletSum = Array.from(candidateValues).reduce((currentMaximum, centralValue) => {
        const sumForCurrentCenter = retrieveFrequency(valueFrequencies, centralValue - 1) +
                                     retrieveFrequency(valueFrequencies, centralValue) +
                                     retrieveFrequency(valueFrequencies, centralValue + 1);
        return Math.max(currentMaximum, sumForCurrentCenter);
    }, 0);

    console.log(maximumTripletSum);
};

processInput(fsys.readFileSync("/dev/stdin", "utf-8"));
