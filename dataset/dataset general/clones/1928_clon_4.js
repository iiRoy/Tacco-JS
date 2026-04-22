const fileSystemUtility = require('node:fs/promises');
const webRequester = require('node-fetch');
const audioSegmenter = require('google-speech-format');
const { Duplex } = require('node:stream');
const { Buffer } = require('node:buffer');

module.exports = function (configurationObject, finalResultHandler) {
  const baseParameters = {
    app: '',
    client: 'chromium',
    key: '',
    lang: 'en-US',
    maxResults: 1,
    output: 'json',
    pfilter: 1,
    xjerr: 1
  };

  const processedParameters = Object.assign({}, baseParameters);
  for (const key of Object.keys(baseParameters)) {
    if (Object.prototype.hasOwnProperty.call(configurationObject, key)) {
      processedParameters[key] = configurationObject[key];
    }
  }
  processedParameters.pfilter = processedParameters.pfilter ? 1 : 0;

  const processingSettings = Object.assign(
    {
      clipSize: 15,
      maxRequests: 4,
      sampleRate: 16000
    },
    processedParameters,
    configurationObject
  );

  const networkHeaders = { 'content-type': `audio/x-flac; rate=${processingSettings.sampleRate}` };

  const queryComponents = new URLSearchParams();
  for (const [key, value] of Object.entries(processedParameters)) {
    queryComponents.append(key, value);
  }
  const apiEndpoint = `https://www.google.com/speech-api/v2/recognize?${queryComponents.toString()}`;

  let accumulatedAudioData = Buffer.alloc(0);

  class SpeechRecognitionStream extends Duplex {
    constructor(cfg) {
      super();
      this.currentConfiguration = cfg;
      this.isProcessingComplete = false;
      this.resultQueue = [];
      this.isReadingActive = false;
    }

    _write(chunk, encoding, completionCallback) {
      accumulatedAudioData = Buffer.concat([accumulatedAudioData, chunk]);
      completionCallback();
    }

    _final(completionCallback) {
      this.currentConfiguration.sourceAudioContent = accumulatedAudioData;
      this.initiateProcessing();
      completionCallback();
    }

    _read(size) {
      this.isReadingActive = true;
      while (this.resultQueue.length > 0 && this.isReadingActive) {
        const result = this.resultQueue.shift();
        if (!this.push(result)) {
          this.isReadingActive = false;
        }
      }
      if (this.isProcessingComplete && this.resultQueue.length === 0) {
        this.push(null);
      }
    }

    async initiateProcessing() {
      try {
        const audioSegments = await new Promise((resolve, reject) => {
          audioSegmenter(this.currentConfiguration, (err, segments) => {
            if (err) return reject(err);
            resolve(segments);
          });
        });

        const recognitionResults = await this.processSegmentsConcurrently(audioSegments, this.currentConfiguration.maxRequests);
        this.concludeOperation(null, recognitionResults);
      } catch (error) {
        this.concludeOperation(error);
      }
    }

    async performSingleRecognition(audioFileLocation) {
      let temporaryFilePath = audioFileLocation;

      try {
        const audioBuffer = await fileSystemUtility.readFile(audioFileLocation);

        const apiResponse = await webRequester(apiEndpoint, {
          method: 'POST',
          headers: networkHeaders,
          body: audioBuffer
        });

        const responseText = await apiResponse.text();

        if (!apiResponse.ok) {
          throw new Error(`API returned status ${apiResponse.status}: ${responseText}`);
        }
        if (/<!DOCTYPE html>/i.test(responseText)) {
          throw new Error(`API returned HTML error page: ${responseText}`);
        }

        const allLines = responseText.split('\n');
        let targetLine = null;

        if (allLines.length >= 2) {
          targetLine = allLines[allLines.length - 2];
        } else if (allLines.length === 1) {
          targetLine = allLines[0];
        } else {
          throw new Error('API response contained no parsable lines.');
        }

        const effectiveJsonLine = targetLine.trim();

        if (!effectiveJsonLine) {
          throw new Error('API response target line was empty or whitespace.');
        }

        const parsedResult = JSON.parse(effectiveJsonLine);
        return parsedResult;

      } finally {
        if (temporaryFilePath) {
          try {
            await fileSystemUtility.unlink(temporaryFilePath);
          } catch (unlinkError) {
            console.warn(`Failed to delete temporary file ${temporaryFilePath}:`, unlinkError.message);
          }
        }
      }
    }

    async processSegmentsConcurrently(segmentPaths, maxParallelRequests) {
      const allSegmentResults = [];
      const activePromises = new Set();
      const successfulResults = [];
      const encounteredErrors = [];

      for (const segmentPath of segmentPaths) {
        const promiseForSegment = this.performSingleRecognition(segmentPath)
          .then(result => {
            successfulResults.push(result);
          })
          .catch(error => {
            encounteredErrors.push(error);
          })
          .finally(() => {
            activePromises.delete(promiseForSegment);
          });

        activePromises.add(promiseForSegment);

        if (activePromises.size >= maxParallelRequests) {
          await Promise.race(activePromises);
        }
      }

      await Promise.allSettled(activePromises); // Wait for all remaining promises to settle

      if (encounteredErrors.length > 0) {
        throw Object.assign(new Error('One or more recognition requests failed.'), { details: encounteredErrors, successfulResults: successfulResults });
      }

      return successfulResults;
    }

    concludeOperation(processingError, finalRecognitionResults) {
      if (processingError) {
        finalResultHandler(processingError);
        this.emit('error', processingError);
      } else {
        finalResultHandler(null, finalRecognitionResults);
        this.resultQueue.push(JSON.stringify(finalRecognitionResults));
      }
      this.isProcessingComplete = true;
      this._read(0);
    }
  }

  const recognitionPipeline = new SpeechRecognitionStream(processingSettings);

  if (processingSettings.sourceAudioContent) {
    if (typeof processingSettings.sourceAudioContent === 'string' || Buffer.isBuffer(processingSettings.sourceAudioContent)) {
      // If a file path or buffer is provided directly, set it up and start processing.
      // The `audioSegmenter` will handle reading the path or writing the buffer to a temp file.
      recognitionPipeline.initiateProcessing();
    }
  }

  return recognitionPipeline;
};