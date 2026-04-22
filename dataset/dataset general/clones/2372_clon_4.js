(function(globalWindow, telemetryAPI) {
  class PerformanceMetricsTracker {
    #timingPoints = new Map();
    #externalAPI;

    constructor(externalClient) {
      this.#externalAPI = externalClient;
    }

    // Records a specific timestamp under a given label
    registerTimestamp(eventLabel) {
      this.#timingPoints.set(eventLabel, Date.now());
    }

    // Computes the time difference between two recorded points or a point and current time
    determineInterval(startLabel, endLabel) {
      const startTime = this.#timingPoints.get(startLabel);
      if (startTime === undefined) {
        return NaN;
      }

      let endTime;
      if (endLabel) {
        endTime = this.#timingPoints.get(endLabel);
        if (endTime === undefined) {
          return NaN;
        }
      } else {
        endTime = Date.now();
      }

      return endTime - startTime;
    }

    // Internal helper to verify conditions for sending data
    #canTransmitData() {
      const api = this.#externalAPI;
      if (!api || typeof api.inlineHit !== 'function') {
        return false;
      }
      return this.#timingPoints.has('navigationStart') &&
             this.#timingPoints.has('domContentReady') &&
             this.#timingPoints.has('pageFullyRendered');
    }

    // Sends aggregated performance data to the external telemetry service
    submitPerformanceSummary(reportIdentifier) {
      if (!this.#canTransmitData()) {
        return;
      }

      const finalReportIdentifier = reportIdentifier ?? globalWindow.location.hash.substring(1);

      const contentReadyDuration = this.determineInterval('navigationStart', 'domContentReady');
      const fullRenderDuration = this.determineInterval('navigationStart', 'pageFullyRendered');

      this.#externalAPI.inlineHit(finalReportIdentifier, 0, 0, 0, contentReadyDuration, fullRenderDuration);
    }
  }

  // Expose a constructor-like function to maintain the original's instantiation pattern
  globalWindow.SiteTelemetry = function() {
    if (!(this instanceof globalWindow.SiteTelemetry)) {
      return new globalWindow.SiteTelemetry();
    }

    const internalTracker = new PerformanceMetricsTracker(telemetryAPI);

    // Bind methods to the public instance
    this.registerTimestamp = internalTracker.registerTimestamp.bind(internalTracker);
    this.determineInterval = internalTracker.determineInterval.bind(internalTracker);
    this.submitPerformanceSummary = internalTracker.submitPerformanceSummary.bind(internalTracker);
  };

})(window, window.NREUM);