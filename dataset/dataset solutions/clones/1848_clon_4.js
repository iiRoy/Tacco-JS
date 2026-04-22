function processInputData(sourceData) {
    const classificationMap = new Map([
        ['0', 'pon'],
        ['1', 'pon'],
        ['2', 'hon'],
        ['3', 'bon'],
        ['4', 'hon'],
        ['5', 'hon'],
        ['6', 'pon'],
        ['7', 'hon'],
        ['8', 'pon'],
        ['9', 'hon']
    ]);

    const finalCharacter = sourceData.slice(-1);

    if (classificationMap.has(finalCharacter)) {
        console.log(classificationMap.get(finalCharacter));
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));