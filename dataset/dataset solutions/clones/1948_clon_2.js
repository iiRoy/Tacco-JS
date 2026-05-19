function processInput(rawData) {
    const lineArray = rawData.trim().split('\n');
    const uniqueElements = new Set(lineArray.slice(1));
    console.log(uniqueElements.size);
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
