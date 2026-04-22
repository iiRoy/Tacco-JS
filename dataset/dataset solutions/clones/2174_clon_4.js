function evaluateCondition(sourceMaterial) {
    const contentSegments = sourceMaterial.trim().split("\n");
    const targetCount = Number(contentSegments[0]);

    const elementTokens = contentSegments[1].split(' ');

    const observedElements = {};
    let uniqueElementCounter = 0;

    for (let currentPosition = 0; currentPosition < elementTokens.length; currentPosition++) {
        const activeElement = elementTokens[currentPosition];
        if (!observedElements[activeElement]) {
            observedElements[activeElement] = true;
            uniqueElementCounter++;
        }
    }

    const finalVerdict = (uniqueElementCounter === targetCount) ? 'YES' : 'NO';
    console.log(finalVerdict);
}

evaluateCondition(require('fs').readFileSync('/dev/stdin', 'utf8'));