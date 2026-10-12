"use strict";
class DataStreamProcessor {
    constructor(sourceText) {
        this.dataTokens = sourceText.split(/\s+/);
        this.tokenIndex = 0;
    }

    retrieveNextInteger() {
        return Number(this.dataTokens[this.tokenIndex++]);
    }

    retrieveIntegerArray(count) {
        const resultCollection = [];
        for (let k = 0; k < count; k++) {
            resultCollection.push(this.retrieveNextInteger());
        }
        return resultCollection;
    }
}

const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const streamProcessor = new DataStreamProcessor(rawInputData);

const finalResult = processSequence();
if (finalResult !== undefined) {
    console.log(String(finalResult));
}

function processSequence() {
    const sequenceLength = streamProcessor.retrieveNextInteger();
    const numericSequence = streamProcessor.retrieveIntegerArray(sequenceLength);

    let searchUpperBoundary = sequenceLength;
    let searchLowerBoundary = 0;

    while (searchUpperBoundary - searchLowerBoundary > 1) {
        const currentMidpoint = Math.floor((searchUpperBoundary + searchLowerBoundary) / 2);
        let isConditionMet = true;

        const segmentStack = [];
        // Initialize segmentStack based on the first element of numericSequence
        if (numericSequence[0] > 1) {
            segmentStack.push({ segmentValue: 1, segmentCount: 1 });
            segmentStack.push({ segmentValue: numericSequence[0], segmentCount: 1 });
        } else {
            segmentStack.push({ segmentValue: 1, segmentCount: 1 });
        }

        for (let elementIndex = 1; elementIndex < sequenceLength && isConditionMet; elementIndex++) {
            const currentElementValue = numericSequence[elementIndex];
            const lastSegmentInStack = segmentStack[segmentStack.length - 1];
            const lastSegmentValue = lastSegmentInStack.segmentValue;

            if (lastSegmentValue < currentElementValue) {
                // Pop segments with count 1 if they are not the base segment
                while (segmentStack.length > 1 && segmentStack[segmentStack.length - 1].segmentCount === 1) {
                    segmentStack.pop();
                }
                segmentStack.push({ segmentValue: currentElementValue, segmentCount: 1 });
            } else { // lastSegmentValue >= currentElementValue
                if (currentMidpoint === 1) {
                    isConditionMet = false;
                    break;
                }

                // Pop segments whose value is greater than currentElementValue
                while (segmentStack.length > 0 && segmentStack[segmentStack.length - 1].segmentValue > currentElementValue) {
                    segmentStack.pop();
                }

                // If stack becomes empty, condition is not met
                if (segmentStack.length === 0) {
                    isConditionMet = false;
                    break;
                }

                const updatedLastSegment = segmentStack[segmentStack.length - 1];
                if (updatedLastSegment.segmentValue < currentElementValue) {
                    segmentStack.push({ segmentValue: currentElementValue, segmentCount: 2 });
                } else { // updatedLastSegment.segmentValue === currentElementValue
                    let currentTargetValue = updatedLastSegment.segmentValue;
                    let innerLoopCompleted = false;

                    // Iterate backward through the stack to adjust counts or add new segments
                    for (let stackPosition = segmentStack.length - 1; stackPosition >= 0; stackPosition--) {
                        const currentStackSegment = segmentStack[stackPosition];

                        if (currentStackSegment.segmentValue < currentTargetValue) {
                            segmentStack.push({ segmentValue: currentElementValue, segmentCount: 2 });
                            innerLoopCompleted = true;
                            break;
                        }

                        if (currentStackSegment.segmentCount < currentMidpoint) {
                            currentStackSegment.segmentCount++;
                            if (currentStackSegment.segmentValue < currentElementValue) {
                                segmentStack.push({ segmentValue: currentElementValue, segmentCount: 1 });
                            }
                            innerLoopCompleted = true;
                            break;
                        }

                        // If count reaches midpoint, pop the segment and decrement target value
                        segmentStack.pop();
                        currentTargetValue--;
                    }

                    if (!innerLoopCompleted) {
                        isConditionMet = false;
                    }
                }
            }
        }

        if (isConditionMet) {
            searchUpperBoundary = currentMidpoint;
        } else {
            searchLowerBoundary = currentMidpoint;
        }
    }

    return searchUpperBoundary;
}
