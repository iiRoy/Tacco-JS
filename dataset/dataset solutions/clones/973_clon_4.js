const fileSystemModule = require('fs');

const inputSourcePath = '/dev/stdin';
const lineSeparationChar = '\n';

const rawDataSource = fileSystemModule.readFileSync(inputSourcePath, 'ascii');
const contentSegments = rawDataSource.split(lineSeparationChar, 2);

const primaryDocument = contentSegments[0];
const searchFragment = contentSegments[1];

const resultingIndexes = [];

if (searchFragment.length === 0) {
    // Special handling for empty search fragment to match String.prototype.indexOf behavior
    // An empty fragment is found at every position, including after the last character
    for (let currentScanPoint = 0; currentScanPoint <= primaryDocument.length; currentScanPoint++) {
        resultingIndexes.push(currentScanPoint);
    }
} else {
    // Escape special regex characters in the search fragment
    const escapedFragment = searchFragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchExpression = new RegExp(escapedFragment, 'g');

    // Utilize RegExp.prototype.exec or String.prototype.matchAll for finding all occurrences
    // matchAll returns an iterator of match objects
    for (const matchEntry of primaryDocument.matchAll(searchExpression)) {
        resultingIndexes.push(matchEntry.index);
    }
}

if (resultingIndexes.length > 0) {
    console.log(resultingIndexes.join('\n'));
}