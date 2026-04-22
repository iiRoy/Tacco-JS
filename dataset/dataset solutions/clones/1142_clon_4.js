const obtainLongestRun = (inputCollection) => {
    const sequencePivots = [];

    for (let currentElementIndex = 1; currentElementIndex < inputCollection.length; ++currentElementIndex) {
        const value = inputCollection[currentElementIndex];

        if (sequencePivots.length === 0 || value > sequencePivots[sequencePivots.length - 1]) {
            sequencePivots.push(value);
        } else {
            let lowerBound = 0;
            let upperBound = sequencePivots.length - 1;
            let replacementIndex = sequencePivots.length; // Default to end, adjusted by binary search

            while (lowerBound <= upperBound) {
                const midPoint = Math.floor((lowerBound + upperBound) / 2);
                if (sequencePivots[midPoint] >= value) {
                    replacementIndex = midPoint;
                    upperBound = midPoint - 1;
                } else {
                    lowerBound = midPoint + 1;
                }
            }
            sequencePivots[replacementIndex] = value;
        }
    }
    return sequencePivots.length;
};

const systemAccess = require('node:fs');
const rawData = systemAccess.readFileSync('/dev/stdin', 'utf8');
const transformedData = rawData.trim().split('\n').map(Number);

transformedData[0] = 0;

const result = obtainLongestRun(transformedData);
console.log(result);