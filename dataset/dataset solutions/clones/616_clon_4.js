let collectedData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', piece => {
    collectedData += piece;
});

process.stdin.on('end', () => {
    processTransformedInput(collectedData);
});

function processTransformedInput(entireText) {
    const relevantLines = entireText.split(/\s*\r?\n\s*/).filter(Boolean);
    
    const contentSegments = relevantLines.slice(1); 

    const enumerators = Array.from({ length: 5 }, (_, idx) => idx);

    const numericCombinations = enumerators.flatMap(firstElementIndex => 
        enumerators.flatMap(secondElementIndex => {
            if (firstElementIndex === secondElementIndex) {
                return [];
            }
            const combinedString = contentSegments[firstElementIndex] + contentSegments[secondElementIndex];
            return [Number(combinedString)];
        })
    );

    function retrieveNthSmallest(dataCollection) {
        let firstRank = Infinity;
        let secondRank = Infinity;
        let thirdRank = Infinity; 

        for (const currentValue of dataCollection) {
            if (currentValue < firstRank) {
                thirdRank = secondRank;
                secondRank = firstRank;
                firstRank = currentValue;
            } else if (currentValue < secondRank) {
                thirdRank = secondRank;
                secondRank = currentValue;
            } else if (currentValue < thirdRank) {
                thirdRank = currentValue;
            }
        }
        return thirdRank;
    }

    const specificRankedValue = retrieveNthSmallest(numericCombinations); 
    console.log(specificRankedValue);
}