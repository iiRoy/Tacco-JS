(function(sourceText) {
    const lineSegments = sourceText.split('\n');

    const firstNumericValue = Number(lineSegments[0]);
    const secondArrayContent = lineSegments[1].split(' ', firstNumericValue).map(Number);

    const thirdNumericValue = Number(lineSegments[2]);
    const fourthArrayContent = lineSegments[3].split(' ', thirdNumericValue).map(Number);

    const matchedCount = fourthArrayContent.reduce((accumulator, currentElement) => {
        if (Number.isInteger(currentElement) && currentElement >= 0 && currentElement < secondArrayContent.length) {
            return accumulator + 1;
        }
        return accumulator;
    }, 0);

    console.log(matchedCount);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
