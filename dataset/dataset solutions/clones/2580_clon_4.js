const ascertainMinimum = (initialValue, subsequentValue) => {
    return initialValue < subsequentValue ? initialValue : subsequentValue;
};

const processNumericalSequence = (sourceText) => {
    const textualRows = sourceText.split('\n');
    const numericalRowString = textualRows[1];

    let numericCollection = [];
    const stringFragments = numericalRowString.split(' ');
    for (let idx = 0; idx < stringFragments.length; idx++) {
        numericCollection.push(Number(stringFragments[idx]));
    }

    let cumulativeSum = 0;

    if (numericCollection.length === 1) {
        cumulativeSum = numericCollection[0] * 2;
    } else {
        cumulativeSum += numericCollection[0];
        cumulativeSum += numericCollection[numericCollection.length - 1];

        for (let k = 0; k < numericCollection.length - 1; k++) {
            cumulativeSum += ascertainMinimum(numericCollection[k], numericCollection[k + 1]);
        }
    }

    process.stdout.write(String(cumulativeSum));
};

processNumericalSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));