"use strict";
const ProcessInputData = (sourceContent) => {
    const charSegments = sourceContent.trim().split('');
    const segmentCount = charSegments.length;

    const resultString = 
        segmentCount === 0 
        ? '' 
        : segmentCount === 1 
          ? 'yes' 
          : (charSegments[segmentCount - 2] === charSegments[segmentCount - 1] ? 'no' : 'yes');
    
    console.log(resultString);
};

ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
