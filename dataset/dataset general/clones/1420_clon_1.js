/*
 * This module provides a JavaScript interface for generating Perlin Noise.
 * It leverages a native C++ module for performance-critical noise calculations.
 *
 * The PerlinNoise class allows for the creation of noise instances
 * with specified seeds and varying levels of detail (iterations).
 */


// Require the native C++ add-on module for noise generation.
// This path assumes the module is built and located in the 'build/Release' directory.
var noise = require( "../build/Release/noise.node" ) ;


// Export the PerlinNoise constructor as the primary interface of this module.
module.exports = PerlinNoise ;


/**
 * PerlinNoise constructor function.
 * Initializes a new Perlin noise generator instance.
 *
 * @param {number} seed       A numeric seed to ensure reproducible noise patterns.
 * @param {number} iterations The number of octaves (layers) of noise to combine.
 *                            More iterations result in finer detail. Defaults to 3.
 */
function PerlinNoise( seed , iterations )
{
    // If 'iterations' is not provided or is a falsy value (e.g., 0, null, undefined),
    // default it to 3 for a reasonable balance of detail.
    iterations = iterations || 3 ;

    // Calculate a normalization factor 'divider'.
    // This ensures the final noise value is within a consistent range, typically [0, 1] or [-1, 1].
    // It's derived from the sum of weights for all iterations.
    var divider = ( ( 1 << ( iterations ) ) - 1 ) ;

    // Initialize two arrays: 'multipliers' and 'scales'.
    // These will store pre-calculated values for each noise octave.
    var multipliers = [ ] ;
    var scales      = [ ] ;


    // Loop through each iteration (octave) to populate the 'multipliers' and 'scales' arrays.
    for ( var iter = 0 ; iter < iterations ; iter ++ )
    {
        // Multiplier: Determines the amplitude (weight) of each octave.
        // Later octaves (higher 'iter' values) have smaller multipliers, contributing less to overall amplitude.
        multipliers.push( ( 1 << ( iterations - iter - 1 ) ) ) ;

        // Scale: Determines the frequency (detail) of each octave.
        // Later octaves have larger scales, meaning higher frequencies and more detail.
        scales.push( ( 1 << iter ) ) ;
    }


    /**
     * Public method 'get'.
     * Calculates the Perlin noise value for a given 3D coordinate (x, y, z).
     *
     * @param {number} x The X-coordinate in 3D space.
     * @param {number} y The Y-coordinate in 3D space.
     * @param {number} z The Z-coordinate in 3D space.
     * @returns {number} The computed Perlin noise value, typically normalized.
     */
    this.get = function get( x , y , z )
    {
        // Initialize the accumulated noise value to zero.
        // Declare 'mult' and 'scale' variables for use within the loop.
        var value = 0 , mult , scale ;

        // Iterate through each noise octave.
        for ( var i = 0 ; i < iterations ; i ++ )
        {
            // Retrieve the pre-calculated multiplier and scale for the current octave.
            mult  = multipliers[ i ] ;
            scale = scales[ i ] ;

            // Call the native 'doubleNoise3' function to get the base noise for this octave.
            // The coordinates (x, y, z) are scaled by 'scale' to adjust frequency.
            // The result is then weighted by (mult / divider) and added to the total 'value'.
            value += noise.doubleNoise3( seed , ( x * scale ) , ( y * scale ) , ( z * scale ) ) * ( ( mult / divider ) ) ;
        }

        // Return the final, combined, and normalized Perlin noise value.
        return value ;
    } ;
}