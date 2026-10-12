function processInputData(sourceContent) {
    const processedLines = sourceContent.trim().split('\n');
    let distinctItemCount = 0;
    const encounteredItems = {};

    for (let i = 1; i < processedLines.length; i++) {
        const currentLine = processedLines[i];
        if (!encounteredItems[currentLine]) {
            encounteredItems[currentLine] = true;
            distinctItemCount++;
        }
    }
    console.log(distinctItemCount);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
