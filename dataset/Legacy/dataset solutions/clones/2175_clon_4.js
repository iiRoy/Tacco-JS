(function() {
    const inputSource = require('fs');
    const fullContentString = inputSource.readFileSync('/dev/stdin', 'utf8');

    let currentLineAccumulator = '';
    let lineCounter = 0;
    let relevantLineData = '';

    for (let characterIndex = 0; characterIndex < fullContentString.length; characterIndex++) {
        const currentCharacter = fullContentString[characterIndex];
        if (currentCharacter === '\n') {
            lineCounter++;
            if (lineCounter === 2) {
                relevantLineData = currentLineAccumulator;
                break;
            }
            currentLineAccumulator = '';
        } else if (lineCounter === 1) {
            currentLineAccumulator += currentCharacter;
        }
    }

    const parsedValues = [];
    let valueBuilder = '';
    for (let charInLineIndex = 0; charInLineIndex < relevantLineData.length; charInLineIndex++) {
        const charFromLine = relevantLineData[charInLineIndex];
        if (charFromLine === ' ') {
            if (valueBuilder.length > 0) {
                parsedValues.push(valueBuilder);
                valueBuilder = '';
            }
        } else {
            valueBuilder += charFromLine;
        }
    }
    if (valueBuilder.length > 0) {
        parsedValues.push(valueBuilder);
    }

    const observedItems = new Map();
    let hasDuplicate = false;

    parsedValues.forEach(element => {
        if (observedItems.has(element)) {
            hasDuplicate = true;
        }
        observedItems.set(element, true);
    });

    if (hasDuplicate) {
        process.stdout.write("NO\n");
    } else {
        process.stdout.write("YES\n");
    }
})();