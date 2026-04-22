const initialRepositorySize = 4 * 3 * 10;
const dataRepository = Array.from({ length: initialRepositorySize }, () => 0);

const fileAccess = require('fs');
const rawSourceData = fileAccess.readFileSync('/dev/stdin', 'utf8');

const processInputLines = (dataContent) => {
    const allLines = dataContent.split('\n');
    const relevantEntries = allLines.slice(1);

    relevantEntries.forEach(entryLine => {
        if (entryLine.trim() === '') return;

        const stringParts = entryLine.split(' ');
        const numericParts = [];
        for (let idx = 0; idx < stringParts.length; idx++) {
            numericParts.push(Number(stringParts[idx]));
        }

        const primaryLoc = numericParts[0] - 1;
        const secondaryLoc = numericParts[1] - 1;
        const tertiaryLoc = numericParts[2] - 1;
        const incrementAmount = numericParts[3];

        const flatPosition = primaryLoc * (3 * 10) + secondaryLoc * 10 + tertiaryLoc;
        dataRepository[flatPosition] += incrementAmount;
    });
};

processInputLines(rawSourceData);

const constructOutput = (storedData) => {
    const dimensionOneCount = 4;
    const dimensionTwoCount = 3;
    const dimensionThreeCount = 10;

    const sectionsForDisplay = Array.from({ length: dimensionOneCount }, (_, d1Index) => {
        const rowsForSection = Array.from({ length: dimensionTwoCount }, (_, d2Index) => {
            const elementsInRow = Array.from({ length: dimensionThreeCount }, (_, d3Index) => {
                const calculatedFlatPosition = d1Index * (dimensionTwoCount * dimensionThreeCount) + d2Index * dimensionThreeCount + d3Index;
                return storedData[calculatedFlatPosition];
            });
            return elementsInRow.join(' ');
        });
        return rowsForSection.join('\n');
    });

    return sectionsForDisplay.join('\n####################\n');
};

console.log(constructOutput(dataRepository));