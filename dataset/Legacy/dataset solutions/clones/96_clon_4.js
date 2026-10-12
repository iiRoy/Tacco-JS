((sourceText) => {
    const evaluateCircleInteraction = (circleData) => {
        const [xCoord1, yCoord1, radius1, xCoord2, yCoord2, radius2] = circleData;

        const deltaX = xCoord2 - xCoord1;
        const deltaY = yCoord2 - yCoord1;
        const squaredDistance = deltaX * deltaX + deltaY * deltaY;
        const centerDistance = Math.sqrt(squaredDistance);

        return (radius1 >= centerDistance + radius2) ? 2
             : (radius2 >= centerDistance + radius1) ? -2
             : (centerDistance <= radius1 + radius2) ? 1
             : 0;
    };

    const inputLines = sourceText.replace(/\n$/, '').split('\n');
    const numberOfCases = Number(inputLines.shift());

    inputLines.slice(0, numberOfCases).forEach(currentLine => {
        const parsedNumbers = currentLine.split(' ').map(Number);
        console.log(evaluateCircleInteraction(parsedNumbers));
    });
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
