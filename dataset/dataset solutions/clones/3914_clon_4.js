const processInput = (rawInput) => {
    const [startVal, endVal, countVal] = rawInput.split(' ').map(Number);

    const firstSegment = Array.from({ length: countVal }, (_, idx) => startVal + idx)
                               .filter(num => num <= endVal);

    const actualStartOfLastK = Math.max(startVal, endVal - countVal + 1);
    const lastSegmentLength = endVal - actualStartOfLastK + 1;

    const lastSegment = Array.from({ length: lastSegmentLength }, (_, idx) => actualStartOfLastK + idx);

    const combinedUnique = new Set([...firstSegment, ...lastSegment]);

    Array.from(combinedUnique)
         .sort((a, b) => a - b)
         .forEach(val => console.log(val));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
