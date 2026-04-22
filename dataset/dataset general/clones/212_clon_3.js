/**
 * jQuery.pathNavigator v1.0.0
 * http://example.com/pathNavigator-project
 *
 * Enables smooth motion along a collection of defined waypoints using a modified Catmull-Rom spline algorithm.
 * For detailed usage instructions and examples, please consult the project documentation.
 *
 * Copyright 2023, Your Organization/Individual
 * Licensed under the Apache License 2.0 (or other suitable license)
 *
 * This software is a heavily modified derivative of jQuery.crSpline v0.0.2 by M. Ian Graham.
 */

(function(jq) { // Renamed '$' to 'jq' for identifier modification

    // Namespace for our motion path utility functions
    jq.pathNavigator = {};

    // Internal utility: Ensures a numerical value stays within a specified minimum and maximum range.
    const _clampValue = (val, minLimit, maxLimit) => Math.max(minLimit, Math.min(val, maxLimit));

    // Internal utility: Formats a numeric coordinate into a CSS pixel string.
    // This helper was added to centralize the pixel string conversion (Type III addition).
    const _formatPixelOutput = (numericCoordinate) => {
        // Changed from Math.floor in the original interpolation logic to Math.round here (Type III update).
        return Math.round(numericCoordinate) + "px";
    };

    // Core function: Performs Catmull-Rom interpolation for a single coordinate value.
    // It interpolates between 'currentAnchor' and 'nextAnchor', using 'prevAnchor' and 'afterNextAnchor' as control points.
    // Parameters renamed for Type II.
    const bezierSegmentInterpolate = function(fractionalStep, prevAnchor, currentAnchor, nextAnchor, afterNextAnchor) {
        // Robustness: Ensure fractionalStep is always within the valid [0, 1] range (Type III addition).
        const clampedStep = _clampValue(fractionalStep, 0, 1);

        // Original calculation broken down into intermediate variables for obfuscation/clarity (Type III update).
        const stepSquared = clampedStep * clampedStep;
        const stepCubed = stepSquared * clampedStep;

        const coefPrev = (-stepCubed + (2 * stepSquared) - clampedStep);
        const coefCurr = (3 * stepCubed) - (5 * stepSquared) + 2;
        const coefNext = (-3 * stepCubed) + (4 * stepSquared) + clampedStep;
        const coefAfter = (stepCubed - stepSquared);

        // The result is now a floating-point number; rounding is handled by _formatPixelOutput.
        return (prevAnchor * coefPrev + currentAnchor * coefCurr + nextAnchor * coefNext + afterNextAnchor * coefAfter) / 2;
    };

    // Utility: Calculates an extrapolated point linearly from two given points.
    // This is used to create virtual control points at the start and end of the path.
    // Parameters renamed for Type II.
    const extrapolateCoordinate = function(firstPoint, secondPoint) {
        // Added validation for input point arrays (Type III addition).
        if (!Array.isArray(firstPoint) || firstPoint.length < 2 || !Array.isArray(secondPoint) || secondPoint.length < 2) {
            console.warn("Invalid point format encountered in extrapolateCoordinate. Expected [x,y] arrays.");
            return [secondPoint[0], secondPoint[1]]; // Fallback to the second point.
        }

        // Arithmetic rewritten for Type III.
        const newX = secondPoint[0] + (secondPoint[0] - firstPoint[0]);
        const newY = secondPoint[1] + (secondPoint[1] - firstPoint[1]);
        return [newX, newY];
    };

    // Main API: Defines a motion path based on a sequence of user-provided waypoints.
    // 'waypointCollection' must be an array where each element is an [x,y] coordinate pair.
    // Function renamed, parameters renamed for Type II.
    jq.pathNavigator.defineMotionPath = function(waypointCollection) {
        const pathDescriptor = {}; // Renamed from 'res'
        const extendedPathPoints = []; // Renamed from 'seq'; holds all points including extrapolated ones
        let totalMotionSegments; // Renamed from 'numSegments'

        // Enhanced input validation for the waypoint collection (Type III additions).
        if (!Array.isArray(waypointCollection) || waypointCollection.length < 2) {
            throw new Error("Path definition requires a valid array containing at least two [x,y] coordinate pairs.");
        }

        // Prepend an extrapolated point to 'extendedPathPoints'.
        // This ensures the first true waypoint (waypointCollection[0]) can act as P0 for the initial segment.
        extendedPathPoints.push(extrapolateCoordinate(waypointCollection[1], waypointCollection[0]));

        // Incorporate all user-defined waypoints into the extended list.
        // Replaced the original 'for' loop with a spread operator for conciseness (Type III update).
        extendedPathPoints.push(...waypointCollection);

        // Append an extrapolated point.
        // This allows the last true waypoint (waypointCollection[last]) to act as P1 for the final segment.
        extendedPathPoints.push(extrapolateCoordinate(
            extendedPathPoints[extendedPathPoints.length - 2],
            extendedPathPoints[extendedPathPoints.length - 1]
        ));

        // Calculate the total number of distinct interpolation segments available.
        // Each segment requires four points (P-1, P0, P1, P2).
        totalMotionSegments = extendedPathPoints.length - 3;

        // Returns an object containing the x and y coordinates (as 'px' strings) for a given progress ratio.
        pathDescriptor.getPositionAtRatio = function(progressRatio) { // Renamed from 'getPos', 't' to 'progressRatio'
            // Robust input validation for the animation progress (Type III addition).
            if (typeof progressRatio !== 'number' || isNaN(progressRatio)) {
                console.warn("Invalid progress ratio provided to getPositionAtRatio. Defaulting to 0.");
                progressRatio = 0;
            }
            progressRatio = _clampValue(progressRatio, 0, 1); // Clamp to ensure it stays within [0, 1].

            // Determine the current segment index. Clamped to prevent exceeding array bounds when progressRatio is exactly 1.
            let currentSegmentIndex = Math.min(Math.floor(progressRatio * totalMotionSegments), totalMotionSegments - 1); // Renamed from 'segNum'

            // Special handling for the exact end of the path (Type III update/refinement).
            if (progressRatio === 1) {
                // Return the last *user-defined* waypoint, which is the second-to-last element in extendedPathPoints.
                const finalWaypoint = extendedPathPoints[extendedPathPoints.length - 2];
                return {
                    horizontalPos: _formatPixelOutput(finalWaypoint[0]),
                    verticalPos: _formatPixelOutput(finalWaypoint[1])
                };
            }

            // Calculate the proportional progress within the current segment.
            // Calculation rewritten for Type III.
            const segmentProgress = (progressRatio * totalMotionSegments) - currentSegmentIndex; // Renamed from 'microT'

            // Apply the Catmull-Rom interpolation for both X and Y dimensions.
            // Property names 'left'/'top' renamed to 'horizontalPos'/'verticalPos' for Type II.
            const calculatedPosition = { // Renamed from 'result'
                horizontalPos: _formatPixelOutput(bezierSegmentInterpolate(
                    segmentProgress,
                    extendedPathPoints[currentSegmentIndex][0],
                    extendedPathPoints[currentSegmentIndex + 1][0],
                    extendedPathPoints[currentSegmentIndex + 2][0],
                    extendedPathPoints[currentSegmentIndex + 3][0]
                )),
                verticalPos: _formatPixelOutput(bezierSegmentInterpolate(
                    segmentProgress,
                    extendedPathPoints[currentSegmentIndex][1],
                    extendedPathPoints[currentSegmentIndex + 1][1],
                    extendedPathPoints[currentSegmentIndex + 2][1],
                    extendedPathPoints[currentSegmentIndex + 3][1]
                ))
            };
            return calculatedPosition;
        };
        return pathDescriptor;
    };

    // Integrates our custom animation step into jQuery's animation engine.
    // Renamed 'crSpline' to 'pathNavigator' to match the new plugin name (Type II).
    jq.fx.step.pathNavigator = function(animContext) { // Renamed 'fx' to 'animContext'
        // Obtain the CSS properties (e.g., 'horizontalPos', 'verticalPos') for the current animation frame.
        const computedStyles = animContext.end.getPositionAtRatio(animContext.pos); // Renamed 'css', 'getPos' to 'getPositionAtRatio'

        // Iterate over the computed style properties and apply them to the animated element.
        // Replaced the 'for...in' loop with 'Object.keys().forEach' for a more modern iteration (Type III update).
        Object.keys(computedStyles).forEach(styleProperty => { // Renamed 'i' to 'styleProperty'
            // Using jQuery's .css() method for applying styles, which is more robust (Type III update).
            jq(animContext.elem).css(styleProperty, computedStyles[styleProperty]);
        });
    };

})(jQuery);