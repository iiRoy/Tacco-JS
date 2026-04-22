function processInputData(rawData) {
    const cleanedData = rawData.trim();
    const lines = cleanedData.split('\n');
    const symbolSequence = lines[1].split(' ');

    const requiredSymbols = new Set(['P', 'W', 'G', 'Y']);
    let detectedSymbolCount = 0;

    const uniqueInputSymbols = new Set(symbolSequence);

    for (const characteristic of requiredSymbols) {
        if (uniqueInputSymbols.has(characteristic)) {
            detectedSymbolCount++;
        }
    }

    if (detectedSymbolCount === 3) {
        console.log("Three");
    } else {
        console.log("Four");
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));