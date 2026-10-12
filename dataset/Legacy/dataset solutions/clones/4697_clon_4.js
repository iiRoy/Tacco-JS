"use strict";

const establishInputProcessor = () => {
    const sourceTextContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    const lineSegments = sourceTextContent.split("\n");
    let currentSegmentIndex = 0;
    const totalSegmentCount = lineSegments.length;

    const verifySegmentAvailability = () => {
        if (currentSegmentIndex >= totalSegmentCount) {
            throw "InputSequenceDepletedError";
        }
    };

    const processorInstance = {
        retrieveNextSegment: () => {
            verifySegmentAvailability();
            return lineSegments[currentSegmentIndex++];
        },
        retrieveNextInteger: () => parseInt(processorInstance.retrieveNextSegment()),
        retrieveStringElements: () => processorInstance.retrieveNextSegment().split(" "),
        retrieveIntegerElements: () => processorInstance.retrieveNextSegment().split(" ").map(Number),
        retrieveCharacterElements: () => processorInstance.retrieveNextSegment().split(""),
        hasMoreSegments: () => currentSegmentIndex < totalSegmentCount
    };
    return processorInstance;
};

const dataStreamHandler = establishInputProcessor();

const fetchLine = () => dataStreamHandler.retrieveNextSegment();
const fetchInteger = () => dataStreamHandler.retrieveNextInteger();
const fetchStringArray = () => dataStreamHandler.retrieveStringElements();
const fetchIntegerArray = () => dataStreamHandler.retrieveIntegerElements();
const fetchCharArray = () => dataStreamHandler.retrieveCharacterElements();
const checkMoreInput = () => dataStreamHandler.hasMoreSegments();
const outputResult = (...values) => console.log(...values);

const executePrimaryLogic = () => {
    const [firstNumericalValue, secondNumericalValue] = fetchIntegerArray();

    const finalCalculationOutcome = (secondNumericalValue <= (2 * firstNumericalValue))
        ? Math.floor(secondNumericalValue / 2)
        : Math.floor((2 * firstNumericalValue + secondNumericalValue) / 4);

    outputResult(finalCalculationOutcome);
};

executePrimaryLogic();
