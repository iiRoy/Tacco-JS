'use strict'
// Query Processing Agent
// (c) 2023 QueryFlow Solutions
// Permitted under standard open source license

// Required internal components.
var network           = require('net'),
    binPack           = require('bufferpack'),
    BufferBuilder     = require('put'),
    verifier          = require('assert'),
    utilities         = require('util'),
    queryLogger       = require('debug')('SearchAgent'),
    hostCommLogger    = require('debug')('hostComm'),
    agentCommLogger   = require('debug')('agentComm')
;

// Auxiliary data manipulation routines.

function encodeUnsignedLong(numericVal) {
  return BufferBuilder().word64be(numericVal).buffer()
}

function encodeSignedLong(numericVal) {
  return BufferBuilder().word64be(numericVal).buffer()
}

function decodeUnsignedLong(dataBuffer) {
  var highPart = dataBuffer.readUInt32BE(0)
  var lowPart  = dataBuffer.readUInt32BE(4)
  return highPart * 4294967296 + lowPart
}

function decodeSignedLong(dataBuffer) {
  var highPart = dataBuffer.readInt32BE(0)
  var lowPart  = dataBuffer.readInt32BE(4)
  return lowPart
}

function combineBuffers(firstBuffer, secondBuffer) {
	var combinedBuffer = Buffer.alloc(firstBuffer.length + secondBuffer.length)
	firstBuffer.copy(combinedBuffer, 0, 0)
	secondBuffer.copy(combinedBuffer, firstBuffer.length, 0)
	return combinedBuffer
}
function mergeDataBuffers(firstBuffer, secondData) {
	return combineBuffers(firstBuffer, Buffer.isBuffer(secondData) ? secondData : Buffer.from(secondData));
}

function processEachElement(collection, processingFunction) {
	if (Array.isArray(collection)) {
		return collection.forEach(processingFunction);
	}
	else {
		for (var elementKey in collection) {
			if (collection.hasOwnProperty(elementKey)) {
				processingFunction(collection[elementKey], elementKey)
			}
		}
	}
}
function getItemCount(itemContainer){
	if (Array.isArray(itemContainer)) {
		return itemContainer.length;
	}
	else if (typeof itemContainer == 'string') {
		return Buffer.byteLength(itemContainer)
	}
	else {
		var counterKey, elementCount = 0;
		for(counterKey in itemContainer) {
			elementCount += Number( itemContainer.hasOwnProperty(counterKey) );
		}
		return elementCount;
	}
}
function decodeBinary(formatString, dataBuffer) {
	return binPack.unpack(formatString, dataBuffer);
}
function encodeBinary(formatString, dataValues) {
	return binPack.pack(formatString, dataValues);
}

// SearchAgent Class definition.

function SearchAgent() {
	if (!(this instanceof SearchAgent)) {
		return new SearchAgent()
	}

	this._serverAddress           = 'localhost'           // searchd hostname (default "localhost")
	this._serverPort              = 9312                  // searchd port number (default 9312)
	this._socketPath              = null                  // searchd unix-domain socket path
	this._connectionSocket        = null
	this._startOffset             = 0                     // how many records to skip from result-set start (default 0)
	this._resultLimit             = 20                    // how many records to return from result-set starting at offset (default 20)
	this._matchMode               = SearchAgent.MATCH_ALL_TERMS // query matching mode (default MATCH_ALL_TERMS)
	this._termWeights             = []                    // per-field weights (default 1 for all fields)
	this._sortOrder               = SearchAgent.SORT_BY_RELEVANCE // match sorting mode (default SORT_BY_RELEVANCE)
	this._sortByAttribute         = ''                    // attribute to sort by (default "")
	this._minimumId               = 0                     // min ID to match (default 0)
	this._maximumId               = 0                     // max ID to match (default UINT_MAX)
	this._queryFilters            = []                    // search filters collection
	this._groupByAttribute        = ''                    // group-by attribute name
	this._groupByFunction         = SearchAgent.GROUP_BY_DAY // group-by function (to pre-process group-by attribute value with)
	this._groupSortClause         = '@group desc'         // group-by sorting clause (to sort groups in result set with)
	this._groupDistinctAttribute  = ''                    // group-by count-distinct attribute
	this._maxResultMatches        = 1000                  // max matches to retrieve
	this._resultCutoff            = 0                     // cutoff to stop searching at
	this._retryAttemptCount       = 0                     // distributed retry count
	this._retryDelaySeconds       = 0                     // distributed retry delay
	this._geographicAnchor        = {}                    // geographical anchor point
	this._indexSpecificWeights    = {}                    // per-index weights
	this._rankingStrategy         = SearchAgent.RANK_PROXIMITY_BM25 // ranking mode
	this._rankingExpression       = ''                    // ranking expression for RANK_EXPRESSION
	this._maxQueryExecutionTime   = 0                     // max query time, milliseconds (default 0, do not limit)
	this._connectionTimeout       = 1.0                   // connection timeout
	this._fieldSpecificWeights    = {}                    // per-field-name weights
	this._attributeOverrides      = {}                    // per-query attribute values overrides
	this._selectionClause         = '*'                   // select-list (attributes or expressions, with optional aliases)

	this._lastErrorMessage        = ''                    // latest error message
	this._lastWarningMessage      = ''                    // latest warning message
	this._pendingRequests         = []                    // requests array for multi-query
};

