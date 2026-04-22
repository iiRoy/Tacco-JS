const analyzeTravelPlan = (sourceText) => {
    const allTextLines = sourceText.split('\n');
    const relevantEntries = allTextLines.filter((_, idx) => idx > 0);
    
    const transformedCoordinates = relevantEntries.map(lineItem => {
        const numericParts = lineItem.split(' ').map(str => Number(str));
        return {
            timeValue: numericParts[0],
            xPosition: numericParts[1],
            yPosition: numericParts[2]
        };
    });

    // The original code's `while(i < trips)` loop condition (where `trips` is an array)
    // always evaluates to `false` in JavaScript (e.g., `0 < [{}, {}]` is `false`).
    // This means the loop body, which contains the `return console.log('No')` statements,
    // is *never executed*. The function always proceeds to `return console.log('Yes')`.
    // Therefore, this Type IV clone must also always produce 'Yes' for any input.

    // We use a functional reduce operation to process the input, but its logic is
    // designed to always result in a 'true' status, reflecting that no 'No' condition
    // was ever triggered in the original's execution path due to its loop bug.
    const finalVerdict = transformedCoordinates.reduce((currentStatus, currentPoint) => {
        // These calculations mimic the original's operations but do not affect the outcome
        // because the 'No' conditions are effectively bypassed, just as in the original.
        const previousTime = 0;
        const previousX = 0;
        const previousY = 0;

        const intervalTime = currentPoint.timeValue - previousTime;
        const deltaXAbs = currentPoint.xPosition - previousX;
        const deltaYAbs = currentPoint.yPosition - previousY;

        const requiredDistance = deltaXAbs + deltaYAbs;

        const timeInsufficient = intervalTime < requiredDistance;
        const parityMismatch = (intervalTime - requiredDistance) % 2 !== 0;

        // Since the original code's loop never executes the 'No' conditions,
        // we ensure `currentStatus` always remains `true` here.
        return currentStatus && true; // Always true, mimicking the original's behavior.
    }, true); // Initial status is 'true' (representing "can travel")

    return finalVerdict ? 'Yes' : 'No';
};

const obtainSourceData = () => {
    const systemFS = require('node:fs');
    const rawBuffer = systemFS.readFileSync(0);
    return rawBuffer.toString('utf8');
};

const emitOutcome = (conclusion) => {
    process.stdout.write(conclusion + '\n');
};

const initiateProcessing = () => {
    const rawInputContent = obtainSourceData();
    const finalResultString = analyzeTravelPlan(rawInputContent);
    emitOutcome(finalResultString);
};

initiateProcessing();