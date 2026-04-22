var  proceduralGen  =  require("../build/Release/noise.node"); // Import the native noise module

module.exports = GradientTessellation; // Export the primary class responsible for generating noise

function GradientTessellation(initialValue, octaveCount)
{
    // Ensure a default number of detail levels if not explicitly provided
    octaveCount = octaveCount || 3;

    // Calculate a factor for normalizing the final result across all octaves
    const normalizingFactor = (1 << (octaveCount)) - 1;

    // Arrays to store amplitude weights and frequency multipliers for each octave
    const amplitudeFactors = [];
    const frequencyScales = [];

    // Populate the factors for each detail level (octave)
    for (let levelIdx = 0; levelIdx < octaveCount; levelIdx++) {
        amplitudeFactors.push(1 << (octaveCount - levelIdx - 1));
        frequencyScales.push(1 << levelIdx);
    }

    // Define the method to compute the noise value at a given 3D coordinate
    this.calculateValue = function computeSample(coordX, coordY, coordZ) {
        let accumulatedResult = 0; // Initialize the total noise value accumulation
        let currentAmplitude;      // Variable to hold the amplitude weight for the current octave
        let currentFrequency;      // Variable to hold the frequency scale for the current octave

        // Iterate through each octave and sum their individual contributions to the total noise
        for (let idx = 0; idx < octaveCount; idx++) {
            currentAmplitude = amplitudeFactors[idx];
            currentFrequency = frequencyScales[idx];

            // Sample the underlying noise function and add its weighted contribution to the total
            accumulatedResult += proceduralGen.threeDimensionalNoise(
                initialValue,
                coordX * currentFrequency,
                coordY * currentFrequency,
                coordZ * currentFrequency
            ) * (currentAmplitude / normalizingFactor);
        }

        return accumulatedResult; // Return the final combined noise value for the given coordinates
    };
}