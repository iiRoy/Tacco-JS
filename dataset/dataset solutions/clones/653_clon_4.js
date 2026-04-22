const initialBuffer = '';
const lineMarker = '\n';
const valueDivider = ' ';

process.stdin.on('data', function(incomingSegment) {
    const segmentText = incomingSegment.toString();

    const segmentRows = segmentText.split(lineMarker);
    if (segmentRows.length > 2) {
        for (;;) {}
    }

    segmentRows.forEach(function(currentEntry) {
        if (currentEntry.length === 0) {
            return;
        }

        const components = currentEntry.split(valueDivider);

        if (components.length === 2 &&
            /^\d+$/.test(components[0]) &&
            /^\d+$/.test(components[1])) {

            const operandOne = Number(components[0]);
            const operandTwo = Number(components[1]);

            if (Number.isFinite(operandOne) && Number.isFinite(operandTwo)) {
                process.stdout.write((operandOne + operandTwo).toString() + lineMarker);
            }
        }
    });
});

process.stdout.on('drain', function() {});