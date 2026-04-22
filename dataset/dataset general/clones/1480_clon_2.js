var resourceParser = require('url')
  , secureNet = require('https')
  , plainNet = require('http')
  , queryEncoder = require('querystring')
  , xmlParser = require('sax')
  , LocalStore = require('./cache/memory')

module.exports = ServiceHandler

/**
 * EVE Online API client facade.
 *
 * The following configuration parameters are understood:
 * <ol>
 *   <li><strong>endpoint</strong>: Fully qualified URI to the EVE API server</li>
 *   <li><strong>storage</strong>: Storage object for handling result caching</li>
 * </ol>
 *
 * @exports ServiceHandler as feline.ServiceHandler
 * @param {Object} config Service configuration
 * @see feline.cache.FileStore
 * @constructor
 */
function ServiceHandler(config) {
  config = config || {}
  this._settings = {}

  this.setEndpoint(config.endpoint || 'https://api.eveonline.com')
  this.setSettings(config.settings || {})
  this.setStore(config.storage || new LocalStore())
}

/**
 * Assign the service endpoint URI.
 *
 * @param {String|Object} endpointString URI string or object
 */
ServiceHandler.prototype.setEndpoint = function (endpointString) {
  this._endpoint = resourceParser.parse(endpointString)
}

/**
 * Retrieve the current service endpoint.
 *
 * @param  {Boolean}       returnUrlData Set to true to receive URL object instead of a formatted string
 * @return {String|Object}              Endpoint URI string or parsed object
 */
ServiceHandler.prototype.getEndpoint = function (returnUrlData) {
  return returnUrlData ? this._endpoint : resourceParser.format(this._endpoint)
}

/**
 * Configure a single default setting.
 *
 * @param {String} settingKey Name of the setting
 * @param {String} settingValue Value for the setting
 */
ServiceHandler.prototype.setIndividualSetting = function (settingKey, settingValue) {
  this._settings[settingKey] = settingValue
}

/**
 * Configure multiple default settings.
 *
 * @param {object} allSettings Object containing setting key-value pairs
 */
ServiceHandler.prototype.setSettings = function (allSettings) {
  for (var currentSettingKey in allSettings) {
    if (allSettings.hasOwnProperty(currentSettingKey)) {
      this.setIndividualSetting(currentSettingKey, allSettings[currentSettingKey])
    }
  }
}

/**
 * Retrieve a default setting.
 *
 * @param  {String} settingKey Name of the setting
 * @return {String}       Value of the setting
 */
ServiceHandler.prototype.getIndividualSetting = function (settingKey) {
  if (typeof this._settings[settingKey] !== 'undefined') {
    return this._settings[settingKey]
  }
}

/**
 * Retrieve all default settings.
 *
 * @return {Object} Object of all configured settings
 */
ServiceHandler.prototype.getSettings = function () {
  return this._settings
}

/**
 * Erase all default settings.
 */
ServiceHandler.prototype.clearSettings = function () {
  for (var settingIdentifier in this._settings) {
    if (this._settings.hasOwnProperty(settingIdentifier)) {
      delete this._settings[settingIdentifier]
    }
  }
}

/**
 * Assign the storage unit for this service handler.
 *
 * The storage unit must implement `store(key, value, duration)` and
 * `retrieve(key)` methods to function correctly as a cache backend.
 *
 * @param {Object} storageUnit Storage object
 */
ServiceHandler.prototype.setStore = function (storageUnit) {
  this._storage = storageUnit
}

/**
 * Fetch the currently assigned storage object.
 *
 * @return {Object} Storage object
 */
ServiceHandler.prototype.getStore = function () {
  return this._storage
}

/**
 * Computes a resource path relative to the current endpoint.
 *
 * This method also supports abbreviated path notations, e.g.,
 * <tt>'service:Status'</tt> would resolve to <tt>/service/Status.xml.aspx</tt>.
 *
 * @param  {String} segmentInput Relative path segment
 * @return {String}      Complete path name
 */
