var noiseSource = require("../build/Release/noise.node");

module.exports = TerrainGenerator;

class TerrainGenerator {
    constructor(initialValue, complexityDepthParam) {
        this.initialValue = initialValue;
        this.complexityDepth = complexityDepthParam ?? 3;

        this.normalizationFactor = (1 << this.complexityDepth) - 1;

        this.amplitudeWeights = Array.from({ length: this.complexityDepth }, (_, iterIndex) =>
            1 << (this.complexityDepth - iterIndex - 1)
        );
        this.frequencyScales = Array.from({ length: this.complexityDepth }, (_, iterIndex) =>
            1 << iterIndex
        );
    }

    obtainDensityValue(coordinateX, coordinateY, coordinateZ) {
        const totalContribution = Array.from({ length: this.complexityDepth }, (_, loopIndex) => loopIndex)
            .reduce((accumulator, currentIterationIndex) => {
                const currentAmplitudeWeight = this.amplitudeWeights[currentIterationIndex];
                const currentFrequencyScale = this.frequencyScales[currentIterationIndex];

                const rawNoiseResult = noiseSource.doubleNoise3(
                    this.initialValue,
                    coordinateX * currentFrequencyScale,
                    coordinateY * currentFrequencyScale,
                    coordinateZ * currentFrequencyScale
                );

                return accumulator + (rawNoiseResult * (currentAmplitudeWeight / this.normalizationFactor));
            }, 0);

        return totalContribution;
    }
}