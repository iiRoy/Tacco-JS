((sourceContent) => {
    const numberPatterns = sourceContent.match(/\n([\d\s]+)/);
    const numericElements = (numberPatterns && numberPatterns[1] ? numberPatterns[1].trim() : '').split(/\s+/).map(val => +val);

    const expandedCollection = [...numericElements, undefined];

    const finalCount = expandedCollection.reduce((currentSum, currentVal, currentIdx) => {
        const isPositionOdd = (currentIdx + 1) % 2 !== 0;
        const isValueOdd = currentVal % 2 !== 0;
        return currentSum + (isPositionOdd && isValueOdd ? 1 : 0);
    }, 0);

    process.stdout.write(String(finalCount) + '\n');
})(require('fs').readFileSync('/dev/stdin', 'utf8'));