const processInput = (rawInput) => {
    const inputLines = rawInput.trim().split('\n');
    const elementCount = parseInt(inputLines[0].split(' ')[0]);
    const numericValues = inputLines[1].split(' ').map(Number);

    numericValues.sort((first, second) => second - first);

    const initialLargest = numericValues[0];
    const initialSmallest = numericValues[numericValues.length - 1];
    const centralElements = numericValues.slice(1, numericValues.length - 1);

    const positiveCentral = [];
    const negativeCentral = [];

    for (const item of centralElements) {
        if (item >= 0) {
            positiveCentral.push(item);
        } else {
            negativeCentral.push(item);
        }
    }

    positiveCentral.reverse();
    negativeCentral.reverse();

    let currentSmallestAccum = initialSmallest;
    const recordedOperations = [];

    positiveCentral.forEach(element => {
        recordedOperations.push(`${currentSmallestAccum} ${element}`);
        currentSmallestAccum -= element;
    });

    let currentLargestAccum = initialLargest;
    recordedOperations.push(`${currentLargestAccum} ${currentSmallestAccum}`);
    currentLargestAccum -= currentSmallestAccum;

    negativeCentral.forEach(element => {
        recordedOperations.push(`${currentLargestAccum} ${element}`);
        currentLargestAccum -= element;
    });

    return `${currentLargestAccum}\n` + recordedOperations.join('\n');
};

console.log(processInput(require('fs').readFileSync('/dev/stdin', 'utf8')));
