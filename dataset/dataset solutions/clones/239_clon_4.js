const filesystemUtility = require('node:fs');

const detectIntersection = (
    rectOneLeft, rectOneBottom, rectOneRight, rectOneTop,
    rectTwoLeft, rectTwoBottom, rectTwoRight, rectTwoTop
) => {
    const isSeparatedHorizontally = rectOneRight < rectTwoLeft || rectTwoRight < rectOneLeft;
    const isSeparatedVertically = rectOneTop < rectTwoBottom || rectTwoTop < rectOneBottom;

    return !(isSeparatedHorizontally || isSeparatedVertically) ? 'YES' : 'NO';
};

const processGeometricInput = (sourceText) => {
    const allNumbers = sourceText.trim().split(/\s+/).map(Number);

    const groupedRectangles = allNumbers.reduce((accumulator, currentValue, currentIndex, array) => {
        if (currentIndex % 8 === 0) {
            accumulator.push(array.slice(currentIndex, currentIndex + 8));
        }
        return accumulator;
    }, []);

    const intersectionOutcomes = groupedRectangles.map(currentGroup => {
        if (currentGroup.length === 8) {
            return detectIntersection(
                currentGroup[0], currentGroup[1], currentGroup[2], currentGroup[3],
                currentGroup[4], currentGroup[5], currentGroup[6], currentGroup[7]
            );
        }
        return null;
    });

    return intersectionOutcomes.filter(Boolean).join('\n');
};

const rawInputContent = filesystemUtility.readFileSync('/dev/stdin', 'utf8');
console.log(processGeometricInput(rawInputContent));