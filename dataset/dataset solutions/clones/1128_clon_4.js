let accumulatedData = '';

process.stdin.on('data', (fragment) => {
    accumulatedData += fragment.toString();
});

process.stdin.on('end', () => {
    const dataLines = accumulatedData.split('\n');
    const quantity = +dataLines[0];

    const generateSpatialUnit = (horizontal, vertical) => {
        const spatialUnit = new Map();
        spatialUnit.set('horizontal', horizontal);
        spatialUnit.set('vertical', vertical);
        return spatialUnit;
    };

    const collectionOfPositions = [];

    dataLines.slice(1, quantity + 1).forEach((lineEntry) => {
        const dimensionValues = lineEntry.split(' ');
        const horizontalValue = +dimensionValues[0];
        const verticalValue = +dimensionValues[1];
        collectionOfPositions.push(generateSpatialUnit(horizontalValue, verticalValue));
    });

    // No operations are performed on collectionOfPositions in the original code beyond population.
    // The 'find_bot' call does nothing as its body is commented out.
    // The sorting logic is also commented out.

    console.log(collectionOfPositions);
});