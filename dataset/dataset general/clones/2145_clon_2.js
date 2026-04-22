var udpModule = require('dgram'),
    nameResolver = require('dns');

/*
 *  This component serves as a UDP-based sender for telemetry data.
 *  It is configured via an options object or direct parameters.
 *  @param configDetails
 *    @option targetHost     {String}  Destination address, defaults to 'localhost'.
 *    @option targetPort     {String|Number} Target port, defaults to 8125.
 *    @option dataPrefix     {String}  Optional string prepended to each metric name.
 *    @option dataSuffix     {String}  Optional string appended to each metric name.
 *    @option makeGlobal     {boolean} If true, sets "telemetry" as a global object.
 *    @option resolveOnce    {boolean} If true, resolves hostname to IP only once.
 *    @option isMocked       {boolean} If true, no data is actually sent (mock mode).
 *    @option commonLabels   {Array=}  An array of labels applied to every outgoing metric.
 *  @constructor
 */
var MetricAgent = function(hostAddress, targetPortNum, metricPrefix, metricSuffix, shouldGlobalize, doDnsCache, useMock, globalTagsArray) {
  var configParams = hostAddress || {};
  var instanceRef = this; // Capture 'this' for callbacks.

  // If parameters are passed individually, consolidate them into the config object.
  if (arguments.length > 1 || typeof(hostAddress) === 'string') {
    configParams = {
      targetHost: hostAddress,
      targetPort: targetPortNum,
      dataPrefix: metricPrefix,
      dataSuffix: metricSuffix,
      makeGlobal: shouldGlobalize,
      resolveOnce: doDnsCache,
      isMocked: useMock === true,
      commonLabels: globalTagsArray
    };
  }

  // Initialize agent properties with defaults or provided values.
  this.targetHost = configParams.targetHost || 'localhost';
  this.targetPort = configParams.targetPort || 8125;
  this.dataPrefix = configParams.dataPrefix || '';
  this.dataSuffix = configParams.dataSuffix || '';
  this.udpSocket = udpModule.createSocket('udp4');
  this.isMocked = configParams.isMocked;
  this.commonLabels = configParams.commonLabels || [];

  // If DNS caching is enabled, perform a one-time lookup.
  if (configParams.resolveOnce === true) {
    nameResolver.lookup(configParams.targetHost, function(lookupError, ipAddress, addressFamily) {
      if (lookupError == null) { // Check if there was no error during lookup.
        instanceRef.targetHost = ipAddress;
      }
    });
  }

  // Optionally expose this agent globally.
  if (configParams.makeGlobal) {
    global.telemetry = this;
  }
};

/**
 *  Records a duration metric (timing).
 *  @param metricName     {String|Array} The name(s) of the metric to record.
 *  @param durationMs     {Number}       The time in milliseconds.
 *  @param sampleRatio    {Number=}      Sampling rate (0 to 1). Optional.
 *  @param metricLabels   {Array=}       Labels to attach to this specific metric. Optional.
 *  @param completionCallback {Function=} Callback invoked after message delivery. Optional.
 */
MetricAgent.prototype.recordDuration = function(metricName, durationMs, sampleRatio, metricLabels, completionCallback) {
  this.dispatchAllMetrics(metricName, durationMs, 'ms', sampleRatio, metricLabels, completionCallback);
};

/**
 *  Increases a counter metric.
 *  @param metricName     {String|Array} The name(s) of the metric.
 *  @param metricValue    {Number}       The amount to increment by.
 *  @param sampleRatio    {Number=}      Sampling rate (0 to 1). Optional.
 *  @param metricLabels   {Array=}       Labels to attach to this specific metric. Optional.
 *  @param completionCallback {Function=} Callback invoked after message delivery. Optional.
 */
MetricAgent.prototype.increaseCounter = function(metricName, metricValue, sampleRatio, metricLabels, completionCallback) {
  this.dispatchAllMetrics(metricName, metricValue || 1, 'c', sampleRatio, metricLabels, completionCallback);
};

