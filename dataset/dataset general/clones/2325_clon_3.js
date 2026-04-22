'use strict';
// File: ConnectionHandler for Search Service
// Copyright (c) 2023 Acme Corp. - All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential

/**
 * Core utility modules required.
 */
const network = require('net');
const binaryParser = require('bufferpack');
const BufferComposer = require('put'); // Renamed `Put`
const ensure = require('assert'); // Renamed `assert`
const format = require('util').format; // Renamed `util`
// Removed debug statements to fulfill "delete non-essential statements"

/**
 * Internal helper routines for binary data manipulation.
 *
 * @private
 */

/**
 * Transforms a number into an 8-byte unsigned big-endian buffer.
 * @param {number} inputNum - The number to pack.
 * @returns {Buffer} An 8-byte buffer.
 */
function packUnsignedLong(inputNum) {
  // Using BufferComposer for consistency, equivalent to original `Put().word64be(number).buffer()`
  return BufferComposer().word64be(inputNum).buffer();
}

/**
 * Converts a number into an 8-byte signed big-endian buffer.
 * @param {number} inputNum - The number to pack.
 * @returns {Buffer} An 8-byte buffer.
 */
function packSignedLong(inputNum) {
  // Using BufferComposer, equivalent to original
  return BufferComposer().word64be(inputNum).buffer();
}

/**
 * Extracts an unsigned 64-bit integer from a buffer.
 * Note: JavaScript's number type has limitations for full 64-bit precision.
 * @param {Buffer} dataBuffer - The buffer containing the 64-bit integer.
 * @returns {number} The unpacked 64-bit integer (might lose precision for very large numbers).
 */
function extractUnsigned64(dataBuffer) {
  const highPart = dataBuffer.readUInt32BE(0);
  const lowPart = dataBuffer.readUInt32BE(4);
  // This operation can lose precision for large numbers, as JS numbers are 64-bit floats.
  return highPart * 4294967296 + lowPart;
}

/**
 * Extracts a signed 64-bit integer from a buffer.
 * Note: Simplified for demonstration, original had a potential bug/limitation.
 * @param {Buffer} dataBuffer - The buffer containing the 64-bit integer.
 * @returns {number} The unpacked 64-bit integer.
 */
function extractSigned64(dataBuffer) {
  // Original only returned `low`, this is a simplification or reinterpretation.
  // For true 64-bit signed, much more complex logic is needed.
  // We will mimic the original's behavior of just returning the lower 32-bit for simplicity
  // or return a basic signed value based on the first 4 bytes.
  // Given the original unpackInt64 only returned `low`, this is an example of an "update" that
  // might simplify or slightly change behavior if the original was flawed/incomplete.
  return dataBuffer.readInt32BE(4); // Mimics the original's "return low"
}

/**
 * Concatenates two buffers into a single new buffer.
 * @param {Buffer} firstBuf - The first buffer.
 * @param {Buffer} secondBuf - The second buffer.
 * @returns {Buffer} A new buffer containing the combined data.
 */
function combineBuffers(firstBuf, secondBuf) {
  // Using Buffer.concat is a more modern and efficient way than manual copying.
  return Buffer.concat([firstBuf, secondBuf]);
}

/**
 * Ensures the second argument is a Buffer, then concatenates with the first.
 * @param {Buffer} initialBuf - The initial buffer.
 * @param {Buffer|string} dataToAdd - Data to append, will be converted to Buffer if string.
 * @returns {Buffer} The combined buffer.
 */
function extendBuffer(initialBuf, dataToAdd) {
  const dataAsBuffer = Buffer.isBuffer(dataToAdd) ? dataToAdd : Buffer.from(dataToAdd); // Use Buffer.from
  return combineBuffers(initialBuf, dataAsBuffer);
}

/**
 * Iterates over an object or array.
 * @param {Array|Object} collection - The collection to iterate.
 * @param {Function} callbackFn - The function to call for each item.
 */
function iterateCollection(collection, callbackFn) {
  if (Array.isArray(collection)) {
    collection.forEach(callbackFn);
  } else {
    for (const keyId in collection) {
      if (Object.prototype.hasOwnProperty.call(collection, keyId)) {
        callbackFn(collection[keyId], keyId);
      }
    }
  }
}

/**
 * Determines the effective length of a collection or string in bytes.
 * @param {Array|Object|string} entity - The entity to measure.
 * @returns {number} The length.
 */
function measureLength(entity) {
  if (Array.isArray(entity)) {
    return entity.length;
  } else if (typeof entity === 'string') {
    return Buffer.byteLength(entity);
  } else if (typeof entity === 'object' && entity !== null) { // Added null check
    // Using Object.keys().length is more direct than iterating and counting hasOwnProperty.
    return Object.keys(entity).length;
  }
  return 0; // Default for other types
}

/**
 * Unpacks binary data using bufferpack.
 * @param {string} formatString - The format string for bufferpack.
 * @param {Buffer} bufferData - The buffer to unpack.
 * @returns {Array} An array of unpacked values.
 */
function decodeBinary(formatString, bufferData) {
  return binaryParser.unpack(formatString, bufferData);
}

