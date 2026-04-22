var utilz = require('lodash');
var concurr = require('async');
var joiner = require('concat-stream');
var biStream = require('duplexer');
var fileSys = require('fs');
var synthesizer = require('google-speech-format');
var queryBldr = require('qs');
var httpReq = require('request');
var passThru = require('through');

module.exports = function (inputConfig, finalHandler) {
  var requestArgs = {
    applicationId: '',
    userAgent: 'chromium',
    apiKey: '',
    languageCode: 'en-US',
    maxOutcomes: 1,
    resultFormat: 'json',
    profanityFilter: 1,
    jsonError: 1
  };

  requestArgs = utilz.extend(requestArgs, utilz.pick.apply(this, [inputConfig].concat(utilz.keys(requestArgs))));
  requestArgs.profanityFilter = requestArgs.profanityFilter ? 1 : 0;

  inputConfig = utilz.defaults(inputConfig, requestArgs, {
    chunkSize: 15,
    maximumConcurrentRequests: 4,
    audioSampleRate: 16000
  });

  // Construct a flowing stream that will retrieve spoken text
  // from the Google speech recognition service once finalized.
  var sourceStream = passThru( null, function () {
    this.queue(null);
    initiateProcessing();
  });

  // Establish an accumulating stream to collect audio material,
  // combine it all, then terminate the reading stream.
  var sinkStream = joiner(function (audioChunk) {
    inputConfig.audioData = audioChunk;
    sourceStream.end();
  });

  var httpHeaders = { 'Content-Type': 'audio/x-flac; rate=' + inputConfig.audioSampleRate };
  var apiEndpoint = 'https://www.google.com/speech-api/v2/recognize?' + queryBldr.stringify(requestArgs);
  var duplexPipe = biStream(sinkStream, sourceStream);
  duplexPipe.pause();

  function fetchTranscription(audioFilePath, handlerFn) {
    fileSys.readFile(audioFilePath, function (errorObj, fileContent) {
      if (errorObj) return handlerFn(errorObj);

      httpReq.post({ body: fileContent, headers: httpHeaders, url: apiEndpoint },
        function (errorObj, httpResponse, responseBody) {
          if (errorObj) return handlerFn(errorObj);
          if ( /<!DOCTYPE html>/i.test(responseBody) ) return handlerFn(responseBody);
          responseBody = utilz.last(responseBody.split('\n'), 2)[0];

          try {
            handlerFn(null, JSON.parse(responseBody));
          }
          catch (exceptionObj) {
            handlerFn(exceptionObj);
          }
          finally {
            fileSys.unlink(audioFilePath);
          }
        }
      );
    });
  }

  function completionCallback(errorObj, finalResult) {
    finalHandler(errorObj, finalResult);
    duplexPipe.resume().queue(JSON.stringify(finalResult)).end();
  }

  function initiateProcessing() {
    synthesizer(inputConfig, function (errorObj, processedAudioFiles) {
      if (errorObj) return finalHandler(errorObj);
      concurr.mapLimit(processedAudioFiles, inputConfig.maximumConcurrentRequests, fetchTranscription, completionCallback);
    });
  }

  // Engage the API if an initial audio file is supplied.
  if (inputConfig.audioData) initiateProcessing();

  // Otherwise, await incoming data on the writing stream.
  return duplexPipe;
};