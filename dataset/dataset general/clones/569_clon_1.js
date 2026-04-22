// This file provides JavaScript implementations of various pitch detection algorithms.
// It's a port of the original Java library 'TarsosDSP' by Joren Six from University College Ghent.
//
// Included algorithms are:
// - YIN (both standard and FFT-based, though FFT version needs an external library)
// - Average Magnitude Difference Function (AMDF)
// - Dynamic Wavelet (DW)
// - McLeod Pitch Method (MPM)
//
// Due to JavaScript's first-class function support, each algorithm is structured
// as a factory function. These functions create and return a pitch detector function
// configured with the provided settings.
//
// The returned detector function expects a Float32Array (audio buffer) as input
// and will output the detected pitch.
//
// Accuracy and performance can differ significantly between algorithms.
// YIN generally provides excellent results in many scenarios.
//
// The original TarsosDSP project can be found at:
// - Project website: http://tarsos.0110.be/tag/TarsosDSP
// - GitHub repository: https://github.com/JorenSix/TarsosDSP
//
'use strict';

// Constructor function for the Average Magnitude Difference Function (AMDF) pitch detector.
var AMDF = function(config) {

  // Initialize configuration, defaulting to an empty object if not provided.
  config = config || {};

  // Create a local object to hold AMDF-related properties (though not strictly used here).
  var AMDF = {};

  // Define default parameters for the AMDF algorithm.
  var
    DEFAULT_MIN_FREQUENCY = 82,     // Default minimum detectable frequency (Hz).
    DEFAULT_MAX_FREQUENCY = 1000,   // Default maximum detectable frequency (Hz).
    DEFAULT_RATIO         = 5,      // Ratio for filtering out unreliable pitches.
    DEFAULT_SENSITIVITY   = 0.1,    // Sensitivity for thresholding.
    DEFAULT_SAMPLE_RATE   = 44100,  // Default audio sample rate (samples per second).

    // Apply configuration settings or fall back to defaults.
    sampleRate            = config.sampleRate    || DEFAULT_SAMPLE_RATE,
    minFrequency          = config.minFrequency  || DEFAULT_MIN_FREQUENCY,
    maxFrequency          = config.maxFrequency  || DEFAULT_MAX_FREQUENCY,
    sensitivity           = config.sensitivity   || DEFAULT_SENSITIVITY,
    ratio                 = config.ratio         || DEFAULT_RATIO,

    amd                   = [],                   // Array to store AMDF values.
    // Calculate the maximum and minimum periods based on sample rate and frequency limits.
    // Adding 0.5 for proper rounding to the nearest integer.
    maxPeriod             = Math.round(sampleRate / minFrequency + 0.5),
    minPeriod             = Math.round(sampleRate / maxFrequency + 0.5),
    result                = {};                   // Object to store the final pitch result.

  // The actual pitch detection function, returned by the constructor.
  // It takes a Float32Array representing an audio buffer.
  return function(float32AudioBuffer) {

    var
      t,                         // Loop counter for frames.
      minval     = Infinity,     // Stores the minimum AMDF value found.
      maxval     = -Infinity,    // Stores the maximum AMDF value found.
      frames1,                   // Array to hold the first set of audio frames.
      frames2,                   // Array to hold the second (shifted) set of audio frames.
      calcSub,                   // Array to hold differences between frames.
      maxShift   = float32AudioBuffer.length; // Maximum possible shift (buffer length).

    // Step 1: Compute the Average Magnitude Difference Function (AMDF).
    // This loop iterates through all possible period offsets (shifts).
    for (var i = 0; i < maxShift; i++) {

      // Only consider shifts within the valid period range (minPeriod to maxPeriod).
      if (minPeriod <= i && i <= maxPeriod) {

        t       = 0;               // Reset frame counter.
        frames1 = [];              // Initialize frames1 array.
        frames2 = [];              // Initialize frames2 array.

        // Populate frames1 and frames2 for the current shift 'i'.
        // frames1 contains samples from the start, frames2 contains samples shifted by 'i'.
        for (var aux1 = 0, aux2 = i, t = 0; aux1 < maxShift - i; t++, aux2++, aux1++) {
          frames1[t] = float32AudioBuffer[aux1];
          frames2[t] = float32AudioBuffer[aux2];
        }

        // Calculate the difference between corresponding frames.
        var frameLength = frames1.length;
        calcSub         = [];
        for (var u = 0; u < frameLength; u++) {
          calcSub[u] = frames1[u] - frames2[u];
        }

        // Sum the absolute differences to get the AMDF value for this shift 'i'.
        var summation = 0;
        for (var l = 0; l < frameLength; l++) {
          summation += Math.abs(calcSub[l]);
        }
        amd[i] = summation; // Store the calculated AMDF value.
      }
    }

    // Step 2: Find the minimum and maximum AMDF values within the relevant period range.
    for (var j = minPeriod; j < maxPeriod; j++) {
      if (amd[j] < minval) minval = amd[j];
      if (amd[j] > maxval) maxval = amd[j];
    }

    // Step 3: Determine a cutoff threshold and find the first AMDF value below it.
    // The cutoff is based on sensitivity and the range of AMDF values.
    var cutoff = Math.round((sensitivity * (maxval - minval)) + minval);

    // Find the first 'j' where amd[j] is less than or equal to the cutoff.
    // This loop continues as long as amd[j] is above the cutoff.
    for (j = minPeriod; j <= maxPeriod && amd[j] > cutoff; j++);

    // Step 4: Refine the pitch estimate by searching around the found 'j'.
    var search_length = minPeriod / 2; // Define a search window.
    minval            = amd[j];        // Initialize minval with the AMDF value at 'j'.
    var minpos        = j;             // Initialize minpos with 'j'.

    // Search for the true minimum within a small window around 'j'.
    for (i = j - 1; i < j + search_length && i <= maxPeriod; i++) {
      if (amd[i] < minval) {
        minval = amd[i];
        minpos = i;
      }
    }

    // Step 5: Validate the detected pitch using the ratio parameter.
    // If the minimum AMDF value (scaled by ratio) is less than the max AMDF,
    // consider the pitch valid.
    if (Math.round(amd[minpos] * ratio) < maxval) {
      // Return the frequency (sampleRate / period).
      return {freq: sampleRate / minpos};
    } else {
      // If validation fails, return -1 indicating no pitch found.
      return {freq: -1};
    }
  };
};

