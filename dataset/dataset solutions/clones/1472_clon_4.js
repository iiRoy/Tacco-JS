const acquireSourceData = require('fs').readFileSync;
const inputSourcePath = '/dev/stdin';
const lineDelimiter = '\n';

const constructLifoContainer = () => {
    let internalDepository = [];
    return {
        depositElement: (item) => {
            internalDepository.push(item);
        },
        extractElement: () => {
            return internalDepository.pop();
        },
        hasElements: () => internalDepository.length > 0
    };
};

const navigateInputSegments = (remainingSegments, currentContainer, accumulatedResults) => {
    if (remainingSegments.length === 0) {
        return accumulatedResults;
    }

    const currentSegment = remainingSegments[0];

    if (currentSegment === "quit") {
        return accumulatedResults;
    }

    const subsequentSegments = remainingSegments.slice(1);

    if (currentSegment === "pop") {
        const retrievedElement = currentContainer.extractElement();
        return navigateInputSegments(subsequentSegments, currentContainer, accumulatedResults.concat([retrievedElement]));
    } else {
        const segmentParts = currentSegment.split(" ");
        const elementToDeposit = segmentParts[1];
        currentContainer.depositElement(elementToDeposit);
        return navigateInputSegments(subsequentSegments, currentContainer, accumulatedResults);
    }
};

const rawContent = acquireSourceData(inputSourcePath, 'utf8');
const parsedLines = rawContent.trim().split(lineDelimiter);

const initialLifoContainer = constructLifoContainer();
const finalResultCollection = navigateInputSegments(parsedLines, initialLifoContainer, []);

console.log(finalResultCollection.join(lineDelimiter));
