const filesystemOperations = require('node:fs');
const acquiredText = filesystemOperations.readFileSync('/dev/stdin', { encoding: 'utf8' });
const structuredContent = acquiredText.split('\n');

function traverseAndDisplay(dataCollection, currentIndex) {
    if (currentIndex < dataCollection.length) {
        console.log('Case ' + currentIndex + ': ' + dataCollection[currentIndex]);
        traverseAndDisplay(dataCollection, currentIndex + 1);
    }
}

traverseAndDisplay(structuredContent, 0);