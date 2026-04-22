const lineReader = require('readline');

class PointGeometry {
    constructor(xVal, yVal) {
        this.xDimension = parseFloat(xVal);
        this.yDimension = parseFloat(yVal);
    }
}

class LineFormation {
    constructor(startPoint, endPoint) {
        this.initialPoint = startPoint;
        this.finalPoint = endPoint;
    }

    calculateStandardizedGradient() {
        const deltaY = this.finalPoint.yDimension - this.initialPoint.yDimension;
        const deltaX = this.finalPoint.xDimension - this.initialPoint.xDimension;
        return (deltaY / deltaX).toFixed(6);
    }
}

const streamProcessor = lineReader.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

streamProcessor.on('line', (currentLine) => {
    const numericalComponents = currentLine.split(' ').map(Number);

    const pointOne = new PointGeometry(numericalComponents[0], numericalComponents[1]);
    const pointTwo = new PointGeometry(numericalComponents[2], numericalComponents[3]);
    const pointThree = new PointGeometry(numericalComponents[4], numericalComponents[5]);
    const pointFour = new PointGeometry(numericalComponents[6], numericalComponents[7]);

    const segmentAlpha = new LineFormation(pointOne, pointTwo);
    const segmentBeta = new LineFormation(pointThree, pointFour);

    const gradientAlpha = segmentAlpha.calculateStandardizedGradient();
    const gradientBeta = segmentBeta.calculateStandardizedGradient();

    if (gradientAlpha === gradientBeta) {
        process.stdout.write('YES\n');
    } else {
        process.stdout.write('NO\n');
    }
});