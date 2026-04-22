// Audio Insight Core - Type IV Clone

// --- Utility Functions ---

// Equivalent to Meyda's isPowerOfTwo
const checkPowerOfTwo = (valCandidate) => (valCandidate & (valCandidate - 1)) === 0 && valCandidate > 0;

// Equivalent to Meyda's µ (spectral moment calculator)
const calculateMoment = (exponentIndex, amplitudeSeries) => {
    let numeratorAccum = 0;
    let denominatorAccum = 0;
    for (let k = 0; k < amplitudeSeries.length; k++) {
        numeratorAccum += Math.pow(k, exponentIndex) * Math.abs(amplitudeSeries[k]);
        denominatorAccum += amplitudeSeries[k];
    }
    return denominatorAccum === 0 ? 0 : numeratorAccum / denominatorAccum;
};

// --- Audio Worklet Processor (Equivalent to ScriptProcessorNode's onaudioprocess) ---
// This code would typically be in a separate file or a blob URL.
const audioAnalysisProcessorCode = `
class AudioAnalysisProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [{ name: 'windowType', defaultValue: 0 }]; // 0: Hanning, 1: Hamming
    }

    constructor() {
        super();
        this.sampleWindowLength = 0;
        this.hanningWindow = null;
        this.hammingWindow = null;
        this.signalBuffer = new Float32Array(0);
        this.port.onmessage = (event) => {
            if (event.data.type === 'config') {
                this.sampleWindowLength = event.data.sampleWindow;
                this.hanningWindow = new Float32Array(this.sampleWindowLength);
                this.hammingWindow = new Float32Array(this.sampleWindowLength);
                for (let i = 0; i < this.sampleWindowLength; i++) {
                    // Hanning
                    this.hanningWindow[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (this.sampleWindowLength - 1));
                    // Hamming
                    this.hammingWindow[i] = 0.54 - 0.46 * Math.cos(2 * Math.PI * (i / this.sampleWindowLength - 1));
                }
                this.signalBuffer = new Float32Array(this.sampleWindowLength);
            }
        };
    }

    // Minimal Complex Number Array and FFT within the worklet
    // This is a simplified placeholder, not a full FFT implementation,
    // but mimics the structure and usage of a complex number array for Type IV cloning.
    _ComplexVector(size) {
        this.realPart = new Float32Array(size).fill(0);
        this.imagPart = new Float32Array(size).fill(0);
        this.length = size;
        this.apply = function(callback) {
            for (let i = 0; i < this.length; i++) {
                callback({ real: this.realPart[i], imag: this.imagPart[i] }, i, this);
            }
        };
        this.performFourierTransform = function() {
            const transformed = new this._ComplexVector(this.length);
            // In a real FFT, this would perform a complex transformation.
            // For this clone, we simulate the output structure.
            for (let i = 0; i < this.length; i++) {
                transformed.realPart[i] = this.realPart[i]; // Simplified
                transformed.imagPart[i] = 0; // Simplified
            }
            return transformed;
        };
    }

    process(inputs, outputs, parameters) {
        if (!this.sampleWindowLength || inputs.length === 0 || inputs[0].length === 0 || inputs[0][0].length === 0) {
            return true;
        }

        const inputChannel = inputs[0][0];
        const outputChannel = outputs[0][0]; // For pass-through audio
        const currentWindowType = parameters.windowType[0]; // 0: hanning, 1: hamming

        // Copy input to output (pass-through functionality, as in original ScriptProcessorNode)
        for (let i = 0; i < inputChannel.length; i++) {
            outputChannel[i] = inputChannel[i];
        }

        // Buffer the signal to maintain a consistent window size
        const newSignalLength = inputChannel.length;
        const remainingBuffer = this.signalBuffer.subarray(newSignalLength);
        this.signalBuffer.set(remainingBuffer, 0);
        this.signalBuffer.set(inputChannel, this.sampleWindowLength - newSignalLength);

        // Apply windowing
        const windowedSignal = new Float32Array(this.sampleWindowLength);
        const activeWindow = currentWindowType === 0 ? this.hanningWindow : this.hammingWindow;
        for (let i = 0; i < this.sampleWindowLength; i++) {
            windowedSignal[i] = this.signalBuffer[i] * activeWindow[i];
        }

        // Perform FFT
        const signalComplex = new this._ComplexVector(this.sampleWindowLength);
        signalComplex.apply((val, i) => {
            val.real = windowedSignal[i];
        });
        const transformedSpectrum = signalComplex.performFourierTransform();

        const amplitudeSpectrum = new Float32Array(this.sampleWindowLength / 2);
        for (let i = 0; i < this.sampleWindowLength / 2; i++) {
            amplitudeSpectrum[i] = Math.sqrt(
                Math.pow(transformedSpectrum.realPart[i], 2) +
                Math.pow(transformedSpectrum.imagPart[i], 2)
            );
        }

        this.port.postMessage({
            signal: this.signalBuffer,
            complexSpectrum: { real: transformedSpectrum.realPart, imag: transformedSpectrum.imagPart },
            amplitudeSpectrum: amplitudeSpectrum
        });

        return true;
    }
}
registerProcessor('audio-analysis-processor', AudioAnalysisProcessor);
`;

