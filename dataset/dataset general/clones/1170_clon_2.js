// Auralis JavaScript Digital Signal Processing framework

var Auralis = function(audioCtxInput, audioInputSource, bufferLength, resultHandler) {
    // Reference to this object
    var instanceRef = this;

    // Default processing block size
    var segmentSize = bufferLength ? bufferLength : 256;

    // Initial audio stream input
    var inputNode = audioInputSource;

    // Control flags for analysis
    var analysisActive = false;
    var _selectedMetrics;

    // Statistical helper function: calculates generalized moments
    var momentCalc = function(order, amplitudeSpectrumInput) {
        var numeratorSum = 0;
        var denominatorSum = 0;
        for (var k_idx = 0; k_idx < amplitudeSpectrumInput.length; k_idx++) {
            numeratorSum += Math.pow(k_idx, order) * Math.abs(amplitudeSpectrumInput[k_idx]);
            denominatorSum += amplitudeSpectrumInput[k_idx];
        }
        return numeratorSum / denominatorSum;
    };

    // Utility to check if a number is a power of two
    var checkPowerOf2 = function(val) {
        while (((val % 2) == 0) && val > 1) {
            val /= 2;
        }
        return (val == 1);
    };

    // SIGNAL WINDOWING FUNCTIONS
    // Set the default windowing method
    instanceRef.currentWindowType = "hanning";

    // Pre-calculate Hanning window coefficients
    instanceRef.hannWindow = new Float64Array(segmentSize);
    for (let currentIdx = 0; currentIdx < segmentSize; currentIdx++) {
        // Based on a common Hanning window formula
        instanceRef.hannWindow[currentIdx] = 0.5 - 0.5 * Math.cos(2 * Math.PI * currentIdx / (segmentSize - 1));
    }

    // Pre-calculate Hamming window coefficients
    instanceRef.hammWindow = new Float64Array(segmentSize);
    for (let currentIdx = 0; currentIdx < segmentSize; currentIdx++) {
        // Following the MATLAB Hamming window definition
        instanceRef.hammWindow[currentIdx] = 0.54 - 0.46 * Math.cos(2 * Math.PI * (currentIdx / segmentSize - 1));
    }

    // TODO: Blackman window implementation is not yet complete

    /*
    instanceRef.blackmanWindow = new Float64Array(segmentSize);
    // Based on the Blackman window formula from MATLAB
    // First half of the window calculation
    for (var i = 0; i < (segmentSize % 2) ? (segmentSize+1)/2 : segmentSize/2; i++) {
        instanceRef.blackmanWindow[i] = 0.42 - 0.5*Math.cos(2*Math.PI*i/(segmentSize-1)) + 0.08*Math.cos(4*Math.PI*i/(segmentSize-1));
    }
    // Symmetrical second half of the window
    for (var i = segmentSize/2; i > 0; i--) {
        instanceRef.blackmanWindow[segmentSize - i] = instanceRef.blackmanWindow[i];
    }
    */

    // Method to apply a selected window function to a signal
    instanceRef.applyWindow = function(inputSignal, methodName) {
        var shapedData = new Float64Array(inputSignal.length);

        if (methodName === "hanning") {
            for (var i_idx = 0; i_idx < inputSignal.length; i_idx++) {
                shapedData[i_idx] = inputSignal[i_idx] * instanceRef.hannWindow[i_idx];
            }
        } else if (methodName === "hamming") {
            for (var i_idx = 0; i_idx < inputSignal.length; i_idx++) {
                shapedData[i_idx] = inputSignal[i_idx] * instanceRef.hammWindow[i_idx];
            }
        } else if (methodName === "blackman") {
            for (var i_idx = 0; i_idx < inputSignal.length; i_idx++) {
                shapedData[i_idx] = inputSignal[i_idx] * instanceRef.blackmanWindow[i_idx];
            }
        }

        return shapedData;
    };

    // Method to update the audio input source
    instanceRef.setAudioInput = function(newAudioSource) {
        inputNode = newAudioSource;
        inputNode.connect(window.dspNode);
    };


    if (checkPowerOf2(segmentSize) && audioCtxInput) {
        // Information about available features
        instanceRef.metricDescriptions = {
            "timeDomainBuffer": {
                "kind": "collection"
            },
            "rootMeanSquare": {
                "kind": "numericValue"
            },
            "signalEnergy": {
                "kind": "numericValue"
            },
            "zeroCrossingRate": {
                "kind": "numericValue"
            },
            "complexSpectrumOutput": {
                "kind": "compoundArrays",
                "arrayLabels": {
                    "1": "realPart",
                    "2": "imagPart"
                }
            },
            "amplitudeSpectrumOutput": {
                "kind": "collection"
            },
            "powerSpectrumOutput": {
                "kind": "collection"
            },
            "spectralCentroidValue": {
                "kind": "numericValue"
            },
            "spectralFlatnessMeasure": {
                "kind": "numericValue"
            },
            "spectralSlopeValue": {
                "kind": "numericValue"
            },
            "spectralRolloffPoint": {
                "kind": "numericValue"
            },
            "spectralSpreadValue": {
                "kind": "numericValue"
            },
            "spectralSkewnessValue": {
                "kind": "numericValue"
            },
            "spectralKurtosisValue": {
                "kind": "numericValue"
            },
            "perceivedLoudness": {
                "kind": "compoundArrays",
                "arrayLabels": {
                    "1": "overall",
                    "2": "detailed"
                }
            },
            "perceptualSpread": {
                "kind": "numericValue"
            },
            "perceptualSharpness": {
                "kind": "numericValue"
            },
            "melFrequencyCepstralCoefficients": {
                "kind": "collection"
            }
        };

        // Functions for extracting various audio features
        instanceRef.metricCalculators = {
            "timeDomainBuffer": function(segmentLen, metricsObj) {
                return metricsObj.currentSignal;
            },
            "rootMeanSquare": function(segmentLen, metricsObj) {

                var calculatedRms = 0;
                for (var i_count = 0; i_count < metricsObj.currentSignal.length; i_count++) {
                    calculatedRms += Math.pow(metricsObj.currentSignal[i_count], 2);
                }
                calculatedRms = calculatedRms / metricsObj.currentSignal.length;
                calculatedRms = Math.sqrt(calculatedRms);

                return calculatedRms;
            },
            "signalEnergy": function(segmentLen, metricsObj) {
                var calculatedEnergy = 0;
                for (var i_count = 0; i_count < metricsObj.currentSignal.length; i_count++) {
                    calculatedEnergy += Math.pow(Math.abs(metricsObj.currentSignal[i_count]), 2);
                }
                return calculatedEnergy;
            },
            "complexSpectrumOutput": function(segmentLen, metricsObj) {
                return metricsObj.complexOutput;
            },
            "spectralSlopeValue": function(segmentLen, metricsObj) {
                // Perform linear regression for slope calculation
                var amplitudeSum = 0;
                var frequencySum = 0;
                var frequenciesArray = new Float64Array(metricsObj.amplitudeOutput.length);
                var freqSquaredSum = 0;
                var ampFreqProductSum = 0;

                for (var i_idx = 0; i_idx < metricsObj.amplitudeOutput.length; i_idx++) {
                    amplitudeSum += metricsObj.amplitudeOutput[i_idx];
                    var currentFrequency = i_idx * metricsObj.audioContextRef.sampleRate / segmentLen;
                    frequenciesArray[i_idx] = currentFrequency;
                    freqSquaredSum += currentFrequency * currentFrequency;
                    frequencySum += currentFrequency;
                    ampFreqProductSum += currentFrequency * metricsObj.amplitudeOutput[i_idx];
                }
                return (metricsObj.amplitudeOutput.length * ampFreqProductSum - frequencySum * amplitudeSum) / (amplitudeSum * (freqSquaredSum - Math.pow(frequencySum, 2)));
            },
            "spectralCentroidValue": function(segmentLen, metricsObj) {
                return momentCalc(1, metricsObj.amplitudeOutput);
            },
            "spectralRolloffPoint": function(segmentLen, metricsObj) {
                var amplitudeSpec = metricsObj.amplitudeOutput;
                // Calculate Nyquist bin frequency
                var nyquistBinFrequency = metricsObj.audioContextRef.sampleRate / (2 * (amplitudeSpec.length - 1));
                var energyAccumulated = 0;
                for (var i_idx = 0; i_idx < amplitudeSpec.length; i_idx++) {
                    energyAccumulated += amplitudeSpec[i_idx];
                }
                var energyThreshold = 0.99 * energyAccumulated;
                var currentBinIndex = amplitudeSpec.length - 1;
                while (energyAccumulated > energyThreshold && currentBinIndex >= 0) {
                    energyAccumulated -= amplitudeSpec[currentBinIndex];
                    --currentBinIndex;
                }
                return (currentBinIndex + 1) * nyquistBinFrequency;
            },
            "spectralFlatnessMeasure": function(segmentLen, metricsObj) {
                var amplitudeSpec = metricsObj.amplitudeOutput;
                var logNumeratorSum = 0;
                var denominatorSum = 0;
                for (var i_idx = 0; i_idx < amplitudeSpec.length; i_idx++) {
                    logNumeratorSum += Math.log(amplitudeSpec[i_idx]);
                    denominatorSum += amplitudeSpec[i_idx];
                }
                return Math.exp(logNumeratorSum / amplitudeSpec.length) * amplitudeSpec.length / denominatorSum;
            },
            "spectralSpreadValue": function(segmentLen, metricsObj) {
                var amplitudeSpec = metricsObj.amplitudeOutput;
                return Math.sqrt(momentCalc(2, amplitudeSpec) - Math.pow(momentCalc(1, amplitudeSpec), 2));
            },
            "spectralSkewnessValue": function(segmentLen, metricsObj, spectrumInput) {
                var amplitudeSpec = metricsObj.amplitudeOutput;
                var firstMoment = momentCalc(1, amplitudeSpec);
                var secondMoment = momentCalc(2, amplitudeSpec);
                var thirdMoment = momentCalc(3, amplitudeSpec);
                var num = 2 * Math.pow(firstMoment, 3) - 3 * firstMoment * secondMoment + thirdMoment;
                var den = Math.pow(Math.sqrt(secondMoment - Math.pow(firstMoment, 2)), 3);
                return num / den;
            },
            "spectralKurtosisValue": function(segmentLen, metricsObj) {
                var amplitudeSpec = metricsObj.amplitudeOutput;
                var firstMoment = momentCalc(1, amplitudeSpec);
                var secondMoment = momentCalc(2, amplitudeSpec);
                var thirdMoment = momentCalc(3, amplitudeSpec);
                var fourthMoment = momentCalc(4, amplitudeSpec);
                var num = -3 * Math.pow(firstMoment, 4) + 6 * firstMoment * secondMoment - 4 * firstMoment * thirdMoment + fourthMoment;
                var den = Math.pow(Math.sqrt(secondMoment - Math.pow(firstMoment, 2)), 4);
                return num / den;
            },
            "amplitudeSpectrumOutput": function(segmentLen, metricsObj) {
                return metricsObj.amplitudeOutput;
            },
            "zeroCrossingRate": function(segmentLen, metricsObj) {
                var zcCount = 0;
                for (var i_idx = 0; i_idx < metricsObj.currentSignal.length; i_idx++) {
                    if ((metricsObj.currentSignal[i_idx] >= 0 && metricsObj.currentSignal[i_idx + 1] < 0) || (metricsObj.currentSignal[i_idx] < 0 && metricsObj.currentSignal[i_idx + 1] >= 0)) {
                        zcCount++;
                    }
                }
                return zcCount;
            },
            "powerSpectrumOutput": function(segmentLen, metricsObj) {
                var outputPowerSpectrum = new Float64Array(metricsObj.amplitudeOutput.length);
                for (var i_idx = 0; i_idx < outputPowerSpectrum.length; i_idx++) {
                    outputPowerSpectrum[i_idx] = Math.pow(metricsObj.amplitudeOutput[i_idx], 2);
                }
                return outputPowerSpectrum;
            },
            "perceivedLoudness": function(segmentLen, metricsObj) {
                var barkBandValues = new Float64Array(metricsObj.amplitudeOutput.length);
                var numBarkBands = 24;
                var specificLoudness = new Float64Array(numBarkBands);
                var totalLoudness = 0;
                var normalizedAmplitudeSpectrum = metricsObj.amplitudeOutput;
                var bandBoundaries = new Uint32Array(numBarkBands + 1);

                for (var i_idx = 0; i_idx < barkBandValues.length; i_idx++) {
                    barkBandValues[i_idx] = i_idx * metricsObj.audioContextRef.sampleRate / (segmentLen);
                    barkBandValues[i_idx] = 13 * Math.atan(barkBandValues[i_idx] / 1315.8) + 3.5 * Math.atan(Math.pow((barkBandValues[i_idx] / 7518), 2));
                }


                bandBoundaries[0] = 0;
                var currentBandUpperLimit = barkBandValues[metricsObj.amplitudeOutput.length - 1] / numBarkBands;
                var currentBandNumber = 1;
                for (var i_idx = 0; i_idx < metricsObj.amplitudeOutput.length; i_idx++) {
                    while (barkBandValues[i_idx] > currentBandUpperLimit) {
                        bandBoundaries[currentBandNumber++] = i_idx;
                        currentBandUpperLimit = currentBandNumber * barkBandValues[metricsObj.amplitudeOutput.length - 1] / numBarkBands;
                    }
                }

                bandBoundaries[numBarkBands] = metricsObj.amplitudeOutput.length - 1;

                // Process each bark band
                for (var i_band = 0; i_band < numBarkBands; i_band++) {
                    var bandSum = 0;
                    for (var j_freq = bandBoundaries[i_band]; j_freq < bandBoundaries[i_band + 1]; j_freq++) {
                        bandSum += normalizedAmplitudeSpectrum[j_freq];
                    }
                    specificLoudness[i_band] = Math.pow(bandSum, 0.23);
                }

                // Get total loudness by summing specific loudnesses
                for (var i_band = 0; i_band < specificLoudness.length; i_band++) {
                    totalLoudness += specificLoudness[i_band];
                }
                return {
                    "detailed": specificLoudness,
                    "overall": totalLoudness
                };
            },
            "perceptualSpread": function(segmentLen, metricsObj) {
                var computedLoudness = metricsObj.metricCalculators["perceivedLoudness"](segmentLen, metricsObj);

                var maximumLoudness = 0;
                for (var i_idx = 0; i_idx < computedLoudness.detailed.length; i_idx++) {
                    if (computedLoudness.detailed[i_idx] > maximumLoudness) {
                        maximumLoudness = computedLoudness.detailed[i_idx];
                    }
                }

                var spreadResult = Math.pow((computedLoudness.overall - maximumLoudness) / computedLoudness.overall, 2);

                return spreadResult;
            },
            "perceptualSharpness": function(segmentLen, metricsObj) {
                var computedLoudness = metricsObj.metricCalculators["perceivedLoudness"](segmentLen, metricsObj);
                var specificLoudnessValues = computedLoudness.detailed;
                var sharpnessOutput = 0;

                for (var i_idx = 0; i_idx < specificLoudnessValues.length; i_idx++) {
                    if (i_idx < 15) {
                        sharpnessOutput += (i_idx + 1) * specificLoudnessValues[i_idx + 1];
                    } else {
                        sharpnessOutput += 0.066 * Math.exp(0.171 * (i_idx + 1));
                    }
                }
                sharpnessOutput *= 0.11 / computedLoudness.overall;

                return sharpnessOutput;
            },
            "melFrequencyCepstralCoefficients": function(segmentLen, metricsObj) {
                // Algorithm based on practicalcryptography.com MFCC guide
                var calculatedPowerSpec = metricsObj.metricCalculators["powerSpectrumOutput"](segmentLen, metricsObj);
                var hertzToMel = function(hertzVal) {
                    var melVal = 1125 * Math.log(1 + (hertzVal / 700));
                    return melVal;
                };
                var melToHertz = function(melVal) {
                    var hertzVal = 700 * (Math.exp(melVal / 1125) - 1);
                    return hertzVal;
                };
                var numMelFilters = 26; // Standard number of filters
                var melScalePoints = new Float64Array(numMelFilters + 2); // +2 for boundary points
                var melScalePointsInHertz = new Float64Array(numMelFilters + 2);
                // Determine frequency limits: 0 Hz to Nyquist frequency
                var lowestFreqLimit = 0;
                var highestFreqLimit = audioCtxInput.sampleRate / 2;
                // Convert these limits to Mel scale
                var lowestMelLimit = hertzToMel(lowestFreqLimit);
                var highestMelLimit = hertzToMel(highestFreqLimit);
                // Calculate the total range on the Mel scale
                var melRange = highestMelLimit - lowestMelLimit;
                // Determine the step size for linear interpolation on Mel scale
                var melStepValue = melRange / (numMelFilters + 1);

                var fftBinIndicesForFreq = Array(numMelFilters + 2);

                for (var i_idx = 0; i_idx < melScalePoints.length; i_idx++) {
                    // Initialize Mel frequencies through linear interpolation
                    melScalePoints[i_idx] = i_idx * melStepValue;
                    // Convert back to Hertz
                    melScalePointsInHertz[i_idx] = melToHertz(melScalePoints[i_idx]);
                    // Find corresponding FFT bins
                    fftBinIndicesForFreq[i_idx] = Math.floor((segmentLen + 1) * melScalePointsInHertz[i_idx] / audioCtxInput.sampleRate);
                }

                var triangularFilterBank = Array(numMelFilters);
                for (var j_filter = 0; j_filter < triangularFilterBank.length; j_filter++) {
                    // Create a 2D array for the filter bank, initialized with zeros
                    triangularFilterBank[j_filter] = Array.apply(null, new Array((segmentLen / 2) + 1)).map(Number.prototype.valueOf, 0);
                    // Generate the lower slope of the triangular filter
                    for (var i_bin = fftBinIndicesForFreq[j_filter]; i_bin < fftBinIndicesForFreq[j_filter + 1]; i_bin++) {
                        triangularFilterBank[j_filter][i_bin] = (i_bin - fftBinIndicesForFreq[j_filter]) / (fftBinIndicesForFreq[j_filter + 1] - fftBinIndicesForFreq[j_filter]);
                    }
                    // Generate the upper slope of the triangular filter
                    for (var i_bin = fftBinIndicesForFreq[j_filter + 1]; i_bin < fftBinIndicesForFreq[j_filter + 2]; i_bin++) {
                        triangularFilterBank[j_filter][i_bin] = (fftBinIndicesForFreq[j_filter + 2] - i_bin) / (fftBinIndicesForFreq[j_filter + 2] - fftBinIndicesForFreq[j_filter + 1]);
                    }
                }

                var logMelBandEnergies = new Float64Array(numMelFilters);
                for (var i_band = 0; i_band < logMelBandEnergies.length; i_band++) {
                    logMelBandEnergies[i_band] = 0;
                    for (var j_freqBin = 0; j_freqBin < (segmentLen / 2); j_freqBin++) {
                        // Multiply power spectrum by filter bank coefficients
                        triangularFilterBank[i_band][j_freqBin] = triangularFilterBank[i_band][j_freqBin] * calculatedPowerSpec[j_freqBin];

                        // Sum the weighted coefficients for each band
                        logMelBandEnergies[i_band] += triangularFilterBank[i_band][j_freqBin];
                    }
                    // Apply logarithm to the summed energy
                    logMelBandEnergies[i_band] = Math.log(logMelBandEnergies[i_band]);
                }

                // Perform Discrete Cosine Transform (DCT)
                var piOverFilters = Math.PI / numMelFilters;
                var weightFactor1 = 1.0 / Math.sqrt(numMelFilters);
                var weightFactor2 = Math.sqrt(2.0 / numMelFilters);
                var numCoefficients = 13;
                var dctTransformationMatrix = new Float64Array(numCoefficients * numMelFilters);

                for (var i_coeff = 0; i_coeff < numCoefficients; i_coeff++) {
                    for (var j_filter = 0; j_filter < numMelFilters; j_filter++) {
                        var matrixIndex = i_coeff + (j_filter * numCoefficients);
                        if (i_coeff === 0) {
                            dctTransformationMatrix[matrixIndex] = weightFactor1 * Math.cos(piOverFilters * (i_coeff + 1) * (j_filter + 0.5));
                        } else {
                            dctTransformationMatrix[matrixIndex] = weightFactor2 * Math.cos(piOverFilters * (i_coeff + 1) * (j_filter + 0.5));
                        }
                    }
                }

                var finalMfccs = new Float64Array(numCoefficients);
                for (var k_coeff = 0; k_coeff < numCoefficients; k_coeff++) {
                    var currentCoefficientValue = 0;
                    for (var n_filter = 0; n_filter < numMelFilters; n_filter++) {
                        var matrixIndex = k_coeff + (n_filter * numCoefficients);
                        currentCoefficientValue += (dctTransformationMatrix[matrixIndex] * logMelBandEnergies[n_filter]);
                    }
                    finalMfccs[k_coeff] = currentCoefficientValue / numCoefficients;
                }
                return finalMfccs;
            }
        };

        // Create the AudioWorkletNode/ScriptProcessorNode for audio processing
        window.dspNode = audioCtxInput.createScriptProcessor(segmentSize, 1, 1);
        dspNode.connect(audioCtxInput.destination);

        // Define the audio processing event handler
        window.dspNode.onaudioprocess = function(eventData) {
            // Obtain the current audio frame (time domain signal)
            var inputAudioBuffer = eventData.inputBuffer.getChannelData(0);
            instanceRef.currentSignal = inputAudioBuffer;
            var shapedData = instanceRef.applyWindow(instanceRef.currentSignal, instanceRef.currentWindowType);

            // Create a complex array structure for FFT
            var spectrumData = new complex_data_struct.ComplexDataSet(segmentSize);
            // Map the time-domain data to the real part of the complex array
            spectrumData.map(function(element, index, totalLength) {
                element.realPart = shapedData[index];
            });
            // Perform Fast Fourier Transform
            var transformedSpec = spectrumData.FFT();
            // Assign the complex spectrum to the instance
            instanceRef.complexOutput = transformedSpec;
            instanceRef.amplitudeOutput = new Float64Array(segmentSize / 2);
            // Calculate the amplitude spectrum from the complex spectrum
            for (var i_idx = 0; i_idx < segmentSize / 2; i_idx++) {
                instanceRef.amplitudeOutput[i_idx] = Math.sqrt(Math.pow(transformedSpec.realPart[i_idx], 2) + Math.pow(transformedSpec.imagPart[i_idx], 2));

            }
            // If a callback is provided and analysis is active, invoke it with extracted features
            if (typeof resultHandler === "function" && analysisActive) {
                resultHandler(instanceRef.retrieveMetrics(_selectedMetrics));
            }

        };

        // Method to begin feature extraction
        instanceRef.startAnalysis = function(targetFeatures) {
            _selectedMetrics = targetFeatures;
            analysisActive = true;
        };

        // Method to halt feature extraction
        instanceRef.stopAnalysis = function() {
            analysisActive = false;
        };

        // Store the audio context reference
        instanceRef.audioContextRef = audioCtxInput;

        // Method to retrieve specific computed features
        instanceRef.retrieveMetrics = function(singleFeature) {
            if (typeof singleFeature === "object") {
                var computedResults = {};
                for (var iter = 0; iter < singleFeature.length; iter++) {
                    try {
                        computedResults[singleFeature[iter]] = (instanceRef.metricCalculators[singleFeature[iter]](segmentSize, instanceRef));
                    } catch (errorMsg) {
                        console.error(errorMsg);
                    }
                }
            }
        };
    }
};