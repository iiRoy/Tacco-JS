let receivedInput = '';

process.stdin.on('data', (chunk) => {
    receivedInput += chunk.toString();
});

process.stdin.on('end', () => {
    const computeDelta = (numericString) => {
        if (typeof numericString !== 'string' || numericString.length === 0) {
            return null;
        }
        
        const digitSequence = numericString.split('').map(Number);

        const maxFormed = parseInt(
            digitSequence.slice().sort((val1, val2) => val2 - val1).join('')
        );

        const minFormed = parseInt(
            digitSequence.slice().sort((val1, val2) => val1 - val2).join('')
        );

        return maxFormed - minFormed;
    };

    const rawContentSegments = receivedInput.split(/\s/);

    const processSegmentsRecursively = (currentIndex) => {
        if (currentIndex >= rawContentSegments.length) {
            return;
        }

        const currentSegment = rawContentSegments[currentIndex];

        if (currentSegment) {
            const resultValue = computeDelta(currentSegment);
            if (resultValue !== null && !isNaN(resultValue)) {
                console.log(resultValue);
            }
            processSegmentsRecursively(currentIndex + 1);
        } else {
            return;
        }
    };

    processSegmentsRecursively(1);
});

process.stdin.on('error', (err) => {
    process.exit(1);
});