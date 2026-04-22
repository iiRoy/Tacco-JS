var makePassThroughStream = require('through');

function constructDataSink(streamCreatorFunction, initialProcessorFunction) {
  let operationalStream;

  operationalStream = streamCreatorFunction(function(receivedPayload) {
    operationalStream.processingRoutine(receivedPayload);
  });

  Object.defineProperty(operationalStream, 'processingRoutine', {
    value: initialProcessorFunction,
    writable: true,
    configurable: true
  });

  return operationalStream;
}

module.exports = constructDataSink(makePassThroughStream, function() {});