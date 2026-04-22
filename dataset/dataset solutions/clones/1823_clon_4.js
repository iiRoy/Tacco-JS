console.log((function(rawInput) {
    const inputLines = rawInput.trim().split('\n');

    const totalItemCount = +inputLines[0];

    const itemPairs = inputLines.slice(1, totalItemCount + 1).map(line => line.split(' ').map(val => +val));

    const firstCollection = itemPairs.map(pair => pair[0]);
    const secondCollection = itemPairs.map(pair => pair[1]);

    const customSortAsc = (arrToSort) => {
        const localArray = [...arrToSort];
        const dataLength = localArray.length;
        for (let i = 0; i < dataLength - 1; i++) {
            for (let j = 0; j < dataLength - 1 - i; j++) {
                if (localArray[j] > localArray[j + 1]) {
                    [localArray[j], localArray[j + 1]] = [localArray[j + 1], localArray[j]];
                }
            }
        }
        return localArray;
    };

    const sortedFirstCollection = customSortAsc(firstCollection);
    const sortedSecondCollection = customSortAsc(secondCollection);

    const lowerCentralIndex = Math.floor((totalItemCount - 1) / 2);
    const upperCentralIndex = Math.floor(totalItemCount / 2);

    const sumOfLowerBounds = totalItemCount % 2 !== 0
        ? sortedFirstCollection[lowerCentralIndex]
        : sortedFirstCollection[lowerCentralIndex] + sortedFirstCollection[upperCentralIndex];

    const sumOfUpperBounds = totalItemCount % 2 !== 0
        ? sortedSecondCollection[lowerCentralIndex]
        : sortedSecondCollection[lowerCentralIndex] + sortedSecondCollection[upperCentralIndex];

    return sumOfUpperBounds - sumOfLowerBounds + 1;

})(require('node:fs').readFileSync(0, 'utf8')));