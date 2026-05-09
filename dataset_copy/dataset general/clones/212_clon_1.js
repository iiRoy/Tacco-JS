/*
 * jQuery.crSpline v0.0.2
 *
 * This file contains the core logic for animating elements along Catmull-Rom splines.
 * For detailed usage and examples, please refer to demo.js and demo.html within the project.
 *
 * Project Home: http://github.com/MmmCurry/jquery.crSpline
 *
 * Copyright 2010, M. Ian Graham
 * License: MIT (http://opensource.org/licenses/MIT)
 *
 * This code enables smooth, curved path animations in jQuery.
 * It's designed to be easily integrated into existing jQuery projects.
 */

( function ( $ ) {

    // Initialize the crSpline namespace within jQuery.
    // This object will hold all public methods for spline functionality.
    $.crSpline = {};

    /**
     * Performs Catmull-Rom interpolation for a single coordinate (x or y).
     *
     * This mathematical function calculates an interpolated point along a spline segment
     * defined by four control points: p_1, p0, p1, and p2.
     * The parameter 't' indicates the position along the segment from p0 to p1,
     * ranging from 0 (at p0) to 1 (at p1).
     *
     * @param {number} t   - The interpolation parameter (0.0 to 1.0) for the current segment.
     * @param {number} p_1 - The coordinate of the previous control point.
     * @param {number} p0  - The coordinate of the starting control point for the segment.
     * @param {number} p1  - The coordinate of the ending control point for the segment.
     * @param {number} p2  - The coordinate of the next control point.
     * @returns {number} The interpolated coordinate value.
     * @see http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull.E2.80.93Rom_spline
     */
    var interpolate = function ( t, p_1, p0, p1, p2 ) {

        // The Catmull-Rom spline formula.
        // It's a weighted sum of the four control points.
        var interpolatedValue = (
              t * ( ( 2 - t ) * t - 1 ) * p_1
            + ( t * t * ( 3 * t - 5 ) + 2 ) * p0
            + t * ( ( 4 - 3 * t ) * t + 1 ) * p1
            + ( t - 1 ) * t * t * p2
        ) / 2;

        // Ensure the result is an integer, suitable for pixel values.
        return Math.floor( interpolatedValue );
    };

    /**
     * Generates an "extension" point linearly beyond the given segment.
     * This is used to create virtual control points at the beginning and end
     * of the spline sequence, ensuring the curve starts and ends smoothly
     * without requiring the user to provide extra points.
     *
     * Given two points p1 and p2, it calculates a third point p3 such that
     * p1, p2, and p3 are collinear and equally spaced.
     *
     * @param {Array<number>} p1 - The first point [x, y].
     * @param {Array<number>} p2 - The second point [x, y].
     * @returns {Array<number>} A new point [x, y] extending the line p1-p2.
     */
    var generateExtension = function ( p1, p2 ) {

        // Calculate the extended point by mirroring the vector from p1 to p2.
        return [
            p2[0] + ( p2[0] - p1[0] ), // New X coordinate
            p2[1] + ( p2[1] - p1[1] )  // New Y coordinate
        ];
    };

    /**
     * Builds an animation sequence object based on a list of waypoints.
     * This function preprocesses the given points and returns an object
     * with a `getPos` method that can calculate the interpolated position
     * along the spline for any given time parameter `t`.
     *
     * @param {Array<Array<number>>} pointList - An array of [x, y] pairs representing the waypoints.
     *                                             Requires at least two points.
     * @returns {object} An object containing the `getPos` method.
     * @throws {string} If `pointList` contains fewer than two points.
     */
    $.crSpline.buildSequence = function ( pointList ) {

        var res = {}; // The result object to be returned.
        var seq = []; // The internal sequence of control points, including virtual extensions.
        var numSegments; // The number of actual spline segments to traverse.

        // Validate the input: a spline requires at least two anchor points.
        if ( pointList.length < 2 ) {
            throw "crSpline.buildSequence requires at least two points";
        }

        // Generate the first "virtual" control point (p_1 for the first actual segment).
        // This ensures the curve starts smoothly from the first user-provided point.
        // It extends linearly backwards from the first two points.
        seq.push( generateExtension( pointList[1], pointList[0] ) );

        // Add all user-provided points to the internal sequence.
        // These are the actual anchor points for the spline.
        for ( var i = 0; i < pointList.length; i++ ) {
            seq.push( pointList[i] );
        }

        // Generate the last "virtual" control point (p2 for the last actual segment).
        // This ensures the curve ends smoothly at the last user-provided point.
        // It extends linearly forwards from the last two points.
        seq.push( generateExtension( seq[seq.length - 2], seq[seq.length - 1] ) );

        // Calculate the total number of segments.
        // For N real points, we have N-1 segments. With the two virtual points,
        // the `seq` array will have N+2 points.
        // A Catmull-Rom segment requires 4 control points (p_1, p0, p1, p2).
        // So, if seq has M points, there are M-3 possible segments.
        numSegments = seq.length - 3;

        /**
         * Calculates the interpolated position along the spline at a given time `t`.
         *
         * @param {number} t - The global time parameter (0.0 to 1.0) for the entire spline.
         * @returns {object} An object with `left` and `top` properties, representing
         *                   the calculated [x, y] position in pixels.
         */
        res.getPos = function ( t ) {

            // Determine which segment the current time 't' falls into.
            // For now, we assume all segments take an equal amount of time to traverse.
            var segNum = Math.floor( t * numSegments );

            // Handle the edge case where 't' is exactly 1.0 (end of the animation).
            // In this scenario, we should return the exact last waypoint provided.
            if ( segNum === numSegments ) {
                return {
                    left: seq[seq.length - 2][0], // The last actual point's X coordinate.
                    top:  seq[seq.length - 2][1]  // The last actual point's Y coordinate.
                };
            }

            // Calculate the 'microT' parameter for the current segment.
            // This normalizes 't' to be between 0.0 and 1.0 for the active segment.
            var microT = ( t - segNum / numSegments ) * numSegments;

            // Perform interpolation for both X (left) and Y (top) coordinates.
            // The four control points for the current segment are:
            // p_1: seq[segNum]
            // p0:  seq[segNum + 1]
            // p1:  seq[segNum + 2]
            // p2:  seq[segNum + 3]
            var result = {
                left: interpolate( microT,
                                   seq[segNum][0],     // p_1 (X)
                                   seq[segNum + 1][0], // p0 (X)
                                   seq[segNum + 2][0], // p1 (X)
                                   seq[segNum + 3][0]  // p2 (X)
                ) + "px", // Append "px" for CSS compatibility.

                top:  interpolate( microT,
                                   seq[segNum][1],     // p_1 (Y)
                                   seq[segNum + 1][1], // p0 (Y)
                                   seq[segNum + 2][1], // p1 (Y)
                                   seq[segNum + 3][1]  // p2 (Y)
                ) + "px"  // Append "px" for CSS compatibility.
            };

            return result; // Return the calculated position.
        };

        return res; // Return the sequence object with the getPos method.
    };

    /**
     * jQuery animation step function for crSpline.
     * This integrates crSpline functionality directly into jQuery's animation engine.
     *
     * When animating a property like `crSpline`, jQuery calls this step function
     * on each animation frame. It expects `fx.end` to be the `crSpline` sequence object
     * returned by `$.crSpline.buildSequence`.
     *
     * @param {object} fx - The jQuery animation properties object for the current step.
     */
    $.fx.step.crSpline = function ( fx ) {

        // Get the current position (left, top) from the spline sequence object
        // based on the animation's current progress (fx.pos, from 0.0 to 1.0).
        var css = fx.end.getPos( fx.pos );

        // Apply the calculated CSS properties to the animated element.
        // The `css` object contains `left` and `top` values with "px" appended.
        for ( var i in css ) {
            fx.elem.style[i] = css[i];
        }
    };

} )( jQuery ); // Pass jQuery into the immediately invoked function expression (IIFE).