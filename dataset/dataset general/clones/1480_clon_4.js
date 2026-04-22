const secureProtocolAgent = require('https');
const plainProtocolAgent = require('http');
const { parseStringPromise } = require('xml2js');

const performNetworkRequest = (connectionOptions) => {
    return new Promise((completionCallback, faultHandler) => {
        const protocolAgent = connectionOptions.protocol === 'https:' ? secureProtocolAgent : plainProtocolAgent;
        const requestHandle = protocolAgent.get(connectionOptions, (serverResponse) => {
            if (serverResponse.statusCode < 200 || serverResponse.statusCode >= 300) {
                const operationFailure = new Error(`Network operation unsuccessful: ${serverResponse.statusCode}`);
                operationFailure.responseDetails = serverResponse;
                return faultHandler(operationFailure);
            }

            let receivedPayload = '';
            serverResponse.on('data', (dataChunk) => {
                receivedPayload += dataChunk;
            });
            serverResponse.on('end', () => {
                completionCallback(receivedPayload);
            });
        });

        requestHandle.on('error', (requestFailure) => {
            faultHandler(requestFailure);
        });

        requestHandle.end();
    });
};

class PromiseBasedMemoryStore {
    #dataContainer = new Map();

    async read(uniqueKey) {
        const storedEntry = this.#dataContainer.get(uniqueKey);
        if (storedEntry && storedEntry.expirationTime > Date.now()) {
            return storedEntry.payload;
        } else {
            this.#dataContainer.delete(uniqueKey);
            return null;
        }
    }

    async write(uniqueKey, contentPayload, validityDurationMilliseconds) {
        const expirationTime = Date.now() + validityDurationMilliseconds;
        this.#dataContainer.set(uniqueKey, { payload: contentPayload, expirationTime });
    }
}

class ApiServiceAdapter {
    #apiEndpoint;
    #defaultRequestParameters = new Map();
    #dataCachingUnit;

    constructor(configuration = {}) {
        this.setApiEndpoint(configuration.address || 'https://api.eveonline.com');
        this.setDefaultRequestParameters(configuration.initialParameters || {});
        this.setDataCachingUnit(configuration.cacheHandler || new PromiseBasedMemoryStore());
    }

    setApiEndpoint(endpointAddressString) {
        this.#apiEndpoint = new URL(endpointAddressString);
    }

    getApiEndpoint(returnAsUrlObject = false) {
        return returnAsUrlObject ? this.#apiEndpoint : this.#apiEndpoint.toString();
    }

    setIndividualParameter(parameterKey, parameterValue) {
        this.#defaultRequestParameters.set(parameterKey, parameterValue);
    }

    setDefaultRequestParameters(parameterObject) {
        for (const [key, value] of Object.entries(parameterObject)) {
            this.setIndividualParameter(key, value);
        }
    }

    getIndividualParameter(parameterKey) {
        return this.#defaultRequestParameters.get(parameterKey);
    }

