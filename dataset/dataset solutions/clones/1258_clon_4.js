const inputHandle = require('readline').createInterface({
    input: globalThis.process.stdin,
    output: globalThis.process.stdout,
    terminal: false
});

inputHandle.on('line', (currentTextRow) => {
    const numericDimensions = currentTextRow.split(/\s+/).map(Number.parseInt);
    const primaryExtent = numericDimensions[0];
    const secondaryExtent = numericDimensions[1];

    if (primaryExtent === 0 && secondaryExtent === 0) {
        globalThis.process.exit(0);
    }

    const rowComposer = (iterationIndex) => {
        if (iterationIndex >= primaryExtent) {
            return;
        }

        const columnComposer = (jIndex) => {
            if (jIndex >= secondaryExtent) {
                return;
            }
            globalThis.process.stdout.write('#\n');
            columnComposer(jIndex + 1);
        };

        columnComposer(0);
        globalThis.process.stdout.write('\n\n');

        rowComposer(iterationIndex + 1);
    };

    rowComposer(0);
    globalThis.process.stdout.write('\n\n');
});