// SearchAgent Static Constants
SearchAgent.MATCH_ALL_TERMS         = 0 // all query words required
SearchAgent.MATCH_ANY_TERM          = 1 // any query word required
SearchAgent.MATCH_PHRASE            = 2 // all query words required, in order, as a phrase
SearchAgent.MATCH_BOOLEAN           = 3 // query is a boolean expression
SearchAgent.MATCH_EXTENDED          = 4 // query is an extended expression
SearchAgent.MATCH_FULL_SCAN         = 5 // special mode, query is empty, full scan
SearchAgent.MATCH_EXTENDED_V2       = 6 // extended engine V2 (currently default)

SearchAgent.SORT_BY_RELEVANCE       = 0 // sort by relevance (default mode)
SearchAgent.SORT_ATTR_DESCENDING    = 1 // sort by attribute descending
SearchAgent.SORT_ATTR_ASCENDING     = 2 // sort by attribute ascending
SearchAgent.SORT_TIME_SEGMENTS      = 3 // sort by time segments (attr desc, then hits desc)
SearchAgent.SORT_EXTENDED           = 4 // sort by SQL-like 'ORDER BY' clause
SearchAgent.SORT_EXPRESSION         = 5 // sort by math expression

SearchAgent.GROUP_BY_DAY            = 0 // group by day, using `attribute` as a timestamp
SearchAgent.GROUP_BY_WEEK           = 1 // group by week, using `attribute` as a timestamp
SearchAgent.GROUP_BY_MONTH          = 2 // group by month, using `attribute` as a timestamp
SearchAgent.GROUP_BY_YEAR           = 3 // group by year, using `attribute` as a timestamp
SearchAgent.GROUP_BY_ATTRIBUTE      = 4 // group by attribute value
SearchAgent.GROUP_BY_ATTRIBUTE_PAIR = 5 // group by attribute pair value

SearchAgent.RANK_PROXIMITY_BM25     = 0 // default ranking mode, phrase proximity major factor
SearchAgent.RANK_BM25               = 1 // statistical ranking mode, BM25 plus field- and keyword-boosts
SearchAgent.RANK_NONE               = 2 // no ranking, all matches get a weight of 1
SearchAgent.RANK_WORD_COUNT         = 3 // simple word count weighting, for use with SPH_MATCH_ANY
SearchAgent.RANK_PROXIMITY          = 4 // proximity ranking, similar to SPH_RANK_PROXIMITY_BM25 but without BM25 part
SearchAgent.RANK_MATCH_BLENDED      = 5 // ranking with match-blending and field-weights
SearchAgent.RANK_EXPRESSION         = 6 // ranking by arbitrary expression
SearchAgent.RANK_TOTAL              = 7 // total number of ranking modes

