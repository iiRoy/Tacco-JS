'use strict';

const processInputData = (sourceContent) => {
    const contentLines = sourceContent.trim().split('\n');
    const firstLineSegments = contentLines[0].split(' ');

    const extractedInitials = firstLineSegments
        .map(fragment => fragment.charAt(0))
        .join('');

    console.log(extractedInitials);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
