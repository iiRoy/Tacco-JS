const TemporalInterpreter = (function() {
    const MILLIS_PER_SECOND = 1000;
    const MILLIS_PER_MINUTE = 60 * MILLIS_PER_SECOND;
    const MILLIS_PER_HOUR = 60 * MILLIS_PER_MINUTE;
    const MILLIS_PER_DAY = 24 * MILLIS_PER_HOUR;

    const SUPPORTED_CUBE_RESOLUTIONS_MS = [
        10 * MILLIS_PER_SECOND, // 10s
        1 * MILLIS_PER_MINUTE,  // 1m
        5 * MILLIS_PER_MINUTE,  // 5m
        1 * MILLIS_PER_HOUR,    // 1h
        1 * MILLIS_PER_DAY      // 1d
    ];

    function calculateDurationFromString(inputString) {
        const regex = /^(\d+)([smhd])$/;
        const match = inputString.match(regex);
        if (!match) return null;

        const value = parseInt(match[1], 10);
        const unit = match[2];

        switch (unit) {
            case 's': return value * MILLIS_PER_SECOND;
            case 'm': return value * MILLIS_PER_MINUTE;
            case 'h': return value * MILLIS_PER_HOUR;
            case 'd': return value * MILLIS_PER_DAY;
            default: return null;
        }
    }

    function parseTimePoint(input) {
        if (input instanceof Date) {
            return input;
        }
        if (typeof input !== 'string') {
            return null;
        }

        input = input.trim().toLowerCase();

        if (input === 'now') {
            return new Date();
        }

        const relativeMatch = input.match(/^(\d+)([smhd])-ago$/);
        if (relativeMatch) {
            const value = parseInt(relativeMatch[1], 10);
            const unit = relativeMatch[2];
            const now = new Date();
            let millisecondsToSubtract;
            switch (unit) {
                case 's': millisecondsToSubtract = value * MILLIS_PER_SECOND; break;
                case 'm': millisecondsToSubtract = value * MILLIS_PER_MINUTE; break;
                case 'h': millisecondsToSubtract = value * MILLIS_PER_HOUR; break;
                case 'd': millisecondsToSubtract = value * MILLIS_PER_DAY; break;
                default: return null;
            }
            return new Date(now.getTime() - millisecondsToSubtract);
        }

        const parsedDate = new Date(input);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        }

        return null;
    }

    return {
        // Replaces rdv.duration
        determineInterval: calculateDurationFromString,
        // Replaces rdv()
        interpretTimeExpression: parseTimePoint,
        // For step validation
        getPermittedResolutionValues: function() {
            return SUPPORTED_CUBE_RESOLUTIONS_MS;
        }
    };
})();

const DataSerializer = (function() {
    function formatCellContent(content, isDateField, reverseDateOrder) {
        if (isDateField && content instanceof Date) {
            const year = content.getFullYear().toString().slice(-2);
            const month = (content.getMonth() + 1).toString().padStart(2, '0');
            const day = content.getDate().toString().padStart(2, '0');
            if (reverseDateOrder) {
                return `${day}/${month}/${year}`;
            } else {
                return `${month}/${day}/${year}`;
            }
        }
        if (typeof content === 'string' && content.includes(',')) {
            return `"${content.replace(/"/g, '""')}"`;
        }
        return String(content);
    }

    return {
        convertRecordsToDelimitedText: function(recordSet, invertDateSequence) {
            if (!Array.isArray(recordSet) || recordSet.length === 0) {
                return '';
            }

            const headerKeys = new Set();
            recordSet.forEach(record => {
                Object.keys(record).forEach(key => headerKeys.add(key));
            });
            const headers = Array.from(headerKeys);

            const lines = [];
            lines.push(headers.map(h => formatCellContent(h)).join(','));

            recordSet.forEach(record => {
                lines.push(headers.map(header => {
                    const value = record[header];
                    const isTimeProperty = header === 'time';
                    return formatCellContent(value === undefined ? '' : value, isTimeProperty, invertDateSequence);
                }).join(','));
            });

            return lines.join('\n');
        }
    };
})();