// Constructor function for the YIN pitch dectector.
var YIN = function(config) {

  // Initialize configuration with defaults if not provided.
  config = config || {};

  // Local YIN object (not extensively used as a namespace).
  var YIN = {};

  // Define default parameters for the YIN algorithm.
  var DEFAULT_THRESHOLD   = 0.10,   // The threshold for detecting a pitch.
    DEFAULT_BUFFER_SIZE   = 2048,   // Default audio buffer size.
    DEFAULT_SAMPLE_RATE   = 44100,  // Default audio sample rate.

    // Apply configuration settings or fall back to defaults.
    threshold             = config.threshold   || DEFAULT_THRESHOLD,
    sampleRate            = config.sampleRate  || DEFAULT_SAMPLE_RATE,
    bufferSize            = config.bufferSize  || DEFAULT_BUFFER_SIZE,

    // Initialize the YIN buffer, which is half the size of the audio buffer.
    yinBuffer             = new Float32Array(bufferSize / 2),
    yinBufferLength       = bufferSize / 2, // Store its length for efficiency.
    result                = {};             // Object to store the final pitch result.

  // Implements the difference function as described in step 2 of the YIN paper.
  // This calculates the squared difference between the signal and its shifted version.
  var difference = function(float32AudioBuffer) {
    var index, delta;

    // Initialize yinBuffer elements to zero.
    for (var tau = 0; tau < yinBufferLength; tau++) {
      yinBuffer[tau] = 0;
    }

    // Calculate the squared difference for each possible lag (tau).
    for (tau = 1; tau < yinBufferLength; tau++) {
      for (index = 0; index < yinBufferLength; index++) {
        delta          = float32AudioBuffer[index] - float32AudioBuffer[index + tau];
        yinBuffer[tau] += delta * delta;
      }
    }
  };

  // Implements the cumulative mean normalized difference as described in step 3 of the paper.
  // This normalizes the difference function to make the thresholding more robust.
  var cumulativeMeanNormalizedDifference = function() {
    // Initialize the first two elements as per the YIN paper.
    yinBuffer[0] = 1;
    yinBuffer[1] = 1;

    var runningSum = 0; // Accumulator for the running sum of yinBuffer values.

    // Calculate cumulative mean normalized difference.
    for (var tau = 1; tau < yinBufferLength; tau++) {
      runningSum += yinBuffer[tau];
      yinBuffer[tau] *= tau / runningSum; // Apply normalization.
    }
  };

  // Implements the absolute thresholding step (step 4 of the YIN paper).
  // This finds the first minimum below a certain threshold.
  var absoluteThreshold = function() {
    // We start searching from the third position (tau=2) because the first two
    // positions are typically 1 and don't represent a true pitch.
    for (var tau = 2; tau < yinBufferLength; tau++) {
      if (yinBuffer[tau] < threshold) {
        // Found a value below the threshold. Now search for the local minimum.
        while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {
          tau++; // Keep incrementing tau as long as the values are decreasing.
        }
        // A local minimum below the threshold has been found.
        // Store the probability of this pitch.
        // The probability is derived from the inverse of the normalized difference.
        result.probability = 1 - yinBuffer[tau];
        break; // Exit the loop as the best candidate tau is found.
      }
    }

    // If no pitch was found (loop finished without breaking, or tau is at the end).
    if (tau == yinBufferLength || yinBuffer[tau] >= threshold) {
      tau                = -1; // Indicate no pitch found.
      result.probability = 0;
      result.foundPitch  = false;
    } else {
      // Pitch was found.
      result.foundPitch = true;
    }

    return tau; // Return the estimated tau (period).
  };

  /**
   * Implements step 5 of the AUBIO_YIN paper: parabolic interpolation.
   * This refines the estimated tau value to achieve higher frequency precision.
   * References:
   * - http://fizyka.umk.pl/nrbook/c10-2.pdf
   * - http://fedc.wiwi.hu-berlin.de/xplore/tutorials/xegbohtmlnode62.html
   */
  var parabolicInterpolation = function(tauEstimate) {
    var betterTau, // The refined tau value.
      x0,          // Left neighbor index.
      x2;          // Right neighbor index.

    // Determine x0 (left neighbor).
    if (tauEstimate < 1) {
      x0 = tauEstimate;
    } else {
      x0 = tauEstimate - 1;
    }

    // Determine x2 (right neighbor).
    if (tauEstimate + 1 < yinBufferLength) {
      x2 = tauEstimate + 1;
    } else {
      x2 = tauEstimate;
    }

    // Handle edge cases where tauEstimate is at the beginning or end of the buffer.
    if (x0 === tauEstimate) {
      if (yinBuffer[tauEstimate] <= yinBuffer[x2]) {
        betterTau = tauEstimate;
      } else {
        betterTau = x2;
      }
    } else if (x2 === tauEstimate) {
      if (yinBuffer[tauEstimate] <= yinBuffer[x0]) {
        betterTau = tauEstimate;
      } else {
        betterTau = x0;
      }
    } else {
      // Perform parabolic interpolation using three points (x0, tauEstimate, x2).
      var s0, s1, s2;
      s0 = yinBuffer[x0];
      s1 = yinBuffer[tauEstimate];
      s2 = yinBuffer[x2];

      // This formula is a corrected version of the AUBIO implementation.
      // Thanks to Karl Helgason for the fix: (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1.
      betterTau = tauEstimate + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
    }
    return betterTau; // Return the refined tau.
  };

  // The main pitch detection function returned by the YIN constructor.
  // It processes an audio buffer and returns the detected pitch.
  return function(float32AudioBuffer) {

    // Step 2: Compute the difference function.
    difference(float32AudioBuffer);

    // Step 3: Compute the cumulative mean normalized difference function.
    cumulativeMeanNormalizedDifference();

    // Step 4: Apply absolute threshold to find an initial tau estimate.
    var tauEstimate = absoluteThreshold();

    // Step 5: If a pitch candidate was found, refine it using parabolic interpolation.
    if (tauEstimate !== -1) {

      var betterTau = parabolicInterpolation(tauEstimate);

      // TODO: Consider adding further optimizations here if necessary.

      // Calculate the frequency from the refined period (betterTau).
      result.freq = sampleRate / betterTau;

    } else {

      // If no pitch was found in step 4, set frequency to -1.
      result.freq = -1;

    }

    // Return the result object containing frequency and probability.
    return result;
  };
};