    getAllDefaultParameters() {
        return Object.fromEntries(this.#defaultRequestParameters);
    }

    clearAllParameters() {
        this.#defaultRequestParameters.clear();
    }

    setDataCachingUnit(cacheImplementation) {
        this.#dataCachingUnit = cacheImplementation;
    }

    getDataCachingUnit() {
        return this.#dataCachingUnit;
    }

    deriveResourcePath(relativePath) {
        let baseSegment = this.getApiEndpoint(true).pathname.replace(/^\/*|\/*$/g, '');

        if (!relativePath.startsWith('/')) {
            relativePath = relativePath.replace(':', '/') + '.xml.aspx';
        }
        if (baseSegment) {
            baseSegment = '/' + baseSegment;
        }
        return baseSegment + '/' + relativePath.replace(/^\/*|\/*$/g, '');
    }

    assembleRequestUrl(resourceIdentifier, specificParameters = {}) {
        const baseAddress = this.getApiEndpoint(true);
        const requestTargetUrl = new URL(baseAddress.toString());

        for (const [key, value] of this.#defaultRequestParameters.entries()) {
            requestTargetUrl.searchParams.set(key, value);
        }

        for (const [key, value] of Object.entries(specificParameters)) {
            requestTargetUrl.searchParams.set(key, value);
        }

        requestTargetUrl.pathname = this.deriveResourcePath(resourceIdentifier);
        return requestTargetUrl;
    }

    generateCacheKey(urlObjectForCaching) {
        const normalizedUrl = new URL(urlObjectForCaching.toString());
        const queryParameters = normalizedUrl.searchParams;

        const sortedKeys = Array.from(queryParameters.keys()).sort();
        const sortedSearchParams = new URLSearchParams();
        for (const key of sortedKeys) {
            for (const value of queryParameters.getAll(key)) {
                sortedSearchParams.append(key, value);
            }
        }
        normalizedUrl.search = sortedSearchParams.toString();
        return normalizedUrl.toString();
    }

    async parseApiResponse(rawXmlData) {
        let parsedXmlRepresentation;
        try {
            parsedXmlRepresentation = await parseStringPromise(rawXmlData, {
                explicitArray: false,
                mergeAttrs: true,
                trim: true
            });
        } catch (parsingError) {
            throw new Error(`Failed to interpret XML: ${parsingError.message}`);
        }

        if (!parsedXmlRepresentation || !parsedXmlRepresentation.eveapi) {
            throw new Error('Malformed API response: missing primary eveapi tag.');
        }

        const apiResponseRoot = parsedXmlRepresentation.eveapi;

        if (apiResponseRoot.error) {
            const apiFault = new Error(apiResponseRoot.error._ || apiResponseRoot.error);
            apiFault.code = apiResponseRoot.error.code;
            throw apiFault;
        }

        if (!apiResponseRoot.result) {
            throw new Error('Malformed API response: missing result section.');
        }

        const restructureRowset = (xml2jsRowset) => {
            if (!xml2jsRowset || !xml2jsRowset.row) return xml2jsRowset;

            const indexingKeys = xml2jsRowset.key.split(',');
            const keyedRowsCollection = {};

            const rowsAsArray = Array.isArray(xml2jsRowset.row) ? xml2jsRowset.row : [xml2jsRowset.row];

            for (const rowEntry of rowsAsArray) {
                const entryIdentifier = indexingKeys.map(k => rowEntry[k]).join(':');
                keyedRowsCollection[entryIdentifier] = rowEntry;
            }
            return keyedRowsCollection;
        };

        const recursivelyProcessResult = (currentObjectElement) => {
            if (typeof currentObjectElement !== 'object' || currentObjectElement === null) {
                return currentObjectElement;
            }

            for (const propertyName in currentObjectElement) {
                if (Object.prototype.hasOwnProperty.call(currentObjectElement, propertyName)) {
                    if (propertyName === 'rowset') {
                        if (Array.isArray(currentObjectElement[propertyName])) {
                            currentObjectElement[propertyName] = currentObjectElement[propertyName].map(restructureRowset);
                        } else {
                            currentObjectElement[propertyName] = restructureRowset(currentObjectElement[propertyName]);
                        }

                        if (currentObjectElement[propertyName] && currentObjectElement[propertyName].name) {
                            currentObjectElement[currentObjectElement[propertyName].name] = currentObjectElement[propertyName];
                            delete currentObjectElement[propertyName];
                        }
                    } else if (typeof currentObjectElement[propertyName] === 'object' && currentObjectElement[propertyName] !== null) {
                        recursivelyProcessResult(currentObjectElement[propertyName]);
                    }
                }
            }
            return currentObjectElement;
        };

        const finalProcessedData = recursivelyProcessResult(apiResponseRoot.result);

        if (apiResponseRoot.currentTime) finalProcessedData.currentTime = apiResponseRoot.currentTime;
        if (apiResponseRoot.cachedUntil) finalProcessedData.cachedUntil = apiResponseRoot.cachedUntil;

        return finalProcessedData;
    }

    async requestApiData(resourcePath, requestParameters = {}) {
        const fullRequestUrl = this.assembleRequestUrl(resourcePath, requestParameters);
        const cacheKey = this.generateCacheKey(fullRequestUrl);
        const cacheHandler = this.getDataCachingUnit();

        let cachedContent;
        try {
            cachedContent = await cacheHandler.read(cacheKey);
        } catch (cacheReadError) {
            // Errors during cache read are typically non-fatal for the overall request.
        }

        if (typeof cachedContent === 'string') {
            try {
                return JSON.parse(cachedContent);
            } catch (jsonParseError) {
                // Failed to parse cached JSON, proceed to fetch live data.
            }
        }

        const networkRequestOptions = {
            protocol: fullRequestUrl.protocol,
            hostname: fullRequestUrl.hostname,
            port: fullRequestUrl.port,
            path: fullRequestUrl.pathname + fullRequestUrl.search,
            headers: { 'User-Agent': 'api-service-adapter-js' }
        };

        let rawApiResponse;
        try {
            rawApiResponse = await performNetworkRequest(networkRequestOptions);
        } catch (networkError) {
            throw networkError;
        }

        const processedApiResponse = await this.parseApiResponse(rawApiResponse);

        const currentMoment = Date.parse(processedApiResponse.currentTime);
        const cacheExpiresAt = Date.parse(processedApiResponse.cachedUntil);
        const cacheValidityDuration = cacheExpiresAt - currentMoment;

        if (cacheValidityDuration > 0) {
            try {
                await cacheHandler.write(cacheKey, JSON.stringify(processedApiResponse), cacheValidityDuration);
            } catch (cacheWriteError) {
                // Errors during cache write are typically non-fatal for the overall request.
            }
        }

        return processedApiResponse;
    }
}

module.exports = ApiServiceAdapter;