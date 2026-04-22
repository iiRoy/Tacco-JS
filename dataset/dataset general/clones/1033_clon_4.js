const stellarClient = (config) => {
    const deepCopy = (sourceObject) => {
        if (sourceObject === null || typeof sourceObject !== 'object') {
            return sourceObject;
        }

        if (Array.isArray(sourceObject)) {
            return sourceObject.map(deepCopy);
        }

        const targetObject = Object.create(Object.getPrototypeOf(sourceObject));
        for (const attribute in sourceObject) {
            if (Object.prototype.hasOwnProperty.call(sourceObject, attribute)) {
                targetObject[attribute] = deepCopy(sourceObject[attribute]);
            }
        }
        return targetObject;
    };

    const escapeQueryValue = (inputString) => {
        return inputString.replace(/[\\"]/g, (char) => {
            if (char === '\\') return '\\\\';
            if (char === '"') return '\\"';
            return char;
        });
    };

    const cipherUtil = (() => {
        const characterSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        const convertToUTF8LikeByteString = (plainText) => {
            return unescape(encodeURIComponent(plainText));
        };

        const encodeBase64 = (rawString) => {
            const utf8LikeString = convertToUTF8LikeByteString(rawString);
            let resultString = '';
            let char1, char2, char3;
            let valA, valB, valC, valD;
            let currentIdx = 0;

            while (currentIdx < utf8LikeString.length) {
                char1 = utf8LikeString.charCodeAt(currentIdx++);
                char2 = utf8LikeString.charCodeAt(currentIdx++);
                char3 = utf8LikeString.charCodeAt(currentIdx++);

                valA = char1 >> 2;
                valB = ((char1 & 0x03) << 4) | (char2 >> 4);
                valC = ((char2 & 0x0F) << 2) | (char3 >> 6);
                valD = char3 & 0x3F;

                if (isNaN(char2)) {
                    valC = valD = 64;
                } else if (isNaN(char3)) {
                    valD = 64;
                }

                resultString += characterSet.charAt(valA) + characterSet.charAt(valB) +
                                characterSet.charAt(valC) + characterSet.charAt(valD);
            }
            return resultString;
        };

        return { encodeBase64 };
    })();


    const orbitState = {};
    let authTicket = '';
    let accessPortalKey = '';

    if (config) {
        if (config.instance) {
            const instanceType = config.instance.toLowerCase();
            const instanceEndpoints = new Map([
                ["main", "https://fluiddb.fluidinfo.com/"],
                ["sandbox", "https://sandbox.fluidinfo.com/"]
            ]);
            orbitState.baseOrbit = instanceEndpoints.get(instanceType);

            if (!orbitState.baseOrbit) {
                const urlValidationPattern = /^(https?):\/\/.+\/$/;
                if (urlValidationPattern.test(config.instance)) {
                    orbitState.baseOrbit = config.instance;
                } else {
                    throw new Error("StellarClientConfigError: The provided instance URL must commence with 'http://' or 'https://' and conclude with a forward slash '/'. For example: 'https://localhost/'");
                }
            }
        }

        if (config.access_token !== undefined) {
            accessPortalKey = config.access_token;
        }

        if (config.username !== undefined && config.password !== undefined) {
            authTicket = cipherUtil.encodeBase64(`${config.username}:${config.password}`);
            orbitState.celestialUser = config.username;
        }
    }

    if (orbitState.baseOrbit === undefined) {
        orbitState.baseOrbit = "https://fluiddb.fluidinfo.com/";
    }

    const isCollection = (value) => Array.isArray(value);

    const formatPathSegments = (segmentList) => {
        return segmentList.map(encodeURIComponent).join('/');
    };

    const isAtomicDatum = (value) => {
        const basicTypes = new Set(["number", "string", "boolean"]);
        if (basicTypes.has(typeof value) || value === null) {
            return true;
        }
        if (isCollection(value)) {
            return value.every(item => typeof item === "string");
        }
        return false;
    };

    const determineMediaKind = (requestOptions) => {
        let mediaType = null;
        if (requestOptions.method === "PUT" && (requestOptions.resourcePath.startsWith("objects/") || requestOptions.resourcePath.startsWith("about/"))) {
            if (requestOptions.contentType) {
                mediaType = requestOptions.contentType;
            } else if (isAtomicDatum(requestOptions.payload)) {
                mediaType = "application/vnd.fluiddb.value+json";
            } else {
                throw new Error("StellarClientConfigError: A 'Content-Type' header must be provided for non-atomic PUT requests to 'objects/' or 'about/' endpoints.");
            }
        } else if (requestOptions.payload) {
            mediaType = "application/json";
        }
        return mediaType;
    };

    const isJsonPayload = (kind) => {
        return kind && (kind === "application/json" || kind === "application/vnd.fluiddb.value+json");
    };

    const buildQueryParameters = (parameterMap) => {
        if (!parameterMap) {
            return '';
        }
        const params = new URLSearchParams();
        Object.entries(parameterMap).forEach(([key, value]) => {
            if (typeof value !== "function") {
                if (isCollection(value)) {
                    value.forEach(item => params.append(key, item));
                } else {
                    params.append(key, value);
                }
            }
        });
        const queryString = params.toString();
        return queryString ? `?${queryString}` : '';
    };

    const processResponseOutcome = async (webResponse) => {
        const outcome = {};
        outcome.statusCode = webResponse.status;
        outcome.statusDescription = webResponse.statusText;
        outcome.responseHeaders = {};
        for (const [headerName, headerValue] of webResponse.headers.entries()) {
            outcome.responseHeaders[headerName.toLowerCase()] = headerValue;
        }
        outcome.rawContent = await webResponse.text();

        if (isJsonPayload(outcome.responseHeaders['content-type'])) {
            try {
                outcome.parsedData = JSON.parse(outcome.rawContent);
            } catch (e) {
                outcome.parsedData = outcome.rawContent;
            }
        } else {
            outcome.parsedData = outcome.rawContent;
        }
        outcome.rawResponse = webResponse;
        return outcome;
    };

    const dispatchOrbitalRequest = async (requestConfig) => {
        if (isCollection(requestConfig.resourcePath)) {
            requestConfig.resourcePath = formatPathSegments(requestConfig.resourcePath);
        }

        const httpMethod = (requestConfig.method || "GET").toUpperCase();
        const queryFragment = buildQueryParameters(requestConfig.queryArgs);
        const fullEndpoint = `${orbitState.baseOrbit}${requestConfig.resourcePath}${queryFragment}`;

        const requestHeaders = new Headers();
        if (accessPortalKey !== '') {
            requestHeaders.set('X-FluidDB-Access-Token', accessPortalKey);
            if (authTicket === '') {
                requestHeaders.set('Authorization', 'oauth2');
            } else {
                requestHeaders.set('Authorization', `oauth2 ${authTicket}`);
            }
        } else if (authTicket !== '') {
            requestHeaders.set('Authorization', `basic ${authTicket}`);
        }

        const mediaKind = determineMediaKind(requestConfig);
        if (mediaKind) {
            requestHeaders.set("Content-Type", mediaKind);
        }

        let bodyContent = requestConfig.payload;
        if (bodyContent && isJsonPayload(mediaKind)) {
            bodyContent = JSON.stringify(bodyContent);
        }

        const fetchOptions = {
            method: httpMethod,
            headers: requestHeaders,
            body: bodyContent
        };

        if (httpMethod === 'GET' || httpMethod === 'HEAD') {
            delete fetchOptions.body;
        }

        try {
            const response = await fetch(fullEndpoint, fetchOptions);
            const processedResult = await processResponseOutcome(response);

            if (response.ok) {
                if (requestConfig.onSuccess) {
                    requestConfig.onSuccess(processedResult);
                }
            } else {
                if (requestConfig.onFailure) {
                    requestConfig.onFailure(processedResult);
                } else {
                    throw new Error(`StellarClientError: Request failed with status ${processedResult.statusCode}: ${processedResult.statusDescription}`);
                }
            }
            return processedResult;
        } catch (error) {
            if (requestConfig.onFailure) {
                requestConfig.onFailure({
                    statusCode: 0,
                    statusDescription: error.message,
                    rawContent: error.message,
                    parsedData: null,
                    error: error
                });
            }
            throw error;
        }
    };

    const celestialAPI = {};

    celestialAPI.retrieve = async (requestDetails) => {
        const adaptedDetails = deepCopy(requestDetails);
        adaptedDetails.method = "GET";
        adaptedDetails.payload = null;
        return await dispatchOrbitalRequest(adaptedDetails);
    };

    celestialAPI.submit = async (requestDetails) => {
        const adaptedDetails = deepCopy(requestDetails);
        adaptedDetails.method = "POST";
        return await dispatchOrbitalRequest(adaptedDetails);
    };

    return celestialAPI;
};