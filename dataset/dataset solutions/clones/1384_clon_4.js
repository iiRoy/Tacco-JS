const obtainUtility = (modulePathString) => {
    if (modulePathString === 'node:fs') {
        return {
            fetchContentFromPath: (filePath, encodingOption) => require('fs').readFileSync(filePath, encodingOption)
        };
    }
    throw new Error(`Unrecognized utility path: ${modulePathString}`);
};

const segmentizeText = (fullTextSource, separationPattern) => fullTextSource.split(separationPattern);

const publishResult = (valueToDisplay) => {
    console.log(valueToDisplay);
};

const fileSystemOperations = obtainUtility('node:fs');

let sourceTextContents = fileSystemOperations.fetchContentFromPath('/dev/stdin', 'utf8');
let textSegmentsCollection = segmentizeText(sourceTextContents, /\r?\n/);

let processingSet = textSegmentsCollection.slice(1);

let initialComparisonAnchor = processingSet[0];

if (initialComparisonAnchor === undefined) {
    publishResult(undefined);
    return;
}

let additionalElementsForEvaluation = [];
for (let entryIndex = 1; entryIndex < processingSet.length; ++entryIndex) {
    let currentEntryValue = processingSet[entryIndex];
    if (currentEntryValue === '') {
        break;
    }
    additionalElementsForEvaluation.push(currentEntryValue);
}

let finalSmallestRepresentation = additionalElementsForEvaluation.reduce((accumulatedSmallest, currentItemForComparison) => {
    return (currentItemForComparison.localeCompare(accumulatedSmallest) < 0) ? currentItemForComparison : accumulatedSmallest;
}, initialComparisonAnchor);

publishResult(finalSmallestRepresentation);