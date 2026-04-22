const udpLink = require('dgram');
const nameResolver = require('dns');

function parseOptionalArguments(argsArray) {
  let sampledRatio, itemLabels, finishCallback;
  let currentArgIndex = 0;

  if (typeof argsArray[currentArgIndex] === 'number' && argsArray[currentArgIndex] >= 0 && argsArray[currentArgIndex] <= 1) {
    sampledRatio = argsArray[currentArgIndex];
    currentArgIndex++;
  }

  if (Array.isArray(argsArray[currentArgIndex])) {
    itemLabels = argsArray[currentArgIndex];
    currentArgIndex++;
  }

  if (typeof argsArray[currentArgIndex] === 'function') {
    finishCallback = argsArray[currentArgIndex];
  }
  return { sampledRatio, itemLabels, finishCallback };
}

class DataEmitter {
  constructor(settings) {
    const defaultSettings = {
      targetHost: 'localhost',
      targetPort: 8125,
      dataPrefix: '',
      dataSuffix: '',
      exposeGlobally: false,
      resolveOnce: false,
      simulateOperation: false,
      universalLabels: []
    };

    let actualSettings = {};
    if (typeof settings === 'string' || arguments.length > 1) {
      actualSettings = {
        targetHost: arguments[0],
        targetPort: arguments[1],
        dataPrefix: arguments[2],
        dataSuffix: arguments[3],
        exposeGlobally: arguments[4],
        resolveOnce: arguments[5],
        simulateOperation: arguments[6] === true,
        universalLabels: arguments[7]
      };
    } else {
      actualSettings = settings || {};
    }

    this.targetHost = actualSettings.targetHost || defaultSettings.targetHost;
    this.targetPort = actualSettings.targetPort || defaultSettings.targetPort;
    this.dataPrefix = actualSettings.dataPrefix || defaultSettings.dataPrefix;
    this.dataSuffix = actualSettings.dataSuffix || defaultSettings.dataSuffix;
    this.commChannel = udpLink.createSocket('udp4');
    this.simulateOperation = actualSettings.simulateOperation || defaultSettings.simulateOperation;
    this.universalLabels = actualSettings.universalLabels || defaultSettings.universalLabels;

    if (actualSettings.resolveOnce === true) {
      nameResolver.lookup(this.targetHost, (error, ipAddress, family) => {
        if (!error) {
          this.targetHost = ipAddress;
        }
      });
    }

    if (actualSettings.exposeGlobally) {
      global.metricsAgent = this;
    }
  }

  emitDatum(measureName, measureValue, metricKind, sampledRatio, itemLabels, completionHandler) {
    return new Promise((resolve, reject) => {
      let payloadText = `${this.dataPrefix}${measureName}${this.dataSuffix}:${measureValue}|${metricKind}`;
      let combinedLabels = [];

      if (sampledRatio && sampledRatio < 1) {
        if (Math.random() < sampledRatio) {
          payloadText += `|@${sampledRatio}`;
        } else {
          if (typeof completionHandler === 'function') {
            completionHandler(null, 0);
          }
          return resolve(0);
        }
      }

      if (itemLabels && Array.isArray(itemLabels)) {
        combinedLabels = combinedLabels.concat(itemLabels);
      }
      if (this.universalLabels && Array.isArray(this.universalLabels)) {
        combinedLabels = combinedLabels.concat(this.universalLabels);
      }
      if (combinedLabels.length > 0) {
        payloadText += `|#${combinedLabels.join(',')}`;
      }

      if (this.simulateOperation) {
        if (typeof completionHandler === 'function') {
          completionHandler(null, 0);
        }
        return resolve(0);
      }

      const dataBuffer = Buffer.from(payloadText);
      this.commChannel.send(dataBuffer, 0, dataBuffer.length, this.targetPort, this.targetHost, (err, bytes) => {
        if (typeof completionHandler === 'function') {
          completionHandler(err, bytes);
        }
        if (err) {
          return reject(err);
        }
        resolve(bytes);
      });
    });
  }

  processMeasurements(measureName, measureValue, metricKind, ...optionalArgs) {
    const { sampledRatio, itemLabels, finishCallback } = parseOptionalArguments(optionalArgs);

    if (Array.isArray(measureName)) {
      const allPromises = measureName.map(singleName =>
        this.emitDatum(singleName, measureValue, metricKind, sampledRatio, itemLabels, null)
      );

      Promise.all(allPromises)
        .then(bytesArray => {
          const totalBytes = bytesArray.reduce((sum, bytes) => sum + bytes, 0);
          if (typeof finishCallback === 'function') {
            finishCallback(null, totalBytes);
          }
        })
        .catch(err => {
          if (typeof finishCallback === 'function') {
            finishCallback(err, 0);
          }
        });
    } else {
      this.emitDatum(measureName, measureValue, metricKind, sampledRatio, itemLabels, finishCallback);
    }
  }

  recordDuration(measureName, duration, ...optionalArgs) {
    this.processMeasurements(measureName, duration, 'ms', ...optionalArgs);
  }

  increaseCounter(measureName, val, ...optionalArgs) {
    this.processMeasurements(measureName, val || 1, 'c', ...optionalArgs);
  }

  decreaseCounter(measureName, val, ...optionalArgs) {
    this.processMeasurements(measureName, -val || -1, 'c', ...optionalArgs);
  }

  captureDistribution(measureName, val, ...optionalArgs) {
    this.processMeasurements(measureName, val, 'h', ...optionalArgs);
  }

  setGauge(measureName, val, ...optionalArgs) {
    this.processMeasurements(measureName, val, 'g', ...optionalArgs);
  }

  trackUnique(measureName, val, ...optionalArgs) {
    this.processMeasurements(measureName, val, 's', ...optionalArgs);
  }

  terminateConnection() {
    this.commChannel.close();
  }
}

module.exports = DataEmitter;
module.exports.MetricsAgent = DataEmitter;