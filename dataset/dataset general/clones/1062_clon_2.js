(function(envScope) {
  var mediaTransmitter = new StreamConnector('ws://localhost:9001');

  mediaTransmitter.on('linkReady', function() {
    envScope.mediaChannel = mediaTransmitter.createStream();

    if (!navigator.getUserMedia)
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                               navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
      navigator.getUserMedia({ audio: true }, audioInitCallback, function(problemEvent) {
        envScope.alert('Error occurred during audio stream acquisition.');
      });
    } else {
      envScope.alert('getUserMedia API is not supported in this browser environment.');
    }

    var captureActive = false;

    envScope.beginAudioFlow = function() {
      captureActive = true;
    };

    envScope.endAudioFlow = function() {
      captureActive = false;
      envScope.mediaChannel.end();
    };

    function audioInitCallback(streamEvent) {
      var soundEngineContext = envScope.AudioContext || envScope.webkitAudioContext;
      var processingEngine = new soundEngineContext();

      // The audio sampling rate is available at processingEngine.sampleRate.
      var streamInput = processingEngine.createMediaStreamSource(streamEvent);

      const dataChunkSize = 2048;
      var scriptProcessor = processingEngine.createScriptProcessor(dataChunkSize, 1, 1);

      scriptProcessor.onaudioprocess = function(inputEvent) {
        if (!captureActive) return;
        console.log('Audio capture in progress...');
        var monoChannelBuffer = inputEvent.inputBuffer.getChannelData(0);
        envScope.mediaChannel.write(rescaleTo16Bit(monoChannelBuffer));
      };

      streamInput.connect(scriptProcessor);
      scriptProcessor.connect(processingEngine.destination);
    }

    function rescaleTo16Bit(floatBuffer) {
      var lengthIterator = floatBuffer.length;
      var outputIntArray = new Int16Array(lengthIterator);

      while (lengthIterator--) {
        outputIntArray[lengthIterator] = floatBuffer[lengthIterator] * 65535; // Convert to 16-bit signed integer range.
      }
      return outputIntArray.buffer;
    }
  });
})(this);