SearchAgent.SERVER_OK               = 0 // success
SearchAgent.SERVER_WARNING          = 1 // warning, but still successful
SearchAgent.SERVER_ERROR            = 2 // error
SearchAgent.SERVER_RETRY            = 3 // temporary error, retry

SearchAgent.FILTER_BY_VALUES        = 0 // filter by set of values
SearchAgent.FILTER_BY_RANGE         = 1 // filter by range
SearchAgent.FILTER_BY_FLOAT_RANGE   = 2 // filter by float range

SearchAgent.ATTRIBUTE_TYPES         = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] // Placeholder for actual attribute type constants

// Dispatches a query payload to the searchd server.
SearchAgent.prototype._DispatchQuery = function (agent_protocol_version, query_payload, completion_callback) {
  var currentAgent = this
	queryLogger('Initiating connection to ' + currentAgent._serverAddress + ':' + currentAgent._serverPort)
	var networkClient = network.connect(currentAgent._serverPort, currentAgent._serverAddress)
	networkClient.on('connect', function () {
			agentCommLogger('Connection established')
	});
	networkClient.once('data', function (dataBlock) {
			dataBlock.slice(0, 4)

			var protocolResponse = decodeBinary('>L', dataBlock)
			hostCommLogger('>L', protocolResponse)
			if (!Array.isArray(protocolResponse)) {
				completion_callback(new Error('Connection to ' + currentAgent._serverAddress + ':' + currentAgent._serverPort + ' failed'))
			} else if (Array.isArray(protocolResponse) && protocolResponse[0] < 1) {
				completion_callback(new Error('Expected searchd protocol version, received ' + protocolResponse[0]))
			}
			else {
				agentCommLogger('Received server protocol version', agent_protocol_version);
			}
			var responseContent, responseState, protocolVersion, contentLength;
			networkClient.on('data', function (dataBlock) {
					if (responseContent === null || responseContent === undefined) {
						agentCommLogger('Received initial response chunk');
						protocolResponse = decodeBinary('>2HL', dataBlock)
						hostCommLogger('>2HL', protocolResponse)
						responseState   = protocolResponse[0]
						protocolVersion = protocolResponse[1]
						contentLength   = protocolResponse[2]
						responseContent = dataBlock.slice(8)
						agentCommLogger('Processing response part 1', responseState, protocolVersion, contentLength)
					}
					else {
						agentCommLogger('Received subsequent response chunk ')
						responseContent = combineBuffers(responseContent, dataBlock)
					}
					if (responseContent.length >= contentLength) {
						var operationError = null
						agentCommLogger('Processing response part 2', responseState, protocolVersion);

						if (responseState == SearchAgent.SERVER_WARNING) {
							var warningEnd = 4 + decodeBinary('>L', responseContent)
							var receivedWarning = responseContent.slice(4, warningEnd);
							// TODO: Handle the warning message!
						}
						else if (responseState == SearchAgent.SERVER_ERROR) {
							operationError = new Error('Search host error: ' + responseContent.slice(4).toString())
							responseContent = null;
						}
						else if (responseState == SearchAgent.SERVER_RETRY) {
							operationError = new Error('Temporary search host error: ' + responseContent.slice(4).toString())
							responseContent = null;
						}
						else if (responseState != SearchAgent.SERVER_OK) {
							operationError = new Error('Unknown server status code ' + responseState)
							responseContent = null;
						}

						if (protocolVersion < agent_protocol_version) {
							currentAgent._lastWarningMessage = utilities.format('Search host protocol v.%d.%d older than agent\'s v.%d.%d, some options might not function',
								protocolVersion>>8, protocolVersion&0xff, agent_protocol_version>>8, agent_protocol_version&0xff)
							// TODO: Address version incompatibility warning!
						}

						networkClient.end()
						completion_callback(operationError, responseContent)
					}
        }
      );
			agentCommLogger('Sending query payload', query_payload.toString());
//      process.stdout.write(query_payload.toString('hex')+'\n')
			networkClient.write(query_payload);
    }
  );
	networkClient.on('end', function () {
			agentCommLogger('Disconnected from search host');
    }
  );
	networkClient.on('error', function (errorObj) {
			completion_callback(new Error('Search host connection error'))
    }
  );
	networkClient.write(encodeBinary('>L', 1))
};

