const fetchSource = () => {
    return new Promise(resolve => {
        let fullData = '';
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', fragment => {
            fullData += fragment;
        });
        process.stdin.on('end', () => {
            resolve(fullData.split('\n'));
        });
    });
};

fetchSource().then(allLines => {
    processGridState(allLines);
});

const processGridState = (incomingMaterial) => {
    const relevantLines = incomingMaterial.filter(l => l.length > 0);

    const dimensionsString = relevantLines[0].trim().split(' ');
    const gridColumns = Number(dimensionsString[0]);
    const gridRows = Number(dimensionsString[1]);

    const initialLayout = relevantLines.slice(1).map(line => line.split(''));

    const relativePositions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    const retrieveCellContent = (layout, y, x, maxY, maxX) => {
        if (y >= 0 && y < maxY && x >= 0 && x < maxX) {
            return layout[y][x];
        }
        return undefined;
    };

    const finalConfiguration = initialLayout.map((rowArr, rowIndex) => {
        return rowArr.map((cellValue, colIndex) => {
            if (cellValue === '#') {
                return '#';
            } else {
                let obstacleCount = 0;
                relativePositions.forEach(offset => {
                    const neighborY = rowIndex + offset[0];
                    const neighborX = colIndex + offset[1];
                    const content = retrieveCellContent(initialLayout, neighborY, neighborX, gridRows, gridColumns);
                    if (content === '#') {
                        obstacleCount++;
                    }
                });
                return obstacleCount;
            }
        });
    });

    finalConfiguration.forEach(rowArr => {
        console.log(rowArr.join(''));
    });
};