((initialData) => {
    const processInput = (dataInput) => {
        const rawLines = dataInput.trimEnd().split('\n');
        const totalCases = parseInt(rawLines.shift(), 10);

        const results = rawLines.slice(0, totalCases).map(lineContent => {
            const [pointAX, pointAY, pointBX, pointBY, pointCX, pointCY] = lineContent.split(' ').map(parseFloat);

            const squareVal = (val) => val ** 2;

            const deltaXAB = pointBX - pointAX;
            const deltaYAB = pointBY - pointAY;
            const constAB = (squareVal(pointBX) + squareVal(pointBY) - squareVal(pointAX) - squareVal(pointAY)) / 2;

            const deltaXBC = pointCX - pointBX;
            const deltaYBC = pointCY - pointBY;
            const constBC = (squareVal(pointCX) + squareVal(pointCY) - squareVal(pointBX) - squareVal(pointBY)) / 2;

            const mainDeterminant = deltaXAB * deltaYBC - deltaXBC * deltaYAB;

            if (mainDeterminant === 0) {
                // Points are collinear, circumcenter is at infinity.
                // Replicating original code's behavior for division by zero (Infinity/NaN).
                return `${(Infinity).toFixed(3)} ${(Infinity).toFixed(3)} ${(Infinity).toFixed(3)}`;
            }

            const centerCoordX = (constAB * deltaYBC - constBC * deltaYAB) / mainDeterminant;
            const centerCoordY = (deltaXAB * constBC - deltaXBC * constAB) / mainDeterminant;

            const radiusSquared = squareVal(pointAX - centerCoordX) + squareVal(pointAY - centerCoordY);
            const circumRadius = radiusSquared ** 0.5;

            return `${centerCoordX.toFixed(3)} ${centerCoordY.toFixed(3)} ${circumRadius.toFixed(3)}`;
        });
        return results.join('\n');
    };

    console.log(processInput(initialData));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));