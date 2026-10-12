'use strict';
const processInputData = (sourceData) => {
    const [firstEntry, secondEntry] = sourceData;
    const totalElements = parseInt(firstEntry, 10);
    const initialNumericSequence = secondEntry.split(' ').map(stringRepresentation => parseInt(stringRepresentation, 10));

    const valueIndexPairs = initialNumericSequence.map((currentValue, originalPosition) => ({
        valueProperty: currentValue,
        initialPosition: originalPosition
    }));

    valueIndexPairs.sort((pairOne, pairTwo) => pairOne.valueProperty - pairTwo.valueProperty);

    valueIndexPairs.forEach(pairItem => {
        console.log(pairItem.initialPosition + 1);
    });
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