const NetworkCommunicator = (function() {
    const nativeHttps = require('https');
    const nativeHttp = require('http');
    const { URL, URLSearchParams } = require('url');

    function executeHttpRequest(fullResourceUri, completionHandler) {
        const resourceUrl = new URL(fullResourceUri);
        const protocolHandler = resourceUrl.protocol === 'https:' ? nativeHttps : nativeHttp;

        const requestOptions = {
            hostname: resourceUrl.hostname,
            port: resourceUrl.port,
            path: resourceUrl.pathname + resourceUrl.search,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        const httpRequest = protocolHandler.request(requestOptions, (serverResponse) => {
            let receivedBuffer = '';
            serverResponse.on('data', (chunk) => {
                receivedBuffer += chunk;
            });
            serverResponse.on('end', () => {
                completionHandler(null, { status: serverResponse.statusCode }, receivedBuffer);
            });
        });

        httpRequest.on('error', (connectionError) => {
            completionHandler(connectionError);
        });

        httpRequest.end();
    }

    return {
        initiateGetRequest: executeHttpRequest
    };
})();

class PerformanceDataAcquirer {
    constructor(evaluationHost) {
        this.baseHost = evaluationHost;
        if (!this.baseHost) {
            throw new Error("Target host address missing for PerformanceDataAcquirer.");
        }
    }

    _constructFullRequestUri(metricIdentifier, acquisitionParameters) {
        const currentParameters = acquisitionParameters || {};
        const queryParameters = new URLSearchParams();

        let resolutionInterval;
        if (typeof currentParameters.resolution === 'string') {
            resolutionInterval = TemporalInterpreter.determineInterval(currentParameters.resolution);
            if (resolutionInterval === null) {
                throw new Error(`${currentParameters.resolution}: invalid duration expression`);
            }
        } else if (typeof currentParameters.resolution === 'number') {
            resolutionInterval = currentParameters.resolution;
        } else {
            throw new Error("Metric resolution must be specified.");
        }

        if (!TemporalInterpreter.getPermittedResolutionValues().includes(resolutionInterval)) {
            throw new Error(`${currentParameters.resolution || currentParameters.resolution}: unsupported resolution`);
        }
        queryParameters.append('step', resolutionInterval.toString());

        let startingPoint;
        if (currentParameters.begin) {
            startingPoint = TemporalInterpreter.interpretTimeExpression(currentParameters.begin);
            if (startingPoint === null) {
                throw new Error(`${currentParameters.begin}: invalid temporal expression`);
            }
        }

        let endingPoint;
        if (currentParameters.finish) {
            endingPoint = TemporalInterpreter.interpretTimeExpression(currentParameters.finish);
            if (endingPoint === null) {
                throw new Error(`${currentParameters.finish}: invalid temporal expression`);
            }
        }

        if (currentParameters.timeWindow) {
            const windowDuration = TemporalInterpreter.determineInterval(currentParameters.timeWindow);
            if (windowDuration === null) {
                throw new Error(`${currentParameters.timeWindow}: invalid duration expression`);
            }

            if (!startingPoint && endingPoint) {
                startingPoint = new Date(endingPoint.getTime() - windowDuration);
            }
            if (!endingPoint && startingPoint) {
                endingPoint = new Date(startingPoint.getTime() + windowDuration);
            }
        }

        let recordLimit;
        if (currentParameters.itemCount) {
            if (typeof currentParameters.itemCount === 'string') {
                const limitDuration = TemporalInterpreter.determineInterval(currentParameters.itemCount);
                if (limitDuration === null) {
                    throw new Error(`${currentParameters.itemCount}: invalid duration expression`);
                }
                recordLimit = Math.floor(limitDuration / resolutionInterval);
            } else {
                recordLimit = currentParameters.itemCount;
            }
        }

        queryParameters.append('expression', metricIdentifier);
        if (startingPoint) queryParameters.append('start', startingPoint.toISOString());
        if (endingPoint) queryParameters.append('stop', endingPoint.toISOString());
        if (recordLimit) queryParameters.append('limit', recordLimit.toString());

        return `http://${this.baseHost}/1.0/metric/get?${queryParameters.toString()}`;
    }

    async fetchMetricData(metricIdentifier, acquisitionParameters, completionCallback) {
        try {
            const finalRequestUri = this._constructFullRequestUri(metricIdentifier, acquisitionParameters);

            NetworkCommunicator.initiateGetRequest(finalRequestUri, (issue, networkResponse, rawPayload) => {
                if (issue) {
                    completionCallback(issue);
                    return;
                }

                if (networkResponse.status !== 200) {
                    completionCallback(new Error(rawPayload));
                    return;
                }

                let processedOutput;
                const requestedFormat = acquisitionParameters.outputFormat || 'json';

                switch (requestedFormat) {
                    case 'csv':
                        const jsonToParseForCsv = JSON.parse(rawPayload).map(entry => {
                            if (entry.time) {
                                entry.time = new Date(entry.time);
                            }
                            return entry;
                        });
                        processedOutput = DataSerializer.convertRecordsToDelimitedText(jsonToParseForCsv, acquisitionParameters.reverseDateOrder);
                        completionCallback(processedOutput);
                        break;
                    case 'json':
                    default:
                        processedOutput = JSON.parse(rawPayload).map(entry => {
                            if (entry.time) {
                                entry.time = new Date(entry.time);
                            }
                            return entry;
                        });
                        completionCallback(processedOutput);
                        break;
                }
            });
        } catch (logicError) {
            completionCallback(logicError);
        }
    }
}

module.exports = function(metricId, parameters, handler) {
    const dataAcquirerInstance = new PerformanceDataAcquirer(parameters.host);
    dataAcquirerInstance.fetchMetricData(metricId, parameters, handler);
};

module.exports.buildRequestURI = function(metricId, parameters) {
    const tempAcquirer = new PerformanceDataAcquirer(parameters.host || 'placeholder.host'); // Host needed for URL, not for actual request
    return tempAcquirer._constructFullRequestUri(metricId, parameters);
};