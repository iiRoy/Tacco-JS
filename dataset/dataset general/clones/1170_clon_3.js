class AudioProcessor {
    // A sophisticated digital signal processing library for audio analysis.
    // This class handles audio input, windowing, FFT, and feature extraction.

    #processingContext;         // The AudioContext instance.
    #inputAudioNode;            // The source audio node connected to the processor.
    #frameBlockSize;            // The size of the audio buffer frame for processing.
    #onAnalysisComplete;        // Callback function to execute after each feature extraction.

    #isAnalysisRunning = false; // Flag to indicate if feature extraction is active.
    #selectedFeatures;          // Array of feature names to extract.

    #internalLog = (message, level = 'info') => {
        // Simple internal logging utility.
        // In a production environment, this might integrate with a more robust logging system.
        const timestamp = new Date().toISOString();
        if (level === 'error') {
            console.error(`[${timestamp}] [AudioProcessor] ERROR: ${message}`);
        } else if (level === 'warn') {
            console.warn(`[${timestamp}] [AudioProcessor] WARN: ${message}`);
        } else {
            // console.log(`[${timestamp}] [AudioProcessor] INFO: ${message}`);
        }
    };

    // Internal utility for calculating spectral moments.
    #calculateSpectralMoment = (momentOrder, amplitudeSpectrum) => {
        if (!amplitudeSpectrum || amplitudeSpectrum.length === 0) {
            this.#internalLog("Amplitude spectrum is empty for moment calculation.", 'warn');
            return 0;
        }

        let numeratorSum = 0;
        let denominatorSum = 0;
        for (let k = 0; k < amplitudeSpectrum.length; k++) {
            const freqBinWeight = Math.abs(amplitudeSpectrum[k]);
            numeratorSum += Math.pow(k, momentOrder) * freqBinWeight;
            denominatorSum += freqBinWeight;
        }

        return denominatorSum === 0 ? 0 : numeratorSum / denominatorSum;
    };

    // Helper to check if a number is a power of two.
    #isPowerOfTwoValidated = (numberToCheck) => {
        if (typeof numberToCheck !== 'number' || numberToCheck <= 0 || !Number.isInteger(numberToCheck)) {
            return false;
        }
        return (numberToCheck & (numberToCheck - 1)) === 0;
    };

    // Window functions storage.
    #windowingFilters = {};
    activeWindowType = "hanning"; // Default windowing function.

    constructor(audCtx, inputNode, frameSize, onProcessComplete) {
        if (!audCtx || !(audCtx instanceof AudioContext)) {
            throw new Error("Invalid AudioContext provided to AudioProcessor.");
        }
        if (!frameSize || !this.#isPowerOfTwoValidated(frameSize)) {
            throw new Error(`Invalid frame size: ${frameSize}. Must be a positive integer power of two.`);
        }

        this.#processingContext = audCtx;
        this.#inputAudioNode = inputNode;
        this.#frameBlockSize = frameSize;
        this.#onAnalysisComplete = onProcessComplete;

        // Initialize windowing functions during construction.
        this.#generateWindowFunctions();

        // Setup the Web Audio API ScriptProcessorNode.
        this.#setupAudioProcessingGraph();

        this.#internalLog(`AudioProcessor initialized with frame size: ${this.#frameBlockSize}`);
    }

    #generateWindowFunctions() {
        const N = this.#frameBlockSize;

        // Hanning Window
        this.#windowingFilters.hanning = new Float32Array(N);
        for (let n = 0; n < N; n++) {
            // Formula from standard DSP texts.
            this.#windowingFilters.hanning[n] = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (N - 1));
        }
        this.#internalLog('Hanning window generated.');

        // Hamming Window
        this.#windowingFilters.hamming = new Float32Array(N);
        for (let n = 0; n < N; n++) {
            // Formula from standard DSP texts.
            this.#windowingFilters.hamming[n] = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (N - 1));
        }
        this.#internalLog('Hamming window generated.');

        // Blackman Window (placeholder, could be fully implemented later if needed)
        // For Type III, we can add a basic structure or remove entirely.
        // Let's add a simplified one here for demonstration of "new fragments".
        this.#windowingFilters.blackman = new Float32Array(N);
        const alpha = 0.16; // Common value for Blackman
        const a0 = (1 - alpha) / 2;
        const a1 = 0.5;
        const a2 = alpha / 2;
        for (let n = 0; n < N; n++) {
            this.#windowingFilters.blackman[n] = a0 - a1 * Math.cos((2 * Math.PI * n) / (N - 1)) + a2 * Math.cos((4 * Math.PI * n) / (N - 1));
        }
        this.#internalLog('Blackman window generated.');
    }

    applyWindowingFilter(signalFrame, windowType) {
        const windowCoefficients = this.#windowingFilters[windowType || this.activeWindowType];
        if (!windowCoefficients) {
            this.#internalLog(`Unknown window type: ${windowType}. Using default Hanning.`, 'warn');
            windowType = 'hanning';
            windowCoefficients = this.#windowingFilters.hanning;
        }

        const outputFrame = new Float32Array(signalFrame.length);
        for (let i = 0; i < signalFrame.length; i++) {
            outputFrame[i] = signalFrame[i] * windowCoefficients[i];
        }
        return outputFrame;
    }

    setInputAudioSource(newSourceNode) {
        if (!newSourceNode) {
            this.#internalLog("Attempted to set null or undefined audio source.", 'warn');
            return;
        }
        this.#inputAudioNode = newSourceNode;
        // Re-connect the new source if the processor is active.
        if (this.#isAnalysisRunning) {
            this.#inputAudioNode.connect(this.audioScriptProcessor);
        }
        this.#internalLog('Audio input source updated.');
    }

    // --- Feature Metadata (simplified for Type III) ---
    static featureSpecifications = {
        "audioBuffer": { description: "Raw audio samples of the current frame.", type: "Float32Array" },
        "rmsValue": { description: "Root Mean Square energy of the signal.", type: "number" },
        "totalEnergy": { description: "Total signal energy.", type: "number" },
        "zeroCrossings": { description: "Number of zero crossings.", type: "number" },
        "complexSpectrumData": { description: "Complex FFT output (real and imaginary parts).", type: "object" },
        "amplitudeSpectrumData": { description: "Magnitude spectrum of the signal.", type: "Float32Array" },
        "powerSpectrumData": { description: "Power spectrum (amplitude squared).", type: "Float32Array" },
        "spectralCentroid": { description: "Center of mass of the spectrum.", type: "number" },
        "spectralFlatness": { description: "Measure of how flat or noisy the spectrum is.", type: "number" },
        "spectralSlopeCoefficient": { description: "Slope of the spectrum's linear regression.", type: "number" },
        "spectralRolloffPoint": { description: "Frequency below which a specified percentage of the total spectral energy lies.", type: "number" },
        "spectralSpread": { description: "Standard deviation of the spectrum around its centroid.", type: "number" },
        "spectralSkewness": { description: "Asymmetry of the spectrum.", type: "number" },
        "spectralKurtosis": { description: "Peakiness or flatness of the spectrum.", type: "number" },
        "perceivedLoudness": { description: "Loudness in Bark scale bands and total loudness.", type: "object" },
        "perceptualSpread": { description: "Perceptual spread index.", type: "number" },
        "perceptualSharpness": { description: "Perceptual sharpness index.", type: "number" },
        "mfccs": { description: "Mel-Frequency Cepstral Coefficients.", type: "Float32Array" }
    };

    // --- Feature Computation Handlers ---
    #featureCalculators = {
        "audioBuffer": (context) => context.currentSignalFrame,
        "rmsValue": (context) => {
            let sumOfSquares = context.currentSignalFrame.reduce((sum, val) => sum + val * val, 0);
            return Math.sqrt(sumOfSquares / context.currentSignalFrame.length);
        },
        "totalEnergy": (context) => {
            return context.currentSignalFrame.reduce((sum, val) => sum + Math.abs(val) * Math.abs(val), 0);
        },
        "complexSpectrumData": (context) => context.complexFrequencyData,
        "spectralSlopeCoefficient": (context) => {
            const ampSpec = context.amplitudeSpectrumData;
            if (ampSpec.length < 2) return 0; // Guard against insufficient data

            let ampSum = 0;
            let freqSum = 0;
            let powFreqSum = 0;
            let ampFreqSum = 0;
            const N = ampSpec.length;
            const sampleRate = context.processingContext.sampleRate;
            const binWidth = sampleRate / context.frameBlockSize;

            for (let i = 0; i < N; i++) {
                const currentFreq = i * binWidth;
                ampSum += ampSpec[i];
                freqSum += currentFreq;
                powFreqSum += currentFreq * currentFreq;
                ampFreqSum += currentFreq * ampSpec[i];
            }

            const numerator = N * ampFreqSum - freqSum * ampSum;
            const denominator = ampSum * (powFreqSum - (freqSum * freqSum) / N); // Corrected denominator based on linear regression formula.
            return denominator === 0 ? 0 : numerator / denominator;
        },
        "spectralCentroid": (context) => this.#calculateSpectralMoment(1, context.amplitudeSpectrumData),
        "spectralRolloffPoint": (context) => {
            const ampSpec = context.amplitudeSpectrumData;
            if (ampSpec.length === 0) return 0;

            const totalEnergy = ampSpec.reduce((sum, val) => sum + val, 0);
            const thresholdEnergy = 0.99 * totalEnergy; // 99% rolloff
            const binWidth = context.processingContext.sampleRate / context.frameBlockSize;

            let cumulativeEnergy = 0;
            for (let i = 0; i < ampSpec.length; i++) {
                cumulativeEnergy += ampSpec[i];
                if (cumulativeEnergy >= thresholdEnergy) {
                    return i * binWidth;
                }
            }
            return (ampSpec.length - 1) * binWidth; // If threshold not met, return max freq.
        },
        "spectralFlatness": (context) => {
            const ampSpec = context.amplitudeSpectrumData;
            if (ampSpec.length === 0) return 0;

            let logSum = 0;
            let sum = 0;
            const N = ampSpec.length;

            for (let i = 0; i < N; i++) {
                const val = ampSpec[i] > 0 ? ampSpec[i] : 1e-10; // Avoid log(0)
                logSum += Math.log(val);
                sum += ampSpec[i];
            }

            const geometricMean = Math.exp(logSum / N);
            const arithmeticMean = sum / N;

            return arithmeticMean === 0 ? 0 : geometricMean / arithmeticMean;
        },
        "spectralSpread": (context) => {
            const ampSpec = context.amplitudeSpectrumData;
            const centroid = this.#calculateSpectralMoment(1, ampSpec);
            const secondMoment = this.#calculateSpectralMoment(2, ampSpec);
            return Math.sqrt(Math.max(0, secondMoment - Math.pow(centroid, 2))); // Ensure non-negative under sqrt
        },
        "spectralSkewness": (context) => {
            const ampSpec = context.amplitudeSpectrumData;
            const m1 = this.#calculateSpectralMoment(1, ampSpec);
            const m2 = this.#calculateSpectralMoment(2, ampSpec);
            const m3 = this.#calculateSpectralMoment(3, ampSpec);

            const stdDev = Math.sqrt(Math.max(0, m2 - Math.pow(m1, 2)));
            if (stdDev === 0) return 0;

            const numerator = m3 - 3 * m1 * m2 + 2 * Math.pow(m1, 3);
            const denominator = Math.pow(stdDev, 3);
            return numerator / denominator;
        },
        "spectralKurtosis": (context) => {
            const ampSpec = context.amplitudeSpectrumData;
            const m1 = this.#calculateSpectralMoment(1, ampSpec);
            const m2 = this.#calculateSpectralMoment(2, ampSpec);
            const m3 = this.#calculateSpectralMoment(3, ampSpec);
            const m4 = this.#calculateSpectralMoment(4, ampSpec);

            const stdDev = Math.sqrt(Math.max(0, m2 - Math.pow(m1, 2)));
            if (stdDev === 0) return 0;

            const numerator = m4 - 4 * m1 * m3 + 6 * Math.pow(m1, 2) * m2 - 3 * Math.pow(m1, 4);
            const denominator = Math.pow(stdDev, 4);
            return numerator / denominator;
        },
        "amplitudeSpectrumData": (context) => context.amplitudeSpectrumData,
        "zeroCrossings": (context) => {
            let zcrCount = 0;
            const signal = context.currentSignalFrame;
            for (let i = 0; i < signal.length - 1; i++) {
                if ((signal[i] >= 0 && signal[i + 1] < 0) || (signal[i] < 0 && signal[i + 1] >= 0)) {
                    zcrCount++;
                }
            }
            return zcrCount;
        },
        "powerSpectrumData": (context) => {
            const ampSpec = context.amplitudeSpectrumData;
            return ampSpec.map(val => val * val);
        },
        "perceivedLoudness": (context) => {
            const ampSpec = context.amplitudeSpectrumData;
            if (ampSpec.length === 0) return { specific: [], total: 0 };

            const NUM_BARK_BANDS = 24;
            const specificLoudness = new Float32Array(NUM_BARK_BANDS);
            let totalLoudness = 0;

            const freqToBark = (freq) => 13 * Math.atan(freq / 1315.8) + 3.5 * Math.atan(Math.pow((freq / 7518), 2));
            const sampleRate = context.processingContext.sampleRate;
            const binWidth = sampleRate / context.frameBlockSize;

            // Calculate Bark scale limits
            const barkLimits = new Int32Array(NUM_BARK_BANDS + 1);
            const maxFreqInBark = freqToBark(sampleRate / 2);
            const barkBandWidth = maxFreqInBark / NUM_BARK_BANDS;

            barkLimits[0] = 0;
            let currentBarkBand = 1;
            for (let i = 0; i < ampSpec.length; i++) {
                const currentFreq = i * binWidth;
                const currentBark = freqToBark(currentFreq);
                while (currentBark > currentBarkBand * barkBandWidth && currentBarkBand <= NUM_BARK_BANDS) {
                    barkLimits[currentBarkBand++] = i;
                }
            }
            barkLimits[NUM_BARK_BANDS] = ampSpec.length;

            // Process specific loudness
            for (let i = 0; i < NUM_BARK_BANDS; i++) {
                let bandSum = 0;
                for (let j = barkLimits[i]; j < barkLimits[i + 1]; j++) {
                    bandSum += ampSpec[j];
                }
                specificLoudness[i] = Math.pow(bandSum, 0.23); // Power law for loudness perception
            }

            // Calculate total loudness
            totalLoudness = specificLoudness.reduce((sum, val) => sum + val, 0);

            return {
                specific: specificLoudness,
                total: totalLoudness
            };
        },
        "perceptualSpread": (context) => {
            const loudnessResult = this.#featureCalculators.perceivedLoudness(context);
            const specific = loudnessResult.specific;
            const total = loudnessResult.total;

            if (specific.length === 0 || total === 0) return 0;

            let maxSpecificLoudness = 0;
            for (const val of specific) {
                if (val > maxSpecificLoudness) {
                    maxSpecificLoudness = val;
                }
            }

            // Ensure the value inside pow is non-negative
            const innerValue = Math.max(0, (total - maxSpecificLoudness) / total);
            return Math.pow(innerValue, 2);
        },
        "perceptualSharpness": (context) => {
            const loudnessResult = this.#featureCalculators.perceivedLoudness(context);
            const specific = loudnessResult.specific;
            const total = loudnessResult.total;

            if (specific.length === 0 || total === 0) return 0;

            let sharpnessSum = 0;
            for (let i = 0; i < specific.length; i++) {
                if (i < 15) { // Assuming 1-based indexing in original, adjusting for 0-based
                    sharpnessSum += (i + 1) * specific[i];
                } else {
                    sharpnessSum += 0.066 * Math.exp(0.171 * (i + 1)) * specific[i];
                }
            }
            return (0.11 / total) * sharpnessSum;
        },
        "mfccs": (context) => {
            const powerSpectrum = this.#featureCalculators.powerSpectrumData(context);
            if (powerSpectrum.length === 0) return new Float32Array(0);

            const freqToMel = (freq) => 1125 * Math.log(1 + (freq / 700));
            const melToFreq = (mel) => 700 * (Math.exp(mel / 1125) - 1);

            const numFilters = 26; // Standard number of filters
            const numCoefficients = 13; // Standard number of MFCCs

            const sampleRate = context.processingContext.sampleRate;
            const nyquistFreq = sampleRate / 2;
            const fftSize = context.frameBlockSize;

            const lowerMel = freqToMel(0);
            const upperMel = freqToMel(nyquistFreq);
            const melStep = (upperMel - lowerMel) / (numFilters + 1);

            const filterBankMels = Array.from({ length: numFilters + 2 }, (_, i) => lowerMel + i * melStep);
            const filterBankHz = filterBankMels.map(melToFreq);
            const filterBankBins = filterBankHz.map(hz => Math.floor(((fftSize / 2) + 1) * hz / nyquistFreq));

            const melFilterBank = Array.from({ length: numFilters }, () => new Float32Array(fftSize / 2 + 1).fill(0));

            for (let j = 0; j < numFilters; j++) {
                const leftBin = filterBankBins[j];
                const centerBin = filterBankBins[j + 1];
                const rightBin = filterBankBins[j + 2];

                // Rising slope
                for (let i = leftBin; i <= centerBin; i++) {
                    melFilterBank[j][i] = (i - leftBin) / (centerBin - leftBin);
                }
                // Falling slope
                for (let i = centerBin; i <= rightBin; i++) {
                    melFilterBank[j][i] = (rightBin - i) / (rightBin - centerBin);
                }
            }

            const loggedMelBandEnergies = new Float32Array(numFilters);
            for (let i = 0; i < numFilters; i++) {
                let bandEnergy = 0;
                for (let j = 0; j < powerSpectrum.length; j++) {
                    bandEnergy += powerSpectrum[j] * melFilterBank[i][j];
                }
                loggedMelBandEnergies[i] = Math.log(Math.max(1e-10, bandEnergy)); // Ensure log is not on zero
            }

            // DCT (Discrete Cosine Transform)
            const mfccs = new Float32Array(numCoefficients);
            const N = numFilters;
            for (let k = 0; k < numCoefficients; k++) {
                let sum = 0;
                for (let n = 0; n < N; n++) {
                    sum += loggedMelBandEnergies[n] * Math.cos(Math.PI * k * (n + 0.5) / N);
                }
                mfccs[k] = sum * Math.sqrt(2 / N);
                if (k === 0) { // For the 0th coefficient, it's sqrt(1/N)
                    mfccs[k] *= (1 / Math.sqrt(2));
                }
            }
            return mfccs;
        }
    };

    // --- Audio Graph Setup ---
    audioScriptProcessor; // Public reference for connection (e.g., from inputNode)

    #setupAudioProcessingGraph() {
        // Create an AudioWorkletNode for better performance and flexibility if available,
        // otherwise fallback to ScriptProcessorNode.
        // For Type III clone, let's stick to ScriptProcessorNode as in original but rename it.
        this.audioScriptProcessor = this.#processingContext.createScriptProcessor(this.#frameBlockSize, 1, 1);
        this.audioScriptProcessor.connect(this.#processingContext.destination); // Connect to speakers

        // If an input node was provided during construction, connect it.
        if (this.#inputAudioNode) {
            this.#inputAudioNode.connect(this.audioScriptProcessor);
        }

        this.audioScriptProcessor.onaudioprocess = (eventData) => {
            // Get raw audio samples from the input buffer.
            const rawAudioSamples = eventData.inputBuffer.getChannelData(0);
            this.currentSignalFrame = rawAudioSamples;

            // Apply windowing to the signal.
            const filteredSignalFrame = this.applyWindowingFilter(this.currentSignalFrame, this.activeWindowType);

            // Prepare data for FFT.
            const fftInputBuffer = new complex_array.ComplexArray(this.#frameBlockSize);
            fftInputBuffer.map((value, i) => {
                value.real = filteredSignalFrame[i];
            });

            // Perform FFT.
            const transformedSpectrum = fftInputBuffer.FFT();
            this.complexFrequencyData = transformedSpectrum;

            // Calculate amplitude spectrum.
            this.amplitudeSpectrumData = new Float32Array(this.#frameBlockSize / 2);
            for (let i = 0; i < this.#frameBlockSize / 2; i++) {
                this.amplitudeSpectrumData[i] = Math.sqrt(
                    transformedSpectrum.real[i] * transformedSpectrum.real[i] +
                    transformedSpectrum.imag[i] * transformedSpectrum.imag[i]
                );
            }

            // If extraction is active and a callback is provided, compute features.
            if (this.#isAnalysisRunning && typeof this.#onAnalysisComplete === "function") {
                try {
                    const computedResults = this.retrieveFeatures(this.#selectedFeatures);
                    this.#onAnalysisComplete(computedResults);
                } catch (error) {
                    this.#internalLog(`Error during feature computation: ${error.message}`, 'error');
                }
            }
        };
        this.#internalLog('Audio processing graph and event listener set up.');
    }

    // --- Control Methods ---
    activateFeatureExtraction(featuresToExtract) {
        if (!Array.isArray(featuresToExtract) || featuresToExtract.length === 0) {
            this.#internalLog("No features specified for extraction. Please provide an array of feature names.", 'warn');
            return;
        }
        this.#selectedFeatures = featuresToExtract;
        this.#isAnalysisRunning = true;
        this.#internalLog(`Feature extraction activated for: ${featuresToExtract.join(', ')}`);
    }

    deactivateFeatureExtraction() {
        this.#isAnalysisRunning = false;
        this.#internalLog('Feature extraction deactivated.');
    }

    retrieveFeatures(featureNames) {
        const results = {};
        if (!featureNames || !Array.isArray(featureNames)) {
            this.#internalLog("Invalid feature list provided for retrieval.", 'warn');
            return results;
        }

        for (const featureName of featureNames) {
            const calculator = this.#featureCalculators[featureName];
            if (calculator) {
                try {
                    // Pass `this` (the AudioProcessor instance) as context to calculators.
                    results[featureName] = calculator(this);
                } catch (e) {
                    this.#internalLog(`Failed to compute feature '${featureName}': ${e.message}`, 'error');
                    results[featureName] = null; // Indicate failure
                }
            } else {
                this.#internalLog(`Requested feature '${featureName}' is not available.`, 'warn');
                results[featureName] = undefined;
            }
        }
        return results;
    }

    destroy() {
        // Disconnect and release resources to prevent memory leaks.
        if (this.audioScriptProcessor) {
            this.audioScriptProcessor.disconnect();
            if (this.#inputAudioNode) {
                this.#inputAudioNode.disconnect(this.audioScriptProcessor);
            }
            this.audioScriptProcessor.onaudioprocess = null;
            this.audioScriptProcessor = null;
        }
        this.#internalLog('AudioProcessor resources released.');
    }
}