const acquireData = () => require('node:fs').readFileSync(0, 'utf8').trim();
const presentOutput = (data) => console.log(data);

const solvePuzzle = () => {
    const rawData = acquireData();
    const allSegments = rawData.split('\n');

    const [heightDimension, widthDimension] = allSegments[0].split(' ').map(Number);
    const totalCount = Number(allSegments[1]);
    const elementDistribution = allSegments[2].split(' ').map(Number);

    const flattenedSequence = elementDistribution.flatMap((count, valueIndex) => 
        Array(count).fill(valueIndex + 1)
    );

    const resultMatrix = Array.from({ length: heightDimension }, () => Array(widthDimension));

    for (let linearIndex = 0; linearIndex < heightDimension * widthDimension; ++linearIndex) {
        const currentNumber = flattenedSequence[linearIndex];
        const currentGridRow = Math.floor(linearIndex / widthDimension);
        let currentGridColumn;

        if (currentGridRow % 2 === 0) {
            currentGridColumn = linearIndex % widthDimension;
        } else {
            currentGridColumn = widthDimension - 1 - (linearIndex % widthDimension);
        }
        resultMatrix[currentGridRow][currentGridColumn] = currentNumber;
    }

    const formattedResult = resultMatrix.map(row => row.join(' ')).join('\n');
    presentOutput(formattedResult);
};

solvePuzzle();