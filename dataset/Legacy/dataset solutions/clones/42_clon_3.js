const fileSystem = require("fs");

/**
 * Helper function to calculate the square of a numeric value.
 * @param {number} value The number to square.
 * @returns {number} The square of the input value.
 */
const squareValue = (value) => value * value;

fileSystem.readFileSync("/dev/stdin", "utf8")
    .trim()
    .split('\n')
    .forEach(function(currentLine) {
        const coordinateStrings = currentLine.split(' ');

        // Ensure the line contains exactly six coordinate values (x1, y1, x2, y2, x3, y3)
        if (coordinateStrings.length === 6) {
            // Parse string coordinates to floating-point numbers
            const x1Coord = parseFloat(coordinateStrings[0]);
            const y1Coord = parseFloat(coordinateStrings[1]);
            const x2Coord = parseFloat(coordinateStrings[2]);
            const y2Coord = parseFloat(coordinateStrings[3]);
            const x3Coord = parseFloat(coordinateStrings[4]);
            const y3Coord = parseFloat(coordinateStrings[5]);

            // Calculate squares of each coordinate for use in formulas
            const x1Sq = squareValue(x1Coord);
            const y1Sq = squareValue(y1Coord);
            const x2Sq = squareValue(x2Coord);
            const y2Sq = squareValue(y2Coord);
            const x3Sq = squareValue(x3Coord);
            const y3Sq = squareValue(y3Coord);

            // Intermediate terms for the circumcenter formulas
            const diffY1Y3 = y1Coord - y3Coord;
            const diffY1Y2 = y1Coord - y2Coord;
            const diffX1X3 = x1Coord - x3Coord;
            const diffX1X2 = x1Coord - x2Coord;

            // Numerator components for circumcenterX
            const termNumeratorP1 = y1Sq - y2Sq + x1Sq - x2Sq; // (y1^2 - y2^2 + x1^2 - x2^2)
            const termNumeratorP2 = y1Sq - y3Sq + x1Sq - x3Sq; // (y1^2 - y3^2 + x1^2 - x3^2)

            // Numerator components for circumcenterY
            const termNumeratorQ1 = x1Sq - x2Sq + y1Sq - y2Sq; // (x1^2 - x2^2 + y1^2 - y2^2)
            const termNumeratorQ2 = x1Sq - x3Sq + y1Sq - y3Sq; // (x1^2 - x3^2 + y1^2 - y3^2)

            // Denominators for circumcenter coordinates
            const denominatorX = 2 * (diffY1Y3 * (x1Coord - x2Coord) - diffY1Y2 * (x1Coord - x3Coord));
            const denominatorY = 2 * (diffX1X3 * (y1Coord - y2Coord) - diffX1X2 * (y1Coord - y3Coord));

            // Calculate the circumcenter (circumcenterX, circumcenterY)
            const circumcenterX = (diffY1Y3 * termNumeratorP1 - diffY1Y2 * termNumeratorP2) / denominatorX;
            const circumcenterY = (diffX1X3 * termNumeratorQ1 - diffX1X2 * termNumeratorQ2) / denominatorY;

            // Calculate the circumradius (distance from (x1, y1) to circumcenter)
            const deltaXForRadius = x1Coord - circumcenterX;
            const deltaYForRadius = y1Coord - circumcenterY;
            const radiusSquared = squareValue(deltaXForRadius) + squareValue(deltaYForRadius);
            const circumradius = Math.sqrt(radiusSquared);

            // Output the circumcenter coordinates and circumradius, formatted to 3 decimal places
            console.log(circumcenterX.toFixed(3), circumcenterY.toFixed(3), circumradius.toFixed(3));
        }
    });
