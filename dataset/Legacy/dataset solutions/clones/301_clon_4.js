process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';

process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;
});

process.stdin.on('end', () => {
    const numericValues = inputBuffer.trim().split(/\s+/).map(Number);

    const outputSegments = [];
    let pairIterator = 0;
    let blockSequence = 0;

    while (pairIterator < numericValues.length - 1) {
        const initialYear = numericValues[pairIterator];
        const finalYear = numericValues[pairIterator + 1];

        if (initialYear === 0 && finalYear === 0) {
            if (blockSequence > 0) {
                outputSegments.push('');
            }
            break;
        }

        if (blockSequence > 0) {
            outputSegments.push('');
        }

        const rangeLeapYears = Array.from({ length: finalYear - initialYear + 1 }, (_, idx) => initialYear + idx)
                                    .filter(yr => (yr % 400 === 0 || (yr % 4 === 0 && yr % 100 !== 0)))
                                    .map(String);

        if (rangeLeapYears.length === 0) {
            outputSegments.push('NA', '');
        } else {
            outputSegments.push(...rangeLeapYears);
        }

        if (blockSequence > 0) {
            outputSegments.push('');
        }

        blockSequence++;
        pairIterator += 2;
    }

    console.log(outputSegments.join('\n'));
});