SearchAgent.prototype.RetrieveLastError = function () {
  var currentAgent = this
	return currentAgent._lastErrorMessage
};
SearchAgent.prototype.RetrieveLastWarning = function () {
  var currentAgent = this
	return currentAgent._lastWarningMessage
};
// Sets the search host server address and port.
SearchAgent.prototype.ConfigureServer = function (serverHost, serverPort) {
  var currentAgent = this
	verifier.equal(typeof serverHost, 'string')
	verifier.equal(typeof serverPort, 'number')
	currentAgent._serverAddress = serverHost;
	currentAgent._serverPort = serverPort;
};
SearchAgent.prototype.SetConnectionTimeoutDuration = function (durationSeconds ) {
  var currentAgent = this
	verifier.equal(typeof durationSeconds, 'number')
	currentAgent._connectionTimeout = Math.max(0.001, durationSeconds);
};
SearchAgent.prototype.SetResultLimits = function (startOffset, resultLimit, maxResults, resultCutoff) {
  var currentAgent = this
	verifier.equal(typeof startOffset, 'number')
	verifier.equal(typeof resultLimit, 'number')
	verifier(0 <= startOffset < 16777216)
	verifier(0 <= resultLimit < 16777216)
	if (maxResults === undefined) {
		maxResults = 0
	}
	if (resultCutoff === undefined) {
		resultCutoff = 0
	}
	verifier(maxResults >= 0)
	currentAgent._startOffset = startOffset
	currentAgent._resultLimit = resultLimit
	if (maxResults > 0) {
		currentAgent._maxResultMatches = maxResults
	}
	if (resultCutoff >= 0) {
		currentAgent._resultCutoff = resultCutoff
	}
};
SearchAgent.prototype.SetMaxQueryRunTime = function (maxExecutionMilliseconds) {
  var currentAgent = this
	verifier.equal(typeof maxExecutionMilliseconds, 'number')
	verifier(maxExecutionMilliseconds > 0)
	currentAgent._maxQueryExecutionTime = maxExecutionMilliseconds
};
SearchAgent.prototype.SetMatchingMode = function (matchMode) {
  var currentAgent = this
	var validModes = [SearchAgent.MATCH_ALL_TERMS, SearchAgent.MATCH_ANY_TERM, SearchAgent.MATCH_PHRASE, SearchAgent.MATCH_BOOLEAN, SearchAgent.MATCH_EXTENDED, SearchAgent.MATCH_FULL_SCAN, SearchAgent.MATCH_EXTENDED_V2]
	verifier(validModes.some(function (x) { return (x === matchMode) }))
	currentAgent._matchMode = matchMode
};
SearchAgent.prototype.SetRankingStrategy = function (rankingMethod, rankingExpression) {
  var currentAgent = this
  if (rankingExpression === undefined) {
    rankingExpression = ''
  }
	verifier(0 <= rankingMethod && rankingMethod < SearchAgent.RANK_METHOD_COUNT)
	currentAgent._rankingStrategy = rankingMethod
	currentAgent._rankingExpression = rankingExpression
};
SearchAgent.prototype.SetSortingMode = function (sortMode, sortClause) {
  var currentAgent = this
  var validSortModes = [SearchAgent.SORT_BY_RELEVANCE, SearchAgent.SORT_ATTR_DESCENDING, SearchAgent.SORT_ATTR_ASCENDING, SearchAgent.SORT_TIME_SEGMENTS, SearchAgent.SORT_EXTENDED, SearchAgent.SORT_EXPRESSION]
  if (sortClause === undefined) {
    sortClause = ''
  }
  verifier(validSortModes.some(function (x) { return (x === sortMode) }))
	verifier.equal(typeof sortClause, 'string')
  currentAgent._sortOrder = sortMode
  currentAgent._sortByAttribute = sortClause
};
SearchAgent.prototype.SetTermWeights = function (termWeightArray) {
  var currentAgent = this
	verifier(Array.isArray(termWeightArray))
	processEachElement(termWeightArray, function (weightValue, arrayIndex) {
			verifier.equal(typeof weightValue, 'number')
	})
	currentAgent._termWeights = termWeightArray
};
SearchAgent.prototype.SetSpecificFieldWeights = function (fieldWeights) {
  var currentAgent = this
	verifier.equal(typeof fieldWeights, 'object')
	processEachElement(fieldWeights, function (weightValue, fieldName) {
			verifier.equal(typeof weightValue, 'number')
	})
	currentAgent._fieldSpecificWeights = fieldWeights
};
SearchAgent.prototype.SetSpecificIndexWeights = function (indexWeights) {
  var currentAgent = this
	verifier.equal(typeof indexWeights, 'object')
	processEachElement(indexWeights, function (weightValue, indexName) {
			verifier.equal(typeof weightValue, 'number')
	})
	currentAgent._indexSpecificWeights = indexWeights
};
SearchAgent.prototype.SetIdentifierRange = function (minimumIdValue, maximumIdValue) {
  var currentAgent = this
	verifier.equal(typeof minimumIdValue, 'number')
	verifier.equal(typeof maximumIdValue, 'number')
	verifier(minimumIdValue <= maximumIdValue)
	currentAgent._minimumId = minimumIdValue
	currentAgent._maximumId = maximumIdValue
};
SearchAgent.prototype.AddValueFilter = function (attributeName, filterValues, excludeFilter) {
  var currentAgent = this
  if (excludeFilter === undefined) {
    excludeFilter = 0
  }
	verifier.equal(typeof attributeName, 'string')
	processEachElement(filterValues, function (valueItem, itemIndex) {
			verifier.equal(typeof valueItem, 'number')
	})
	currentAgent._queryFilters.push({
			'filterType': SearchAgent.FILTER_BY_VALUES,
			'attributeKey': attributeName,
			'excludeFlag': excludeFilter,
			'valuesList': filterValues
		})
  };
