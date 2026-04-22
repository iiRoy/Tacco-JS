const processData = (rawData) => {
    const numericElements = rawData.match(/-?\d+/g).map(Number);
    const initialMagnitude = numericElements[0];
    const dataSequence = numericElements.slice(1);

    const comparisonThreshold = initialMagnitude / 2;

    const aggregateCounts = dataSequence.reduce((accumulators, currentNumber) => {
        if (currentNumber % 4 === 0) {
            accumulators.fourMultiples++;
        } else if (currentNumber % 2 !== 0) {
            accumulators.oddValues++;
        }
        return accumulators;
    }, { fourMultiples: 0, oddValues: 0 });

    const totalFourMultiples = aggregateCounts.fourMultiples;
    const totalOddValues = aggregateCounts.oddValues;

    const outcomeIfOverThreshold = (totalOddValues - 1 <= totalFourMultiples) ? "Yes" : "No";
    const outcomeIfUnderThreshold = (totalOddValues <= totalFourMultiples) ? "Yes" : "no";

    const finalDecision = (comparisonThreshold < totalOddValues) ? outcomeIfOverThreshold : outcomeIfUnderThreshold;

    return finalDecision;
};

const inputPayload = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processData(inputPayload));