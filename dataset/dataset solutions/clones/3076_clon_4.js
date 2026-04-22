'use strict';

const acquireAllInputLines = () => require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const establishInputProcessor = (rawContent) => {
    let currentPointer = 0;
    const totalContentLength = rawContent.length;

    const typeConversionOperations = new Map([
        [1, (segment) => parseInt(segment, 10)],
        [2, (segment) => segment.split(" ")],
        [4, (segment) => segment.split(" ").map(Number)],
        [6, (segment) => segment.split("")],
        [7, (segment) => segment.split("").map(Number)],
        [8, (segment) => segment.join(" ")],
        [9, (segment) => segment.join("\n")],
        [0, (segment) => segment.join("")],
    ]);

    const performTransformation = (itemValue, transformationCode) => {
        try {
            const operation = typeConversionOperations.get(transformationCode);
            return operation ? operation(itemValue) : itemValue;
        } catch (errorDetails) {
            return itemValue;
        }
    };

    const hasMoreSegments = () => currentPointer < totalContentLength;

    const retrieveNextSegment = () => {
        if (!hasMoreSegments()) {
            return "";
        }
        const extractedSegment = rawContent[currentPointer];
        currentPointer++;
        return extractedSegment;
    };

    const obtainInteger = () => performTransformation(retrieveNextSegment(), 1);
    const obtainStringSequence = () => performTransformation(retrieveNextSegment(), 2);
    const obtainNumericSequence = () => performTransformation(retrieveNextSegment(), 4);
    const obtainCharacterSequence = () => performTransformation(retrieveNextSegment(), 6);

    return {
        obtainInteger,
        obtainStringSequence,
        obtainNumericSequence,
        obtainCharacterSequence,
        retrieveNextSegment,
        hasMoreSegments,
        performTransformation
    };
};

const publishResult = (messageContent) => {
    console.log(messageContent);
};

const notifyError = (errorInfo) => {
    console.error(errorInfo);
};

const executeComputation = () => {
    const dataHub = establishInputProcessor(acquireAllInputLines());

    const initialParameters = dataHub.obtainNumericSequence();
    const dimensionOne = initialParameters[0];
    const dimensionTwo = initialParameters[1];
    const dimensionThree = initialParameters[2];
    const topCountLimit = initialParameters[3]; // This variable's effect on list trimming is nullified by original code's slice behavior.

    const collectionAlpha = dataHub.obtainNumericSequence();
    const collectionBeta = dataHub.obtainNumericSequence();
    const collectionGamma = dataHub.obtainNumericSequence();

    // First stage of summation: combine elements from collectionAlpha and collectionBeta
    const partialSums = collectionAlpha.flatMap(valueA =>
        collectionBeta.map(valueB => valueA + valueB)
    );

    // Sort the partial sums in descending order
    partialSums.sort((item1, item2) => item2 - item1);

    // Second stage of summation: combine partial sums with elements from collectionGamma
    const finalAggregateSums = partialSums.flatMap(sumAB =>
        collectionGamma.map(valueC => sumAB + valueC)
    );

    // Sort the final aggregate sums in descending order
    finalAggregateSums.sort((item1, item2) => item2 - item1);

    // Output all final aggregate sums, joined by newlines.
    // The original code's Array.prototype.slice(0,K) call was not assigned,
    // thus it did not modify the array, and all elements are printed.
    publishResult(dataHub.performTransformation(finalAggregateSums, 9));
};

executeComputation();