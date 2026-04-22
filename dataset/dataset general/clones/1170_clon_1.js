/*
 * Meyda: A JavaScript Audio Feature Extraction Library.
 * This file contains the core Meyda class definition and its feature extraction methods.
 */

var Meyda = function ( audioContext, src, bufSize, callback ) {

  // Reference to the current instance of Meyda
  var self = this;

  // Configure the buffer size; defaults to 256 if not provided.
  var bufferSize = bufSize ? bufSize : 256;


  // The audio source node for processing.
  var source = src;

  // Flags and variables for managing feature extraction state.
  var EXTRACTION_STARTED = false;
  var _featuresToExtract;

  // Utility functions for signal processing.

  /**
   * Calculates the i-th moment of the amplitude spectrum.
   * Used in spectral centroid, spread, skewness, and kurtosis.
   * @param {number} i - The moment order.
   * @param {Float32Array} amplitudeSpect - The amplitude spectrum.
   * @returns {number} The i-th moment.
   */
  var µ = function ( i, amplitudeSpect ) {
    var numerator = 0;
    var denominator = 0;

    // Iterate through the amplitude spectrum to sum values
    for ( var k = 0; k < amplitudeSpect.length; k++ ) {
      numerator += Math.pow( k, i ) * Math.abs( amplitudeSpect[k] );
      denominator += amplitudeSpect[k];
    }
    return numerator / denominator;
  };

  /**
   * Checks if a number is a power of two.
   * Important for FFT calculations.
   * @param {number} num - The number to check.
   * @returns {boolean} True if the number is a power of two, false otherwise.
   */
  var isPowerOfTwo = function ( num ) {
    while ( ( ( num % 2 ) == 0 ) && num > 1 ) {
      num /= 2;
    }
    return ( num == 1 );
  };


  // --- WINDOWING FUNCTIONS ---

  // Default windowing function set to "hanning".
  self.windowingFunction = "hanning";

  // Pre-calculate Hanning window coefficients.
  self.hanning = new Float32Array( bufSize );
  for ( var i = 0; i < bufSize; i++ ) {
    // Formula from R documentation: http://rgm.ogalab.net/RGM/R_rdfile?f=GENEAread/man/hanning.window.Rd&d=R_CC
    self.hanning[i] = 0.5 - 0.5 * Math.cos( 2 * Math.PI * i / ( bufSize - 1 ) );
  }

  // Pre-calculate Hamming window coefficients.
  self.hamming = new Float32Array( bufSize );
  for ( var i = 0; i < bufSize; i++ ) {
    // Formula from MathWorks documentation: http://uk.mathworks.com/help/signal/ref/hamming.html
    self.hamming[i] = 0.54 - 0.46 * Math.cos( 2 * Math.PI * ( i / bufSize - 1 ) );
  }

  // UNFINISHED - Blackman window implementation is commented out.
  /*
  self.blackman = new Float32Array(bufSize);
  // According to http://uk.mathworks.com/help/signal/ref/blackman.html
  // first half of the window
  for (var i = 0; i < (bufSize % 2) ? (bufSize+1)/2 : bufSize/2; i++) {
    self.blackman[i] = 0.42 - 0.5*Math.cos(2*Math.PI*i/(bufSize-1)) + 0.08*Math.cos(4*Math.PI*i/(bufSize-1));
  }
  // second half of the window
  for (var i = bufSize/2; i > 0; i--) {
    self.blackman[bufSize - i] = self.blackman[i];
  }
  */

  /**
   * Applies a windowing function to a given signal.
   * @param {Float32Array} sig - The input signal.
   * @param {string} type - The type of window to apply ("hanning", "hamming", "blackman").
   * @returns {Float32Array} The windowed signal.
   */
  self.windowing = function ( sig, type ) {
    var windowed = new Float32Array( sig.length );

    if ( type == "hanning" ) {
      for ( var i = 0; i < sig.length; i++ ) {
        windowed[i] = sig[i] * self.hanning[i];
      }
    } else if ( type == "hamming" ) {
      for ( var i = 0; i < sig.length; i++ ) {
        windowed[i] = sig[i] * self.hamming[i];
      }
    } else if ( type == "blackman" ) {
      // This branch will currently do nothing as blackman is not implemented.
      for ( var i = 0; i < sig.length; i++ ) {
        windowed[i] = sig[i] * self.blackman[i];
      }
    }

    return windowed;
  };


  // --- SOURCE MANAGEMENT ---

  /**
   * Sets a new audio source for Meyda to process.
   * @param {AudioNode} _src - The new audio source node.
   */
  self.setSource = function ( _src ) {
    source = _src;
    source.connect( window.spn ); // Connects the source to the script processor node.
  };



  // Initialize Meyda only if buffer size is a power of two and audio context is provided.
  if ( isPowerOfTwo( bufferSize ) && audioContext ) {

    // Metadata about available features and their data types.
    self.featureInfo = {
      "buffer": {
        "type": "array"
      },
      "rms": {
        "type": "number"
      },
      "energy": {
        "type": "number"
      },
      "zcr": {
        "type": "number"
      },
      "complexSpectrum": {
        "type": "multipleArrays",
        "arrayNames": {
          "1": "real",
          "2": "imag"
        }
      },
      "amplitudeSpectrum": {
        "type": "array"
      },
      "powerSpectrum": {
        "type": "array"
      },
      "spectralCentroid": {
        "type": "number"
      },
      "spectralFlatness": {
        "type": "number"
      },
      "spectralSlope": {
        "type": "number"
      },
      "spectralRolloff": {
        "type": "number"
      },
      "spectralSpread": {
        "type": "number"
      },
      "spectralSkewness": {
        "type": "number"
      },
      "spectralKurtosis": {
        "type": "number"
      },
      "loudness": {
        "type": "multipleArrays",
        "arrayNames": {
          "1": "total",
          "2": "specific"
        }
      },
      "perceptualSpread": {
        "type": "number"
      },
      "perceptualSharpness": {
        "type": "number"
      },
      "mfcc": {
        "type": "array"
      }
    };


    // --- FEATURE EXTRACTORS ---
    // A collection of functions, each responsible for computing a specific audio feature.
    self.featureExtractors = {

      // Raw audio buffer.
      "buffer": function ( bufferSize, m ) {
        return m.signal;
      },

      // Root Mean Square (RMS) of the signal.
      "rms": function ( bufferSize, m ) {
        var rms = 0;
        for ( var i = 0; i < m.signal.length; i++ ) {
          rms += Math.pow( m.signal[i], 2 );
        }
        rms = rms / m.signal.length;
        rms = Math.sqrt( rms );

        return rms;
      },

      // Energy of the signal.
      "energy": function ( bufferSize, m ) {
        var energy = 0;
        for ( var i = 0; i < m.signal.length; i++ ) {
          energy += Math.pow( Math.abs( m.signal[i] ), 2 );
        }
        return energy;
      },

      // Complex spectrum (real and imaginary parts).
      "complexSpectrum": function ( bufferSize, m ) {
        return m.complexSpectrum;
      },

      // Spectral Slope.
      "spectralSlope": function ( bufferSize, m ) {
        // Implements linear regression for spectral slope.
        var ampSum = 0;
        var freqSum = 0;
        var freqs = new Float32Array( m.ampSpectrum.length );
        var powFreqSum = 0;
        var ampFreqSum = 0;

        for ( var i = 0; i < m.ampSpectrum.length; i++ ) {
          ampSum += m.ampSpectrum[i];
          var curFreq = i * m.audioContext.sampleRate / bufferSize;
          freqs[i] = curFreq;
          powFreqSum += curFreq * curFreq;
          freqSum += curFreq;
          ampFreqSum += curFreq * m.ampSpectrum[i];
        }
        return ( m.ampSpectrum.length * ampFreqSum - freqSum * ampSum ) / ( ampSum * ( powFreqSum - Math.pow( freqSum, 2 ) ) );
      },

      // Spectral Centroid.
      "spectralCentroid": function ( bufferSize, m ) {
        return µ( 1, m.ampSpectrum );
      },

      // Spectral Rolloff.
      "spectralRolloff": function ( bufferSize, m ) {
        var ampspec = m.ampSpectrum;
        // Calculate the Nyquist bin frequency.
        var nyqBin = m.audioContext.sampleRate / ( 2 * ( ampspec.length - 1 ) );
        var ec = 0;
        for ( var i = 0; i < ampspec.length; i++ ) {
          ec += ampspec[i];
        }
        var threshold = 0.99 * ec; // 99% energy threshold.
        var n = ampspec.length - 1;
        while ( ec > threshold && n >= 0 ) {
          ec -= ampspec[n];
          --n;
        }
        return ( n + 1 ) * nyqBin;
      },

      // Spectral Flatness.
      "spectralFlatness": function ( bufferSize, m ) {
        var ampspec = m.ampSpectrum;
        var numerator = 0;
        var denominator = 0;
        for ( var i = 0; i < ampspec.length; i++ ) {
          numerator += Math.log( ampspec[i] );
          denominator += ampspec[i];
        }
        return Math.exp( numerator / ampspec.length ) * ampspec.length / denominator;
      },

      // Spectral Spread.
      "spectralSpread": function ( bufferSize, m ) {
        var ampspec = m.ampSpectrum;
        return Math.sqrt( µ( 2, ampspec ) - Math.pow( µ( 1, ampspec ), 2 ) );
      },

      // Spectral Skewness.
      "spectralSkewness": function ( bufferSize, m, spectrum ) {
        var ampspec = m.ampSpectrum;
        var µ1 = µ( 1, ampspec );
        var µ2 = µ( 2, ampspec );
        var µ3 = µ( 3, ampspec );
        var numerator = 2 * Math.pow( µ1, 3 ) - 3 * µ1 * µ2 + µ3;
        var denominator = Math.pow( Math.sqrt( µ2 - Math.pow( µ1, 2 ) ), 3 );
        return numerator / denominator;
      },

      // Spectral Kurtosis.
      "spectralKurtosis": function ( bufferSize, m ) {
        var ampspec = m.ampSpectrum;
        var µ1 = µ( 1, ampspec );
        var µ2 = µ( 2, ampspec );
        var µ3 = µ( 3, ampspec );
        var µ4 = µ( 4, ampspec );
        var numerator = -3 * Math.pow( µ1, 4 ) + 6 * µ1 * µ2 - 4 * µ1 * µ3 + µ4;
        var denominator = Math.pow( Math.sqrt( µ2 - Math.pow( µ1, 2 ) ), 4 );
        return numerator / denominator;
      },

      // Amplitude Spectrum.
      "amplitudeSpectrum": function ( bufferSize, m ) {
        return m.ampSpectrum;
      },

      // Zero Crossing Rate (ZCR).
      "zcr": function ( bufferSize, m ) {
        var zcr = 0;
        for ( var i = 0; i < m.signal.length; i++ ) {
          if ( ( m.signal[i] >= 0 && m.signal[i + 1] < 0 ) || ( m.signal[i] < 0 && m.signal[i + 1] >= 0 ) ) {
            zcr++;
          }
        }
        return zcr;
      },

      // Power Spectrum.
      "powerSpectrum": function ( bufferSize, m ) {
        var powerSpectrum = new Float32Array( m.ampSpectrum.length );
        for ( var i = 0; i < powerSpectrum.length; i++ ) {
          powerSpectrum[i] = Math.pow( m.ampSpectrum[i], 2 );
        }
        return powerSpectrum;
      },

      // Loudness (total and specific bark bands).
      "loudness": function ( bufferSize, m ) {
        var barkScale = new Float32Array( m.ampSpectrum.length );
        var NUM_BARK_BANDS = 24;
        var specific = new Float32Array( NUM_BARK_BANDS );
        var tot = 0;
        var normalisedSpectrum = m.ampSpectrum;
        var bbLimits = new Int32Array( NUM_BARK_BANDS + 1 );

        for ( var i = 0; i < barkScale.length; i++ ) {
          barkScale[i] = i * m.audioContext.sampleRate / ( bufferSize );
          barkScale[i] = 13 * Math.atan( barkScale[i] / 1315.8 ) + 3.5 * Math.atan( Math.pow( ( barkScale[i] / 7518 ), 2 ) );
        }


        bbLimits[0] = 0;
        var currentBandEnd = barkScale[m.ampSpectrum.length - 1] / NUM_BARK_BANDS;
        var currentBand = 1;
        for ( var i = 0; i < m.ampSpectrum.length; i++ ) {
          while ( barkScale[i] > currentBandEnd ) {
            bbLimits[currentBand++] = i;
            currentBandEnd = currentBand * barkScale[m.ampSpectrum.length - 1] / NUM_BARK_BANDS;
          }
        }

        bbLimits[NUM_BARK_BANDS] = m.ampSpectrum.length - 1;

        // Process bark bands.
        for ( var i = 0; i < NUM_BARK_BANDS; i++ ) {
          var sum = 0;
          for ( var j = bbLimits[i]; j < bbLimits[i + 1]; j++ ) {

            sum += normalisedSpectrum[j];
          }
          specific[i] = Math.pow( sum, 0.23 );
        }

        // Calculate total loudness.
        for ( var i = 0; i < specific.length; i++ ) {
          tot += specific[i];
        }
        return {
          "specific": specific,
          "total": tot
        };
      },

      // Perceptual Spread.
      "perceptualSpread": function ( bufferSize, m ) {
        var loudness = m.featureExtractors["loudness"]( bufferSize, m );

        var max = 0;
        for ( var i = 0; i < loudness.specific.length; i++ ) {
          if ( loudness.specific[i] > max ) {
            max = loudness.specific[i];
          }
        }

        var spread = Math.pow( ( loudness.total - max ) / loudness.total, 2 );

        return spread;
      },

      // Perceptual Sharpness.
      "perceptualSharpness": function ( bufferSize, m ) {
        var loudness = m.featureExtractors["loudness"]( bufferSize, m );
        var spec = loudness.specific;
        var output = 0;

        for ( var i = 0; i < spec.length; i++ ) {
          if ( i < 15 ) {
            output += ( i + 1 ) * spec[i + 1];
          } else {
            output += 0.066 * Math.exp( 0.171 * ( i + 1 ) );
          }
        }
        ;
        output *= 0.11 / loudness.total;

        return output;
      },

      // Mel-Frequency Cepstral Coefficients (MFCCs).
      "mfcc": function ( bufferSize, m ) {
        // Implementation based on a tutorial:
        // http://practicalcryptography.com/miscellaneous/machine-learning/guide-mel-frequency-cepstral-coefficients-mfccs/
        var powSpec = m.featureExtractors["powerSpectrum"]( bufferSize, m );

        var freqToMel = function ( freqValue ) {
          var melValue = 1125 * Math.log( 1 + ( freqValue / 700 ) );
          return melValue;
        };

        var melToFreq = function ( melValue ) {
          var freqValue = 700 * ( Math.exp( melValue / 1125 ) - 1 );
          return freqValue;
        };

        var numFilters = 26; // Standard number of filters.
        var melValues = new Float32Array( numFilters + 2 ); // Includes upper and lower limits.
        var melValuesInFreq = new Float32Array( numFilters + 2 );

        // Define frequency limits for Mel scale.
        var lowerLimitFreq = 0;
        var upperLimitFreq = audioContext.sampleRate / 2;

        // Convert limits to Mel scale.
        var lowerLimitMel = freqToMel( lowerLimitFreq );
        var upperLimitMel = freqToMel( upperLimitFreq );

        // Calculate range and interpolation value.
        var range = upperLimitMel - lowerLimitMel;
        var valueToAdd = range / ( numFilters + 1 );

        var fftBinsOfFreq = Array( numFilters + 2 );

        for ( var i = 0; i < melValues.length; i++ ) {
          // Initialize mel frequencies with linear interpolation.
          melValues[i] = i * valueToAdd;
          // Convert back to Hz.
          melValuesInFreq[i] = melToFreq( melValues[i] );
          // Find corresponding FFT bins.
          fftBinsOfFreq[i] = Math.floor( ( bufferSize + 1 ) * melValuesInFreq[i] / audioContext.sampleRate );
        }
        ;

        var filterBank = Array( numFilters );
        for ( var j = 0; j < filterBank.length; j++ ) {
          // Create 2D array for filter bank, initialized with zeros.
          filterBank[j] = Array.apply( null, new Array( ( bufferSize / 2 ) + 1 ) ).map( Number.prototype.valueOf, 0 );
          // Create lower and upper slopes for each bin.
          for ( var i = fftBinsOfFreq[j]; i < fftBinsOfFreq[j + 1]; i++ ) {
            filterBank[j][i] = ( i - fftBinsOfFreq[j] ) / ( fftBinsOfFreq[j + 1] - fftBinsOfFreq[j] );
          }
          for ( var i = fftBinsOfFreq[j + 1]; i < fftBinsOfFreq[j + 2]; i++ ) {
            filterBank[j][i] = ( fftBinsOfFreq[j + 2] - i ) / ( fftBinsOfFreq[j + 2] - fftBinsOfFreq[j + 1] );
          }
        }

        var loggedMelBands = new Float32Array( numFilters );
        for ( var i = 0; i < loggedMelBands.length; i++ ) {
          loggedMelBands[i] = 0;
          for ( var j = 0; j < ( bufferSize / 2 ); j++ ) {
            // Point-wise multiplication of power spectrum and filter banks.
            filterBank[i][j] = filterBank[i][j] * powSpec[j];

            // Sum coefficients into one array.
            loggedMelBands[i] += filterBank[i][j];
          }
          // Log each coefficient.
          loggedMelBands[i] = Math.log( loggedMelBands[i] );
        }

        // Discrete Cosine Transform (DCT) for MFCCs.
        var k = Math.PI / numFilters;
        var w1 = 1.0 / Math.sqrt( numFilters );
        var w2 = Math.sqrt( 2.0 / numFilters );
        var numCoeffs = 13; // Standard number of MFCCs.
        var dctMatrix = new Float32Array( numCoeffs * numFilters );

        for ( var i = 0; i < numCoeffs; i++ ) {
          for ( var j = 0; j < numFilters; j++ ) {
            var idx = i + ( j * numCoeffs );
            if ( i == 0 ) {
              dctMatrix[idx] = w1 * Math.cos( k * ( i + 1 ) * ( j + 0.5 ) );
            } else {
              dctMatrix[idx] = w2 * Math.cos( k * ( i + 1 ) * ( j + 0.5 ) );
            }
          }
        }

        var mfccs = new Float32Array( numCoeffs );
        for ( var k_mfcc = 0; k_mfcc < numCoeffs; k_mfcc++ ) { // Renamed k to k_mfcc to avoid conflict with `k` above.
          var v = 0;
          for ( var n = 0; n < numFilters; n++ ) {
            var idx = k_mfcc + ( n * numCoeffs );
            v += ( dctMatrix[idx] * loggedMelBands[n] );
          }
          mfccs[k_mfcc] = v / numCoeffs;
        }
        return mfccs;
      }
    };

    // --- AUDIO PROCESSING NODE SETUP ---

    // Create a ScriptProcessorNode for real-time audio analysis.
    window.spn = audioContext.createScriptProcessor( bufferSize, 1, 1 );
    spn.connect( audioContext.destination ); // Connect to destination to keep it alive.

    // Define the audio processing callback.
    window.spn.onaudioprocess = function ( e ) {
      // Get the input audio data from the first channel.
      var inputData = e.inputBuffer.getChannelData( 0 );
      self.signal = inputData;

      // Apply the chosen windowing function.
      var windowedSignal = self.windowing( self.signal, self.windowingFunction );

      // Create a ComplexArray for FFT processing.
      var data = new complex_array.ComplexArray( bufferSize );
      // Map the time domain data to the real part of the complex array.
      data.map( function ( value, i, n ) {
        value.real = windowedSignal[i];
      } );

      // Perform the Fast Fourier Transform (FFT).
      var spec = data.FFT();

      // Assign the complex spectrum to the Meyda instance.
      self.complexSpectrum = spec;
      self.ampSpectrum = new Float32Array( bufferSize / 2 );

      // Calculate the amplitude spectrum from the complex spectrum.
      for ( var i = 0; i < bufferSize / 2; i++ ) {
        self.ampSpectrum[i] = Math.sqrt( Math.pow( spec.real[i], 2 ) + Math.pow( spec.imag[i], 2 ) );

      }

      // If a callback is defined and extraction is started, call it with the extracted features.
      if ( typeof callback === "function" && EXTRACTION_STARTED ) {
        callback( self.get( _featuresToExtract ) );
      }
    };


    // --- CONTROL METHODS ---

    /**
     * Starts the feature extraction process.
     * @param {Array<string>} features - An array of feature names to extract.
     */
    self.start = function ( features ) {
      _featuresToExtract = features;
      EXTRACTION_STARTED = true;
    };

    /**
     * Stops the feature extraction process.
     */
    self.stop = function () {
      EXTRACTION_STARTED = false;
    };

    // Store the audio context for later use by extractors.
    self.audioContext = audioContext;

    /**
     * Retrieves the specified audio features.
     * @param {string|Array<string>} feature - The name of a feature or an array of feature names.
     * @returns {Object|any} An object containing requested features or a single feature value.
     */
    self.get = function ( feature ) {
      if ( typeof feature === "object" ) { // If an array of features is requested.
        var results = {};
        for ( var x = 0; x < feature.length; x++ ) {
          try {
            results[feature[x]] = ( self.featureExtractors[feature[x]]( bufferSize, self ) );
          } catch ( e ) {
            console.error( e ); // Log errors during feature extraction.
          }
        }
        return results;
      } else if ( typeof feature === "string" ) { // If a single feature is requested.
        try {
          return self.featureExtractors[feature]( bufferSize, self );
        } catch ( e ) {
          console.error( e );
          return null;
        }
      } else {
        console.error( "Invalid feature request. Please provide a string or an array of strings." );
        return null;
      }
    };
  } else {
    // Log an error if Meyda cannot be initialized due to invalid buffer size or missing audio context.
    console.error( "Meyda could not be initialised. Buffer size must be a power of 2 and an AudioContext must be provided." );
  }
};