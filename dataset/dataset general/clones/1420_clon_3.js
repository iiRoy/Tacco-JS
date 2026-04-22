const nativeNoiseModule = require("../build/Release/noise.node");

// A small, internal utility function to compute powers of two
// using bitwise left shift, which is often more performant than Math.pow.
const computeBinaryPower = (exponent) => {
  // Ensure exponent is a non-negative integer for valid bit shifting.
  if (typeof exponent !== 'number' || !Number.isInteger(exponent) || exponent < 0) {
    console.error("Invalid exponent provided to computeBinaryPower. Defaulting to 0.");
    return 1; // 2^0
  }
  return 1 << exponent;
};

/**
 * @class OctavePerlinGenerator
 * @description This class provides a mechanism to generate Perlin noise
 *              by blending multiple layers (octaves) of a base noise function.
 *              This technique creates richer, more organic-looking noise patterns.
 * @param {number} initialSeed - The fundamental seed value that dictates the
 *                                overall randomness of the noise patterns.
 * @param {number} [numberOfOctaves=3] - Specifies the count of noise layers
 *                                       to be combined. A higher number typically
 *                                       introduces more detail but increases computation.
 */
function OctavePerlinGenerator(initialSeed, numberOfOctaves) {
    // --- Configuration and Input Sanitization ---

    // Validate the provided seed. If it's not an integer, a warning is issued,
    // and the seed is coerced to a default value of 0 to ensure stability.
    if (typeof initialSeed !== 'number' || !Number.isInteger(initialSeed)) {
        console.warn("OctavePerlinGenerator: Non-integer seed detected. Using 0 as the default seed.");
        initialSeed = 0;
    }

    // Determine the effective number of octaves.
    // It defaults to 3 if not provided or invalid, is clamped to a minimum of 1,
    // and capped at a maximum of 8 to balance detail with performance.
    let validatedOctaveCount = Math.max(1, Math.floor(numberOfOctaves ?? 3));
    if (validatedOctaveCount > 8) {
        console.warn(`OctavePerlinGenerator: Requested ${validatedOctaveCount} octaves. Capped at 8 for optimal performance.`);
        validatedOctaveCount = 8;
    }

    // An internal configuration object to encapsulate all pre-calculated and
    // immutable settings for this specific noise generator instance.
    const generatorSettings = {
        baseSeedValue: initialSeed,
        actualOctaveCount: validatedOctaveCount,
        weightingCoefficients: [], // Stores the influence factor for each octave.
        frequencyMultipliers: []   // Stores the scaling factor for coordinates for each octave.
    };

    // --- Pre-computation of Octave-Specific Parameters ---

    // The total sum of all weighting coefficients. This value is used to
    // normalize the final accumulated noise, ensuring its output range is consistent.
    const cumulativeWeightSum = computeBinaryPower(generatorSettings.actualOctaveCount) - 1;

    // Iterate through each octave to pre-calculate its unique weighting coefficient
    // and frequency multiplier. This avoids redundant calculations during noise generation.
    for (let currentLayerIndex = 0; currentLayerIndex < generatorSettings.actualOctaveCount; currentLayerIndex++) {
        // Weighting coefficients decrease for higher-frequency octaves,
        // making the coarser details more prominent.
        generatorSettings.weightingCoefficients.push(
            computeBinaryPower(generatorSettings.actualOctaveCount - currentLayerIndex - 1)
        );

        // Frequency multipliers increase for higher-frequency octaves,
        // effectively "zooming in" to reveal finer details.
        generatorSettings.frequencyMultipliers.push(
            computeBinaryPower(currentLayerIndex)
        );
    }

    // --- Public Interface for Noise Generation ---

    /**
     * Calculates the final, blended Perlin noise value for a given 3D point.
     * This method iterates through all configured octaves, computes their
     * individual noise contributions, and combines them into a single result.
     * @param {number} coordinateX - The X-coordinate for noise sampling.
     * @param {number} coordinateY - The Y-coordinate for noise sampling.
     * @param {number} coordinateZ - The Z-coordinate for noise sampling.
     * @returns {number} The normalized noise value, typically in the range [0, 1] or [-1, 1],
     *                   depending on the underlying native noise implementation.
     */
    this.fetchBlendedNoise = function(coordinateX, coordinateY, coordinateZ) {
        let totalNoiseAccumulation = 0.0; // Initialize a variable to sum up noise contributions.

        // Loop through each pre-configured octave to compute its impact on the total noise.
        for (let octaveIterator = 0; octaveIterator < generatorSettings.actualOctaveCount; octaveIterator++) {
            const currentWeight = generatorSettings.weightingCoefficients[octaveIterator];
            const currentFrequency = generatorSettings.frequencyMultipliers[octaveIterator];

            // Scale the input coordinates based on the current octave's frequency.
            const scaledXInput = coordinateX * currentFrequency;
            const scaledYInput = coordinateY * currentFrequency;
            const scaledZInput = coordinateZ * currentFrequency;

            // Query the native noise module for the raw noise value at the scaled coordinates.
            const rawOctaveNoise = nativeNoiseModule.doubleNoise3(
                generatorSettings.baseSeedValue,
                scaledXInput,
                scaledYInput,
                scaledZInput
            );

            // Add the weighted and normalized contribution of this octave to the overall sum.
            totalNoiseAccumulation += rawOctaveNoise * (currentWeight / cumulativeWeightSum);
        }

        return totalNoiseAccumulation; // Return the final, multi-octave noise value.
    };
}

// Export the OctavePerlinGenerator constructor as the primary module export.
module.exports = OctavePerlinGenerator;