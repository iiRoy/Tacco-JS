'use strict';

// Renamed module dependencies and internal helpers
const streamModule = require('net');
const validation = require('assert');
const utility = require('util');
const channelLog = require('debug')('QueryEngine');
const serverChannel = require('debug')('serverComms');
const clientChannel = require('debug')('clientComms');

// --- Re-implemented Binary Helpers (replacing bufferpack and put) ---

// Custom Buffer Builder (replaces 'put' module)
function CustomBufferBuilder() {
    let parts = [];
    let currentLength = 0;

    function append(data) {
        if (data && data.length > 0) {
            parts.push(data);
            currentLength += data.length;
        }
        return this;
    }

    function build() {
        return Buffer.concat(parts, currentLength);
    }

    function putUInt32(value) {
        const buf = Buffer.alloc(4);
        buf.writeUInt32BE(value, 0);
        return append(buf);
    }

    function putInt32(value) {
        const buf = Buffer.alloc(4);
        buf.writeInt32BE(value, 0);
        return append(buf);
    }

    function putFloat(value) {
        const buf = Buffer.alloc(4);
        buf.writeFloatBE(value, 0);
        return append(buf);
    }

    // This is the internal implementation for word64be, which is called by emitQuadValue/emitSignedQuadValue
    function put64BitValue(numVal) {
        const dataBuffer = Buffer.alloc(8);
        const dataView = new DataView(dataBuffer.buffer);
        if (typeof numVal === 'bigint') {
            dataView.setBigUint64(0, numVal, false); // Big-endian (original Put().word64be was unsigned)
        } else {
            const high = Math.floor(numVal / 0x100000000);
            const low = numVal % 0x100000000;
            dataView.setUint32(0, high, false);
            dataView.setUint32(4, low, false);
        }
        return append(dataBuffer);
    }

    function putString(value) {
        const strBuf = Buffer.from(value, 'utf8');
        this.putUInt32(strBuf.length);
        return append(strBuf);
    }

    return {
        append,
        buffer: build,
        word32be: putUInt32,
        word64be: put64BitValue, // This method is used by emitQuadValue/emitSignedQuadValue
        floatbe: putFloat,
        int32be: putInt32,
        string: putString
    };
}

// Function to put a 64-bit unsigned integer into a Buffer (replaces original packUInt64)
function emitQuadValue(numVal) {
    return CustomBufferBuilder().word64be(numVal).buffer();
}

// Function to put a 64-bit signed integer into a Buffer (replaces original packInt64)
function emitSignedQuadValue(numVal) {
    // The original packInt64 also used word64be, which implies unsigned packing.
    // For exact clone, replicate that, even if unpackInt64 then only reads low part.
    return CustomBufferBuilder().word64be(numVal).buffer();
}

// Function to extract a 64-bit unsigned integer from a Buffer (replaces original unpackUInt64)
function readQuadValue(dataBuffer) {
    const dataView = new DataView(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength);
    const high = dataView.getUint32(0, false);
    const low = dataView.getUint32(4, false);
    return (BigInt(high) * 0x100000000n) + BigInt(low);
}

// Function to extract a 64-bit signed integer from a Buffer (replaces original unpackInt64)
function readSignedQuadValue(dataBuffer) {
    const dataView = new DataView(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength);
    // Emulating original's unpackInt64 behavior which only returned the low 32-bit part
    return dataView.getInt32(4, false);
}


