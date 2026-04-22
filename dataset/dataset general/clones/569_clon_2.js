// A JavaScript translation of a sound frequency detection library,
// initially developed in Java by Joren Six from University College Ghent.
//
// This library includes diverse frequency analysis techniques:
//  - YIN (with optional FFT integration, requiring an external FFT tool)
//  - Amplitude Difference Function
//  - Wavelet-based Detection
//  - McLeod's Pitch Method
//
// Utilizing JavaScript's functional capabilities, each algorithm
// is instantiated as a configurable function. When invoked with a
// Float32Array audio sample, it yields the detected fundamental frequency.
//
// Performance and precision differ among the methods; YIN has shown
// to be particularly effective in testing.
//
// For more details, refer to the original Java project at
// http://tarsos.0110.be/tag/TarsosDSP or its GitHub repository:
// https://github.com/JorenSix/TarsosDSP

'use strict';

const AmpDiffFreq = function(params) {
  params = params || {};

  const processingContext = {}; // Unused, but kept for structural consistency

  const MIN_FREQ_DEFAULT = 82;
  const MAX_FREQ_DEFAULT = 1000;
  const DEFAULT_AMPL_RATIO = 5;
  const DEFAULT_DETECT_SENS = 0.1;
  const DEFAULT_AUDIO_RATE = 44100;

  let audioSampleRate = params.audioSampleRate || DEFAULT_AUDIO_RATE;
  let lowestFreq = params.lowestFreq || MIN_FREQ_DEFAULT;
  let highestFreq = params.highestFreq || MAX_FREQ_DEFAULT;
  let detectSensitivity = params.detectSensitivity || DEFAULT_DETECT_SENS;
  let amplitudeRatio = params.amplitudeRatio || DEFAULT_AMPL_RATIO;

  const diffMagnitudes = [];
  const maximumPeriod = Math.round(audioSampleRate / lowestFreq + 0.5);
  const minimumPeriod = Math.round(audioSampleRate / highestFreq + 0.5);
  const outcome = {};

  return function(audioSignalBuffer) {
    let idx;
    let minimumValue = Infinity;
    let maximumValue = -Infinity;
    let segmentA;
    let segmentB;
    let diffBuffer;
    const maxOffset = audioSignalBuffer.length;

    // Calculate the average magnitude difference for each potential period offset.
    for (let k = 0; k < maxOffset; k++) {
      if (minimumPeriod <= k && k <= maximumPeriod) {
        idx = 0;
        segmentA = []; // Magnitudes from the start of the buffer.
        segmentB = []; // Magnitudes from the start of the buffer plus the offset.

        for (let offset1 = 0, offset2 = k; offset1 < maxOffset - k; idx++, offset2++, offset1++) {
          segmentA[idx] = audioSignalBuffer[offset1];
          segmentB[idx] = audioSignalBuffer[offset2];
        }

        // Determine the difference between these signal segments.
        const currentSegmentLength = segmentA.length;
        diffBuffer = [];
        for (let bufIdx = 0; bufIdx < currentSegmentLength; bufIdx++) {
          diffBuffer[bufIdx] = segmentA[bufIdx] - segmentB[bufIdx];
        }

        // Aggregate the absolute differences.
        let totalSum = 0;
        for (let sumIdx = 0; sumIdx < currentSegmentLength; sumIdx++) {
          totalSum += Math.abs(diffBuffer[sumIdx]);
        }
        diffMagnitudes[k] = totalSum;
      }
    }

    for (let periodIdx = minimumPeriod; periodIdx < maximumPeriod; periodIdx++) {
      if (diffMagnitudes[periodIdx] < minimumValue) minimumValue = diffMagnitudes[periodIdx];
      if (diffMagnitudes[periodIdx] > maximumValue) maximumValue = diffMagnitudes[periodIdx];
    }

    const thresholdCutoff = Math.round((detectSensitivity * (maximumValue - minimumValue)) + minimumValue);
    let periodIdx = minimumPeriod;
    while (periodIdx <= maximumPeriod && diffMagnitudes[periodIdx] > thresholdCutoff) {
      periodIdx++;
    }

    const searchSpan = minimumPeriod / 2;
    minimumValue = diffMagnitudes[periodIdx];
    let minPosition = periodIdx;
    for (let k = periodIdx - 1; k < periodIdx + searchSpan && k <= maximumPeriod; k++) {
      if (diffMagnitudes[k] < minimumValue) {
        minimumValue = diffMagnitudes[k];
        minPosition = k;
      }
    }

    if (Math.round(diffMagnitudes[minPosition] * amplitudeRatio) < maximumValue) {
      return {frequency: audioSampleRate / minPosition};
    } else {
      return {frequency: -1};
    }
  };
};


