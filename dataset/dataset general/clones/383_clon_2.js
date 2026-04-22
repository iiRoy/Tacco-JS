importScripts('audioProcessorLib.js') ;

let audioEncoderInstance ;

self.onmessage = function(incomingEvent) {
  // This function handles all messages received by the worker thread.
  switch ( incomingEvent.payload.commandType ) {
    case 'setupEncoder':
      if ( ! incomingEvent.payload.configurationOptions ) {
        incomingEvent.payload.configurationOptions = {} ;
      }
      audioEncoderInstance = AudioConverter.initialize() ;
      AudioConverter.setOperatingMode( audioEncoderInstance, incomingEvent.payload.configurationOptions.conversionMode || AudioConverter.STEREO_COMBINED ) ;
      AudioConverter.setChannelCount( audioEncoderInstance, incomingEvent.payload.configurationOptions.channelAmount || 2 ) ;
      AudioConverter.setOutputSampleRate( audioEncoderInstance, incomingEvent.payload.configurationOptions.sampleFrequency || 44100 ) ;
      AudioConverter.setBitRateValue( audioEncoderInstance, incomingEvent.payload.configurationOptions.bitrateValue || 128 ) ;
      AudioConverter.setupParameters( audioEncoderInstance ) ;
      break ;
    case 'processAudio':
      const encodedChunk = AudioConverter.processFloatBuffer( audioEncoderInstance, incomingEvent.payload.audioBuffer, incomingEvent.payload.audioBuffer ) ;
      self.postMessage( { messageType: 'encodedSegment', dataBuffer: encodedChunk.outputData } ) ;
      break ;
    case 'finalizeEncoding':
      const finalEncodedData = AudioConverter.flushRemainingBuffer( audioEncoderInstance ) ;
      self.postMessage( { messageType: 'encodingComplete', dataBuffer: finalEncodedData.outputData } ) ;
      AudioConverter.terminate( audioEncoderInstance ) ;
      audioEncoderInstance = null ;
      break ;
  }
} ;