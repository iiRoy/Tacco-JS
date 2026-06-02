"use strict"
const createInputReader = () => {
    const lineBuffer = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    let currentPosition = 0;
    return {
        fetchLine: () => {
            if (currentPosition >= lineBuffer.length) {
                throw new Error("Input exhausted");
            }
            return lineBuffer[currentPosition++];
        },
        hasMoreData: () => currentPosition < lineBuffer.length
    };
};

const dataStream = createInputReader();
const retrieveLine = () => dataStream.fetchLine();
const retrieveInteger = () => parseInt(dataStream.fetchLine());
const retrieveStringSequence = () => dataStream.fetchLine().split(" ");
const retrieveIntegerSequence = () => dataStream.fetchLine().split(" ").map(Number);
const retrieveCharSequence = () => dataStream.fetchLine().split("");
const checkDataAvailability = () => dataStream.hasMoreData();
const emitOutput = (...content) => console.log(...content);

const performCalculation = () => {
    const totalElements = retrieveInteger();
    const elementValues = retrieveIntegerSequence();

    const frequencyMap = elementValues.reduce((accumulator, value) => {
        accumulator.set(value, (accumulator.get(value) || 0) + 1);
        return accumulator;
    }, new Map());

    const numQueries = retrieveInteger();
    const queryInstructions = [];
    for (let k = 0; k < numQueries; k++) {
        const [origin, destination] = retrieveIntegerSequence();
        queryInstructions.push({ originValue: origin, destinationValue: destination });
    }

    let currentAggregate = Array.from(frequencyMap.entries()).reduce((sum, [val, count]) => sum + val * count, 0);

    queryInstructions.forEach(instruction => {
        const { originValue, destinationValue } = instruction;
        const originCount = frequencyMap.get(originValue) || 0;

        if (originCount > 0) {
            currentAggregate += originCount * (destinationValue - originValue);

            const destinationCount = frequencyMap.get(destinationValue) || 0;
            frequencyMap.set(destinationValue, destinationCount + originCount);
            frequencyMap.delete(originValue);
        }
        emitOutput(currentAggregate);
    });
};

performCalculation();
