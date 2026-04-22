const reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

class PlanarCoord {
    constructor(horizontal, vertical) {
        this.h = horizontal;
        this.v = vertical;
    }

    combine(otherCoord) {
        return new PlanarCoord(this.h + otherCoord.h, this.v + otherCoord.v);
    }

    difference(otherCoord) {
        return new PlanarCoord(this.h - otherCoord.h, this.v - otherCoord.v);
    }

    rotateNinetyCounterClockwise() {
        return new PlanarCoord(-this.v, this.h);
    }
}

const deriveConjugatePoints = (startVertex, endVertex) => {
    const beginPoint = new PlanarCoord(startVertex.h, startVertex.v);
    const finishPoint = new PlanarCoord(endVertex.h, endVertex.v);

    const displacementVector = finishPoint.difference(beginPoint);

    const perpendicularVector = displacementVector.rotateNinetyCounterClockwise();

    const thirdVertex = finishPoint.combine(perpendicularVector);

    const fourthVertex = beginPoint.combine(perpendicularVector);

    return {
        primaryConjugate: thirdVertex,
        secondaryConjugate: fourthVertex
    };
};

let bufferLine = '';
reader.on('line', (currentLine) => {
    bufferLine = currentLine;
});

reader.on('close', () => {
    const rawValues = bufferLine.trim().split(' ').map(val => parseFloat(val));

    const initialReference = { h: rawValues[0], v: rawValues[1] };
    const terminalReference = { h: rawValues[2], v: rawValues[3] };

    const calculatedConjugates = deriveConjugatePoints(initialReference, terminalReference);

    process.stdout.write(`${calculatedConjugates.primaryConjugate.h} ${calculatedConjugates.primaryConjugate.v} ${calculatedConjugates.secondaryConjugate.h} ${calculatedConjugates.secondaryConjugates.v}\n`);
});