// Custom Binary Unpacker (replaces 'bufferpack.unpack')
function decodeBinary(format, dataBuffer) {
    let offset = 0;
    const results = [];
    let formatIndex = 0;

    // Helper to read bytes and advance offset
    const readSegment = (length) => {
        const val = dataBuffer.slice(offset, offset + length);
        offset += length;
        return val;
    };

    while (formatIndex < format.length) {
        let char = format[formatIndex];
        let count = 1;

        // Check for count prefix (e.g., '2H')
        if (!isNaN(parseInt(char, 10))) {
            let numStr = '';
            while (!isNaN(parseInt(format[formatIndex], 10))) {
                numStr += format[formatIndex];
                formatIndex++;
            }
            count = parseInt(numStr, 10);
            char = format[formatIndex]; // Update char to the actual type
        }

        for (let i = 0; i < count; i++) {
            switch (char) {
                case 'L': // Unsigned long (32-bit big-endian)
                    results.push(readSegment(4).readUInt32BE(0));
                    break;
                case 'H': // Unsigned short (16-bit big-endian)
                    results.push(readSegment(2).readUInt16BE(0));
                    break;
                case 'f': // Float (32-bit big-endian)
                    results.push(readSegment(4).readFloatBE(0));
                    break;
                case 'Q': // Unsigned long long (64-bit big-endian)
                    results.push(readQuadValue(readSegment(8))); // Use the standalone helper
                    break;
                default:
                    throw new Error(`Unsupported format character: ${char}`);
            }
        }
        formatIndex++;
    }
    return results;
}

// Custom Binary Packer (replaces 'bufferpack.pack')
function encodeBinary(format, values) {
    const builder = CustomBufferBuilder();
    let valueIndex = 0;
    let formatIndex = 0;

    while (formatIndex < format.length) {
        let char = format[formatIndex];
        let count = 1;

        // Check for count prefix (e.g., '2H')
        if (!isNaN(parseInt(char, 10))) {
            let numStr = '';
            while (!isNaN(parseInt(format[formatIndex], 10))) {
                numStr += format[formatIndex];
                formatIndex++;
            }
            count = parseInt(numStr, 10);
            char = format[formatIndex]; // Update char to the actual type
        }

        for (let i = 0; i < count; i++) {
            const value = values[valueIndex++];
            switch (char) {
                case 'L': // Unsigned long (32-bit big-endian)
                    builder.word32be(value);
                    break;
                case 'H': // Unsigned short (16-bit big-endian)
                    const bufH = Buffer.alloc(2);
                    bufH.writeUInt16BE(value, 0);
                    builder.append(bufH);
                    break;
                case 'f': // Float (32-bit big-endian)
                    builder.floatbe(value);
                    break;
                case 'Q': // Unsigned long long (64-bit big-endian)
                    builder.word64be(value); // Uses CustomBufferBuilder's internal 64-bit writer
                    break;
                default:
                    throw new Error(`Unsupported format character: ${char}`);
            }
        }
        formatIndex++;
    }
    return builder.buffer();
}

// Function to combine buffers (replaces original ConcatBuffer)
function fuseBuffers(first, second) {
    return Buffer.concat([first, second]);
}

// Custom iteration helper (replaces original forEach)
function processElements(collection, action) {
    if (Array.isArray(collection)) {
        collection.forEach(action);
    } else {
        for (const key in collection) {
            if (Object.prototype.hasOwnProperty.call(collection, key)) {
                action(collection[key], key);
            }
        }
    }
}

// Custom length helper (replaces original len)
function measureLength(dataObject) {
    if (Array.isArray(dataObject)) {
        return dataObject.length;
    } else if (typeof dataObject === 'string') {
        return Buffer.byteLength(dataObject);
    } else {
        let count = 0;
        for (const key in dataObject) {
            if (Object.prototype.hasOwnProperty.call(dataObject, key)) {
                count++;
            }
        }
        return count;
    }
}

// --- Constants (renamed and restructured) ---
const MatchBehavior = Object.freeze({
    ALL_WORDS: 1, // SPH_MATCH_ALL
    ANY_WORD: 2, // SPH_MATCH_ANY
    PHRASE: 3, // SPH_MATCH_PHRASE
    BOOLEAN_MODE: 4, // SPH_MATCH_BOOLEAN
    EXTENDED_MODE: 5, // SPH_MATCH_EXTENDED
    FULL_SCAN: 6, // SPH_MATCH_FULLSCAN
    EXTENDED_MODE_V2: 7 // SPH_MATCH_EXTENDED2
});