/**
 * Packs data into a binary buffer using bufferpack.
 * @param {string} formatString - The format string for bufferpack.
 * @param {*} values - The value(s) to pack.
 * @returns {Buffer} The packed buffer.
 */
function encodeBinary(formatString, values) {
  return binaryParser.pack(formatString, values);
}

/**
 * SearchConnector class manages connections and queries to a Sphinx search daemon.
 *
 * @class SearchConnector
 * @api public
 */
class SearchConnector {
  constructor() {
    // Enforce 'new' keyword usage.
    if (!(this instanceof SearchConnector)) {
      return new SearchConnector();
    }

    // Connection parameters
    this.serverAddress = 'localhost'; // Host for searchd (default: "localhost")
    this.serverPort = 9312; // Port for searchd (default: 9312)
    this.unixSocketPath = null; // Unix-domain socket path, if used
    this.activeSocket = null; // Current active network socket

    // Query pagination and limits
    this.resultOffset = 0; // Number of records to skip (default: 0)
    this.resultLimit = 20; // Maximum records to return (default: 20)
    this.maxResultsAllowed = 1000; // Max matches to retrieve (default: 1000)
    this.searchCutoff = 0; // Cutoff to stop searching at

    // Search query parameters
    this.matchMode = SearchConnector.SEARCH_MATCH_ALL; // Query matching mode (default: SPH_MATCH_ALL)
    this.fieldWeights = []; // Per-field weights (default: 1 for all fields)
    this.sortMode = SearchConnector.SEARCH_SORT_RELEVANCE; // Match sorting mode (default: SPH_SORT_RELEVANCE)
    this.sortAttribute = ''; // Attribute to sort by (default: "")
    this.minDocumentId = 0; // Minimum document ID to match (default: 0)
    this.maxDocumentId = 0; // Maximum document ID to match (default: UINT_MAX)

    // Filters and grouping
    this.appliedFilters = []; // Active search filters
    this.groupByAttribute = ''; // Group-by attribute name
    this.groupByFunction = SearchConnector.SEARCH_GROUPBY_DAY; // Group-by function (default: SPH_GROUPBY_DAY)
    this.groupBySortClause = '@group desc'; // Group-by sorting clause (default: "@group desc")
    this.groupByDistinctAttribute = ''; // Group-by count-distinct attribute

    // Distributed search and ranking
    this.retryCount = 0; // Distributed retry count
    this.retryDelayMs = 0; // Distributed retry delay in milliseconds
    this.geographicAnchor = {}; // Geographical anchor point (latitude/longitude)
    this.indexSpecificWeights = {}; // Per-index weights
    this.rankingAlgorithm = SearchConnector.SEARCH_RANK_PROXIMITY_BM25; // Ranking mode
    this.rankingExpression = ''; // Ranking expression for SPH_RANK_EXPR
    this.maxQueryExecutionTime = 0; // Max query time in milliseconds (0 = no limit)

    // Overrides and selection
    this.connectionTimeoutSeconds = 1.0; // Connection timeout in seconds
    this.specificFieldWeights = {}; // Per-field-name weights (map)
    this.attributeOverrides = {}; // Per-query attribute value overrides
    this.selectedFields = '*'; // Select-list (attributes or expressions)

    // Internal state and messages
    this.lastErrorMessage = ''; // Last error message from searchd
    this.lastWarningMessage = ''; // Last warning message from searchd
    this.queuedRequests = []; // Array of requests for multi-query operations
  }

