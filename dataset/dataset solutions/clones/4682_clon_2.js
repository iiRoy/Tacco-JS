"use strict";

const generateStream = () => {
    const dataLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    const dataAccessor = {
        "contentList": dataLines,
        "currentPosition": 0,
        "maxElements": dataLines.length,
        "hasFurtherItems": function() {
            return this.currentPosition < this.maxElements;
        },
        "retrieveNext": function() {
            if (!this.hasFurtherItems()) {
                throw new Error("EndOfDataStreamException");
            } else {
                return this.contentList[this.currentPosition++];
            }
        }
    };
    return dataAccessor;
};

const dataStream = generateStream();

const fetchNext = () => dataStream.retrieveNext();

const fetchInteger = () => parseInt(dataStream.retrieveNext(), 10);

const fetchStringArray = () => dataStream.retrieveNext().split(" ");

const fetchIntegerArray = () => dataStream.retrieveNext().split(" ").map(currentItem => parseInt(currentItem, 10));

const fetchCharacterArray = () => dataStream.retrieveNext().split("");

const checkAvailability = () => dataStream.hasFurtherItems();

const displayOutput = (...outputElements) => console.log(...outputElements);

const PrimaryExecution = () => {
    const targetValue = fetchInteger();
    let iterationCount = 0;
    let processingQueue = [0];

    while (processingQueue.length > 0) {
        iterationCount++;
        let queueSize = processingQueue.length;
        for (let loopIndex = 0; loopIndex < queueSize; loopIndex++) {
            let currentLocation = processingQueue.shift();
            if (currentLocation - iterationCount === targetValue || currentLocation + iterationCount === targetValue) {
                displayOutput(iterationCount);
                return;
            }
            processingQueue.push(currentLocation - iterationCount);
            processingQueue.push(currentLocation + iterationCount);
            processingQueue.push(currentLocation);
        }
    }
};

PrimaryExecution();