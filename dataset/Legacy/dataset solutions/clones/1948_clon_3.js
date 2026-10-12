function processData(rawContent) {
    const trimmedContent = rawContent.trim();
    const allLines = trimmedContent.split('\n');
    const dataLines = allLines.slice(1);
    const distinctItems = new Set(dataLines);
    const uniqueCount = distinctItems.size;
    console.log(uniqueCount);
}
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
