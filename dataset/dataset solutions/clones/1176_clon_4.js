const FileSystemAccess = require('fs');
const AllIncomingData = FileSystemAccess.readFileSync('/dev/stdin', 'utf8');

const RawTokens = AllIncomingData.trim().split(/\s+/);
const ParsedNumerics = [];
for (const token of RawTokens) {
    ParsedNumerics.push(parseFloat(token));
}

const FirstDimension = ParsedNumerics[0];
const SecondDimension = ParsedNumerics[1];
const DeclinationDegrees = ParsedNumerics[2];

const GeomUtil = {
    _radianFactor: (degrees) => degrees * (Math.atan(1) * 4 / 180),
    _squareValue: (val) => val * val,
    _hypotenuseOfRightTriangle: (side1, side2) => Math.hypot(side1, side2),
    _angularSine: (angle) => Math.sin(angle),
    _angularCosine: (angle) => Math.cos(angle),

    calculateShapeAttributes: (dimA, dimB, angD) => {
        const angR = GeomUtil._radianFactor(angD);

        const verticalComponent = GeomUtil._angularSine(angR) * dimB;
        const horizontalComponent = GeomUtil._angularCosine(angR) * dimB;

        const effectiveBase = dimA - horizontalComponent;
        const thirdBoundary = GeomUtil._hypotenuseOfRightTriangle(effectiveBase, verticalComponent);

        const superficialExtent = (dimA * verticalComponent) / 2;
        const totalOutline = dimA + dimB + thirdBoundary;

        return {
            extent: superficialExtent,
            outline: totalOutline,
            altitude: verticalComponent
        };
    }
};

const ComputedAttributes = GeomUtil.calculateShapeAttributes(FirstDimension, SecondDimension, DeclinationDegrees);

process.stdout.write(ComputedAttributes.extent + '\n' + ComputedAttributes.outline + '\n' + ComputedAttributes.altitude + '\n');