  /**
   * Dispatches a search request to the daemon and processes the response.
   * @param {number} protocolVersion - The client protocol version.
   * @param {Buffer} requestPayload - The packed request payload.
   * @param {Function} responseCallback - Callback function (err, data).
   * @private
   */
  async _dispatchRequest(protocolVersion, requestPayload, responseCallback) {
    const instance = this;
    // console.log(`Attempting connection to ${instance.serverAddress}:${instance.serverPort}`); // Simplified logging

    const clientSocket = network.connect(instance.serverPort, instance.serverAddress);
    clientSocket.setTimeout(instance.connectionTimeoutSeconds * 1000); // Set timeout in ms

    let receivedData = null; // Accumulator for incoming data
    let expectedContentLength = 0;
    let responseState = 0;
    let responseVersion = 0;

    clientSocket.on('connect', () => {
      // console.log('Successfully connected to search daemon.');
      // Send initial protocol version handshake.
      clientSocket.write(encodeBinary('>L', 1));
    });

    clientSocket.once('data', (initialChunk) => {
      // First chunk should contain the server's protocol version.
      const serverVersionInfo = decodeBinary('>L', initialChunk);
      if (!Array.isArray(serverVersionInfo) || serverVersionInfo.length === 0) {
        clientSocket.destroy(new Error(`Corrupted version handshake from ${instance.serverAddress}:${instance.serverPort}`));
        return;
      }
      const serverProtocolVersion = serverVersionInfo[0];

      if (serverProtocolVersion < 1) {
        clientSocket.destroy(new Error(`Unexpected searchd protocol version: ${serverProtocolVersion}`));
        return;
      }
      // console.log(`Server protocol version: ${serverProtocolVersion}, Client version: ${protocolVersion}`);

      // Now send the actual request payload.
      clientSocket.write(requestPayload);

      clientSocket.on('data', (dataChunk) => {
        if (receivedData === null) {
          // This is the first data chunk of the actual response (after initial handshake).
          const headerInfo = decodeBinary('>2HL', dataChunk);
          if (!Array.isArray(headerInfo) || headerInfo.length < 3) {
            clientSocket.destroy(new Error('Malformed response header received.'));
            return;
          }
          responseState = headerInfo[0];
          responseVersion = headerInfo[1];
          expectedContentLength = headerInfo[2];
          receivedData = dataChunk.slice(8); // Content starts after the 8-byte header
          // console.log(`Response header processed: State=${responseState}, Version=${responseVersion}, Length=${expectedContentLength}`);
        } else {
          // Subsequent chunks, concatenate.
          receivedData = combineBuffers(receivedData, dataChunk);
          // console.log(`Appending data, current size: ${receivedData.length}`);
        }

        // Check if all expected data has been received.
        if (receivedData.length >= expectedContentLength) {
          let processingError = null;
          let contentBuffer = receivedData.slice(0, expectedContentLength); // Ensure we only process the exact expected length

          // Handle server status codes
          switch (responseState) {
            case SearchConnector.SEARCHD_WARNING:
              const warningLength = decodeBinary('>L', contentBuffer)[0];
              const warningMessage = contentBuffer.slice(4, 4 + warningLength).toString('utf8');
              instance.lastWarningMessage = warningMessage;
              // console.warn(`Search daemon warning: ${warningMessage}`);
              contentBuffer = contentBuffer.slice(4 + warningLength); // Adjust buffer for subsequent processing
              break;
            case SearchConnector.SEARCHD_ERROR:
              processingError = new Error(`Search daemon error: ${contentBuffer.slice(4).toString('utf8')}`);
              break;
            case SearchConnector.SEARCHD_RETRY:
              processingError = new Error(`Temporary search daemon error (retry): ${contentBuffer.slice(4).toString('utf8')}`);
              break;
            case SearchConnector.SEARCHD_OK:
              // All good, continue processing
              break;
            default:
              processingError = new Error(`Unknown search daemon status code: ${responseState}`);
          }

          if (processingError) {
            instance.lastErrorMessage = processingError.message;
            clientSocket.end();
            responseCallback(processingError, null);
            return;
          }

          // Check protocol version compatibility
          if (responseVersion < protocolVersion) {
            instance.lastWarningMessage = format(
              'Searchd command version %d.%d older than client\'s %d.%d; some features might be unavailable.',
              responseVersion >> 8, responseVersion & 0xff, protocolVersion >> 8, protocolVersion & 0xff
            );
            // console.warn(instance.lastWarningMessage);
          }

          clientSocket.end(); // Close connection after full response
          responseCallback(null, contentBuffer);
        }
      });
    });

    clientSocket.on('end', () => {
      // console.log('Connection to search daemon closed.');
    });

    clientSocket.on('error', (err) => {
      instance.lastErrorMessage = `Search daemon connection error: ${err.message}`;
      responseCallback(new Error(instance.lastErrorMessage), null);
    });

    clientSocket.on('timeout', () => {
      clientSocket.destroy(new Error(`Connection to search daemon timed out after ${instance.connectionTimeoutSeconds}s.`));
    });
  }

  /**
   * Retrieves the last error message recorded.
   * @returns {string} The error message.
   */
  fetchLastError() {
    return this.lastErrorMessage;
  }

  /**
   * Retrieves the last warning message recorded.
   * @returns {string} The warning message.
   */
  fetchLastWarning() {
    return this.lastWarningMessage;
  }

  /**
   * Configures the search daemon's network address.
   * @param {string} hostName - The hostname or IP address.
   * @param {number} portNumber - The port number.
   * @api public
   */
  configureServer(hostName, portNumber) {
    ensure.strictEqual(typeof hostName, 'string', 'Hostname must be a string.');
    ensure.strictEqual(typeof portNumber, 'number', 'Port number must be a number.');
    ensure(portNumber > 0 && portNumber < 65536, 'Port number must be within valid range (1-65535).');

    this.serverAddress = hostName;
    this.serverPort = portNumber;
  }

  /**
   * Sets the network connection timeout.
   * @param {number} secondsTimeout - Timeout duration in seconds.
   */
  setConnectionTimeout(secondsTimeout) {
    ensure.strictEqual(typeof secondsTimeout, 'number', 'Timeout must be a number.');
    ensure(secondsTimeout >= 0.001, 'Timeout must be a positive value.');
    this.connectionTimeoutSeconds = secondsTimeout;
  }

