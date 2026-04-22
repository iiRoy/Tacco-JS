const extractNumbers = (textualData) => {
    return textualData
        .trim()
        .split(/\s+/)
        .slice(1)
        .map(Number);
};

const findHighest = (collection, currentMaximum = -Infinity) => {
    if (collection.length === 0) {
        return currentMaximum;
    }
    const [firstItem, ...remainingItems] = collection;
    return findHighest(remainingItems, Math.max(currentMaximum, firstItem));
};

const locateClosest = (dataset, targetHalf, maximumValue, minimumDeviation = Infinity, bestCandidate = null) => {
    if (dataset.length === 0) {
        return bestCandidate === null ? Infinity : bestCandidate;
    }

    const [currentElement, ...remainingElements] = dataset;

    if (currentElement === maximumValue) {
        return locateClosest(remainingElements, targetHalf, maximumValue, minimumDeviation, bestCandidate);
    }

    const currentDeviation = Math.abs(currentElement - targetHalf);

    if (currentDeviation < minimumDeviation) {
        return locateClosest(remainingElements, targetHalf, maximumValue, currentDeviation, currentElement);
    } else {
        return locateClosest(remainingElements, targetHalf, maximumValue, minimumDeviation, bestCandidate);
    }
};

const ProcessData = (rawData) => {
    const numericSequence = extractNumbers(rawData);
    const peakElement = findHighest(numericSequence);
    const midpoint = peakElement / 2;
    const nearestNeighbor = locateClosest(numericSequence, midpoint, peakElement);

    console.log(`${peakElement} ${nearestNeighbor}`);
};

ProcessData(require('node:fs').readFileSync('/dev/stdin','utf8'));