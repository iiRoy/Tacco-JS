const performComputation = (sourcePayload) => {
    const lineSegments = sourcePayload.trim().split(/\s*\n\s*/);

    const initialMetrics = lineSegments[0].split(/\s+/).map(Number);
    const relevantCount = initialMetrics[1];

    const valueSeries = lineSegments[1].split(/\s+/).map(Number);

    const sumRecursive = (arr, idx = 0, currentTotal = 0) => {
        if (idx >= arr.length) {
            return currentTotal;
        }
        return sumRecursive(arr, idx + 1, currentTotal + arr[idx]);
    };
    const cumulativeValue = sumRecursive(valueSeries);

    const checkPoint = cumulativeValue / (4 * relevantCount);

    const extractTopElements = (dataArray, limit) => {
        let leadingElements = [];
        for (let unit of dataArray) {
            if (leadingElements.length < limit) {
                leadingElements.push(unit);
                leadingElements.sort((alpha, beta) => alpha - beta);
            } else if (limit > 0 && unit > leadingElements[0]) {
                leadingElements[0] = unit;
                leadingElements.sort((alpha, beta) => alpha - beta);
            }
        }
        return leadingElements;
    };

    const significantValues = extractTopElements(valueSeries, relevantCount);

    const allPassCondition = significantValues.every(val => val >= checkPoint);

    console.log(allPassCondition ? "Yes" : "No");
};

const executionModule = (() => {
    const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');
    performComputation(dataSource);
})();