// Constructor function for the YIN pitch detector.
const PitchYin = (params) => {

  params = params || {};

  const yinContext = {}; // Structural placeholder

  const DEFAULT_YIN_CONFIDENCE = 0.10;
  const DEFAULT_AUDIO_FRAME_SIZE = 2048;
  const DEFAULT_SAMPLE_RATE_HZ = 44100;

  let confidenceThreshold = params.confidenceThreshold || DEFAULT_YIN_CONFIDENCE;
  let audioSampleRate = params.audioSampleRate || DEFAULT_SAMPLE_RATE_HZ;
  let audioFrameSize = params.audioFrameSize || DEFAULT_AUDIO_FRAME_SIZE;

  const diffAccumulator = new Float32Array(audioFrameSize / 2);
  const accumulatorLength = audioFrameSize / 2;
  const detectionResult = {};

  // Implements the difference function as described in step 2 of the YIN paper.
  const calculateDifference = (inputAudioBuffer) => {
    let sampleIndex, sampleDelta;
    for (let periodLag = 0; periodLag < accumulatorLength; periodLag++) {
      diffAccumulator[periodLag] = 0;
    }
    for (let periodLag = 1; periodLag < accumulatorLength; periodLag++) {
      for (sampleIndex = 0; sampleIndex < accumulatorLength; sampleIndex++) {
        sampleDelta = inputAudioBuffer[sampleIndex] - inputAudioBuffer[sampleIndex + periodLag];
        diffAccumulator[periodLag] += sampleDelta * sampleDelta;
      }
    }
  };

  // Implements the cumulative mean normalized difference as described in step 3 of the paper.
  const normalizeCumulativeMean = () => {
    diffAccumulator[0] = 1;
    diffAccumulator[1] = 1;
    let currentRunningSum = 0;
    for (let periodLag = 1; periodLag < accumulatorLength; periodLag++) {
      currentRunningSum += diffAccumulator[periodLag];
      diffAccumulator[periodLag] *= periodLag / currentRunningSum;
    }
  };

  const findAbsoluteThreshold = () => {
    // Starting search from the third position since the first two are 1.
    let periodLag;
    for (periodLag = 2; periodLag < accumulatorLength; periodLag++) {
      if (diffAccumulator[periodLag] < confidenceThreshold) {
        while (periodLag + 1 < accumulatorLength && diffAccumulator[periodLag + 1] < diffAccumulator[periodLag]) {
          periodLag++;
        }
        // Found the optimal lag, now store the probability.
        // As per the YIN paper, the threshold indicates the acceptable
        // proportion of aperiodic power in a periodic signal.
        // Therefore, periodicity is 1 - aperiodicity.
        detectionResult.periodicityCertainty = 1 - diffAccumulator[periodLag];
        break;
      }
    }

    // If no pitch is detected, reset lag and probability.
    if (periodLag === accumulatorLength || diffAccumulator[periodLag] >= confidenceThreshold) {
      periodLag = -1;
      detectionResult.periodicityCertainty = 0;
      detectionResult.isPitchDetected = false;
    } else {
      detectionResult.isPitchDetected = true;
    }

    return periodLag;
  };

  /**
   * Implements step 5 of the AUBIO_YIN paper. This refines the estimated
   * lag value using parabolic interpolation for more precise higher
   * frequency detection. See references:
   * http://fizyka.umk.pl/nrbook/c10-2.pdf
   * http://fedc.wiwi.hu-berlin.de/xplore/tutorials/xegbohtmlnode62.html
   */
  const refineParabolic = (estimatedLag) => {
    let refinedLag;
    let lagOffset0;
    let lagOffset2;

    if (estimatedLag < 1) {
      lagOffset0 = estimatedLag;
    } else {
      lagOffset0 = estimatedLag - 1;
    }
    if (estimatedLag + 1 < accumulatorLength) {
      lagOffset2 = estimatedLag + 1;
    } else {
      lagOffset2 = estimatedLag;
    }

    if (lagOffset0 === estimatedLag) {
      if (diffAccumulator[estimatedLag] <= diffAccumulator[lagOffset2]) {
        refinedLag = estimatedLag;
      } else {
        refinedLag = lagOffset2;
      }
    } else if (lagOffset2 === estimatedLag) {
      if (diffAccumulator[estimatedLag] <= diffAccumulator[lagOffset0]) {
        refinedLag = estimatedLag;
      } else {
        refinedLag = lagOffset0;
      }
    } else {
      const value0 = diffAccumulator[lagOffset0];
      const value1 = diffAccumulator[estimatedLag];
      const value2 = diffAccumulator[lagOffset2];
      // Corrected AUBIO implementation, credit to Karl Helgason:
      // (2.0f * value1 - value2 - value0) was erroneously multiplied by -1.
      refinedLag = estimatedLag + (value2 - value0) / (2 * (2 * value1 - value2 - value0));
    }
    return refinedLag;
  };


  // Returns the detected pitch of a given audio signal, or -1 if none is found.
  return (inputAudioBuffer) => {

    // Step 2: Calculate the difference function.
    calculateDifference(inputAudioBuffer);

    // Step 3: Normalize the cumulative mean.
    normalizeCumulativeMean();

    // Step 4: Find the absolute threshold.
    const estimatedLag = findAbsoluteThreshold();

    // Step 5: Refine the lag using parabolic interpolation.
    if (estimatedLag !== -1) {

      const refinedLag = refineParabolic(estimatedLag);

      // TODO: Future optimization!

      detectionResult.frequencyHz = audioSampleRate / refinedLag;

    } else {

      detectionResult.frequencyHz = -1;

    }

    // Best of luck with your pitch detection!
    return detectionResult;
  };
};

