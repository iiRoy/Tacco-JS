function generateArrangements(items, desiredLength) {
    if (desiredLength === 0) {
        return [[]];
    }

    return items.reduce((accumulator, currentItem, index) => {
        const remainingItems = [...items.slice(0, index), ...items.slice(index + 1)];
        const subArrangements = generateArrangements(remainingItems, desiredLength - 1);
        const newArrangements = subArrangements.map(sub => [currentItem, ...sub]);
        return accumulator.concat(newArrangements);
    }, []);
}

function processInputData(allInputLines) {
    const initialDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const finalResults = allInputLines
        .filter(inputLine => inputLine.trim() !== '')
        .map(inputLine => {
            const parsedNumbers = inputLine.split(' ').map(value => parseFloat(value));
            const sequenceLength = parsedNumbers[0];
            const requiredSum = parsedNumbers[1];

            let validSequenceCount = 0;

            const allPossibleArrangements = generateArrangements(initialDigits, sequenceLength);

            for (const currentSequence of allPossibleArrangements) {
                let currentTotalWeight = 0;
                for (let position = 0; position < currentSequence.length; position++) {
                    currentTotalWeight += currentSequence[position] * (position + 1);
                }
                if (currentTotalWeight === requiredSum) {
                    validSequenceCount++;
                }
            }
            return validSequenceCount;
        });

    finalResults.forEach(resultValue => console.log(resultValue));
}

let collectedRawData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataSegment) {
    collectedRawData += dataSegment;
});
process.stdin.on('end', function() {
    const finalLines = collectedRawData.split('\n');
    processInputData(finalLines);
});