// Constructor function for the Dynamic Wavelet (DW) pitch detector.
var DW = function(config) {

  // Initialize configuration with defaults if not provided.
  config = config || {};

  // Define internal parameters for the Dynamic Wavelet algorithm.
  var maxFLWTlevels        = 6,      // Maximum number of wavelet levels.
    maxF                   = 3000,   // Maximum frequency to consider for pitch detection.
    differenceLevelsN      = 3,      // Number of difference levels for distance calculation.
    maximaThresholdRatio   = 0.75,   // Ratio for thresholding maxima/minima amplitude.
    sampleRate             = config.sampleRate  || 44100, // Audio sample rate.
    bufferLength           = config.bufferSize  || 1024,  // Audio buffer size.

    distances              = [],     // Array to store distances between extrema.
    mins                   = [],     // Array to store indices of minima.
    maxs                   = [],     // Array to store indices of maxima.
    result                 = {};     // Object to store the final pitch result.

  // The main pitch detection function returned by the DW constructor.
  // It processes an audio buffer and returns the detected pitch.
  return function(float32AudioBuffer) {
    var pitchF           = -1,       // Detected pitch frequency, initialized to -1 (no pitch).
      curSamNb           = float32AudioBuffer.length, // Current number of samples in the buffer.
      nbMins,                        // Number of minima found.
      nbMaxs,                        // Number of maxima found.
      amplitudeThreshold,            // Amplitude threshold for extrema detection.
      theDC              = 0,        // DC component of the signal.
      minValue           = 0,        // Minimum sample value.
      maxValue           = 0;        // Maximum sample value.

    // Step 1: Compute max amplitude, amplitude threshold, and the DC component.
    for (var i = 0; i < bufferLength; i++) {
      var sample = float32AudioBuffer[i];
      theDC      = theDC + sample;        // Accumulate for DC calculation.
      maxValue   = Math.max(maxValue, sample); // Track max sample value.
      minValue   = Math.min(minValue, sample); // Track min sample value.
    }

    theDC = theDC / bufferLength; // Calculate average DC component.
    minValue -= theDC;            // Remove DC from min value.
    maxValue -= theDC;            // Remove DC from max value.

    // Determine the peak amplitude (max absolute deviation from DC).
    var amplitudeMax = (maxValue > -1 * minValue ? maxValue : -1 * minValue);

    // Calculate the amplitude threshold for detecting significant extrema.
    amplitudeThreshold = amplitudeMax * maximaThresholdRatio;

    // Initialize wavelet level and current mode distance.
    var curLevel        = 0,
      curModeDistance = -1,
      delta; // Delta value based on current level and max frequency.

    // Step 2: Main wavelet search loop.
    // This loop processes the signal at different downsampling levels.
    while (true) {
      // Calculate delta, which determines the minimum distance between extrema.
      delta = ~~(sampleRate / (Math.pow(2, curLevel) * maxF));

      if (curSamNb < 2) break; // If buffer is too small, exit.

      var dv,                             // Current difference in sample values.
        previousDV       = -1000,         // Previous difference in sample values.
        lastMinIndex     = -1000000,      // Index of the last detected minimum.
        lastMaxIndex     = -1000000,      // Index of the last detected maximum.
        findMax          = false,         // Flag to indicate searching for a maximum.
        findMin          = false;         // Flag to indicate searching for a minimum.

      nbMins = 0; // Reset minimum count for the current level.
      nbMaxs = 0; // Reset maximum count for the current level.

      // Iterate through the current audio buffer to find minima and maxima.
      for (var i = 2; i < curSamNb; i++) {
        var si  = float32AudioBuffer[i] - theDC,     // Current sample (DC removed).
          si1 = float32AudioBuffer[i - 1] - theDC; // Previous sample (DC removed).

        // Detect zero-crossings to identify potential extrema.
        if (si1 <= 0 && si > 0) findMax = true; // Rising edge, potential max.
        if (si1 >= 0 && si < 0) findMin = true; // Falling edge, potential min.

        dv = si - si1; // Calculate the difference between current and previous sample.

        if (previousDV > -1000) { // Ensure previousDV is initialized.
          // Check for a minimum.
          if (findMin && previousDV < 0 && dv >= 0) {
            // Found a minimum if value is significant and far enough from previous minimum.
            if (Math.abs(si) >= amplitudeThreshold) {
              if (i > lastMinIndex + delta) {
                mins[nbMins++] = i; // Store index of minimum.
                lastMinIndex   = i;
                findMin        = false;
              }
            }
          }

          // Check for a maximum.
          if (findMax && previousDV > 0 && dv <= 0) {
            // Found a maximum if value is significant and far enough from previous maximum.
            if (Math.abs(si) >= amplitudeThreshold) {
              if (i > lastMinIndex + delta) { // Note: original code used lastMinIndex here, might be a bug, but preserving Type I clone.
                maxs[nbMaxs++] = i; // Store index of maximum.
                lastMaxIndex   = i;
                findMax        = false;
              }
            }
          }
        }
        previousDV = dv; // Update previousDV for the next iteration.
      }

      // If no minima or maxima were found, then no best distance can be determined.
      if (nbMins === 0 && nbMaxs === 0) {
        break;
      }

      // Step 3: Calculate distances between consecutive minima and sum their occurrences.
      var d,
        distances = []; // Reset distances array for this level.
      // Initialize distances array with zeros.
      for (var k = 0; k < curSamNb; k++) {
        distances[k] = 0;
      }

      for (var i = 0; i < nbMins; i++) {
        for (var j = 1; j < differenceLevelsN; j++) {
          if (i + j < nbMins) {
            d = Math.abs(mins[i] - mins[i + j]); // Distance between minima.
            distances[d] = (distances[d] || 0) + 1; // Increment count for this distance.
          }
        }
      }

      // Step 4: Find the best distance (mode distance) by summing occurrences in a window.
      var bestDistance = -1,
        bestValue    = -1;

      for (var i = 0; i < curSamNb; i++) {
        var summed = 0;
        // Sum distances within a window of +/- delta.
        for (var j = -delta; j <= delta; j++) {
          if (i + j >= 0 && i + j < curSamNb) {
            summed += distances[i + j] || 0; // Add to sum, handling undefined values.
          }
        }

        // Update best distance if a higher sum is found.
        if (summed === bestValue) {
          // If sums are equal, prefer the one closer to twice the current bestDistance (averaging effect).
          if (i === 2 * bestDistance) {
            bestDistance = i;
          }
        } else if (summed > bestValue) {
          bestValue    = summed;
          bestDistance = i;
        }
      }

      // Step 5: Average the best distance to get a more precise value.
      var distAvg = 0,
        nbDists = 0;
      for (var j = -delta; j <= delta; j++) {
        if (bestDistance + j >= 0 && bestDistance + j < bufferLength) {
          var nbDist = distances[bestDistance + j];
          if (nbDist > 0) {
            nbDists += nbDist;
            distAvg += (bestDistance + j) * nbDist;
          }
        }
      }

      distAvg /= nbDists; // This is the mode distance for the current level.

      // Step 6: Check for similarity with the previous level's mode distance.
      // If two consecutive levels yield similar mode distances, a pitch is found.
      if (curModeDistance > -1) {
        var similarity = Math.abs(distAvg * 2 - curModeDistance);
        if (similarity <= 2 * delta) {
          // Two consecutive similar mode distances: pitch detected!
          // Calculate frequency, accounting for downsampling.
          pitchF = (sampleRate / (Math.pow(2, curLevel - 1) * curModeDistance));
          break; // Exit the wavelet search loop.
        }
      }

      // If not similar, continue to the next level.
      curModeDistance = distAvg;

      curLevel++; // Increment wavelet level.
      // Exit if maximum levels reached or buffer size becomes too small.
      if (curLevel >= maxFLWTlevels || curSamNb < 2) {
        break;
      }

      // Downsample the audio buffer for the next level.
      // Create a new buffer to avoid modifying the original.
      var newFloat32AudioBuffer = float32AudioBuffer.subarray(0); // Create a shallow copy.
      // If the buffer size matches the distances array length (meaning it's the full original buffer),
      // then allocate a new buffer of half the size for downsampling.
      if (curSamNb === distances.length) {
        newFloat32AudioBuffer = new Float32Array(Math.floor(curSamNb / 2));
      }
      // Average pairs of samples for downsampling.
      for (var i = 0; i < Math.floor(curSamNb / 2); i++) {
        newFloat32AudioBuffer[i] = (float32AudioBuffer[2 * i] + float32AudioBuffer[2 * i + 1]) / 2;
      }
      float32AudioBuffer = newFloat32AudioBuffer; // Use the downsampled buffer for the next iteration.
      curSamNb           = Math.floor(curSamNb / 2); // Update current sample number.
    }

    result.freq = pitchF; // Store the detected frequency.

    return result; // Return the result object.
  };
};