// Construtor function for Dynamic Wavelet detector
const WaveletDetector = function(options) {

  options = options || {};

  const maxWaveletLevels = 6;
  const maxFrequencyLimit = 3000;
  const diffLevelCount = 3;
  const peakThresholdRatio = 0.75;

  let sampleRateHz = options.sampleRateHz || 44100;
  let inputBufferSize = options.inputBufferSize || 1024;

  const unusedWaveletDistances = []; // This one is not used, 'calculatedDistances' is redeclared inside.
  const minimaIndices = [];
  const maximaIndices = [];
  const detectionResult = {};

  return function(audioInputData) {
    let detectedPitch = -1;
    let currentSampleCount = audioInputData.length;
    let minimaCount;
    let maximaCount;
    let amplitudeCutoff;
    let dcOffset = 0;
    let minSignalValue = 0;
    let maxSignalValue = 0;

    // Calculate maximum amplitude, amplitude threshold, and DC offset.
    for (let i = 0; i < inputBufferSize; i++) {
      const currentSample = audioInputData[i];
      dcOffset += currentSample;
      maxSignalValue = Math.max(maxSignalValue, currentSample);
      minSignalValue = Math.min(minSignalValue, currentSample);
    }

    dcOffset /= inputBufferSize;
    minSignalValue -= dcOffset;
    maxSignalValue -= dcOffset;
    const amplitudeMax = (maxSignalValue > -1 * minSignalValue ? maxSignalValue : -1 * minSignalValue);

    amplitudeCutoff = amplitudeMax * peakThresholdRatio;

    // Process levels, starting without downsampling.
    let currentLevel = 0;
    let currentModeDistance = -1;
    let levelDelta;

    // Main search loop:
    while (true) {
      levelDelta = ~~(sampleRateHz / (Math.pow(2, currentLevel) * maxFrequencyLimit));
      if (currentSampleCount < 2) break;

      let derivativeValue;
      let previousDerivative = -1000;
      let lastMinimumPos = -1000000;
      let lastMaximumPos = -1000000;
      let seekingMax = false;
      let seekingMin = false;

      minimaCount = 0;
      maximaCount = 0;

      for (let i = 2; i < currentSampleCount; i++) {
        const signalValue = audioInputData[i] - dcOffset;
        const previousSignalValue = audioInputData[i - 1] - dcOffset;

        if (previousSignalValue <= 0 && signalValue > 0) seekingMax = true;
        if (previousSignalValue >= 0 && signalValue < 0) seekingMin = true;

        // Check for min or max:
        derivativeValue = signalValue - previousSignalValue;

        if (previousDerivative > -1000) {
          if (seekingMin && previousDerivative < 0 && derivativeValue >= 0) {
            // Found a minimum
            if (Math.abs(signalValue) >= amplitudeCutoff) {
              if (i > lastMinimumPos + levelDelta) {
                minimaIndices[minimaCount++] = i;
                lastMinimumPos = i;
                seekingMin = false;
              }
            }
          }

          if (seekingMax && previousDerivative > 0 && derivativeValue <= 0) {
            // Found a maximum
            if (Math.abs(signalValue) >= amplitudeCutoff) {
              if (i > lastMaximumPos + levelDelta) {
                maximaIndices[maximaCount++] = i;
                lastMaximumPos = i;
                seekingMax = false;
              }
            }
          }
        }
        previousDerivative = derivativeValue;
      }

      if (minimaCount === 0 && maximaCount === 0) {
        // No suitable distance found at this level.
        break;
      }

      let distanceVal;
      const calculatedDistances = []; // This is the array used in this scope.
      for (let i = 0; i < currentSampleCount; i++) calculatedDistances[i] = 0; // Initialize with 0s

      for (let i = 0; i < minimaCount; i++) {
        for (let j = 1; j < diffLevelCount; j++) {
          if (i + j < minimaCount) {
            distanceVal = Math.abs(minimaIndices[i] - minimaIndices[i + j]);
            calculatedDistances[distanceVal] = (calculatedDistances[distanceVal] || 0) + 1;
          }
        }
      }

      let optimalDistance = -1;
      let optimalValue = -1;

      for (let i = 0; i < currentSampleCount; i++) {
        let summedDistances = 0;
        for (let j = -levelDelta; j <= levelDelta; j++) {
          if (i + j >= 0 && i + j < currentSampleCount) {
            summedDistances += calculatedDistances[i + j] || 0; // Handle undefined for sparse arrays
          }
        }

        if (summedDistances === optimalValue) {
          if (i === 2 * optimalDistance) {
            optimalDistance = i;
          }
        } else if (summedDistances > optimalValue) {
          optimalValue = summedDistances;
          optimalDistance = i;
        }
      }

      // Perform averaging for the mode distance.
      let averageDistance = 0;
      let numDistances = 0;
      for (let j = -levelDelta; j <= levelDelta; j++) {
        if (optimalDistance + j >= 0 && optimalDistance + j < inputBufferSize) {
          const count = calculatedDistances[optimalDistance + j];
          if (count > 0) {
            numDistances += count;
            averageDistance += (optimalDistance + j) * count;
          }
        }
      }

      // This is our determined mode distance for the current level.
      averageDistance /= numDistances;

      // Should we continue to deeper levels?
      if (currentModeDistance > -1) {
        const similarity = Math.abs(averageDistance * 2 - currentModeDistance);
        if (similarity <= 2 * levelDelta) {
          // Two consecutive similar mode distances: good!
          detectedPitch = (sampleRateHz / (Math.pow(2, currentLevel - 1) * currentModeDistance));
          break;
        }
      }

      // If not similar, proceed to the next level.
      currentModeDistance = averageDistance;

      currentLevel++;
      if (currentLevel >= maxWaveletLevels || currentSampleCount < 2) {
        break;
      }

      // Do not alter the original audio buffer; create a copy if downsampling is necessary.
      // The original logic makes a subarray copy then immediately overwrites it with a new Float32Array.
      let downsampledBuffer = audioInputData.subarray(0);
      if (currentSampleCount === calculatedDistances.length) {
        downsampledBuffer = new Float32Array(Math.floor(currentSampleCount / 2));
      }
      for (let i = 0; i < Math.floor(currentSampleCount / 2); i++) {
        downsampledBuffer[i] = (audioInputData[2 * i] + audioInputData[2 * i + 1]) / 2;
      }
      audioInputData = downsampledBuffer;
      currentSampleCount = Math.floor(currentSampleCount / 2);
    }

    detectionResult.frequency = detectedPitch;

    return detectionResult;
  };
};

