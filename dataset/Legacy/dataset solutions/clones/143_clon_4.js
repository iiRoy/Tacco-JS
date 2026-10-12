var fs = require('fs');

function calculateGradient(pointOne, pointTwo) {
    return (pointTwo.yCoord - pointOne.yCoord) / (pointTwo.xCoord - pointOne.xCoord);
}

function processCoordinateData() {
    const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');
    const dataLines = rawInputContent.split('\n').filter(Boolean);

    dataLines.forEach(function(currentLine) {
        const numericValues = currentLine.split(',').map(Number);

        const vertexCollection = [
            { xCoord: numericValues[0], yCoord: numericValues[1] },
            { xCoord: numericValues[2], yCoord: numericValues[3] },
            { xCoord: numericValues[4], yCoord: numericValues[5] },
            { xCoord: numericValues[6], yCoord: numericValues[7] }
        ];

        const segmentGradients = [
            calculateGradient(vertexCollection[0], vertexCollection[1]),
            calculateGradient(vertexCollection[1], vertexCollection[2]),
            calculateGradient(vertexCollection[2], vertexCollection[3]),
            calculateGradient(vertexCollection[3], vertexCollection[0])
        ];

        const nonNegativeCount = segmentGradients.filter(gradient => gradient >= 0).length;

        console.log(nonNegativeCount % 2 === 1 ? 'YES' : 'NO');
    });
}

processCoordinateData();