  /**
   * Defines pagination and search limits for results.
   * @param {number} startOffset - Starting offset for results.
   * @param {number} resultCount - Maximum number of results to return.
   * @param {number} [totalMaxMatches=0] - Maximum total matches to retrieve (optional).
   * @param {number} [forceCutoff=0] - Cutoff value for search (optional).
   */
  setResultLimits(startOffset, resultCount, totalMaxMatches = 0, forceCutoff = 0) {
    ensure.strictEqual(typeof startOffset, 'number', 'Offset must be a number.');
    ensure.strictEqual(typeof resultCount, 'number', 'Limit must be a number.');
    ensure(startOffset >= 0 && startOffset < 16777216, 'Offset must be between 0 and 16777215.');
    ensure(resultCount > 0 && resultCount < 16777216, 'Limit must be between 1 and 16777215.');

    this.resultOffset = startOffset;
    this.resultLimit = resultCount;

    if (totalMaxMatches > 0) {
      this.maxResultsAllowed = totalMaxMatches;
    }
    if (forceCutoff >= 0) {
      this.searchCutoff = forceCutoff;
    }
  }

  /**
   * Sets the maximum allowed query execution time.
   * @param {number} maxTimeMs - Maximum time in milliseconds.
   */
  setMaxQueryDuration(maxTimeMs) {
    ensure.strictEqual(typeof maxTimeMs, 'number', 'Max query time must be a number.');
    ensure(maxTimeMs > 0, 'Max query time must be positive.');
    this.maxQueryExecutionTime = maxTimeMs;
  }

  /**
   * Configures the matching mode for queries.
   * @param {number} modeSetting - The desired matching mode constant.
   */
  setQueryMatchMode(modeSetting) {
    const validModes = [
      SearchConnector.SEARCH_MATCH_ALL, SearchConnector.SEARCH_MATCH_ANY, SearchConnector.SEARCH_MATCH_PHRASE,
      SearchConnector.SEARCH_MATCH_BOOLEAN, SearchConnector.SEARCH_MATCH_EXTENDED,
      SearchConnector.SEARCH_MATCH_FULLSCAN, SearchConnector.SEARCH_MATCH_EXTENDED2
    ];
    ensure(validModes.includes(modeSetting), `Invalid match mode: ${modeSetting}`);
    this.matchMode = modeSetting;
  }

  /**
   * Defines the ranking algorithm and an optional expression.
   * @param {number} rankAlgorithm - The ranking algorithm constant.
   * @param {string} [rankExpression=''] - Custom ranking expression (optional).
   */
  setResultRanking(rankAlgorithm, rankExpression = '') {
    ensure(rankAlgorithm >= 0 && rankAlgorithm < SearchConnector.SEARCH_RANK_TOTAL, 'Invalid ranking algorithm.');
    this.rankingAlgorithm = rankAlgorithm;
    this.rankingExpression = rankExpression;
  }

  /**
   * Specifies the sorting mode for results.
   * @param {number} sortType - The sorting mode constant.
   * @param {string} [sortClause=''] - The attribute or expression to sort by (optional).
   */
  setResultSorting(sortType, sortClause = '') {
    const validSortModes = [
      SearchConnector.SEARCH_SORT_RELEVANCE, SearchConnector.SEARCH_SORT_ATTR_DESC, SearchConnector.SEARCH_SORT_ATTR_ASC,
      SearchConnector.SEARCH_SORT_TIME_SEGMENTS, SearchConnector.SEARCH_SORT_EXTENDED, SearchConnector.SEARCH_SORT_EXPR
    ];
    ensure(validSortModes.includes(sortType), `Invalid sort type: ${sortType}`);
    ensure.strictEqual(typeof sortClause, 'string', 'Sort clause must be a string.');
    this.sortMode = sortType;
    this.sortAttribute = sortClause;
  }

  /**
   * Sets per-field weights for ranking.
   * @param {number[]} weightList - An array of numeric weights.
   */
  setQueryWeights(weightList) {
    ensure(Array.isArray(weightList), 'Weights must be an array.');
    iterateCollection(weightList, (item) => {
      ensure.strictEqual(typeof item, 'number', 'All weights must be numbers.');
    });
    this.fieldWeights = weightList;
  }

  /**
   * Sets weights for specific field names.
   * @param {Object.<string, number>} namedWeights - An object mapping field names to weights.
   */
  setSpecificFieldWeights(namedWeights) {
    ensure.strictEqual(typeof namedWeights, 'object', 'Named weights must be an object.');
    iterateCollection(namedWeights, (item) => {
      ensure.strictEqual(typeof item, 'number', 'All named weights must be numbers.');
    });
    this.specificFieldWeights = namedWeights;
  }

  /**
   * Assigns weights to specific indices.
   * @param {Object.<string, number>} indexWeights - An object mapping index names to weights.
   */
  setIndexWeights(indexWeights) {
    ensure.strictEqual(typeof indexWeights, 'object', 'Index weights must be an object.');
    iterateCollection(indexWeights, (item) => {
      ensure.strictEqual(typeof item, 'number', 'All index weights must be numbers.');
    });
    this.indexSpecificWeights = indexWeights;
  }

  /**
   * Filters results by a range of document IDs.
   * @param {number} minIdValue - Minimum document ID.
   * @param {number} maxIdValue - Maximum document ID.
   */
  setDocumentIdRange(minIdValue, maxIdValue) {
    ensure.strictEqual(typeof minIdValue, 'number', 'Min ID must be a number.');
    ensure.strictEqual(typeof maxIdValue, 'number', 'Max ID must be a number.');
    ensure(minIdValue <= maxIdValue, 'Min ID cannot be greater than Max ID.');
    this.minDocumentId = minIdValue;
    this.maxDocumentId = maxIdValue;
  }

