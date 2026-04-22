(function(globalObj, PerformanceMonitor) {

  globalObj.PerfMetrics = function() {
    this.timestamps = {};
    this.monitorRef = PerformanceMonitor;

    this.setTimestamp = function(label) {
      this.timestamps[label] = Date.now();
    };

    this.getInterval = function(finishLabel, beginLabel) {
      let endTimeValue, startTimeValue;

      if (beginLabel) {
        startTimeValue = this.timestamps[beginLabel];
        endTimeValue = this.timestamps[finishLabel];
      } else {
        startTimeValue = this.timestamps[finishLabel];
        endTimeValue = Date.now();
      }

      return endTimeValue - startTimeValue;
    };

    this.emitMetrics = function(pageSection) {
      if (!this.canSendReport()) {
        return;
      }

      pageSection || (pageSection = globalObj.location.hash.slice(1));

      const contentReadyDuration = this.getInterval('contentLoaded', 'navigationStart');
      const visualCompleteTime = this.getInterval('visualComplete', 'navigationStart');

      this.monitorRef.logMetric(pageSection, 0, 0, 0, contentReadyDuration, visualCompleteTime);
    };

    this.canSendReport = function() {
      if (
        !this.monitorRef ||
        !this.monitorRef.logMetric ||
        typeof this.monitorRef.logMetric !== 'function'
      ) {
        return false;
      }
      return (
        this.timestamps.navigationStart &&
        this.timestamps.contentLoaded &&
        this.timestamps.visualComplete
      );
    };
  };

})(window, window.NREUM);