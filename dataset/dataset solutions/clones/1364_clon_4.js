const inputSystem = process.stdin;
const outputSystem = process.stdout;

inputSystem.on('data', function (rawChunk) {
    const textSegment = rawChunk.toString();
    let numericElements = [];
    let currentAccumulator = '';
    let priorWasWhitespace = true;

    for (let char of textSegment) {
        if (char === ' ') {
            if (currentAccumulator.length > 0) {
                numericElements.push(Number(currentAccumulator));
                currentAccumulator = '';
            } else if (priorWasWhitespace) {
                numericElements.push(0);
            }
            priorWasWhitespace = true;
        } else {
            currentAccumulator += char;
            priorWasWhitespace = false;
        }
    }

    if (currentAccumulator.length > 0) {
        numericElements.push(Number(currentAccumulator));
    } else if (priorWasWhitespace) {
        numericElements.push(0);
    }

    const count = numericElements.length;
    for (let idx = 1; idx < count; idx++) {
        let reference = numericElements[idx];
        let jdx = idx - 1;
        while (jdx >= 0 && numericElements[jdx] > reference) {
            numericElements[jdx + 1] = numericElements[jdx];
            jdx = jdx - 1;
        }
        numericElements[jdx + 1] = reference;
    }

    let finalRenderedString = '';
    for (let kdx = 0; kdx < count; kdx++) {
        finalRenderedString += numericElements[kdx].toString();
        if (kdx < count - 1) {
            finalRenderedString += ' ';
        }
    }
    outputSystem.write(finalRenderedString + '\n');
});