// Constructor function for McLeod Pitch Method detector.
// Note: This algorithm can be quite computationally intensive (slow).
var MPM = function(config) {

  // Initialize configuration with defaults if not provided.
  config = config || {};

  /**
   * The expected size of an audio buffer in samples.
   * This is a default value.
   */
  var DEFAULT_BUFFER_SIZE = 1024,

    /**
     * Defines the relative size the chosen peak (pitch) must have.
     * For example, 0.93 means the first peak higher than 93% of the highest
     * peak detected is chosen. This is the default from Tartini's UI.
     */
    DEFAULT_CUTOFF = 0.97,

    DEFAULT_SAMPLE_RATE = 44100, // Standard audio sample rate.

    /**
     * For performance optimization, peaks below this cutoff are not considered
     * as potential pitch candidates at all.
     */
    SMALL_CUTOFF = 0.5,

    /**
     * Pitch annotations below this frequency threshold are considered invalid
     * and are ignored. This helps filter out noise or non-musical sounds.
     */
    LOWER_PITCH_CUTOFF = 88, // Approximately the lowest note on a piano (A0).

    /**
     * The actual cutoff value used, either from config or default.
     */
    cutoff = config.cutoff,

    /**
     * The audio sample rate, from config or default (e.g., 44.1kHz).
     */
    sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE,

    /**
     * The size of the input audio buffer for processing.
     */
    bufferSize = config.bufferSize || DEFAULT_BUFFER_SIZE,

    /**
     * Array to contain normalized square difference function values for each delay (lag).
     */
    // This variable declaration is incomplete in the provided snippet.
    // It would typically be followed by its initialization or further definition.