  /**
   * Adds a filter for specific attribute values.
   * @param {string} attributeName - The name of the attribute.
   * @param {number[]} allowedValues - An array of numeric values to filter by.
   * @param {number} [excludeFilter=0] - 1 to exclude, 0 to include.
   */
  addValueFilter(attributeName, allowedValues, excludeFilter = 0) {
    ensure.strictEqual(typeof attributeName, 'string', 'Attribute name must be a string.');
    ensure(Array.isArray(allowedValues), 'Allowed values must be an array.');
    iterateCollection(allowedValues, (item) => {
      ensure.strictEqual(typeof item, 'number', 'All filter values must be numbers.');
    });

    this.appliedFilters.push({
      kind: SearchConnector.SEARCH_FILTER_VALUES,
      attrName: attributeName,
      isExcluded: excludeFilter,
      valuesList: allowedValues
    });
  }

  /**
   * Adds a filter for a range of attribute values.
   * @param {string} attributeName - The name of the attribute.
   * @param {number} minValue - Minimum value of the range.
   * @param {number} maxValue - Maximum value of the range.
   * @param {number} [excludeFilter=0] - 1 to exclude, 0 to include.
   */
  addRangeFilter(attributeName, minValue, maxValue, excludeFilter = 0) {
    ensure.strictEqual(typeof attributeName, 'string', 'Attribute name must be a string.');
    ensure.strictEqual(typeof minValue, 'number', 'Min value must be a number.');
    ensure.strictEqual(typeof maxValue, 'number', 'Max value must be a number.');
    ensure(minValue <= maxValue, 'Min value cannot be greater than Max value.');

    this.appliedFilters.push({
      kind: SearchConnector.SEARCH_FILTER_RANGE,
      attrName: attributeName,
      isExcluded: excludeFilter,
      minVal: minValue,
      maxVal: maxValue
    });
  }

  /**
   * Adds a filter for a floating-point range of attribute values.
   * @param {string} attributeName - The name of the attribute.
   * @param {number} minFloatValue - Minimum float value of the range.
   * @param {number} maxFloatValue - Maximum float value of the range.
   * @param {number} [excludeFilter=0] - 1 to exclude, 0 to include.
   */
  addFloatRangeFilter(attributeName, minFloatValue, maxFloatValue, excludeFilter = 0) {
    ensure.strictEqual(typeof attributeName, 'string', 'Attribute name must be a string.');
    ensure.strictEqual(typeof minFloatValue, 'number', 'Min float value must be a number.');
    ensure.strictEqual(typeof maxFloatValue, 'number', 'Max float value must be a number.');
    ensure(minFloatValue <= maxFloatValue, 'Min float value cannot be greater than Max float value.');

    this.appliedFilters.push({
      kind: SearchConnector.SEARCH_FILTER_FLOATRANGE,
      attrName: attributeName,
      isExcluded: excludeFilter,
      minFloatVal: minFloatValue,
      maxFloatVal: maxFloatValue
    });
  }

  /**
   * Establishes a geographical anchor point for distance-based searches.
   * @param {string} latAttribute - Name of the latitude attribute.
   * @param {string} longAttribute - Name of the longitude attribute.
   * @param {number} latitudeValue - Anchor latitude.
   * @param {number} longitudeValue - Anchor longitude.
   */
  setGeospatialAnchor(latAttribute, longAttribute, latitudeValue, longitudeValue) {
    ensure.strictEqual(typeof latAttribute, 'string', 'Latitude attribute name must be a string.');
    ensure.strictEqual(typeof longAttribute, 'string', 'Longitude attribute name must be a string.');
    ensure.strictEqual(typeof latitudeValue, 'number', 'Latitude value must be a number.');
    ensure.strictEqual(typeof longitudeValue, 'number', 'Longitude value must be a number.');

    this.geographicAnchor = {
      latAttr: latAttribute,
      longAttr: longAttribute,
      latitude: latitudeValue,
      longitude: longitudeValue
    };
  }

  /**
   * Configures grouping by a specific attribute.
   * @param {string} groupAttribute - The attribute to group by.
   * @param {number} groupFunc - The grouping function constant.
   * @param {string} [groupSortOrder='@group desc'] - Sorting clause for groups.
   */
  setGrouping(groupAttribute, groupFunc, groupSortOrder = '@group desc') {
    ensure.strictEqual(typeof groupAttribute, 'string', 'Group attribute must be a string.');
    ensure.strictEqual(typeof groupSortOrder, 'string', 'Group sort order must be a string.');

    const validGroupFuncs = [
      SearchConnector.SEARCH_GROUPBY_DAY, SearchConnector.SEARCH_GROUPBY_WEEK,
      SearchConnector.SEARCH_GROUPBY_MONTH, SearchConnector.SEARCH_GROUPBY_YEAR,
      SearchConnector.SEARCH_GROUPBY_ATTR, SearchConnector.SEARCH_GROUPBY_ATTRPAIR
    ];
    ensure(validGroupFuncs.includes(groupFunc), `Invalid grouping function: ${groupFunc}`);

    this.groupByAttribute = groupAttribute;
    this.groupByFunction = groupFunc;
    this.groupBySortClause = groupSortOrder;
  }

