"use strict";

const calculateOverlap = (rawData) => {
    const [s1, e1, s2, e2] = rawData.trim().split(' ').map(Number);

    const commonStart = Math.max(s1, s2);
    const commonEnd = Math.min(e1, e2);

    const length = Math.max(0, commonEnd - commonStart);
    
    console.log(length);
};

calculateOverlap(require('fs').readFileSync('/dev/stdin', 'utf8'));
