"use strict";

const processInputData = (streamOfCharacters) => {

    const deriveNumericalExpressions = (sourceText) => {
        let numericalCollections = [];
        let currentNumericSequence = "";
        const rowSeparator = "\n";
        const componentSeparator = " ";
        let currentRowData = [];

        const finalizeNumber = () => {
            if (currentNumericSequence.length > 0) {
                currentRowData.push(Number(currentNumericSequence));
                currentNumericSequence = "";
            }
        };

        for (let characterIndex = 0; characterIndex < sourceText.length; ++characterIndex) {
            const currentCharacter = sourceText[characterIndex];

            if (currentCharacter === rowSeparator) {
                finalizeNumber();
                numericalCollections.push(currentRowData);
                currentRowData = [];
            } else if (currentCharacter === componentSeparator) {
                finalizeNumber();
            } else if ((currentCharacter >= '0' && currentCharacter <= '9') || currentCharacter === '-') {
                currentNumericSequence += currentCharacter;
            }
        }
        finalizeNumber();
        if (currentRowData.length > 0) {
             numericalCollections.push(currentRowData);
        }

        return numericalCollections;
    };

    const parsedDataSegments = deriveNumericalExpressions(streamOfCharacters);
    const totalSubjectCount = parsedDataSegments[0][0];
    const subjectDescriptions = parsedDataSegments.slice(1);

    const projectPairsToSegments = (sourcePairs, accumulatedSegments = []) => {
        if (sourcePairs.length === 0) {
            return accumulatedSegments;
        }
        const [firstPair, ...restOfPairs] = sourcePairs;
        const [centralPoint, deviationSpan] = firstPair;
        accumulatedSegments.push([centralPoint - deviationSpan, centralPoint + deviationSpan]);
        return projectPairsToSegments(restOfPairs, accumulatedSegments);
    };

    let transformedSegments = projectPairsToSegments(subjectDescriptions);

    const mergeSortedCollections = (leftSequence, rightSequence) => {
        let combinedResult = [];
        let leftIdx = 0;
        let rightIdx = 0;

        while (leftIdx < leftSequence.length && rightIdx < rightSequence.length) {
            if (leftSequence[leftIdx][1] <= rightSequence[rightIdx][1]) {
                combinedResult.push(leftSequence[leftIdx]);
                leftIdx++;
            } else {
                combinedResult.push(rightSequence[rightIdx]);
                rightIdx++;
            }
        }

        while (leftIdx < leftSequence.length) {
            combinedResult.push(leftSequence[leftIdx]);
            leftIdx++;
        }

        while (rightIdx < rightSequence.length) {
            combinedResult.push(rightSequence[rightIdx]);
            rightIdx++;
        }

        return combinedResult;
    };

    const orderSegmentsByFinishPoint = (unorderedSegments) => {
        if (unorderedSegments.length <= 1) {
            return unorderedSegments;
        }

        const midPoint = Math.floor(unorderedSegments.length / 2);
        const leftPortion = unorderedSegments.slice(0, midPoint);
        const rightPortion = unorderedSegments.slice(midPoint);

        const sortedLeftPortion = orderSegmentsByFinishPoint(leftPortion);
        const sortedRightPortion = orderSegmentsByFinishPoint(rightPortion);

        return mergeSortedCollections(sortedLeftPortion, sortedRightPortion);
    };

    let orderedIntervals = orderSegmentsByFinishPoint(transformedSegments);

    const countMaximalDisjointSegments = (currentSegmentList, lastTakenEndpoint = -Infinity, currentTally = 0) => {
        if (currentSegmentList.length === 0) {
            return currentTally;
        }

        const [firstAvailableSegment, ...remainingSegmentList] = currentSegmentList;
        const [segmentStartPoint, segmentEndPoint] = firstAvailableSegment;

        if (segmentStartPoint >= lastTakenEndpoint) {
            return countMaximalDisjointSegments(remainingSegmentList, segmentEndPoint, currentTally + 1);
        } else {
            return countMaximalDisjointSegments(remainingSegmentList, lastTakenEndpoint, currentTally);
        }
    };

    let finalNonOverlappingCount = countMaximalDisjointSegments(orderedIntervals);

    const outputResultValue = (valueToDisplay) => {
        console.log(valueToDisplay);
    };

    outputResultValue(finalNonOverlappingCount);
};

const acquireSystemInput = () => {
    const fileSystemHandler = require("fs");
    const standardInputPath = "/dev/stdin";
    const textEncoding = "utf8";
    return fileSystemHandler.readFileSync(standardInputPath, textEncoding);
};

const orchestrateExecution = () => {
    const rawInputContent = acquireSystemInput();
    processInputData(rawInputContent.toString());
};

orchestrateExecution();