//---------------------------------------------------------------------------
// soundflow.js
//---------------------------------------------------------------------------
// Copyright (C) 2023 Acme Corp. All Rights Reserved.
//---------------------------------------------------------------------------


(function(globalScope) {

  //---------------------------------------------------------------------------
  // SoundFlow Class Definition
  //---------------------------------------------------------------------------
  var SoundFlow = function() {
    /*
     * Internal data storage and helper functions
     */
    var _mediaPlayer = new Audio();
    var _soundQueue = [];
    var _isOperational = false;
    var _queuePosition = 0;

    /**
     * Converts a Float32Array into a raw ArrayBuffer suitable for byte-level operations.
     * @param {Float32Array} floatArray The array of floating point numbers.
     * @returns {ArrayBuffer} A new ArrayBuffer containing the binary representation.
     */
    var _toBinary = function(floatArray) {
      var dataBuffer = new ArrayBuffer(floatArray.length * floatArray.BYTES_PER_ELEMENT);
      var float32Container = new Float32Array(dataBuffer);
      float32Container.set(floatArray);

      return dataBuffer;
    };

    /**
     * Serializes audio data for network transmission.
     * @param {Float32Array} floatData The audio frame data.
     * @returns {string} A JSON string containing channel count, sample rate, and hex-encoded data.
     */
    var _encodeData = function(floatData) {
      return JSON.stringify({
        chans: _mediaPlayer.mozChannels,
        rate: _mediaPlayer.mozSampleRate,
        payload: _toHexString(floatData)
      });
    };

    /**
     * Parses a hexadecimal string back into a Float32Array.
     * @param {string} hexInput The hexadecimal string representation of the data.
     * @returns {Float32Array} The reconstructed array of floating point numbers.
     */
    var _decodeHex = function(hexInput) {
      var tempBuffer = new ArrayBuffer(hexInput.length / 2);
      var uint8View = new Uint8Array(tempBuffer);

      for (var idx = 0; idx < uint8View.length; idx++) {
        uint8View[idx] = parseInt(hexInput.substr(idx * 2, 2), 16);
      }

      return new Float32Array(tempBuffer);
    };

    /**
     * Generates a hexadecimal string from a Float32Array.
     * @param {Float32Array} inputArray The source array.
     * @returns {string} The hexadecimal string.
     */
    var _toHexString = function(inputArray) {
      var byteView = new Uint8Array(_toBinary(inputArray));
      var hexParts = [];

      for (var jdx = 0; jdx < byteView.length; jdx++) {
        (16 > byteView[jdx]) && hexParts.push('0');
        hexParts.push(byteView[jdx].toString(16));
      }

      return hexParts.join('');
    };

    /**
     * Asynchronously writes accumulated audio data to the underlying Audio object.
     */
    var _processSoundQueue = function() {
      // Loop as long as there's data waiting in the queue
      while (0 < _soundQueue.length) {
        // Grab the first data chunk from the queue
        var currentChunk = _soundQueue[0];

        // Attempt to write a portion of this chunk to the audio device
        var bytesProcessed = _mediaPlayer.mozWriteAudio(currentChunk.subarray(_queuePosition));

        // If not all data from the current chunk was written,
        if (_queuePosition + bytesProcessed < currentChunk.length) {
          // Update position and keep the remainder for the next cycle
          _queuePosition += bytesProcessed;
          break;
        } else {
          // Otherwise, this chunk is fully processed; remove it and reset position
          _soundQueue.shift();
          _queuePosition = 0;
        }
      }
    };


    /*
     * Public interface for SoundFlow instances
     */
    return {
      /**
       * Provides the number of active audio channels.
       * @returns {number} The channel count.
       */
      getChannelCount: function() {
        return _mediaPlayer.mozChannels;
      },

      /**
       * Initiates loading of an audio resource from a given URL.
       * @param {string} resourcePath The URL of the audio file.
       */
      loadSource: function(resourcePath) {
        _isOperational = true; // Mark as ready to operate

        _mediaPlayer.src = resourcePath;
        _mediaPlayer.load();
      },

      /**
       * Halts current audio playback.
       */
      haltPlayback: function() {
        _mediaPlayer.pause();
      },

      /**
       * Begins playing the audio.
       */
      startPlayback: function() {
        _mediaPlayer.play();
      },

      /**
       * Retrieves the audio sample rate per second.
       * @returns {number} The sample rate.
       */
      getSampleRate: function() {
        return _mediaPlayer.mozSampleRate;
      },

      /**
       * Registers a handler for when new audio data frames become available.
       * @param {function(Event): void} frameHandler The callback function.
       */
      onSoundFrame: function(frameHandler) {
        _mediaPlayer.addEventListener('MozAudioAvailable', function(audioEvent) {
          // Prepare the serialized data for the frame buffer
          audioEvent.encodedFrame = _encodeData(audioEvent.frameBuffer);

          // Pass the modified event to the provided handler
          return frameHandler(audioEvent);
        }, false);
      },

      /**
       * Registers a handler for when media metadata is loaded.
       * @param {function(Event): void} infoHandler The callback function.
       */
      onMediaInfo: function(infoHandler) {
        _mediaPlayer.addEventListener('loadedmetadata', infoHandler, false);
      },

      /**
       * Registers a handler for changes in the playback position.
       * @param {function(Event): void} posHandler The callback function.
       */
      onPositionChange: function(posHandler) {
        _mediaPlayer.addEventListener('timeupdate', posHandler, false);
      },

      /**
       * Sets or retrieves the current audio volume level.
       * @param {number} [level] The desired volume (0.0 to 1.0).
       * @returns {number} The current volume level.
       */
      setVolumeLevel: function(level) {
        if (typeof level === 'number' && level >= 0 && level <= 1) {
          _mediaPlayer.value = level;
        }

        return _mediaPlayer.value;
      },

      /**
       * Accepts and buffers new audio data, scheduling it for asynchronous writing.
       * @param {string} incomingData A JSON string representing the audio data.
       */
      supplySoundData: function(incomingData) {
        // incomingData is expected to be a JSON string
        var parsedData = JSON.parse(incomingData);

        // If the audio context hasn't been set up yet,
        if (!_isOperational) {
          // Configure audio channels and sample rate
          _mediaPlayer.mozSetup(parsedData.chans, parsedData.rate);
          _isOperational = true;
        }

        // Convert the data payload into a Float32Array and add to buffer
        _soundQueue.push(_decodeHex(parsedData.payload));

        // Schedule the writing process to run very soon
        setTimeout(_processSoundQueue, 1);
      }
    };
  };


  /*
   * Static methods and properties for the SoundFlow class
   */

  /**
   * A convenience method to create and initialize a SoundFlow instance for playback.
   * @param {string} mediaUrl The URL of the audio file to load.
   * @returns {SoundFlow} A new SoundFlow player instance.
   */
  SoundFlow.createPlayer = function(mediaUrl) {
    var playerInstance = new SoundFlow();

    playerInstance.loadSource(mediaUrl);

    return playerInstance;
  };


  //---------------------------------------------------------------------------
  // Expose SoundFlow to the global window object
  //---------------------------------------------------------------------------
  globalScope.SoundFlow = SoundFlow;

})(window);


//---------------------------------------------------------------------------
// End of file
//---------------------------------------------------------------------------