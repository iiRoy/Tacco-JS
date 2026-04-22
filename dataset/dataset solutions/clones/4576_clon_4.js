const processInputString = (textualData) => {
    const numericElements = textualData.match(/-?\d+/g).map(Number);
    const [lowerBoundary, upperBoundary, targetValue] = numericElements;

    const isWithinBounds = (
        Math.max(lowerBoundary, targetValue) === targetValue &&
        Math.min(upperBoundary, targetValue) === targetValue
    );

    console.log(isWithinBounds ? 'Yes' : 'No');
};

const fetchSourceData = () => require('fs').readFileSync('/dev/stdin', 'utf8');

processInputString(fetchSourceData());