/**
 *  Decreases a counter metric.
 *  @param metricName     {String|Array} The name(s) of the metric.
 *  @param metricValue    {Number}       The amount to decrement by.
 *  @param sampleRatio    {Number=}      Sampling rate (0 to 1). Optional.
 *  @param metricLabels   {Array=}       Labels to attach to this specific metric. Optional.
 *  @param completionCallback {Function=} Callback invoked after message delivery. Optional.
 */
MetricAgent.prototype.decreaseCounter = function(metricName, metricValue, sampleRatio, metricLabels, completionCallback) {
  this.dispatchAllMetrics(metricName, -metricValue || -1, 'c', sampleRatio, metricLabels, completionCallback);
};

/**
 *  Submits a value to a histogram.
 *  @param metricName     {String|Array} The name(s) of the metric.
 *  @param metricValue    {Number}       The value to record.
 *  @param sampleRatio    {Number=}      Sampling rate (0 to 1). Optional.
 *  @param metricLabels   {Array=}       Labels to attach to this specific metric. Optional.
 *  @param completionCallback {Function=} Callback invoked after message delivery. Optional.
 */
MetricAgent.prototype.addHistogram = function(metricName, metricValue, sampleRatio, metricLabels, completionCallback) {
  this.dispatchAllMetrics(metricName, metricValue, 'h', sampleRatio, metricLabels, completionCallback);
};

/**
 *  Sets a gauge metric to a specific value.
 *  @param metricName     {String|Array} The name(s) of the metric.
 *  @param metricValue    {Number}       The value to set the gauge to.
 *  @param sampleRatio    {Number=}      Sampling rate (0 to 1). Optional.
 *  @param metricLabels   {Array=}       Labels to attach to this specific metric. Optional.
 *  @param completionCallback {Function=} Callback invoked after message delivery. Optional.
 */
MetricAgent.prototype.setGauge = function(metricName, metricValue, sampleRatio, metricLabels, completionCallback) {
  this.dispatchAllMetrics(metricName, metricValue, 'g', sampleRatio, metricLabels, completionCallback);
};

/**
 *  Tracks unique occurrences or values (sets).
 *  @param metricName     {String|Array} The name(s) of the metric.
 *  @param metricValue    {any}          The unique value to track.
 *  @param sampleRatio    {Number=}      Sampling rate (0 to 1). Optional.
 *  @param metricLabels   {Array=}       Labels to attach to this specific metric. Optional.
 *  @param completionCallback {Function=} Callback invoked after message delivery. Optional.
 */
MetricAgent.prototype.trackUnique =
  MetricAgent.prototype.set = function(metricName, metricValue, sampleRatio, metricLabels, completionCallback) {
    this.dispatchAllMetrics(metricName, metricValue, 's', sampleRatio, metricLabels, completionCallback);
  };

/**
 *  Handles sending multiple metrics if an array is provided, otherwise sends a single metric.
 *  Ensures the completionCallback is only invoked once after all individual sends are done.
 *  @param metricName         {String|Array} The name(s) of the metric(s) to send.
 *  @param metricValue        {any}          The value associated with the metric.
 *  @param metricType         {String}       The type of metric (e.g., 'ms', 'c', 'g', 'h', 's').
 *  @param sampleRatio        {Number=}      Sampling rate (0 to 1). Optional.
 *  @param metricLabels       {Array=}       Labels to attach to this specific metric. Optional.
 *  @param completionCallback {Function=}    Callback invoked after message delivery. Optional.
 */
