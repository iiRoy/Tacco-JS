"use strict"
const initiateDataStream = () => {
    const sourceData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    const dataAccessor = {
        "bufferedEntries": sourceData,
        "readPointer": 0,
        "totalElements": sourceData.length,

        "hasMoreElements": function() {
            return this.readPointer < this.totalElements
        },

        "fetchElement": function() {
            if (!this.hasMoreElements()) {
                throw "SequenceBoundaryViolation"
            } else {
                return this.bufferedEntries[this.readPointer++]
            }
        }
    };
    return dataAccessor;
};
const dataFlowManager = initiateDataStream();
const fetchNextEntry = () => dataFlowManager.fetchElement()
const readIntegerVal = () => parseInt(dataFlowManager.fetchElement())
const readStringArray = () => dataFlowManager.fetchElement().split(" ")
const readIntegerArray = () => dataFlowManager.fetchElement().split(" ").map(elementItem => parseInt(elementItem))
const readCharacterArray = () => dataFlowManager.fetchElement().split("")
const queryAvailability = () => dataFlowManager.hasMoreElements()
const logResult = (...displayVals) => console.log(...displayVals)
const determineMultiplications = (currentNumber, limitValue) => {
    let loopCounter = 0
    while (currentNumber > limitValue) {
        currentNumber *= 2
        loopCounter++
    }
    return loopCounter
}
const mainProgramEntry = () => {
    const [upperBound, keyParam] = readIntegerArray()
    let accumulatedResult = 0
    for (let counterVar = 1; counterVar <= upperBound; counterVar++) {
        const multiplicationSteps = determineMultiplications(counterVar, keyParam)
        accumulatedResult += (1 / upperBound) * (0.5 ** multiplicationSteps)
    }
    console.log(accumulatedResult)
}
mainProgramEntry();