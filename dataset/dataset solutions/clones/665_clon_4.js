const _mockInputSource = [
    "8",   // n=8
    "10",  // a
    "20",  // a
    "4",   // n=4
    "5",   // a
    "0",   // n=0, terminates
    "12",  // another test case
    "1", "2", "3",
    "4", "5", "6",
    "0"
];
let _sourceIndex = 0;
const acquireLine = () => {
    if (_sourceIndex < _mockInputSource.length) {
        return _mockInputSource[_sourceIndex++];
    }
    return null;
};

const processInputSegments = () => {
    const currentSegmentHeader = acquireLine();
    if (currentSegmentHeader === null) {
        return;
    }
    const currentSegmentSize = parseInt(currentSegmentHeader, 10);

    if (currentSegmentSize === 0) {
        return;
    }

    const recursivelySumSegmentValues = (remainingItems, runningSum) => {
        if (remainingItems === 0) {
            return runningSum;
        }
        const itemText = acquireLine();
        if (itemText === null) {
            return runningSum;
        }
        const itemNumericalValue = parseInt(itemText, 10);
        return recursivelySumSegmentValues(remainingItems - 1, runningSum + itemNumericalValue);
    };

    const finalSegmentSum = recursivelySumSegmentValues(currentSegmentSize / 4, 0);
    console.log(finalSegmentSum);

    processInputSegments();
};

processInputSegments();