const SortMethod = Object.freeze({
    BY_RELEVANCE: 1, // SPH_SORT_RELEVANCE
    ATTRIBUTE_DESC: 2, // SPH_SORT_ATTR_DESC
    ATTRIBUTE_ASC: 3, // SPH_SORT_ATTR_ASC
    TIME_SEGMENTS: 4, // SPH_SORT_TIME_SEGMENTS
    EXTENDED_SORT: 5, // SPH_SORT_EXTENDED
    EXPRESSION_SORT: 6 // SPH_SORT_EXPR
});

const GroupingFunction = Object.freeze({
    PER_DAY: 0, // SPH_GROUPBY_DAY
    PER_WEEK: 1, // SPH_GROUPBY_WEEK
    PER_MONTH: 2, // SPH_GROUPBY_MONTH
    PER_YEAR: 3, // SPH_GROUPBY_YEAR
    BY_ATTRIBUTE: 4, // SPH_GROUPBY_ATTR
    BY_ATTRIBUTE_PAIR: 5 // SPH_GROUPBY_ATTRPAIR
});

const RankingAlgorithm = Object.freeze({
    PROXIMITY_BM25: 0, // SPH_RANK_PROXIMITY_BM25
    WORD_COUNT: 1, // SPH_RANK_WORDCOUNT
    PROXIMITY_BM25_V2: 2, // SPH_RANK_PROXIMITY_BM25A
    MATCH_SCORE: 3, // SPH_RANK_MATCHSP
    EXPRESSION_RANK: 4, // SPH_RANK_EXPR
    NONE: 5, // SPH_RANK_NONE
    TOTAL_RANKS: 6 // SPH_RANK_TOTAL - This is typically a count, not a mode itself.
});

const FilterKind = Object.freeze({
    VALUE_SET: 0, // SPH_FILTER_VALUES
    RANGE_INTEGER: 1, // SPH_FILTER_RANGE
    RANGE_FLOAT: 2 // SPH_FILTER_FLOATRANGE
});

const ServerStatus = Object.freeze({
    OK: 1, // SEARCHD_OK
    WARNING: 2, // SEARCHD_WARNING
    ERROR: 3, // SEARCHD_ERROR
    RETRY: 4 // SEARCHD_RETRY
});

const AttributeType = Object.freeze({
    INTEGER: 1, // SPH_ATTR_INTEGER
    TIMESTAMP: 2, // SPH_ATTR_TIMESTAMP
    ORDINAL: 3, // SPH_ATTR_ORDINAL
    BOOLEAN: 4, // SPH_ATTR_BOOLEAN
    FLOAT: 5, // SPH_ATTR_FLOAT
    BIGINT: 6, // SPH_ATTR_BIGINT
    STRING: 7, // SPH_ATTR_STRING
    MULTI: 0x40000001, // SPH_ATTR_MULTI
    MULTI64: 0x40000002 // SPH_ATTR_MULTI64
});

// --- Main Query Engine Factory Function ---

