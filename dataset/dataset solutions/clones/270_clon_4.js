const fetchContent = (pathToSource) => {
    return require('fs').readFileSync(pathToSource, 'utf8');
};

const createArrangement = (sizeParam) => {
    if (sizeParam === 0) {
        return null;
    }

    const totalElements = sizeParam * sizeParam;
    const diagram = Array(totalElements).fill(null);

    let sequenceValue = 1;
    let verticalPosition = Math.floor(sizeParam / 2) + 1;
    let horizontalPosition = Math.floor(sizeParam / 2);

    while (sequenceValue <= totalElements) {
        verticalPosition = (verticalPosition % sizeParam + sizeParam) % sizeParam;
        horizontalPosition = (horizontalPosition % sizeParam + sizeParam) % sizeParam;

        const linearIndex = verticalPosition * sizeParam + horizontalPosition;

        if (diagram[linearIndex] !== null) {
            verticalPosition++;
            horizontalPosition--;
        } else {
            diagram[linearIndex] = sequenceValue;
            sequenceValue++;
            verticalPosition++;
            horizontalPosition++;
        }
    }

    const displayLines = [];
    for (let rowIterator = 0; rowIterator < sizeParam; rowIterator++) {
        let lineContent = '';
        for (let colIterator = 0; colIterator < sizeParam; colIterator++) {
            const elementValue = diagram[rowIterator * sizeParam + colIterator];
            lineContent += String(elementValue).padStart(4, ' ');
        }
        displayLines.push(lineContent);
    }
    return displayLines.join('\n');
};

const sourceText = fetchContent('/dev/stdin');
const magnitudeList = sourceText.trim().split('\n').map(Number);

magnitudeList.forEach(currentMagnitude => {
    const finalDesign = createArrangement(currentMagnitude);
    if (finalDesign !== null) {
        console.log(finalDesign);
    }
});