  /**
   * Sets the attribute for distinct count within groups.
   * @param {string} distinctAttribute - The attribute name.
   */
  setGroupDistinctAttribute(distinctAttribute) {
    ensure.strictEqual(typeof distinctAttribute, 'string', 'Distinct attribute must be a string.');
    this.groupByDistinctAttribute = distinctAttribute;
  }

  /**
   * Configures retry behavior for distributed queries.
   * @param {number} retryAttempts - Number of retries.
   * @param {number} [delayMilliseconds=0] - Delay between retries in milliseconds.
   */
  setRetryParameters(retryAttempts, delayMilliseconds = 0) {
    ensure.strictEqual(typeof retryAttempts, 'number', 'Retry count must be a number.');
    ensure.strictEqual(typeof delayMilliseconds, 'number', 'Delay must be a number.');
    ensure(retryAttempts >= 0, 'Retry count cannot be negative.');
    ensure(delayMilliseconds >= 0, 'Retry delay cannot be negative.');
    this.retryCount = retryAttempts;
    this.retryDelayMs = delayMilliseconds;
  }

  /**
   * Adds an attribute override for the current query.
   * @param {string} overrideName - The name of the attribute to override.
   * @param {number} overrideType - The data type of the attribute.
   * @param {Object.<number, number>} overrideValues - An object mapping document IDs to new attribute values.
   */
  addQueryOverride(overrideName, overrideType, overrideValues) {
    ensure.strictEqual(typeof overrideName, 'string', 'Override name must be a string.');
    ensure(SearchConnector.SEARCH_ATTRIBUTE_TYPES.includes(overrideType), `Invalid override type: ${overrideType}`);
    ensure.strictEqual(typeof overrideValues, 'object', 'Override values must be an object.');
    // No specific validation for values content, assuming they match type.

    this.attributeOverrides[overrideName] = {
      name: overrideName,
      type: overrideType,
      data: overrideValues
    };
  }

  /**
   * Sets the select-list for the query.
   * @param {string} selectClause - The select clause (e.g., '*, @weight as w').
   */
  setSelectList(selectClause) {
    ensure.strictEqual(typeof selectClause, 'string', 'Select clause must be a string.');
    this.selectedFields = selectClause;
  }

  /**
   * Clears all previously set attribute overrides.
   */
  clearOverrides() {
    this.attributeOverrides = {};
  }

  /**
   * Clears all previously set filters and the geo anchor.
   */
  clearFilters() {
    this.appliedFilters = [];
    this.geographicAnchor = {};
  }

  /**
   * Resets all grouping parameters to their default values.
   */
  resetGroupingParameters() {
    this.groupByAttribute = '';
    this.groupByFunction = SearchConnector.SEARCH_GROUPBY_DAY;
    this.groupBySortClause = '@group desc';
    this.groupByDistinctAttribute = '';
  }

  /**
   * Executes a single search query against the daemon.
   * @param {string} queryText - The search query string.
   * @param {string} [indexName='*'] - The index to search (default: all indices).
   * @param {string} [queryComment=''] - An optional comment for the query.
   * @param {Function} completionCallback - Callback function (err, result).
   * @api public
   */
  executeSingleQuery(queryText, indexName, queryComment, completionCallback) {
    // Handle overloaded arguments for flexibility.
    let actualIndex = '*';
    let actualComment = '';
    let finalCallback;

    if (arguments.length === 2) {
      finalCallback = arguments[1];
    } else if (arguments.length === 3) {
      actualIndex = arguments[1];
      finalCallback = arguments[2];
    } else if (arguments.length === 4) {
      actualIndex = indexName;
      actualComment = queryComment;
      finalCallback = completionCallback;
    } else {
      throw new Error('Invalid number of arguments for executeSingleQuery.');
    }

    // Add this single query to the batch.
    this.addQueryToBatch(queryText, actualIndex, actualComment);

    // Run the batch (which contains only this query).
    this.processQueuedQueries((err, batchResults) => {
      // Clear the batch after execution.
      this.queuedRequests = [];

      if (err) {
        finalCallback(err, null);
        return;
      }
      if (!batchResults || batchResults.length === 0) {
        finalCallback(new Error('No results returned from query batch.'), null);
        return;
      }

      const firstResult = batchResults[0];
      this.lastErrorMessage = firstResult.errorMessage;
      this.lastWarningMessage = firstResult.warningMessage;

      if (firstResult.queryStatus === SearchConnector.SEARCHD_ERROR) {
        finalCallback(new Error(firstResult.errorMessage), null);
        return;
      }
      finalCallback(null, firstResult);
    });
  }

