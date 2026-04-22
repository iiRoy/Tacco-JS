const dataBuffer = [];
process.stdin.on('data', (portion) => {
    dataBuffer.push(portion);
});

process.stdin.on('end', () => {
    const fullContent = dataBuffer.join('');
    const geometryInstructions = fullContent.trim().split('\n');

    class SpaceRectangle {
        constructor(minX, minY, maxX, maxY) {
            this.xMin = minX;
            this.yMin = minY;
            this.xMax = maxX;
            this.yMax = maxY;
        }

        overlapsWith(otherShape) {
            // Check for non-overlap conditions
            const horizontalSeparation = this.xMax < otherShape.xMin || otherShape.xMax < this.xMin;
            const verticalSeparation = this.yMax < otherShape.yMin || otherShape.yMax < this.yMin;

            // If there's no separation, then there must be an overlap
            return !(horizontalSeparation || verticalSeparation);
        }
    }

    const resultsCollection = geometryInstructions.map(instructionLine => {
        const numericalCoordinates = instructionLine.split(' ').map(Number);

        const firstShape = new SpaceRectangle(
            numericalCoordinates[0], numericalCoordinates[1], numericalCoordinates[2], numericalCoordinates[3]
        );
        const secondShape = new SpaceRectangle(
            numericalCoordinates[4], numericalCoordinates[5], numericalCoordinates[6], numericalCoordinates[7]
        );

        return firstShape.overlapsWith(secondShape) ? "YES" : "NO";
    });

    console.log(resultsCollection.join('\n'));
});