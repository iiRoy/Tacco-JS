const r = require('readline').createInterface({
    input: process.stdin
});

let inputLines = [];

r.on('line', (line) => {
    inputLines.push(line);
});

r.on('close', () => {
    const parseNumericList = (str) => str.split(' ').map(s => parseInt(s.trim()));

    const [countItems, maxItemsToSum] = parseNumericList(inputLines[0]);

    const generateCoefficientSets = (currentCombination) => {
        if (currentCombination.length === 3) {
            return [currentCombination];
        }
        return [
            ...generateCoefficientSets([...currentCombination, 1]),
            ...generateCoefficientSets([...currentCombination, -1])
        ];
    };

    const allPossibleCoeffs = generateCoefficientSets([]);
    const relevantCoeffs = allPossibleCoeffs.filter(trio =>
        !(trio[0] === -1 && trio[1] === -1 && trio[2] === 1)
    );

    const maintainSortedTop = (collection, newValue, collectionLimit) => {
        if (collectionLimit === 0) {
            return;
        }

        let lowPointer = 0;
        let highPointer = collection.length - 1;
        let insertionPoint = collection.length;

        while (lowPointer <= highPointer) {
            let midIndex = Math.floor((lowPointer + highPointer) / 2);
            if (collection[midIndex] < newValue) {
                insertionPoint = midIndex;
                highPointer = midIndex - 1;
            } else {
                lowPointer = midIndex + 1;
            }
        }

        collection.splice(insertionPoint, 0, newValue);

        if (collection.length > collectionLimit) {
            collection.pop();
        }
    };

    const topSumsPerCoeffSet = new Map();
    relevantCoeffs.forEach(coeffTrio => {
        topSumsPerCoeffSet.set(coeffTrio.join(','), []);
    });

    for (let currentItemIndex = 0; currentItemIndex < countItems; currentItemIndex++) {
        const [_xCoord, _yCoord, _zCoord] = parseNumericList(inputLines[currentItemIndex + 1]);

        relevantCoeffs.forEach(currCoeffTrio => {
            const currentTransformationValue =
                _xCoord * currCoeffTrio[0] +
                _yCoord * currCoeffTrio[1] +
                _zCoord * currCoeffTrio[2];

            const collectionForCoeff = topSumsPerCoeffSet.get(currCoeffTrio.join(','));
            maintainSortedTop(collectionForCoeff, currentTransformationValue, maxItemsToSum);
        });
    }

    const finalCalculatedSums = [];
    for (const collection of topSumsPerCoeffSet.values()) {
        const sumOfTopValues = collection.reduce((accumulator, val) => accumulator + val, 0);
        finalCalculatedSums.push(sumOfTopValues);
    }

    const ultimateMaximumResult = Math.max(...finalCalculatedSums);

    console.log(ultimateMaximumResult);
});