function createSearchMechanism() {
    let configuration = {
        connection: { host: 'localhost', port: 9312, socketPath: null, timeout: 1.0 },
        pagination: { offset: 0, limit: 20, maxMatches: 1000, cutoff: 0 },
        matchSettings: { mode: MatchBehavior.ALL_WORDS, ranking: RankingAlgorithm.PROXIMITY_BM25, rankExpression: '' },
        sorting: { method: SortMethod.BY_RELEVANCE, clause: '' },
        attributeWeights: [],
        fieldSpecificWeights: {},
        indexSpecificWeights: {},
        idRange: { min: 0, max: 0x7FFFFFFF },
        queryFilters: [],
        geographicAnchor: {},
        grouping: { attribute: '', func: GroupingFunction.PER_DAY, sortClause: '@group desc', distinctAttribute: '' },
        retryPolicy: { count: 0, delay: 0 },
        valueOverrides: {},
        selectionClause: '*',
        maxExecutionTime: 0,
        lastError: '',
        lastWarning: '',
        pendingRequests: []
    };

    // Helper for network communication (async/await based)
    async function transmitPayload(clientProtocolVersion, outgoingData) {
        return new Promise((resolve, reject) => {
            const connector = streamModule.connect(configuration.connection.port, configuration.connection.host);
            let receivedBuffer = Buffer.alloc(0);
            let headerParsed = false;
            let expectedBodyLength = 0;
            let responseState = null;
            let responseVersion = null;

            const connectionTimeout = setTimeout(() => {
                connector.destroy(new Error('Connection timed out'));
            }, configuration.connection.timeout * 1000);

            connector.on('connect', () => {
                clearTimeout(connectionTimeout);
                clientChannel('Established connection');
                connector.write(encodeBinary('>L', [1])); 
                clientChannel('Sending request payload of length', outgoingData.length);
                connector.write(outgoingData);
            });

            connector.on('data', chunk => {
                receivedBuffer = fuseBuffers(receivedBuffer, chunk);
                serverChannel('Received data chunk, total length:', receivedBuffer.length);

                if (!headerParsed && receivedBuffer.length >= 12) {
                    const serverProtoVersion = decodeBinary('>L', receivedBuffer.slice(0, 4));
                    if (!Array.isArray(serverProtoVersion) || serverProtoVersion[0] < 1) {
                         connector.destroy(new Error(`Unexpected server protocol version: ${serverProtoVersion[0]}`));
                         return;
                    }
                    clientChannel('Server protocol version:', serverProtoVersion[0]);

                    const responseHeader = decodeBinary('>2HL', receivedBuffer.slice(4, 12));
                    responseState = responseHeader[0];
                    responseVersion = responseHeader[1];
                    expectedBodyLength = responseHeader[2];
                    headerParsed = true;
                    receivedBuffer = receivedBuffer.slice(12);
                    serverChannel(`Parsed header: State=${responseState}, Version=${responseVersion}, BodyLength=${expectedBodyLength}`);
                }

                if (headerParsed && receivedBuffer.length >= expectedBodyLength) {
                    serverChannel('Received full response body.');
                    connector.end();
                    resolve({
                        status: responseState,
                        version: responseVersion,
                        payload: receivedBuffer.slice(0, expectedBodyLength)
                    });
                }
            });

            connector.on('end', () => {
                clientChannel('Disconnected');
            });

            connector.on('error', err => {
                clearTimeout(connectionTimeout);
                reject(new Error(`Connection issue: ${err.message}`));
            });
        });
    }

    const apiMethods = {
        fetchLastError: () => configuration.lastError,
        fetchLastWarning: () => configuration.lastWarning,

        establishEndpoint: (nodeHost, nodePort) => {
            validation.equal(typeof nodeHost, 'string');
            validation.equal(typeof nodePort, 'number');
            configuration.connection.host = nodeHost;
            configuration.connection.port = nodePort;
        },
        configureConnectionTimeout: (duration) => {
            validation.equal(typeof duration, 'number');
            configuration.connection.timeout = Math.max(0.001, duration);
        },
        setRetrievalBounds: (startIndex, resultLimit, maximumMatches, trimThreshold) => {
            validation.equal(typeof startIndex, 'number');
            validation.equal(typeof resultLimit, 'number');
            validation(startIndex >= 0 && startIndex < 16777216);
            validation(resultLimit >= 0 && resultLimit < 16777216);
            configuration.pagination.offset = startIndex;
            configuration.pagination.limit = resultLimit;
            if (maximumMatches !== undefined && maximumMatches > 0) {
                configuration.pagination.maxMatches = maximumMatches;
            }
            if (trimThreshold !== undefined && trimThreshold >= 0) {
                configuration.pagination.cutoff = trimThreshold;
            }
        },
        setMaxProcessingTime: (maxTimeMs) => {
            validation.equal(typeof maxTimeMs, 'number');
            validation(maxTimeMs > 0);
            configuration.maxExecutionTime = maxTimeMs;
        },
        setSearchBehavior: (behaviorMode) => {
            const validModes = Object.values(MatchBehavior);
            validation(validModes.some(m => m === behaviorMode));
            configuration.matchSettings.mode = behaviorMode;
        },
        setRankingAlgorithm: (algorithm, expression = '') => {
            validation(algorithm >= 0 && algorithm < RankingAlgorithm.TOTAL_RANKS);
            configuration.matchSettings.ranking = algorithm;
            configuration.matchSettings.rankExpression = expression;
        },
        setSortingMethod: (method, criterion = '') => {
            const validMethods = Object.values(SortMethod);
            validation(validMethods.some(m => m === method));
            validation.equal(typeof criterion, 'string');
            configuration.sorting.method = method;
            configuration.sorting.clause = criterion;
        },
        setFieldAttributeWeights: (weightsArray) => {
            validation(Array.isArray(weightsArray));
            processElements(weightsArray, (item) => validation.equal(typeof item, 'number'));
            configuration.attributeWeights = weightsArray;
        },
        setSpecificFieldWeights: (fieldMap) => {
            validation.equal(typeof fieldMap, 'object');
            processElements(fieldMap, (item) => validation.equal(typeof item, 'number'));
            configuration.fieldSpecificWeights = fieldMap;
        },
        setIndexSpecificWeights: (indexMap) => {
            validation.equal(typeof indexMap, 'object');
            processElements(indexMap, (item) => validation.equal(typeof item, 'number'));
            configuration.indexSpecificWeights = indexMap;
        },
        setIdentifierRange: (minimumId, maximumId) => {
            validation.equal(typeof minimumId, 'number');
            validation.equal(typeof maximumId, 'number');
            validation(minimumId <= maximumId);
            configuration.idRange.min = minimumId;
            configuration.idRange.max = maximumId;
        },
        addValueFilter: (attributeName, valueSet, excludeFlag = 0) => {
            validation.equal(typeof attributeName, 'string');
            processElements(valueSet, (item) => validation.equal(typeof item, 'number'));
            configuration.queryFilters.push({
                type: FilterKind.VALUE_SET,
                attribute: attributeName,
                exclude: excludeFlag,
                values: valueSet
            });
        },
        addIntegerRangeFilter: (attributeName, minValue, maxValue, excludeFlag = 0) => {
            validation.equal(typeof attributeName, 'string');
            validation.equal(typeof minValue, 'number');
            validation.equal(typeof maxValue, 'number');
            validation(minValue <= maxValue);
            configuration.queryFilters.push({
                type: FilterKind.RANGE_INTEGER,
                attribute: attributeName,
                exclude: excludeFlag,
                min: minValue,
                max: maxValue
            });
        },
        addFloatRangeFilter: (attributeName, minFloat, maxFloat, excludeFlag = 0) => {
            validation.equal(typeof attributeName, 'string');
            validation.equal(typeof minFloat, 'number');
            validation.equal(typeof maxFloat, 'number');
            validation(minFloat <= maxFloat);
            configuration.queryFilters.push({
                type: FilterKind.RANGE_FLOAT,
                attribute: attributeName,
                exclude: excludeFlag,
                min: minFloat,
                max: maxFloat
            });
        },
        defineGeographicAnchor: (latitudeAttr, longitudeAttr, latitudeValue, longitudeValue) => {
            validation.equal(typeof latitudeAttr, 'string');
            validation.equal(typeof longitudeAttr, 'string');
            validation.equal(typeof latitudeValue, 'number');
            validation.equal(typeof longitudeValue, 'number');
            configuration.geographicAnchor = {
                latAttribute: latitudeAttr,
                longAttribute: longitudeAttr,
                latitude: latitudeValue,
                longitude: longitudeValue
            };
        },
        setGroupingParameters: (groupAttribute, groupFunc, groupOrdering = '@group desc') => {
            validation.equal(typeof groupAttribute, 'string');
            validation.equal(typeof groupOrdering, 'string');
            const validFuncs = Object.values(GroupingFunction);
            validation(validFuncs.some(f => f === groupFunc));
            configuration.grouping.attribute = groupAttribute;
            configuration.grouping.func = groupFunc;
            configuration.grouping.sortClause = groupOrdering;
        },
        setGroupDistinctAttribute: (distinctAttribute) => {
            validation.equal(typeof distinctAttribute, 'string');
            configuration.grouping.distinctAttribute = distinctAttribute;
        },
        configureRetries: (attemptCount, retryDelay = 0) => {
            validation.equal(typeof attemptCount, 'number');
            validation.equal(typeof retryDelay, 'number');
            validation(attemptCount >= 0);
            validation(retryDelay >= 0);
            configuration.retryPolicy.count = attemptCount;
            configuration.retryPolicy.delay = retryDelay;
        },
        setAttributeValueOverride: (attrName, attrType, attrValues) => {
            validation.equal(typeof attrName, 'string');
            const validTypes = Object.values(AttributeType).filter(v => typeof v === 'number');
            validation(validTypes.some(t => t === attrType));
            validation.equal(typeof attrValues, 'object');
            configuration.valueOverrides[attrName] = {
                name: attrName,
                type: attrType,
                values: attrValues
            };
        },
        setProjectionClause: (projectionString) => {
            validation.equal(typeof projectionString, 'string');
            configuration.selectionClause = projectionString;
        },
        clearValueOverrides: () => {
            configuration.valueOverrides = {};
        },
        clearAllFilters: () => {
            configuration.queryFilters = [];
            configuration.geographicAnchor = {};
        },
        resetGroupingOptions: () => {
            configuration.grouping.attribute = '';
            configuration.grouping.func = GroupingFunction.PER_DAY;
            configuration.grouping.sortClause = '@group desc';
            configuration.grouping.distinctAttribute = '';
        },

        enqueueSearchRequest: (queryText, targetIndex = '*', queryComment = '') => {
            configuration.pendingRequests.push({ queryText, targetIndex, queryComment });
        },

        executePendingSearches: async (completionCallback) => {
            const requestsToProcess = configuration.pendingRequests;
            configuration.pendingRequests = []; 

            if (requestsToProcess.length === 0) {
                return completionCallback(null, []);
            }

            const buildRequestBuffer = (req) => {
                const builder = CustomBufferBuilder();
                
                builder.word32be(1); 
                builder.word32be(0x118); 

                builder.putString(req.queryText);
                builder.putString(req.targetIndex);
                builder.putString(req.queryComment);

                builder.word32be(configuration.pagination.offset);
                builder.word32be(configuration.pagination.limit);
                builder.word32be(configuration.matchSettings.mode);
                builder.word32be(configuration.matchSettings.ranking);
                builder.word32be(configuration.sorting.method);
                builder.putString(configuration.sorting.clause);

                builder.word32be(configuration.pagination.maxMatches);
                builder.word32be(configuration.pagination.cutoff);
                builder.word32be(configuration.maxExecutionTime);

                builder.word32be(configuration.attributeWeights.length);
                configuration.attributeWeights.forEach(w => builder.word32be(w));

                const fieldWeightsKeys = Object.keys(configuration.fieldSpecificWeights);
                builder.word32be(fieldWeightsKeys.length);
                fieldWeightsKeys.forEach(key => {
                    builder.putString(key);
                    builder.word32be(configuration.fieldSpecificWeights[key]);
                });

                const indexWeightsKeys = Object.keys(configuration.indexSpecificWeights);
                builder.word32be(indexWeightsKeys.length);
                indexWeightsKeys.forEach(key => {
                    builder.putString(key);
                    builder.word32be(configuration.indexSpecificWeights[key]);
                });

                builder.word64be(configuration.idRange.min);
                builder.word64be(configuration.idRange.max);

                builder.word32be(configuration.queryFilters.length);
                configuration.queryFilters.forEach(filter => {
                    builder.putString(filter.attribute);
                    builder.word32be(filter.type);
                    builder.word32be(filter.exclude);

                    if (filter.type === FilterKind.VALUE_SET) {
                        builder.word32be(filter.values.length);
                        filter.values.forEach(v => builder.word32be(v));
                    } else if (filter.type === FilterKind.RANGE_INTEGER) {
                        builder.word32be(filter.min);
                        builder.word32be(filter.max);
                    } else if (filter.type === FilterKind.RANGE_FLOAT) {
                        builder.floatbe(filter.min);
                        builder.floatbe(filter.max);
                    }
                });

                if (Object.keys(configuration.geographicAnchor).length > 0) {
                    builder.word32be(1);
                    builder.putString(configuration.geographicAnchor.latAttribute);
                    builder.putString(configuration.geographicAnchor.longAttribute);
                    builder.floatbe(configuration.geographicAnchor.latitude);
                    builder.floatbe(configuration.geographicAnchor.longitude);
                } else {
                    builder.word32be(0);
                }

                builder.putString(configuration.grouping.attribute);
                builder.word32be(configuration.grouping.func);
                builder.putString(configuration.grouping.sortClause);
                builder.putString(configuration.grouping.distinctAttribute);

                builder.word32be(configuration.retryPolicy.count);
                builder.word32be(configuration.retryPolicy.delay);

                const overrideKeys = Object.keys(configuration.valueOverrides);
                builder.word32be(overrideKeys.length);
                overrideKeys.forEach(key => {
                    const ov = configuration.valueOverrides[key];
                    builder.putString(ov.name);
                    builder.word32be(ov.type);
                    builder.word32be(Object.keys(ov.values).length);
                    processElements(ov.values, (value, id) => {
                        builder.word64be(BigInt(id));
                        if (ov.type === AttributeType.FLOAT) {
                            builder.floatbe(value);
                        } else {
                            builder.word32be(value);
                        }
                    });
                });

                builder.putString(configuration.selectionClause);

                const combinedRequest = builder.buffer();
                
                return CustomBufferBuilder().word32be(combinedRequest.length).append(combinedRequest).buffer();
            };


            try {
                if (requestsToProcess.length === 0) {
                    return completionCallback(null, []);
                }
                const firstRequest = requestsToProcess[0]; 

                const generatedBuffer = buildRequestBuffer(firstRequest);
                channelLog('Sending request buffer for command SEARCH');

                const response = await transmitPayload(1, generatedBuffer); 

                let result = {
                    status: response.status,
                    warning: '',
                    error: '',
                    matches: [],
                    total: 0,
                    totalFound: 0,
                    wordInfo: [],
                    attributeNames: [],
                    attributeTypes: [],
                    fieldNames: [],
                };

                let responseContent = response.payload;
                let offset = 0;

                if (response.status === ServerStatus.WARNING) {
                    const warningLen = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                    offset += 4;
                    result.warning = responseContent.slice(offset, offset + warningLen).toString();
                    offset += warningLen;
                } else if (response.status === ServerStatus.ERROR || response.status === ServerStatus.RETRY) {
                    result.error = responseContent.slice(4).toString(); 
                    configuration.lastError = result.error;
                    return completionCallback(new Error(result.error), null);
                } else if (response.status !== ServerStatus.OK) {
                    result.error = `Unknown server status code: ${response.status}`;
                    configuration.lastError = result.error;
                    return completionCallback(new Error(result.error), null);
                }

                const fieldCount = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                offset += 4;
                for (let i = 0; i < fieldCount; i++) {
                    const fieldNameLen = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                    offset += 4;
                    result.fieldNames.push(responseContent.slice(offset, offset + fieldNameLen).toString());
                    offset += fieldNameLen;
                }

                const attributeCount = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                offset += 4;
                for (let i = 0; i < attributeCount; i++) {
                    const attrNameLen = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                    offset += 4;
                    result.attributeNames.push(responseContent.slice(offset, offset + attrNameLen).toString());
                    offset += attrNameLen;
                    result.attributeTypes.push(decodeBinary('>L', responseContent.slice(offset, offset + 4))[0]);
                    offset += 4;
                }

                const matchCount = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                offset += 4;
                const matchesTotal = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                offset += 4;
                const matchesTotalFound = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                offset += 4;
                const queryTime = decodeBinary('>f', responseContent.slice(offset, offset + 4))[0];
                offset += 4;
                const totalWords = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                offset += 4; 

                result.total = matchesTotal;
                result.totalFound = matchesTotalFound;

                for(let i=0; i < matchCount; i++) {
                    const docId = readQuadValue(responseContent.slice(offset, offset + 8)); 
                    offset += 8;
                    const weight = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                    offset += 4;
                    const matchAttributes = {};
                    for(let j=0; j < attributeCount; j++) {
                        const attrType = result.attributeTypes[j];
                        const attrName = result.attributeNames[j];
                        if (attrType === AttributeType.BIGINT || attrType === AttributeType.MULTI64) {
                             matchAttributes[attrName] = readQuadValue(responseContent.slice(offset, offset + 8));
                             offset += 8;
                        } else if (attrType === AttributeType.FLOAT) {
                            matchAttributes[attrName] = decodeBinary('>f', responseContent.slice(offset, offset + 4))[0];
                            offset += 4;
                        } else if (attrType === AttributeType.MULTI) {
                            const multiCount = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                            offset += 4;
                            const multiValues = [];
                            for(let k=0; k < multiCount; k++) {
                                multiValues.push(decodeBinary('>L', responseContent.slice(offset, offset + 4))[0]);
                                offset += 4;
                            }
                            matchAttributes[attrName] = multiValues;
                        } else {
                            matchAttributes[attrName] = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                            offset += 4;
                        }
                    }
                    result.matches.push({ id: docId, weight: weight, attributes: matchAttributes });
                }

                for(let i=0; i < totalWords; i++) {
                    const wordLen = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                    offset += 4;
                    const word = responseContent.slice(offset, offset + wordLen).toString();
                    offset += wordLen;
                    const docs = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                    offset += 4;
                    const hits = decodeBinary('>L', responseContent.slice(offset, offset + 4))[0];
                    offset += 4;
                    result.wordInfo.push({ word, docs, hits });
                }

                completionCallback(null, [result]); 

            } catch (err) {
                configuration.lastError = err.message;
                completionCallback(err, null);
            }
        },

        initiateSearch: (queryStatement, searchIndex, queryAnnotation, completionHandler) => {
            if (arguments.length === 2) {
                completionHandler = arguments[1];
                searchIndex = '*';
                queryAnnotation = '';
            } else if (arguments.length === 3) {
                completionHandler = arguments[2];
                queryAnnotation = '';
            }

            apiMethods.enqueueSearchRequest(queryStatement, searchIndex, queryAnnotation);

            apiMethods.executePendingSearches((err, results) => {
                if (err) {
                    completionHandler(err, null);
                    return;
                }
                if (!results || results.length === 0) {
                    completionHandler(new Error('No search results returned.'), null);
                    return;
                }

                const firstResult = results[0];
                configuration.lastError = firstResult.error;
                configuration.lastWarning = firstResult.warning;

                if (firstResult.status === ServerStatus.ERROR) {
                    completionHandler(new Error(firstResult.error), null);
                    return;
                }
                completionHandler(null, firstResult);
            });
        }
    };

    Object.assign(apiMethods, MatchBehavior, SortMethod, GroupingFunction, RankingAlgorithm, FilterKind, ServerStatus, AttributeType);

    return apiMethods;
}

Object.assign(createSearchMechanism, MatchBehavior, SortMethod, GroupingFunction, RankingAlgorithm, FilterKind, ServerStatus, AttributeType);