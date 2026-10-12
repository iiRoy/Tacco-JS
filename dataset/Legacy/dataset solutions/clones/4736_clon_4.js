'use strict'

const calculateSpanLength = (sourceContent) => {
    const processedContent = sourceContent.trim();
    const startChar = 'A';
    const endChar = 'Z';

    const firstOccurrence = processedContent.indexOf(startChar);
    const lastOccurrence = processedContent.lastIndexOf(endChar);

    if (firstOccurrence !== -1 && lastOccurrence !== -1 && firstOccurrence <= lastOccurrence) {
        return lastOccurrence - firstOccurrence + 1;
    } else {
        return 0;
    }
};

console.log(calculateSpanLength(require('fs').readFileSync('/dev/stdin', 'utf8')));