MetricAgent.prototype.dispatchAllMetrics = function(metricName, metricValue, metricType, sampleRatio, metricLabels, completionCallback) {
  var processedCount = 0;
  var callbackInvoked = false;
  var bytesTransmitted = 0;
  var instanceRef = this; // Reference to the current agent instance.

  // Adjust parameters if sampleRatio or metricLabels are omitted.
  if (sampleRatio && typeof sampleRatio !== 'number') {
    completionCallback = metricLabels;
    metricLabels = sampleRatio;
    sampleRatio = undefined;
  }

  if (metricLabels && !Array.isArray(metricLabels)) {
    completionCallback = metricLabels;
    metricLabels = undefined;
  }

  /*
   *  Internal helper function called after each metric send operation completes.
   *  Aggregates results and invokes the main completionCallback when all sends are done.
   *  @private
   */
  function onMetricSent(sendError, byteCount) {
    processedCount += 1;
    // If the callback was already called or not provided, just return.
    if (callbackInvoked || typeof completionCallback !== 'function') {
      return;
    }

    // If an error occurred, invoke the callback immediately with the error.
    if (sendError) {
      callbackInvoked = true;
      return completionCallback(sendError);
    }

    bytesTransmitted += byteCount;
    // If all metrics have been processed, invoke the main callback.
    if (processedCount === metricName.length) {
      completionCallback(null, bytesTransmitted);
    }
  }

  // Check if multiple metrics are provided as an array.
  if (Array.isArray(metricName)) {
    metricName.forEach(function(singleMetric) {
      instanceRef.transmitMetric(singleMetric, metricValue, metricType, sampleRatio, metricLabels, onMetricSent);
    });
  } else {
    // Otherwise, send a single metric.
    this.transmitMetric(metricName, metricValue, metricType, sampleRatio, metricLabels, completionCallback);
  }
};

/**
 *  Dispatches a single telemetry metric over the network.
 *  @param metricName         {String}   The specific metric identifier.
 *  @param metricValue        {any}      The value to associate with the metric.
 *  @param metricType         {String}   The StatD-compatible type (e.g., 'ms', 'c', 'g').
 *  @param sampleRatio        {Number}   The sampling frequency (0 to 1).
 *  @param metricLabels       {Array}    An array of string labels for the metric.
 *  @param completionCallback {Function=} Callback invoked after the message is sent. Optional.
 */
MetricAgent.prototype.transmitMetric = function(metricName, metricValue, metricType, sampleRatio, metricLabels, completionCallback) {
  var payloadString = this.dataPrefix + metricName + this.dataSuffix + ':' + metricValue + '|' + metricType;
  var dataBuffer;
  var combinedLabels = [];

  // Apply sampling logic if specified.
  if (sampleRatio && sampleRatio < 1) {
    if (Math.random() < sampleRatio) {
      payloadString += '|@' + sampleRatio;
    } else {
      // If the metric doesn't pass the sample ratio, do not send it.
      return;
    }
  }

  // Combine local and global labels.
  if (metricLabels && Array.isArray(metricLabels)) {
    combinedLabels = combinedLabels.concat(metricLabels);
  }
  if (this.commonLabels && Array.isArray(this.commonLabels)) {
    combinedLabels = combinedLabels.concat(this.commonLabels);
  }

  // Append combined labels to the payload if any exist.
  if (combinedLabels.length > 0) {
    payloadString += '|#' + combinedLabels.join(',');
  }

  // Only send the metric if this agent is not in mock mode.
  if (!this.isMocked) {
    dataBuffer = new Buffer(payloadString);
    this.udpSocket.send(dataBuffer, 0, dataBuffer.length, this.targetPort, this.targetHost, completionCallback);
  } else {
    // In mock mode, simulate a successful send if a callback is provided.
    if (typeof completionCallback === 'function') {
      completionCallback(null, 0); // Report no error and zero bytes sent.
    }
  }
};

/**
 *  Terminates the underlying network socket, stopping data transmission.
 */
MetricAgent.prototype.close = function() {
  this.udpSocket.close();
};

// Export the MetricAgent class.
exports = module.exports = MetricAgent;
exports.TelemetryAgent = MetricAgent;