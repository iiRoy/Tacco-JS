(function(jQ){

    jQ.splineAnimator = {};

    var calculateSplinePointComponent = function (progression, pA, pB, pC, pD) {
        var pSq = progression * progression;
        var pCub = pSq * progression;

        // Coefficients for Catmull-Rom spline (derived from original formula structure)
        var cMinus1 = (2 * pSq - pCub - progression);
        var cZero = (3 * pCub - 5 * pSq + 2);
        var cOne = (4 * pSq - 3 * pCub + progression);
        var cTwo = (pCub - pSq);

        return ((cMinus1 * pA + cZero * pB + cOne * pC + cTwo * pD) / 2) | 0;
    };

    var extrapolateEndpoint = function (initialCoord, terminalCoord) {
        return [
            terminalCoord[0] + (terminalCoord[0] - initialCoord[0]),
            terminalCoord[1] + (terminalCoord[1] - initialCoord[1])
        ];
    };

    jQ.splineAnimator.createPath = function(pathVertices) {
        if (pathVertices.length < 2) {
            throw new Error("Path definition requires a minimum of two vertices.");
        }

        var controlPointsArray = [];
        var pathHandler = {};
        var totalPathSegments;

        // Generate leading virtual point
        controlPointsArray.push(extrapolateEndpoint(pathVertices[1], pathVertices[0]));

        // Incorporate user-provided points
        for (var idx = 0; idx < pathVertices.length; idx++) {
            controlPointsArray.push(pathVertices[idx]);
        }

        // Generate trailing virtual point
        controlPointsArray.push(extrapolateEndpoint(
            controlPointsArray[controlPointsArray.length - 2],
            controlPointsArray[controlPointsArray.length - 1]
        ));

        totalPathSegments = controlPointsArray.length - 3;

        pathHandler.retrievePosition = function (currentProgression) {
            if (currentProgression >= 1) {
                return {
                    xPos: pathVertices[pathVertices.length - 1][0] + "px",
                    yPos: pathVertices[pathVertices.length - 1][1] + "px"
                };
            }

            var segmentNumber = Math.floor(currentProgression * totalPathSegments);
            var segmentProgressRatio = (currentProgression * totalPathSegments) - segmentNumber;

            var pointMinus1 = controlPointsArray[segmentNumber];
            var pointZero = controlPointsArray[segmentNumber + 1];
            var pointOne = controlPointsArray[segmentNumber + 2];
            var pointTwo = controlPointsArray[segmentNumber + 3];

            var calculatedX = calculateSplinePointComponent(
                segmentProgressRatio,
                pointMinus1[0],
                pointZero[0],
                pointOne[0],
                pointTwo[0]
            );

            var calculatedY = calculateSplinePointComponent(
                segmentProgressRatio,
                pointMinus1[1],
                pointZero[1],
                pointOne[1],
                pointTwo[1]
            );

            return {
                xPos: calculatedX + "px",
                yPos: calculatedY + "px"
            };
        };
        return pathHandler;
    };

    jQ.fx.step.splineMotion = function (animationObject) {
        var styleData = animationObject.end.retrievePosition(animationObject.pos);
        animationObject.elem.style.left = styleData.xPos;
        animationObject.elem.style.top = styleData.yPos;
    };

})(jQuery);