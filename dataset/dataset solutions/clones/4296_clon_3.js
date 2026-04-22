(function processInputAndFindUnique() {
    const parseNumericalInput = () => {
        const rawDataLine = require('fs').readFileSync('/dev/stdin', 'utf8');
        const stringSegments = rawDataLine.trim().split(' ');

        const expectedSegmentCount = 3;
        if (stringSegments.length !== expectedSegmentCount) {
            console.error(`Input error: Expected ${expectedSegmentCount} values, but received ${stringSegments.length}.`);
            return [];
        }

        const processedNumbers = stringSegments.map(Number);
        return processedNumbers;
    };

    const numericalItems = parseNumericalInput();

    if (numericalItems.length === 0) {
        return;
    }

    const firstCandidate = numericalItems[0];
    const secondCandidate = numericalItems[1];
    const thirdCandidate = numericalItems[2];

    const frequencyMap = {};

    const updateFrequency = (value) => {
        frequencyMap[value] = (frequencyMap[value] || 0) + 1;
    };

    updateFrequency(firstCandidate);
    updateFrequency(secondCandidate);
    updateFrequency(thirdCandidate);

    let distinctValueCandidate = null;

    for (const numKey in frequencyMap) {
        const currentNumber = Number(numKey);
        const count = frequencyMap[numKey];

        if (count === 1) {
            distinctValueCandidate = currentNumber;
            break;
        }
    }

    if (distinctValueCandidate !== null) {
        console.log(distinctValueCandidate);
    } else {
        console.log(firstCandidate);
    }
})();