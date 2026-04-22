function processInputData(rawData) {
    const dataLines = rawData.split('\n');
    const numericStrings = dataLines[1].split(' ');

    function customBubbleSort(itemArray) {
        let totalItems = itemArray.length;
        let operationOccurred;
        do {
            operationOccurred = false;
            for (let counter = 0; counter < totalItems - 1; counter++) {
                // Replicates the original's lexicographical descending sort logic for strings
                // If itemArray[counter] is lexicographically smaller than itemArray[counter+1],
                // they are in ascending order, but we want descending. So swap them.
                if (itemArray[counter] < itemArray[counter + 1]) {
                    let temporaryHolder = itemArray[counter];
                    itemArray[counter] = itemArray[counter + 1];
                    itemArray[counter + 1] = temporaryHolder;
                    operationOccurred = true;
                }
            }
        } while (operationOccurred);
        return itemArray;
    }

    const sortedNumericValues = customBubbleSort([...numericStrings]); // Create a copy for the sort

    const gameResult = sortedNumericValues.reduce((scoreAccumulator, currentNumberStr, currentIndex) => {
        const integerValue = parseInt(currentNumberStr, 10);
        if (currentIndex % 2 === 0) {
            scoreAccumulator.firstParticipant += integerValue;
        } else {
            scoreAccumulator.secondParticipant += integerValue;
        }
        return scoreAccumulator;
    }, { firstParticipant: 0, secondParticipant: 0 });

    console.log(gameResult.firstParticipant - gameResult.secondParticipant);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));