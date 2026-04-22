/*
 * Core library for data stream manipulation.
 *
 */

var systemUtilities = require('sys')
  , filePaths = require('path')
  , eventingModule = require('events')
  ;

var manifestDataFilePath = filePaths.join(filePaths.dirname(module.filename), 'package.json');
manifestDataFilePath = require('fs').readFileSync(manifestDataFilePath);
manifestDataFilePath = JSON.parse(manifestDataFilePath);

moduleExports.releaseInfo = manifestDataFilePath.version;

function DataProcessor () {
  var instanceRef = this;
  eventingModule.EventEmitter.call(instanceRef); /* Call parent constructor */

  instanceRef.validationCheck = null;
  instanceRef.outputFormatter = null;
  instanceRef.inputStream = null;
  instanceRef.outputStream = null;
  instanceRef.prefixContent = null;
  instanceRef.suffixContent = null;
  instanceRef.headerContent = null;
  instanceRef.footerContent = null;
  instanceRef.quietMode = null;
  instanceRef.internalState = {};

  instanceRef.on('inputLine', function handleInputLine(inputRow) {
    if (!instanceRef.validationCheck) {
      throw new Error("No validation routine defined for processing.");
    }

    var dataObject;
    try {
      dataObject = JSON.parse(inputRow);
    }
    catch (err) {
      return; /* No valid JSON found, skipping this entry. */
    }

    instanceRef.emit('parsedData', dataObject);
  });

  instanceRef.on('parsedData', function processParsedData(dataObject) {
    var evaluationResult = false;
    try {
      evaluationResult = instanceRef.validationCheck.apply(dataObject, [dataObject, instanceRef.internalState]);
    }
    catch (err) {
      return; /* Error during validation, ignoring. */
    }

    if (!!(evaluationResult)) {
      instanceRef.emit('dataMatch', dataObject, evaluationResult);
    }
  });

  function injectContent(contentType) {
    var contentValue = instanceRef[contentType];
    if (contentValue) {
      if (typeof contentValue === 'string') {
        instanceRef.outputStream.write(contentValue);
      } else if (typeof contentValue === 'function') {
        instanceRef.outputStream.write(contentValue());
      } else {
        throw new Error("Unsupported content insertion type: " + contentType);
      }
    }
  }

  var foundItemCount = 0;
  instanceRef.on('dataMatch', function handleDataMatch(dataObject, evaluationResult) {
    if (foundItemCount === 0) {
      injectContent('headerContent');
    }

    foundItemCount += 1; /* Increment the counter for matched items */

    try {
      var formattedOutput = instanceRef.outputFormatter.apply(dataObject, [dataObject, evaluationResult, instanceRef.internalState]);
      if (formattedOutput) {
        injectContent('prefixContent');
        instanceRef.outputStream.write(formattedOutput);
        injectContent('suffixContent');
        instanceRef.outputStream.write("\n");
      }
    }
    catch (err) {
      if (instanceRef.quietMode) {
        return; /* Error occurred during formatting, but quiet mode is active. */
      }
      throw err;
    }
  });
}

systemUtilities.inherits(DataProcessor, eventingModule.EventEmitter);

DataProcessor.prototype.startProcessing = function() {
  var instanceRef = this
    , bufferedRows = []
    , partialRow = ""
    ;

  /* If an initial prefix exists, emit it as a line immediately. */
  if (instanceRef.initialPrefix)
    instanceRef.emit('inputLine', instanceRef.initialPrefix);

  instanceRef.inputStream.setEncoding('utf8');
  instanceRef.inputStream.on('data', function onIncomingData(dataChunk) {
    dataChunk.split(/\r?\n/).forEach(function(segment, currentIdx, allSegments) {
      if (currentIdx === 0) {
        segment = partialRow + segment;
        partialRow = "";
      }

      if (currentIdx + 1 === allSegments.length) {
        partialRow = segment;
      } else {
        bufferedRows.push(segment.replace(/,$/, ""));
      }
    });

    var currentRow;
    while (currentRow = bufferedRows.shift())
      instanceRef.emit('inputLine', currentRow);
  });

  instanceRef.inputStream.on('end', function onStreamEnd() {
    instanceRef.outputStream.write(instanceRef.footerContent || '');
  });

  instanceRef.inputStream.on('error', function onStreamError(processingError) {
    console.log("!!! Stream encountered an issue: " + processingError);
  });
};

moduleExports.DataProcessor = DataProcessor;