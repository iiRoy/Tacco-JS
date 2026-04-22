const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const transformInput = (fullText) => {
    const trimmedFullText = fullText.replace(/\s*$/, '');
    const lineSegments = trimmedFullText.split('\n');
    const cleanedSegments = lineSegments.map(segment => segment.replace(/\s*$/, ''));
    return cleanedSegments;
};

const rearrangeElements = (collection, startBound, endBound) => {
    const anchorValue = collection[endBound];
    let smallerIdx = startBound - 1;

    for (let currentIdx = startBound; currentIdx < endBound; currentIdx++) {
        if (collection[currentIdx] <= anchorValue) {
            smallerIdx++;
            [collection[smallerIdx], collection[currentIdx]] = [collection[currentIdx], collection[smallerIdx]];
        }
    }

    [collection[smallerIdx + 1], collection[endBound]] = [collection[endBound], collection[smallerIdx + 1]];
    return smallerIdx + 1;
};

const processNumericalSequence = (series) => {
    const pivotPoint = rearrangeElements(series, 0, series.length - 1);
    
    console.log(
        series.reduce((accumulator, val, idx) => {
            accumulator.push(idx === pivotPoint ? `[${val}]` : String(val));
            return accumulator;
        }, []).join(' ')
    );
};

const allInputLines = transformInput(rawInputContent);
const numericSequence = allInputLines[1].split(' ').map(Number);

processNumericalSequence(numericSequence);