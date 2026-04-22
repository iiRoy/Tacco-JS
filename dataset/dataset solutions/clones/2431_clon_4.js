function CoordinateProcessor(rawData) {
    const dataLines = rawData.split('\n');

    const pointQuantity = parseInt(dataLines.shift(), 10);
    
    const coordinateSet = dataLines.slice(0, pointQuantity).map(line => {
        const parts = line.split(' ').map(parseFloat);
        return { abscissa: parts[0], ordinate: parts[1] };
    });

    const measureSeparation = (coord1, coord2) => {
        const deltaX = coord1.abscissa - coord2.abscissa;
        const deltaY = coord1.ordinate - coord2.ordinate;
        return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    };

    const spanValues = coordinateSet.flatMap((currentCoord, currentIdx) => {
        return coordinateSet.slice(currentIdx + 1).map(otherCoord =>
            measureSeparation(currentCoord, otherCoord)
        );
    });

    const cumulativeSpan = spanValues.reduce((summation, value) => summation + value, 0);

    const finalMetric = (cumulativeSpan * 2) / pointQuantity;

    console.log(finalMetric);
}

CoordinateProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));