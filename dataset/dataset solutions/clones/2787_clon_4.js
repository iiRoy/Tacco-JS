const processData = (inputLines) => {
    const quantityIndicator = Number(inputLines[0]);
    
    const numericalSeries = inputLines[1].split(' ').reduce((accumulator, stringValue) => {
        accumulator.push(+stringValue);
        return accumulator;
    }, []);

    const arrangeElementsAscending = (dataCollection) => {
        const totalItems = dataCollection.length;
        for (let i = 1; i < totalItems; i++) {
            let currentItem = dataCollection[i];
            let j = i - 1;
            while (j >= 0 && dataCollection[j] > currentItem) {
                dataCollection[j + 1] = dataCollection[j];
                j--;
            }
            dataCollection[j + 1] = currentItem;
        }
        return dataCollection;
    };

    const orderedNumericalSeries = arrangeElementsAscending(numericalSeries);

    const rightMidPointIndex = orderedNumericalSeries.length / 2;
    const leftMidPointIndex = rightMidPointIndex - 1;

    const calculatedDifference = orderedNumericalSeries[rightMidPointIndex] - orderedNumericalSeries[leftMidPointIndex];
    
    console.log(calculatedDifference);
};

const acquiredInput = require("fs").readFileSync("/dev/stdin", "utf8");
const separatedInputLines = acquiredInput.split('\n');

processData(separatedInputLines);