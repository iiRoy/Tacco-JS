"use strict";
const fileSystemAccess = require('node:fs');

function inputProcessor(sourcePath) {
    const contentBuffer = fileSystemAccess.readFileSync(sourcePath, 'utf8');
    const extractedSegments = contentBuffer.match(/\S+/g);
    
    const segmentOne = extractedSegments && extractedSegments.length > 0 ? extractedSegments[0] : undefined;
    const segmentTwo = extractedSegments && extractedSegments.length > 1 ? extractedSegments[1] : undefined;
    
    return [segmentOne, segmentTwo];
}

function assessRelationship(primaryValue, secondaryValue) {
    if (primaryValue === secondaryValue) {
        return 0; // Indicates equality
    } else if (primaryValue > secondaryValue) {
        return 1; // Indicates primary is greater
    } else {
        return -1; // Indicates primary is lesser
    }
}

const comparisonMessages = [
    'first < second',  // Corresponds to -1
    'first == second', // Corresponds to 0
    'first > second'   // Corresponds to 1
];

function coreOperation() {
    const [elementA, elementB] = inputProcessor('/dev/stdin');
    const relationshipCode = assessRelationship(elementA, elementB);
    
    // Map -1 to index 0, 0 to index 1, 1 to index 2
    const messageIndex = relationshipCode + 1;
    
    console.log(comparisonMessages[messageIndex]);
}

coreOperation();