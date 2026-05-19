(function(rawData) {
    function square(value) {
        return value * value;
    }

    function parseNumericLine(lineString) {
        return lineString.split(' ').map(Number);
    }

    var processedLines = rawData.replace(/\n$/, '').split('\n');
    var numCases = Number(processedLines.shift());

    for (var caseIndex = 0; caseIndex < numCases; caseIndex++) {
        var currentCaseCoordinates = parseNumericLine(processedLines[caseIndex]);

        var [
            point1X, point1Y,
            point2X, point2Y,
            point3X, point3Y
        ] = currentCaseCoordinates;

        var sqPoint1X = square(point1X);
        var sqPoint1Y = square(point1Y);
        var sqPoint2X = square(point2X);
        var sqPoint2Y = square(point2Y);
        var sqPoint3X = square(point3X);
        var sqPoint3Y = square(point3Y);

        var diffY2Y1 = point2Y - point1Y;
        var diffY3Y2 = point3Y - point2Y;
        var diffX2X1 = point2X - point1X;
        var diffX3X2 = point3X - point2X;

        var commonDenominatorCore = (diffY2Y1 * diffX3X2) - (diffX2X1 * diffY3Y2);
        var fullDenominator = 2 * commonDenominatorCore;

        var termA_for_X_Numerator = (sqPoint3X - sqPoint2X + sqPoint3Y - sqPoint2Y);
        var termB_for_X_Numerator = (sqPoint2X - sqPoint1X + sqPoint2Y - sqPoint1Y);
        var numeratorForCenterX = (termA_for_X_Numerator * diffY2Y1) - (termB_for_X_Numerator * diffY3Y2);

        var centerX = numeratorForCenterX / fullDenominator;

        var termA_for_Y_Numerator = (sqPoint3Y - sqPointPoint2Y + sqPoint3X - sqPoint2X);
        var termB_for_Y_Numerator = (sqPoint2Y - sqPoint1Y + sqPoint2X - sqPoint1X);
        var numeratorForCenterY = (termA_for_Y_Numerator * diffX2X1) - (termB_for_Y_Numerator * diffX3X2);

        var centerY = numeratorForCenterY / (-fullDenominator); // Denominator for Y is negative of X's

        var radiusSquared = square(point1X - centerX) + square(point1Y - centerY);
        var radiusValue = Math.sqrt(radiusSquared);

        console.log(centerX.toFixed(3), centerY.toFixed(3), radiusValue.toFixed(3));
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