// Constructor function for McLeod Pitch Method detector.
// Note: This method can be computationally intensive.
const McLeodPitchEstimator = function(settings) {

  settings = settings || {};

  /**
   * The anticipated number of samples in an audio buffer.
   */
  const STANDARD_FRAME_SIZE = 1024;

  /**
   * Defines the relative height of the selected peak (pitch). For example,
   * 0.93 means selecting the first peak that exceeds 93% of the highest
   * detected peak. 93% is the default in the Tartini interface.
   */
  const DEFAULT_PEAK_THRESHOLD = 0.97;

  const STANDARD_SAMPLE_RATE_HZ = 44100;

  /**
   * For optimization, peaks below this threshold are ignored.
   */
  const MINOR_PEAK_THRESHOLD = 0.5;

  /**
   * Pitch measurements below this threshold are deemed invalid and discarded.
   */
  const MIN_VALID_PITCH_HZ = 88;

  let peakThreshold = settings.peakThreshold || DEFAULT_PEAK_THRESHOLD;
  let audioSampleRate = settings.audioSampleRate || STANDARD_SAMPLE_RATE_HZ;
  let frameSize = settings.frameSize || STANDARD_FRAME_SIZE;

  // This array initially stores R_x(tau) (autocorrelation) and is
  // subsequently transformed to store the final NSDF values.
  const nsdfValues = new Float32Array(frameSize);
  const peakLocations = new Int32Array(frameSize); // Stores indices of identified peaks.
  // This array temporarily stores R_x(tau) for the second calculation pass.
  const partialCorrelationSum = new Float32Array(frameSize);

  const mpmOutput = {
    detectedFrequency: -1,
    periodicity: 0,
    isDetected: false
  };

  /**
   * Computes the Normalized Square Difference Function (NSDF)
   * for the given audio buffer.
   */
  const computeNSDF = (inputAudioFrame) => {
    // First pass: Calculate R_x(tau) and store in nsdfValues
    for (let lagValue = 0; lagValue < frameSize; lagValue++) {
      let totalPower = 0;
      for (let iter = 0; iter < frameSize - lagValue; iter++) {
        totalPower += inputAudioFrame[iter] * inputAudioFrame[iter + lagValue];
      }
      nsdfValues[lagValue] = totalPower;
    }

    // Second pass: Calculate the full NSDF using R_x(0) and R_x(tau)
    // R_x(0) is already nsdfValues[0] from the first loop.
    for (let lagValue = 1; lagValue < frameSize; lagValue++) {
      let periodicityScore = 0;
      for (let iter = 0; iter < frameSize - lagValue; iter++) {
        periodicityScore += inputAudioFrame[iter] * inputAudioFrame[iter + lagValue];
      }
      partialCorrelationSum[lagValue] = periodicityScore; // Store R_x(tau) again

      const currentSum = nsdfValues[0] + nsdfValues[lagValue]; // R_x(0) + R_x(tau)
      if (currentSum === 0) {
        nsdfValues[lagValue] = 1; // Avoid division by zero, treat as perfect correlation
      } else {
        nsdfValues[lagValue] = (2 * partialCorrelationSum[lagValue]) / currentSum;
      }
    }
  };

  /**
   * Identifies peaks within the NSDF array that meet a minor threshold.
   */
  const findPeaks = () => {
    let currentPeakValue = -Infinity;
    let currentPeakIndex = -1;
    let peakCount = 0;

    for (let iter = 1; iter < frameSize - 1; iter++) {
      // Check for a local maximum
      if (nsdfValues[iter] > nsdfValues[iter - 1] && nsdfValues[iter] >= nsdfValues[iter + 1]) {
        if (nsdfValues[iter] > MINOR_PEAK_THRESHOLD) {
          peakLocations[peakCount++] = iter;
          if (nsdfValues[iter] > currentPeakValue) {
            currentPeakValue = nsdfValues[iter];
            currentPeakIndex = iter;
          }
        }
      }
    }
    return peakCount;
  };

  /**
   * Chooses the most probable pitch candidate from the detected peaks
   * based on a primary peak threshold.
   */
  const selectPitchCandidate = (numPeaks) => {
    let potentialPitchLag = -1;
    let candidatePeriodicity = 0;

    if (numPeaks === 0) {
      return { lagValue: -1, periodicityScore: 0 };
    }

    // Determine the highest peak value among all detected peaks.
    let maximumValue = -Infinity;
    let peakPosition = -1;
    for (let iter = 0; iter < numPeaks; iter++) {
      const currentCandidateLag = peakLocations[iter];
      if (nsdfValues[currentCandidateLag] > maximumValue) {
        maximumValue = nsdfValues[currentCandidateLag];
        peakPosition = currentCandidateLag;
      }
    }

    if (peakPosition === -1) { // Should not happen if numPeaks > 0
      return { lagValue: -1, periodicityScore: 0 };
    }

    const thresholdValue = peakThreshold * maximumValue;

    // Find the first peak that crosses the main threshold.
    for (let iter = 0; iter < numPeaks; iter++) {
      const currentCandidateLag = peakLocations[iter];
      if (nsdfValues[currentCandidateLag] >= thresholdValue) {
        potentialPitchLag = currentCandidateLag;
        candidatePeriodicity = nsdfValues[currentCandidateLag];
        break;
      }
    }

    return { lagValue: potentialPitchLag, periodicityScore: candidatePeriodicity };
  };

  /**
   * Refines the selected pitch candidate's lag value using parabolic interpolation
   * for sub-sample precision.
   */
  const interpolateParabolic = (lagValue) => {
    if (lagValue <= 0) return lagValue; // Cannot interpolate at or before 0

    const leftPoint = lagValue - 1;
    const rightPoint = lagValue + 1;

    // Ensure interpolation points are within array bounds.
    if (leftPoint < 0 || rightPoint >= frameSize) {
      return lagValue;
    }

    const coeffA = nsdfValues[leftPoint];
    const coeffB = nsdfValues[lagValue];
    const coeffC = nsdfValues[rightPoint];

    // Calculate the vertex of the parabola (x-coordinate).
    const vertexPosition = lagValue + (coeffA - coeffC) / (2 * (coeffA - (2 * coeffB) + coeffC));
    // The original code calculates the vertex position but not its value.

    if (isNaN(vertexPosition) || !isFinite(vertexPosition) || vertexPosition < 0 || vertexPosition >= frameSize) {
      return lagValue; // Fallback if interpolation yields invalid result
    }

    return vertexPosition;
  };


  // Main execution function for pitch detection.
  return (inputAudioFrame) => {
    // Step 1: Compute the Normalized Square Difference Function (NSDF).
    computeNSDF(inputAudioFrame);

    // Step 2: Identify local maxima (peaks) in the NSDF array.
    const numPeaks = findPeaks();

    // Step 3: Select the most promising pitch candidate based on thresholding.
    const { lagValue: selectedLag, periodicityScore: detectedPeriodicity } = selectPitchCandidate(numPeaks);

    // Step 4: Refine the chosen lag value for higher accuracy using parabolic interpolation.
    const interpolatedLag = interpolateParabolic(selectedLag);

    if (interpolatedLag > 0 && isFinite(interpolatedLag)) { // Check for valid interpolated lag
      const estimatedFrequency = audioSampleRate / interpolatedLag;
      if (estimatedFrequency >= MIN_VALID_PITCH_HZ && estimatedFrequency < audioSampleRate / 2) { // Add upper frequency limit
        mpmOutput.detectedFrequency = estimatedFrequency;
        mpmOutput.periodicity = detectedPeriodicity;
        mpmOutput.isDetected = true;
      } else {
        mpmOutput.detectedFrequency = -1;
        mpmOutput.periodicity = 0;
        mpmOutput.isDetected = false;
      }
    } else {
      mpmOutput.detectedFrequency = -1;
      mpmOutput.periodicity = 0;
      mpmOutput.isDetected = false;
    }

    return mpmOutput;
  };
};