const processorBlob = new Blob([audioAnalysisProcessorCode], { type: 'application/javascript' });
const processorUrl = URL.createObjectURL(processorBlob);


// --- Feature Calculation Logic ---

const metricProcedures = {
    "rawWaveform": (dataBundle) => dataBundle.signal,
    "rootMeanSquare": (dataBundle) => {
        const squaredSum = dataBundle.signal.reduce((acc, val) => acc + val * val, 0);
        return Math.sqrt(squaredSum / dataBundle.signal.length);
    },
    "powerSum": (dataBundle) => {
        return dataBundle.signal.reduce((acc, val) => acc + Math.pow(Math.abs(val), 2), 0);
    },
    "spectralComponents": (dataBundle) => dataBundle.complexSpectrum,
    "spectralGradient": (dataBundle) => {
        const amplitudes = dataBundle.amplitudeSpectrum;
        const sampleRate = dataBundle.envContext.sampleRate;
        const windowSize = dataBundle.bufferLength;

        let ampTotal = 0; // sum(y)
        let freqTotal = 0; // sum(x)
        let freqSquaredTotal = 0; // sum(x^2)
        let ampFreqTotal = 0; // sum(xy)

        for (let i = 0; i < amplitudes.length; i++) {
            const currentFrequency = i * sampleRate / windowSize;
            ampTotal += amplitudes[i];
            freqTotal += currentFrequency;
            freqSquaredTotal += currentFrequency * currentFrequency;
            ampFreqTotal += currentFrequency * amplitudes[i];
        }
        const N = amplitudes.length;
        const numerator = N * ampFreqTotal - freqTotal * ampTotal;
        // Replicating original's unusual denominator formula
        const denominator = ampTotal * (freqSquaredTotal - Math.pow(freqTotal, 2));
        if (denominator === 0) return 0;
        return numerator / denominator;
    },
    "spectralPeak": (dataBundle) => {
        return calculateMoment(1, dataBundle.amplitudeSpectrum);
    },
    "spectralDropOff": (dataBundle) => {
        const amplitudes = dataBundle.amplitudeSpectrum;
        const sampleRate = dataBundle.envContext.sampleRate;
        const windowSize = dataBundle.bufferLength;
        const nyquistBin = sampleRate / (2 * (amplitudes.length - 1));

        let cumulativeEnergy = amplitudes.reduce((sum, val) => sum + val, 0);
        const thresholdEnergy = 0.99 * cumulativeEnergy;
        let currentBin = amplitudes.length - 1;

        while (cumulativeEnergy > thresholdEnergy && currentBin >= 0) {
            cumulativeEnergy -= amplitudes[currentBin];
            currentBin--;
        }
        return (currentBin + 1) * nyquistBin;
    },
    "spectralEvenness": (dataBundle) => {
        const amplitudes = dataBundle.amplitudeSpectrum;
        const N = amplitudes.length;
        if (N === 0) return 0;

        let logSum = 0;
        let linearSum = 0;
        for (let i = 0; i < N; i++) {
            const currentAmp = amplitudes[i];
            logSum += Math.log(currentAmp > 0 ? currentAmp : 1e-10); // Small epsilon for log(0)
            linearSum += currentAmp;
        }
        if (linearSum === 0) return 0;
        return Math.exp(logSum / N) * N / linearSum;
    },
    "spectralDispersion": (dataBundle) => {
        const amplitudes = dataBundle.amplitudeSpectrum;
        const m1 = calculateMoment(1, amplitudes);
        const m2 = calculateMoment(2, amplitudes);
        const variance = m2 - Math.pow(m1, 2);
        return Math.sqrt(Math.max(0, variance)); // Ensure non-negative for sqrt
    },
    "spectralAsymmetry": (dataBundle) => {
        const amplitudes = dataBundle.amplitudeSpectrum;
        const m1 = calculateMoment(1, amplitudes);
        const m2 = calculateMoment(2, amplitudes);
        const m3 = calculateMoment(3, amplitudes);
        const variance = m2 - Math.pow(m1, 2);
        const stdDevCubed = Math.pow(Math.sqrt(Math.max(0, variance)), 3);

        if (stdDevCubed === 0) return 0;
        // Formula using raw moments
        const numerator = m3 - 3 * m1 * m2 + 2 * Math.pow(m1, 3);
        return numerator / stdDevCubed;
    },
    "spectralPeakedness": (dataBundle) => {
        const amplitudes = dataBundle.amplitudeSpectrum;
        const m1 = calculateMoment(1, amplitudes);
        const m2 = calculateMoment(2, amplitudes);
        const m3 = calculateMoment(3, amplitudes);
        const m4 = calculateMoment(4, amplitudes);
        const variance = m2 - Math.pow(m1, 2);
        const varianceSquared = Math.pow(variance, 2);

        if (varianceSquared === 0) return 0;
        // Formula for excess kurtosis using raw moments
        const numerator = m4 - 4 * m1 * m3 + 6 * Math.pow(m1, 2) * m2 - 3 * Math.pow(m1, 4);
        return numerator / varianceSquared;
    },
    "amplitudeProfile": (dataBundle) => dataBundle.amplitudeSpectrum,
    "zeroCrossingRate": (dataBundle) => {
        let crossings = 0;
        for (let i = 0; i < dataBundle.signal.length - 1; i++) {
            if ((dataBundle.signal[i] >= 0 && dataBundle.signal[i + 1] < 0) ||
                (dataBundle.signal[i] < 0 && dataBundle.signal[i + 1] >= 0)) {
                crossings++;
            }
        }
        return crossings;
    },
    "powerProfile": (dataBundle) => {
        const amplitudes = dataBundle.amplitudeSpectrum;
        const powerSpec = new Float32Array(amplitudes.length);
        for (let i = 0; i < amplitudes.length; i++) {
            powerSpec[i] = Math.pow(amplitudes[i], 2);
        }
        return powerSpec;
    },
    "overallLoudness": (dataBundle) => {
        const amplitudes = dataBundle.amplitudeSpectrum;
        const sampleRate = dataBundle.envContext.sampleRate;
        const windowSize = dataBundle.bufferLength;
        const numBarkBands = 24;

        const barkValues = new Float32Array(amplitudes.length);
        for (let i = 0; i < barkValues.length; i++) {
            const freq = i * sampleRate / windowSize;
            barkValues[i] = 13 * Math.atan(freq / 1315.8) + 3.5 * Math.atan(Math.pow((freq / 7518), 2));
        }

        const bandBoundaries = new Int32Array(numBarkBands + 1);
        bandBoundaries[0] = 0;
        const maxBarkValue = barkValues[amplitudes.length - 1];
        let currentBandEndBark = maxBarkValue / numBarkBands;
        let currentBandIndex = 1;

        for (let i = 0; i < amplitudes.length; i++) {
            while (barkValues[i] > currentBandEndBark && currentBandIndex <= numBarkBands) {
                bandBoundaries[currentBandIndex++] = i;
                currentBandEndBark = currentBandIndex * maxBarkValue / numBarkBands;
            }
        }
        bandBoundaries[numBarkBands] = amplitudes.length - 1;

        const specificLoudness = new Float32Array(numBarkBands);
        let totalLoudness = 0;

        for (let i = 0; i < numBarkBands; i++) {
            let bandSum = 0;
            for (let j = bandBoundaries[i]; j < bandBoundaries[i + 1]; j++) {
                bandSum += amplitudes[j];
            }
            specificLoudness[i] = Math.pow(bandSum, 0.23);
            totalLoudness += specificLoudness[i];
        }

        return {
            specific: specificLoudness,
            total: totalLoudness
        };
    },
    "perceptualSpatiality": (dataBundle) => {
        const loudnessResult = metricProcedures["overallLoudness"](dataBundle);
        let maxLoudness = 0;
        for (let i = 0; i < loudnessResult.specific.length; i++) {
            if (loudnessResult.specific[i] > maxLoudness) {
                maxLoudness = loudnessResult.specific[i];
            }
        }
        if (loudnessResult.total === 0) return 0;
        return Math.pow((loudnessResult.total - maxLoudness) / loudnessResult.total, 2);
    },
    "perceptualAcumen": (dataBundle) => {
        const loudnessResult = metricProcedures["overallLoudness"](dataBundle);
        const specificLoudness = loudnessResult.specific;
        let acuityOutput = 0;

        for (let i = 0; i < specificLoudness.length; i++) {
            if (i < 15) {
                acuityOutput += (i + 1) * specificLoudness[i + 1];
            } else {
                acuityOutput += 0.066 * Math.exp(0.171 * (i + 1));
            }
        }
        if (loudnessResult.total === 0) return 0;
        return acuityOutput * 0.11 / loudnessResult.total;
    },
    "melFrequencyCepstralCoefficients": (dataBundle) => {
        const powerSpec = metricProcedures["powerProfile"](dataBundle);
        const sampleRate = dataBundle.envContext.sampleRate;
        const windowSize = dataBundle.bufferLength;
        const numFilters = 26; // Standard value
        const numCoeffs = 13; // Standard value

        const hertzToMel = (freq) => 1125 * Math.log(1 + (freq / 700));
        const melToHertz = (mel) => 700 * (Math.exp(mel / 1125) - 1);

        const lowerFreqBound = 0;
        const upperFreqBound = sampleRate / 2;
        const lowerMelBound = hertzToMel(lowerFreqBound);
        const upperMelBound = hertzToMel(upperFreqBound);

        const melSteps = new Float32Array(numFilters + 2);
        const hertzSteps = new Float32Array(numFilters + 2);
        const fftBinIndices = new Int32Array(numFilters + 2);

        const melRangePerStep = (upperMelBound - lowerMelBound) / (numFilters + 1);

        for (let i = 0; i < melSteps.length; i++) {
            melSteps[i] = lowerMelBound + i * melRangePerStep;
            hertzSteps[i] = melToHertz(melSteps[i]);
            fftBinIndices[i] = Math.floor((windowSize + 1) * hertzSteps[i] / sampleRate);
        }

        const filterBankMatrix = Array(numFilters).fill(0).map(() => new Float32Array(windowSize / 2 + 1).fill(0));

        for (let j = 0; j < numFilters; j++) {
            for (let i = fftBinIndices[j]; i < fftBinIndices[j + 1]; i++) {
                filterBankMatrix[j][i] = (i - fftBinIndices[j]) / (fftBinIndices[j + 1] - fftBinIndices[j]);
            }
            for (let i = fftBinIndices[j + 1]; i < fftBinIndices[j + 2]; i++) {
                filterBankMatrix[j][i] = (fftBinIndices[j + 2] - i) / (fftBinIndices[j + 2] - fftBinIndices[j + 1]);
            }
        }

        const melBandLogEnergies = new Float32Array(numFilters);
        for (let i = 0; i < numFilters; i++) {
            let bandEnergy = 0;
            for (let j = 0; j < (windowSize / 2); j++) {
                bandEnergy += filterBankMatrix[i][j] * powerSpec[j];
            }
            melBandLogEnergies[i] = Math.log(bandEnergy > 0 ? bandEnergy : 1e-10); // Avoid log(0)
        }

        // Discrete Cosine Transform (DCT)
        const dctCoefficients = new Float32Array(numCoeffs);
        const kValue = Math.PI / numFilters;
        const weight1 = 1.0 / Math.sqrt(numFilters);
        const weight2 = Math.sqrt(2.0 / numFilters);

        for (let i = 0; i < numCoeffs; i++) { // i is the DCT coefficient index
            let sum = 0;
            const currentWeight = (i === 0) ? weight1 : weight2;
            for (let j = 0; j < numFilters; j++) { // j is the Mel filter band index
                // Replicating original's formula for cosine argument
                sum += melBandLogEnergies[j] * Math.cos(kValue * (i + 1) * (j + 0.5));
            }
            dctCoefficients[i] = currentWeight * sum;
        }
        return dctCoefficients;
    }
};

