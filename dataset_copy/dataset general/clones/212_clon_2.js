/*
 * jQuery.pathAnimator v1.0.0
 * https://github.com/YourName/jquery.pathanimator
 *
 * Facilitates object movement along custom Catmull-Rom spline trajectories defined by a series of geographic markers.
 * How to use: Refer to example.js, example.html
 *
 * Copyright 2023, Your Name
 * License: Apache 2.0
 *
 */

(function(pluginHost) {

    pluginHost.pathAnimator = {};

    // Computes a point along a Catmull-Rom spline segment given a time factor and four control points.
    // Based on: http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull.E2.80.93Rom_spline
    var deriveInterpolatedValue = function(timeFactor, prevCoord, currentCoord, nextCoord, furtherCoord) {
        return Math.floor(
            (
                timeFactor * ((2 - timeFactor) * timeFactor - 1) * prevCoord +
                (timeFactor * timeFactor * (3 * timeFactor - 5) + 2) * currentCoord +
                timeFactor * ((4 - 3 * timeFactor) * timeFactor + 1) * nextCoord +
                (timeFactor - 1) * timeFactor * timeFactor * furtherCoord
            ) / 2
        );
    };

    // Extends a line defined by two points linearly to infer a third point.
    var createLinearExtension = function(pointX, pointY) {
        return [
            pointY[0] + (pointY[0] - pointX[0]),
            pointY[1] + (pointY[1] - pointX[1])
        ];
    };

    // Generates an animation object based on a collection of coordinate pairs.
    // The input 'coordinateList' must be an array of [x, y] arrays.
    pluginHost.pathAnimator.generateCurvePath = function(coordinateList) {
        var pathResult = {};
        var completePath = [];
        var totalPathSegments;

        if (coordinateList.length < 2) {
            throw "pathAnimator.generateCurvePath needs at least two coordinate pairs to form a path.";
        }

        // Generate the initial virtual point (p_1) for the Catmull-Rom calculation.
        completePath.push(createLinearExtension(coordinateList[1], coordinateList[0]));

        // Append all the provided actual coordinate points to the sequence.
        for (var currentIdx = 0; currentIdx < coordinateList.length; currentIdx++) {
            completePath.push(coordinateList[currentIdx]);
        }

        // Generate the final virtual point (p2) to complete the spline calculation.
        completePath.push(createLinearExtension(completePath[completePath.length - 2], completePath[completePath.length - 1]));

        totalPathSegments = completePath.length - 3;

        pathResult.retrievePosition = function(progressRatio) {
            // For simplicity, assume all path segments consume equal animation time.
            var currentSegmentIndex = Math.floor(progressRatio * totalPathSegments);
            if (currentSegmentIndex === totalPathSegments) {
                // If at the very end, return the last actual waypoint.
                return {
                    horiz: completePath[completePath.length - 2][0],
                    vert: completePath[completePath.length - 2][1]
                };
            }
            var segmentProgress = (progressRatio - currentSegmentIndex / totalPathSegments) * totalPathSegments;
            var calculatedCoords = {
                horiz: deriveInterpolatedValue(
                    segmentProgress,
                    completePath[currentSegmentIndex][0],
                    completePath[currentSegmentIndex + 1][0],
                    completePath[currentSegmentIndex + 2][0],
                    completePath[currentSegmentIndex + 3][0]
                ) + "px",
                vert: deriveInterpolatedValue(
                    segmentProgress,
                    completePath[currentSegmentIndex][1],
                    completePath[currentSegmentIndex + 1][1],
                    completePath[currentSegmentIndex + 2][1],
                    completePath[currentSegmentIndex + 3][1]
                ) + "px"
            };
            return calculatedCoords;
        };
        return pathResult;
    };

    // Custom animation step for jQuery's FX engine to handle spline movement.
    pluginHost.fx.step.curvePath = function(animationCtx) {
        var computedStyles = animationCtx.end.retrievePosition(animationCtx.pos);
        for (var styleKey in computedStyles) {
            animationCtx.elem.style[styleKey] = computedStyles[styleKey];
        }
    };

})(window.jQuery);