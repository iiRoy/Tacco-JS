"use strict";

function* dataStreamSupplier() {
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    for (const entry of rawData) {
        yield entry;
    }
}

const inputSequence = dataStreamSupplier();

const lineExtractor = () => inputSequence.next().value;
const integerExtractor = () => parseInt(lineExtractor());
const integerArrayExtractor = () => lineExtractor().split(" ").map(Number);

const reportResult = (...content) => console.log(...content);

const processOperations = () => {
    const initialQuantity = integerExtractor();
    const initialElements = integerArrayExtractor();

    const valueCounts = new Map();
    initialElements.forEach(elementValue => {
        valueCounts.set(elementValue, (valueCounts.get(elementValue) || 0) + 1);
    });

    let totalAccumulation = 0;
    for (const [val, count] of valueCounts.entries()) {
        totalAccumulation += val * count;
    }

    const operationCount = integerExtractor();

    for (let iterIndex = 0; iterIndex < operationCount; iterIndex++) {
        const [origin, destination] = integerArrayExtractor();

        const originCount = valueCounts.get(origin) || 0;

        if (originCount > 0) {
            const destinationCount = valueCounts.get(destination) || 0;

            totalAccumulation += originCount * (destination - origin);

            valueCounts.set(destination, destinationCount + originCount);
            valueCounts.delete(origin);
        }
        reportResult(totalAccumulation);
    }
};

processOperations();