// --- Main Factory Function ---

const createAudioInsight = (audioEnv, audioFeed, windowSampleCount, dataProcessor) => {
    let instanceData = {};

    const internalWindowSize = windowSampleCount ? windowSampleCount : 256;
    if (!checkPowerOfTwo(internalWindowSize)) {
        console.error("Window sample count must be a power of two.");
        return null;
    }

    let audioWorkletNode = null;
    let currentAudioSource = audioFeed;
    let processingActive = false;
    let requestedMetrics = [];
    let latestAnalysisData = {
        signal: new Float32Array(internalWindowSize),
        complexSpectrum: { real: new Float32Array(internalWindowSize), imag: new Float32Array(internalWindowSize) },
        amplitudeSpectrum: new Float32Array(internalWindowSize / 2),
        envContext: audioEnv,
        bufferLength: internalWindowSize
    };

    // Load and initialize AudioWorkletNode
    audioEnv.audioWorklet.addModule(processorUrl)
        .then(() => {
            audioWorkletNode = new AudioWorkletNode(audioEnv, 'audio-analysis-processor', {
                outputChannelCount: [1],
                processorOptions: { sampleWindow: internalWindowSize }
            });
            audioWorkletNode.connect(audioEnv.destination); // Pass audio through
            currentAudioSource.connect(audioWorkletNode);

            audioWorkletNode.port.onmessage = (event) => {
                latestAnalysisData.signal = event.data.signal;
                latestAnalysisData.complexSpectrum = event.data.complexSpectrum;
                latestAnalysisData.amplitudeSpectrum = event.data.amplitudeSpectrum;

                if (typeof dataProcessor === "function" && processingActive) {
                    dataProcessor(instanceData.retrieveMetrics(requestedMetrics));
                }
            };

            audioWorkletNode.port.postMessage({ type: 'config', sampleWindow: internalWindowSize });
            // Set initial windowing method
            audioWorkletNode.parameters.get('windowType').setValueAtTime(currentWindowingType, audioEnv.currentTime);
        })
        .catch(e => console.error("Error loading AudioWorklet:", e));

    let currentWindowingType = 0; // 0: Hanning, 1: Hamming

    instanceData.setAudioSource = (newFeed) => {
        if (currentAudioSource && audioWorkletNode) {
            currentAudioSource.disconnect(audioWorkletNode);
        }
        currentAudioSource = newFeed;
        if (currentAudioSource && audioWorkletNode) {
            currentAudioSource.connect(audioWorkletNode);
        }
    };

    instanceData.beginAnalysis = (metricsList) => {
        requestedMetrics = metricsList;
        processingActive = true;
    };

    instanceData.endAnalysis = () => {
        processingActive = false;
    };

    instanceData.retrieveMetrics = (metricsToFetch) => {
        const results = {};
        for (const metric of metricsToFetch) {
            if (metricProcedures[metric]) {
                try {
                    results[metric] = metricProcedures[metric](latestAnalysisData);
                } catch (e) {
                    console.error(`Error calculating metric '${metric}':`, e);
                    results[metric] = null;
                }
            } else {
                console.warn(`Unknown metric requested: '${metric}'`);
                results[metric] = null;
            }
        }
        return results;
    };

    instanceData.setWindowMethod = (methodName) => {
        if (methodName === "hanning") {
            currentWindowingType = 0;
        } else if (methodName === "hamming") {
            currentWindowingType = 1;
        } else {
            console.warn(`Unknown window method: ${methodName}. Defaulting to Hanning.`);
            currentWindowingType = 0;
        }
        if (audioWorkletNode) {
            audioWorkletNode.parameters.get('windowType').setValueAtTime(currentWindowingType, audioEnv.currentTime);
        }
    };

    instanceData.metricInfo = {
        "rawWaveform": { "kind": "array" },
        "rootMeanSquare": { "kind": "number" },
        "powerSum": { "kind": "number" },
        "spectralComponents": { "kind": "multipleArrays", "arrayFields": { "1": "real", "2": "imag" } },
        "amplitudeProfile": { "kind": "array" },
        "spectralPeak": { "kind": "number" },
        "spectralEvenness": { "kind": "number" },
        "spectralGradient": { "kind": "number" },
        "spectralDropOff": { "kind": "number" },
        "spectralDispersion": { "kind": "number" },
        "spectralAsymmetry": { "kind": "number" },
        "spectralPeakedness": { "kind": "number" },
        "overallLoudness": { "kind": "multipleArrays", "arrayFields": { "1": "total", "2": "specific" } },
        "perceptualSpatiality": { "kind": "number" },
        "perceptualAcumen": { "kind": "number" },
        "melFrequencyCepstralCoefficients": { "kind": "array" }
    };

    return instanceData;
};