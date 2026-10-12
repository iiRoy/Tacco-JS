const fileSystemModule = require('fs');

const extractSegmentData = (lineText) => {
    const trimmedLine = lineText.trim();
    if (trimmedLine.length === 0) return { type: null, quantity: NaN };

    const parts = trimmedLine.split(" ");
    if (parts.length !== 2) return { type: null, quantity: NaN };

    const segmentType = parts[0].trim();
    const segmentQuantity = parseInt(parts[1], 10);

    if (isNaN(segmentQuantity) || segmentQuantity < 0) return { type: segmentType, quantity: NaN };
    
    if (segmentType !== '(' && segmentType !== ')') {
        return { type: null, quantity: NaN };
    }

    return { type: segmentType, quantity: segmentQuantity };
};

const isOpeningSegment = (symbol) => symbol === '(';

const isClosingSegment = (symbol) => symbol === ')';

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processedInputLines = rawInputContent.trim().split("\n").filter(line => line.length > 0);

const totalEntriesExpected = parseInt(processedInputLines.shift(), 10);

if (isNaN(totalEntriesExpected) || totalEntriesExpected < 0) {
    console.log("NO");
    return;
}

const segmentProcessingStack = [];

let lastPushedOpeningSegmentType = null;

for (let currentEntryIndex = 0; currentEntryIndex < totalEntriesExpected; ++currentEntryIndex) {
    if (currentEntryIndex >= processedInputLines.length) {
        console.log("NO");
        return;
    }

    const currentSegmentData = extractSegmentData(processedInputLines[currentEntryIndex]);

    if (currentSegmentData.type === null || isNaN(currentSegmentData.quantity)) {
        console.log("NO");
        return;
    }

    if (currentEntryIndex === 0 && isClosingSegment(currentSegmentData.type)) {
        console.log("NO");
        return;
    }

    if (isOpeningSegment(currentSegmentData.type) && lastPushedOpeningSegmentType === currentSegmentData.type) {
        segmentProcessingStack[segmentProcessingStack.length - 1].quantity += currentSegmentData.quantity;
    }
    else {
        if (isClosingSegment(currentSegmentData.type)) {
            if (segmentProcessingStack.length === 0) {
                console.log("NO");
                return;
            }

            const topSegment = segmentProcessingStack[segmentProcessingStack.length - 1];

            if (topSegment.quantity > currentSegmentData.quantity) {
                topSegment.quantity -= currentSegmentData.quantity;
            } else if (topSegment.quantity < currentSegmentData.quantity) {
                segmentProcessingStack.pop();

                segmentProcessingStack.push({
                    type: currentSegmentData.type,
                    quantity: currentSegmentData.quantity - topSegment.quantity
                });
            } else {
                segmentProcessingStack.pop();
            }
        }
        else {
            segmentProcessingStack.push(currentSegmentData);
            lastPushedOpeningSegmentType = currentSegmentData.type;
        }
    }
}

if (segmentProcessingStack.length === 0) {
    console.log("YES");
} else {
    console.log("NO");
}