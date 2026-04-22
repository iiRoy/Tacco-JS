const rawTextualData = require("fs").readFileSync("/dev/stdin", "utf8");

const numericalComponents = rawTextualData.match(/-?\d+(\.\d+)?/g).map(Number);

const firstDimension = numericalComponents[0];
const secondDimension = numericalComponents[1];
const angularMeasureDegrees = numericalComponents[2];

class GeometricFigure {
    #firstSide;
    #secondSide;
    #includedAngle;

    constructor(s1, s2, angDeg) {
        this.#firstSide = s1;
        this.#secondSide = s2;
        this.#includedAngle = angDeg;
    }

    #convertDegreesToRadians(degrees) {
        const tauFactor = 2 * Math.acos(0);
        return degrees * tauFactor / 180;
    }

    #calculateThirdBoundaryLength() {
        const angleInRadians = this.#convertDegreesToRadians(this.#includedAngle);
        const termOne = this.#firstSide * this.#firstSide;
        const termTwo = this.#secondSide * this.#secondSide;
        const termThree = 2 * this.#firstSide * this.#secondSide * Math.cos(angleInRadians);
        return Math.sqrt(termOne + termTwo - termThree);
    }

    computePlanarExtent() {
        const thirdBoundary = this.#calculateThirdBoundaryLength();
        const semiPerimeter = (this.#firstSide + this.#secondSide + thirdBoundary) / 2;
        
        return Math.sqrt(
            semiPerimeter *
            (semiPerimeter - this.#firstSide) *
            (semiPerimeter - this.#secondSide) *
            (semiPerimeter - thirdBoundary)
        );
    }

    determineTotalBoundaryLength() {
        return this.#firstSide + this.#secondSide + this.#calculateThirdBoundaryLength();
    }

    ascertainPerpendicularElevation() {
        const currentPlanarExtent = this.computePlanarExtent();
        return (2 * currentPlanarExtent) / this.#firstSide;
    }
}

const shapeInstance = new GeometricFigure(firstDimension, secondDimension, angularMeasureDegrees);

const calculatedPlanarExtent = shapeInstance.computePlanarExtent();
const calculatedTotalBoundaryLength = shapeInstance.determineTotalBoundaryLength();
const calculatedPerpendicularElevation = shapeInstance.ascertainPerpendicularElevation();

console.log(
    calculatedPlanarExtent.toFixed(8) + "\n" +
    calculatedTotalBoundaryLength.toFixed(8) + "\n" +
    calculatedPerpendicularElevation.toFixed(8)
);