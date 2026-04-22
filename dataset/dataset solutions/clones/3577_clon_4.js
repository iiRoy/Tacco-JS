const obtainData = (rawContent) => {
    const contentLines = rawContent.split("\n");
    const numericContent = contentLines.map(Number);
    const totalCount = numericContent[0];
    const dataValues = numericContent.slice(1);
    return { totalCount, dataValues };
};

const locateNextUnclaimedSlot = (initialMarker, claimedRecords) => {
    let candidateMarker = initialMarker + 2;
    while (claimedRecords.has(candidateMarker)) {
        candidateMarker += 2;
    }
    return candidateMarker;
};

const processNestedSegment = (
    currentPositionInSegment,
    segmentEndIdentifier,
    segmentStartIdentifier,
    overallLimit,
    dataElements,
    currentClaimedSet
) => {
    if (currentPositionInSegment >= segmentEndIdentifier) {
        return { success: true, nextPosition: currentPositionInSegment, finalEnd: segmentEndIdentifier, finalStart: segmentStartIdentifier, finalClaimedSet: currentClaimedSet };
    }

    const firstAdvancePosition = currentPositionInSegment + 1;
    if (firstAdvancePosition > overallLimit || dataElements[firstAdvancePosition - 1] !== firstAdvancePosition) {
        return { success: false };
    }

    const secondAdvancePosition = firstAdvancePosition + 1;
    if (secondAdvancePosition > overallLimit) {
        return { success: false };
    }
    const valueAtSecondAdvance = dataElements[secondAdvancePosition - 1];

    if ((valueAtSecondAdvance % 2) !== (secondAdvancePosition % 2)) {
        return { success: false };
    }

    let newSegmentEnd = segmentEndIdentifier;
    let newSegmentStart = segmentStartIdentifier;
    const updatedClaimedSet = new Set(currentClaimedSet);

    if (segmentEndIdentifier < valueAtSecondAdvance) {
        newSegmentEnd = valueAtSecondAdvance;
        if (updatedClaimedSet.has(newSegmentEnd)) {
            return { success: false };
        }
        updatedClaimedSet.add(newSegmentEnd);
    } else if (segmentStartIdentifier === valueAtSecondAdvance) {
        newSegmentStart = locateNextUnclaimedSlot(segmentStartIdentifier, updatedClaimedSet);
    } else {
        return { success: false };
    }

    const recursiveResult = processNestedSegment(
        secondAdvancePosition,
        newSegmentEnd,
        newSegmentStart,
        overallLimit,
        dataElements,
        updatedClaimedSet
    );

    if (!recursiveResult.success) {
        return { success: false };
    }

    return recursiveResult;
};

const validateDataStructure = (
    currentProcessingIndex,
    maximumElements,
    elementSequence,
    globalClaimedRegister
) => {
    if (currentProcessingIndex > maximumElements) {
        return "Yes";
    }

    const currentElement = elementSequence[currentProcessingIndex - 1];
    if ((currentElement % 2) !== (currentProcessingIndex % 2)) {
        return "No";
    }

    const initialSegmentEnd = currentElement;
    const initialSegmentStart = currentProcessingIndex;

    if (globalClaimedRegister.has(initialSegmentEnd)) {
        return "No";
    }
    const updatedGlobalClaimedRegister = new Set(globalClaimedRegister);
    updatedGlobalClaimedRegister.add(initialSegmentEnd);

    const segmentEvaluation = processNestedSegment(
        currentProcessingIndex,
        initialSegmentEnd,
        initialSegmentStart,
        maximumElements,
        elementSequence,
        updatedGlobalClaimedRegister
    );

    if (!segmentEvaluation.success) {
        return "No";
    }

    return validateDataStructure(
        segmentEvaluation.nextPosition + 1,
        maximumElements,
        elementSequence,
        segmentEvaluation.finalClaimedSet
    );
};

const initiateProcessing = () => {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const { totalCount, dataValues } = obtainData(fileContent);

    if (dataValues.length !== totalCount) {
        return "No";
    }

    const initialClaimedRegister = new Set();
    return validateDataStructure(1, totalCount, dataValues, initialClaimedRegister);
};

console.log(initiateProcessing());