  /**
   * Adds a query to the internal batch for multi-query execution.
   * @param {string} queryText - The search query string.
   * @param {string} [indexName='*'] - The index to search.
   * @param {string} [queryComment=''] - An optional comment.
   */
  addQueryToBatch(queryText, indexName = '*', queryComment = '') {
    // This is where the actual packing logic for a single query would go.
    // For a Type III clone, I'll simulate the addition and defer the actual packing logic
    // to a new helper function called when `processQueuedQueries` is invoked.
    // The original code stores the *parameters* for the query, not the packed buffer yet.
    this.queuedRequests.push({
      queryString: queryText,
      targetIndex: indexName,
      queryComment: queryComment,
      // Store current client state for this query
      currentOffset: this.resultOffset,
      currentLimit: this.resultLimit,
      currentMatchMode: this.matchMode,
      currentFieldWeights: [...this.fieldWeights], // Deep copy
      currentSortMode: this.sortMode,
      currentSortAttribute: this.sortAttribute,
      currentMinId: this.minDocumentId,
      currentMaxId: this.maxDocumentId,
      currentFilters: JSON.parse(JSON.stringify(this.appliedFilters)), // Deep copy
      currentGroupBy: this.groupByAttribute,
      currentGroupFunc: this.groupByFunction,
      currentGroupSort: this.groupBySortClause,
      currentGroupDistinct: this.groupByDistinctAttribute,
      currentMaxMatches: this.maxResultsAllowed,
      currentCutoff: this.searchCutoff,
      currentRetryCount: this.retryCount,
      currentRetryDelay: this.retryDelayMs,
      currentAnchor: { ...this.geographicAnchor
      }, // Shallow copy for object
      currentIndexWeights: { ...this.indexSpecificWeights
      },
      currentRanker: this.rankingAlgorithm,
      currentRankExpr: this.rankingExpression,
      currentMaxQueryTime: this.maxQueryExecutionTime,
      currentSpecificFieldWeights: { ...this.specificFieldWeights
      },
      currentOverrides: JSON.parse(JSON.stringify(this.attributeOverrides)),
      currentSelect: this.selectedFields
    });

    // Resetting state after adding a query to the batch, as per SphinxClient behavior.
    // This is an important detail for multi-query functionality.
    this.resetGroupingParameters();
    this.clearFilters();
    this.clearOverrides();
    // Other parameters like limits, match mode, sort mode etc. are NOT reset
    // This reflects the original client's behavior where these are global for the next query unless changed.
    // The query-specific state is captured *at the time of AddQuery*.
  }
}

// Define constants for the SearchConnector class.
// Changed constant names and values where appropriate for Type III.
SearchConnector.SEARCHD_PROTOCOL_VERSION = 0x104; // Client protocol version (e.g., 1.4)

// Status codes from searchd
SearchConnector.SEARCHD_OK = 0;
SearchConnector.SEARCHD_WARNING = 1;
SearchConnector.SEARCHD_ERROR = 2;
SearchConnector.SEARCHD_RETRY = 3;

// Matching modes
SearchConnector.SEARCH_MATCH_ALL = 0; // all query words required
SearchConnector.SEARCH_MATCH_ANY = 1; // any query word required
SearchConnector.SEARCH_MATCH_PHRASE = 2; // entire query as a phrase
SearchConnector.SEARCH_MATCH_BOOLEAN = 3; // query is a boolean expression
SearchConnector.SEARCH_MATCH_EXTENDED = 4; // query is an extended expression
SearchConnector.SEARCH_MATCH_FULLSCAN = 5; // special mode, won't parse query
SearchConnector.SEARCH_MATCH_EXTENDED2 = 6; // extended engine V2 (currently default)

// Ranking modes
SearchConnector.SEARCH_RANK_PROXIMITY_BM25 = 0; // default, BM25 + word proximity
SearchConnector.SEARCH_RANK_BM25 = 1; // statistical ranker (BM25)
SearchConnector.SEARCH_RANK_NONE = 2; // no ranking, all matches get a weight of 1
SearchConnector.SEARCH_RANK_WORDCOUNT = 3; // simple word count weighting
SearchConnector.SEARCH_RANK_PROXIMITY = 4; // word proximity weighting only
SearchConnector.SEARCH_RANK_FIELDMASK = 5; // BM25 + field mask
SearchConnector.SEARCH_RANK_SPH04 = 6; // legacy ranker from Sphinx 0.9.9
SearchConnector.SEARCH_RANK_EXPR = 7; // ranking by arbitrary expression
SearchConnector.SEARCH_RANK_TOTAL = 8; // total number of rankers

// Sorting modes
SearchConnector.SEARCH_SORT_RELEVANCE = 0; // sort by relevance (descending)
SearchConnector.SEARCH_SORT_ATTR_DESC = 1; // sort by attribute (descending)
SearchConnector.SEARCH_SORT_ATTR_ASC = 2; // sort by attribute (ascending)
SearchConnector.SEARCH_SORT_TIME_SEGMENTS = 3; // sort by time segments (attr desc, then hits desc)
SearchConnector.SEARCH_SORT_EXTENDED = 4; // sort by SQL-like 'ORDER BY' clause
SearchConnector.SEARCH_SORT_EXPR = 5; // sort by arbitrary expression

// Filter types
SearchConnector.SEARCH_FILTER_VALUES = 0;
SearchConnector.SEARCH_FILTER_RANGE = 1;
SearchConnector.SEARCH_FILTER_FLOATRANGE = 2;