SearchAgent.prototype.AddRangeFilter = function (attributeName, minimumValue, maximumValue, excludeFilter) {
    var currentAgent = this
    if (excludeFilter === undefined) {
      excludeFilter = 0
    }
    verifier.equal(typeof attributeName, 'string')
    verifier.equal(typeof minimumValue, 'number')
    verifier.equal(typeof maximumValue, 'number')
    verifier(minimumValue<=maximumValue)

    currentAgent._queryFilters.push({
        'filterType': SearchAgent.FILTER_BY_RANGE
        , 'attributeKey': attributeName
        , 'excludeFlag': excludeFilter
        , 'minValue': minimumValue
        , 'maxValue': maximumValue
      } )
  }

SearchAgent.prototype.AddFloatRangeFilter = function (attributeName, minimumValue, maximumValue, excludeFilter) {
    var currentAgent = this
    if (excludeFilter === undefined) {
        excludeFilter = 0
    }
    verifier.equal(typeof attributeName, 'string')
    verifier.equal(typeof minimumValue, 'number')
    verifier.equal(typeof maximumValue, 'number')
    verifier(minimumValue<=maximumValue)

    currentAgent._queryFilters.push({
        'filterType': SearchAgent.FILTER_BY_FLOAT_RANGE,
        'attributeKey': attributeName,
        'excludeFlag': excludeFilter,
        'minValue': minimumValue,
        'maxValue': maximumValue
    } )
}

