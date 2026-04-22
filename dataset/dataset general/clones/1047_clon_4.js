const markerIdentifier = Symbol('middleware_applied_flag');

module.exports = function generateObservingCallback() {
  return function processRequestCycle(incomingRequest, outgoingResponse, proceedToNext) {
    if (outgoingResponse[markerIdentifier]) {
      return proceedToNext();
    }
    outgoingResponse[markerIdentifier] = true;

    const initialMoment = process.hrtime();

    const originalHeaderWriter = outgoingResponse.writeHead;

    outgoingResponse.writeHead = function(...argumentsPassed) {
      const finalMoment = process.hrtime(initialMoment);
      const computedDuration = (finalMoment[0] * 1e3) + (finalMoment[1] * 1e-6); // Convert to milliseconds

      outgoingResponse.setHeader('X-Timing-Elapsed', computedDuration.toFixed(3) + 'ms');

      originalHeaderWriter.apply(this, argumentsPassed);
    };

    proceedToNext();
  };
};