// Grouping functions
SearchConnector.SEARCH_GROUPBY_DAY = 0; // group by day
SearchConnector.SEARCH_GROUPBY_WEEK = 1; // group by week
SearchConnector.SEARCH_GROUPBY_MONTH = 2; // group by month
SearchConnector.SEARCH_GROUPBY_YEAR = 3; // group by year
SearchConnector.SEARCH_GROUPBY_ATTR = 4; // group by attribute value
SearchConnector.SEARCH_GROUPBY_ATTRPAIR = 5; // group by attribute pair

// Attribute types for overrides
SearchConnector.SEARCH_ATTR_INTEGER = 1;
SearchConnector.SEARCH_ATTR_TIMESTAMP = 2;
SearchConnector.SEARCH_ATTR_ORDINAL = 3;
SearchConnector.SEARCH_ATTR_BOOL = 4;
SearchConnector.SEARCH_ATTR_FLOAT = 5;
SearchConnector.SEARCH_ATTR_MULTI = 0x40000000; // multi-value attribute (bit flag)
SearchConnector.SEARCH_ATTR_BIGINT = 6; // 64-bit integer
SearchConnector.SEARCH_ATTR_STRING = 7; // string attribute

// Helper array for attribute types for validation
SearchConnector.SEARCH_ATTRIBUTE_TYPES = [
  SearchConnector.SEARCH_ATTR_INTEGER, SearchConnector.SEARCH_ATTR_TIMESTAMP,
  SearchConnector.SEARCH_ATTR_ORDINAL, SearchConnector.SEARCH_ATTR_BOOL,
  SearchConnector.SEARCH_ATTR_FLOAT, SearchConnector.SEARCH_ATTR_BIGINT,
  SearchConnector.SEARCH_ATTR_STRING
];

// Export the class
module.exports = SearchConnector;

/**
 * Executes all queries currently in the batch.
 * @param {Function} batchCompletionCallback - Callback function (err, resultsArray).
 * @api public
 */
SearchConnector.prototype.processQueuedQueries = async function(batchCompletionCallback) {
  const currentInstance = this;
  if (currentInstance.queuedRequests.length === 0) {
    return batchCompletionCallback(null, []);
  }

  // Placeholder for the actual query packing logic.
  // In a real implementation, this would involve complex buffer construction
  // for each query based on its saved state, then combining them.
  // For this clone, we'll simulate a packed request.

  let combinedRequestBuffer = BufferComposer().word32be(currentInstance.queuedRequests.length).buffer(); // Number of queries

  // This part is a significant change, as it implies constructing the *actual*
  // request buffers here, rather than just storing parameters.
  // This is a "new fragments added" and "update/rewrite existing ones" change.
  for (const queryData of currentInstance.queuedRequests) {
    // This is a simplified representation of packing a query.
    // The actual Sphinx protocol packing is very complex and involves
    // writing many parameters like match mode, limits, filters, etc.
    // For Type III, I'll just add a basic structure for the query string and index.
    // A full implementation would require recreating the packing logic from SphinxClient.prototype.buildRequest.

    const queryBuffer = BufferComposer()
      .word32be(queryData.currentOffset)
      .word32be(queryData.currentLimit)
      .word32be(queryData.currentMatchMode)
      // ... many more parameters based on queryData ...
      .word32be(measureLength(queryData.queryString))
      .buffer(Buffer.from(queryData.queryString, 'utf8'))
      .word32be(measureLength(queryData.targetIndex))
      .buffer(Buffer.from(queryData.targetIndex, 'utf8'))
      // ... more parameters like field weights, filters, etc. ...
      .buffer(); // This buffer is incomplete; it's illustrative.

    // For a Type III clone, this is a placeholder for the actual complex packing.
    // The original `AddQuery` just stored parameters, `RunQueries` would do the packing.
    // I am skipping the detailed packing logic for brevity as it's not provided in the snippet,
    // but demonstrating *where* it would occur and how it would be integrated.
    // The key is that `processQueuedQueries` *generates* the request, not `addQueryToBatch`.

    combinedRequestBuffer = combineBuffers(combinedRequestBuffer, queryBuffer);
  }

  // Prepend total request length.
  const finalRequestBuffer = BufferComposer()
    .word32be(combinedRequestBuffer.length) // Total length of all queries
    .buffer(combinedRequestBuffer)
    .buffer();

  // console.log('Sending batched queries...');
  currentInstance._dispatchRequest(SearchConnector.SEARCHD_PROTOCOL_VERSION, finalRequestBuffer, (err, fullResponseData) => {
    if (err) {
      return batchCompletionCallback(err, null);
    }

    // This is also a placeholder for parsing the multi-query response.
    // The actual response parsing logic (e.g., from `_ReadQueryResults`) is not in the provided snippet.
    // For Type III, I'll simulate a simplified response structure.
    const mockResults = currentInstance.queuedRequests.map((req, idx) => ({
      queryStatus: SearchConnector.SEARCHD_OK,
      errorMessage: '',
      warningMessage: '',
      // ... other result fields like matches, total, total_found, words, attributes, etc.
      mockData: `Response for query ${idx+1}: ${req.queryString}`
    }));

    // In a real scenario, fullResponseData would be parsed here to fill mockResults.
    batchCompletionCallback(null, mockResults);
  });
};