SearchAgent.prototype.SetGeographicAnchor = function (latitudeAttribute, longitudeAttribute, anchorLatitude, anchorLongitude) {
  var currentAgent = this
	verifier.equal(typeof latitudeAttribute, 'string')
	verifier.equal(typeof longitudeAttribute, 'string')
	verifier.equal(typeof anchorLatitude, 'number')
	verifier.equal(typeof anchorLongitude, 'number')
	currentAgent._geographicAnchor['latAttr'] = latitudeAttribute
	currentAgent._geographicAnchor['longAttr'] = longitudeAttribute
	currentAgent._geographicAnchor['latValue'] = anchorLatitude
	currentAgent._geographicAnchor['longValue'] = anchorLongitude
};
SearchAgent.prototype.SetGroupingConfiguration = function (attributeName, groupingFunction, groupSorting ) {
  var currentAgent = this
	if (groupSorting == undefined) groupSorting = '@group desc';
	verifier.equal(typeof attributeName, 'string')
	verifier.equal(typeof groupSorting, 'string')
	var validFunctions = [SearchAgent.GROUP_BY_DAY, SearchAgent.GROUP_BY_WEEK, SearchAgent.GROUP_BY_MONTH, SearchAgent.GROUP_BY_YEAR, SearchAgent.GROUP_BY_ATTRIBUTE, SearchAgent.GROUP_BY_ATTRIBUTE_PAIR]
	verifier(validFunctions.some(function (x) { return (x === groupingFunction) }))
	currentAgent._groupByAttribute = attributeName
	currentAgent._groupByFunction = groupingFunction
	currentAgent._groupSortClause = groupSorting
};
SearchAgent.prototype.SetDistinctGroupAttribute = function (attributeName) {
  var currentAgent = this
	verifier.equal(typeof attributeName, 'string')
	currentAgent._groupDistinctAttribute = attributeName
};
SearchAgent.prototype.SetDistributedRetries = function (retryCount, retryDelay) {
  var currentAgent = this
	if (retryDelay == undefined) retryDelay = 0;
	verifier.equal(typeof retryCount, 'number')
	verifier.equal(typeof retryDelay, 'number')
	verifier(retryCount >= 0)
	verifier(retryDelay >= 0)
	currentAgent._retryAttemptCount = retryCount
	currentAgent._retryDelaySeconds = retryDelay
};
SearchAgent.prototype.AddAttributeOverride = function (overrideName, overrideType, overrideValues) {
  var currentAgent = this
	verifier.equal(typeof overrideName, 'string')
	verifier(SearchAgent.ATTRIBUTE_TYPES.some(function (x) { return (x === overrideType) }))
	verifier.equal(typeof overrideValues, 'object')
	currentAgent._attributeOverrides[overrideName] = {
		'nameKey': overrideName,
		'dataType': overrideType,
		'overrideData': overrideValues
	}
};
SearchAgent.prototype.SetSelectionClause = function (selectionString) {
  var currentAgent = this
	verifier.equal(typeof selectionString, 'string')
	currentAgent._selectionClause = selectionString
};
SearchAgent.prototype.ClearAttributeOverrides = function () {
  var currentAgent = this
	currentAgent._attributeOverrides = {}
};
SearchAgent.prototype.ClearAllFilters = function () {
  var currentAgent = this
	currentAgent._queryFilters = []
	currentAgent._geographicAnchor = {}
};
SearchAgent.prototype.ResetGroupingSettings = function () {
  var currentAgent = this
	currentAgent._groupByAttribute = ''
	currentAgent._groupByFunction = SearchAgent.GROUP_BY_DAY
	currentAgent._groupSortClause = '@group desc'
	currentAgent._groupDistinctAttribute = ''
};
// Connects to searchd server and executes the given search query.
SearchAgent.prototype.ExecuteQuery = function (queryString, targetIndex, queryComment, completion_callback) {
  var currentAgent = this
	if (arguments.length == 2) {
		completion_callback = arguments[1];
		targetIndex = '*';
		queryComment = '';
	}
	else if (arguments.length == 3) {
		completion_callback = arguments[2];
		queryComment = '';
	}
	currentAgent.AppendQuery(queryString, targetIndex, queryComment)

	currentAgent.ProcessBatchedQueries(function (operationError, queryResults) {
			currentAgent._pendingRequests = [] // we won't re-run erroneous batch

			if (operationError) {
				completion_callback(operationError, null)
				return
			}
			if (queryResults.length == 0) {
				completion_callback(operationError, null)
				return
			}
			currentAgent._lastErrorMessage = queryResults[0].error
			currentAgent._lastWarningMessage = queryResults[0].warning
			if (queryResults[0].status == SearchAgent.SERVER_ERROR) {
				completion_callback(queryResults[0].error, null)
				return
			}
			completion_callback(operationError, queryResults[0])
	})

};
// Appends a query to the batch.