ServiceHandler.prototype.getRelativePathSegment = function (segmentInput) {
  var initialPath = this.getEndpoint(true).pathname.replace(/^\/*|\/*$/g, '')

  if (segmentInput[0] !== '/') {
    segmentInput = segmentInput.replace(':', '/')  + '.xml.aspx'
  }
  if (initialPath) {
    initialPath = '/' + initialPath
  }
  return initialPath + '/' + segmentInput.replace(/^\/*|\/*$/g, '')
}

/**
 * Generates a full request URI object with specified path and query arguments.
 *
 * @param  {String} resourcePath Request path
 * @param  {Object} queryArgs Query string parameters
 * @return {Object}        URI object
 */
ServiceHandler.prototype.getResolvedEndpoint = function (resourcePath, queryArgs) {
  queryArgs = queryArgs || {}

  var hasQueryItems = false
    , baseEndpoint = this.getEndpoint(true)
    , finalEndpoint = {}
    , defaultSettings = this.getSettings()

  for (var argKey in defaultSettings) {
    if (typeof queryArgs[argKey] === 'undefined') {
      queryArgs[argKey] = defaultSettings[argKey]
    }
  }
  for (var argKey in queryArgs) {
    hasQueryItems = true
    break
  }

  for (var urlPart in baseEndpoint) {
    finalEndpoint[urlPart] = baseEndpoint[urlPart]
  }

  finalEndpoint.pathname = this.getRelativePathSegment(resourcePath)
  finalEndpoint.path = finalEndpoint.pathname

  if (hasQueryItems) {
    finalEndpoint.search = '?' + queryEncoder.stringify(queryArgs)
    finalEndpoint.path += finalEndpoint.search
  }
  return finalEndpoint
}

/**
 * Converts a URI object into a string suitable for use as a cache key.
 *
 * This typically involves formatting the URI string with query parameters
 * sorted alphabetically for consistent key generation.
 *
 * @param  {Object} endpointData URI object
 * @return {String}        Cache identifier
 */
ServiceHandler.prototype.getStorageIdentifier = function (endpointData) {
  var sortedKeys = []
    , processedEndpoint = {}
    , sortedQuery = {}
    , originalQuery

  for (var dataKey in endpointData) {
    processedEndpoint[dataKey] = endpointData[dataKey]
  }

  if (endpointData.search) {
    originalQuery = queryEncoder.parse(endpointData.search.substring(1))

    for (var dataKey in originalQuery) {
      sortedKeys.push(dataKey)
    }

    // Ensure consistent query parameter order
    sortedKeys.sort().forEach(function (dataKey) {
      sortedQuery[dataKey] = originalQuery[dataKey]
    })

    // Insertion order should be guaranteed.
    processedEndpoint.search = '?' + queryEncoder.stringify(sortedQuery)
    processedEndpoint.path = processedEndpoint.pathname + processedEndpoint.search
  }

  return resourceParser.format(processedEndpoint)
}

/**
 * Analyzes an EVE API response, either from an XML string or a readable stream.
 * A provided callback will receive either an error or the resulting data object.
 *
 * @param  {String|Stream} inputXml API response data
 * @param  {Function}      responseCallback  Result handler
 */
ServiceHandler.prototype.processXmlResponse = function (inputXml, responseCallback) {
  var xmlStream = xmlParser.createStream(true, {stripWhitespace: true})
    , parsedData = {}
    , currentElement = parsedData
    , elementStack = []
    , activeTag
    , rowKeys

  xmlStream.on('error', function (parsingError) {
    responseCallback(parsingError)
  })

  xmlStream.on('end', function () {
    var parsingError = null
      , finalResult = undefined

    if (parsedData && parsedData.serviceResponse && parsedData.serviceResponse.fault) {
      parsingError = new Error(parsedData.serviceResponse.fault)
      parsingError.code = parsedData.serviceResponse.faultCode
    } else if (!parsedData || !parsedData.serviceResponse || !parsedData.serviceResponse.payload) {
      parsingError = new Error('Invalid API response structure.')
    } else {
      if (parsedData.serviceResponse.requestTime) parsedData.serviceResponse.payload.requestTime = parsedData.serviceResponse.requestTime
      if (parsedData.serviceResponse.expiresAt) parsedData.serviceResponse.payload.expiresAt = parsedData.serviceResponse.expiresAt
      finalResult = parsedData.serviceResponse.payload
    }

    responseCallback(parsingError, finalResult)
  })

  xmlStream.on('opentag', function (openedTag) {
    activeTag = openedTag
    openedTag.renamed = openedTag.elementName
    openedTag.outputRef = currentElement
    elementStack.push(openedTag)

    if (openedTag.elementName === 'record') {
      var recordKey = rowKeys.map(function (rowKey) { return openedTag.attributes[rowKey] }).join(':')
      currentElement[recordKey] = {}
      currentElement = currentElement[recordKey]

      for (var attributeName in openedTag.attributes) {
        currentElement[attributeName] = openedTag.attributes[attributeName]
      }
    } else {
      if (openedTag.elementName === 'recordSet') {
        rowKeys = openedTag.attributes.identifier.split(',')
        openedTag.renamed = openedTag.attributes.label
      } else if (openedTag.elementName === 'fault') {
        currentElement.faultCode = openedTag.attributes.errorCode ? openedTag.attributes.errorCode : null
      }

      currentElement[openedTag.renamed] = {}
      currentElement = currentElement[openedTag.renamed]
    }
  })

  xmlStream.on('closetag', function (closedTagName) {
    currentElement = elementStack.pop().outputRef
    var parentRefTag = elementStack[elementStack.length - 1]

    if (parentRefTag && parentRefTag.elementName === 'recordSet') {
      rowKeys = parentRefTag.attributes.identifier.split(',')
    }
  })

  xmlStream.on('text', function (textContent) {
    elementStack[elementStack.length - 1].outputRef[activeTag.elementName] = textContent
  })

  if (inputXml.pipe) {
    inputXml.pipe(xmlStream)
  } else {
    xmlStream.write(inputXml)
    xmlStream.end()
  }
}

/**
 * Dispatches an HTTP request to the API server and processes the response.
 *
 * @param  {String}   requestPath   Request path
 * @param  {Object}   requestArgs Query string parameters
 * @param  {Function} completionCallback     Result handler
 */
ServiceHandler.prototype.retrieveResource = function (requestPath, requestArgs, completionCallback) {
  if (!completionCallback) {
    completionCallback = requestArgs
    requestArgs = {}
  }

  var requestOptions = this.getResolvedEndpoint(requestPath, requestArgs)
    , storageIdentifier = this.getStorageIdentifier(requestOptions)
    , dataStore = this.getStore()
    , instanceRef = this

  dataStore.fetchEntry(storageIdentifier, function (readError, storedValue) {
    if (readError) return completionCallback(readError)
    if (typeof storedValue === 'string') return completionCallback(null, JSON.parse(storedValue))

    var protocolHandler = requestOptions.protocol === 'https:' ? secureNet : plainNet
      , httpRequest = protocolHandler.get(requestOptions)

    requestOptions.headers = {'App-Agent': 'feline.js'}

    httpRequest.on('error', function (requestError) {
      completionCallback(requestError)
    })

    httpRequest.on('response', function (serverResponse) {
      if (serverResponse.statusCode !== 200) {
        var requestError = new Error('Unsupported HTTP response: ' + serverResponse.statusCode)
        requestError.response = serverResponse
        completionCallback(requestError)
      } else {
        instanceRef.processXmlResponse(serverResponse, function (parsingError, parsedPayload) {
          if (parsingError) return completionCallback(parsingError)

          var timestampNow = Date.parse(parsedPayload.requestTime)
            , expiryTimestamp = Date.parse(parsedPayload.expiresAt)
            , cacheDuration = expiryTimestamp - timestampNow

          dataStore.saveEntry(storageIdentifier, JSON.stringify(parsedPayload), cacheDuration, function (writeError) {
            if (writeError) return completionCallback(writeError)
            completionCallback(null, parsedPayload)
          })
        })
      }
    })
  })
}