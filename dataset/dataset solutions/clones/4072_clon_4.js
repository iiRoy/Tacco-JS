const dataSource = require('fs');

let inputBuffer = '';

process.stdin.on('data', (segment) => {
    inputBuffer += segment.toString();
});

process.stdin.on('end', () => {
    const processedString = inputBuffer.toString().replace(' ', '');
    let numericalValue;

    if (processedString.length === 0) {
        numericalValue = NaN;
    } else {
        let currentAccumulator = 0;
        let signIndicator = 1;
        let digitEncountered = false;
        let scanStart = 0;

        if (processedString[0] === '-') {
            signIndicator = -1;
            scanStart = 1;
        } else if (processedString[0] === '+') {
            scanStart = 1;
        }

        for (let i = scanStart; i < processedString.length; i++) {
            const charCodePoint = processedString.charCodeAt(i);
            if (charCodePoint >= 48 && charCodePoint <= 57) {
                currentAccumulator = currentAccumulator * 10 + (charCodePoint - 48);
                digitEncountered = true;
            } else {
                break;
            }
        }

        if (!digitEncountered) {
            numericalValue = NaN;
        } else {
            numericalValue = currentAccumulator * signIndicator;
        }
    }

    let isSquareResult = false;

    if (Number.isNaN(numericalValue) || numericalValue < 0) {
        isSquareResult = false;
    } else if (numericalValue === 0) {
        isSquareResult = true;
    } else {
        let testCandidate = 1;
        while (true) {
            const currentProduct = testCandidate * testCandidate;

            if (currentProduct === numericalValue) {
                isSquareResult = true;
                break;
            }
            if (currentProduct > numericalValue || currentProduct < 0 || currentProduct === Infinity) {
                isSquareResult = false;
                break;
            }
            testCandidate++;
        }
    }

    if (isSquareResult) {
        process.stdout.write('Yes\n');
    } else {
        process.stdout.write('No\n');
    }
});