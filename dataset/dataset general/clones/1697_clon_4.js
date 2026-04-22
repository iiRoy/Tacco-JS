(function() {

    let timeOffsetMilliseconds = 0;

    const transferProperties = (targetObject, sourceObject) => {
        if (targetObject && sourceObject) {
            Object.keys(sourceObject).forEach(key => {
                targetObject[key] = sourceObject[key];
            });
        }
        return targetObject;
    };

    const encodeDataComponent = (inputItem) => {
        if (inputItem === null || typeof inputItem === 'undefined') {
            return "";
        }
        if (Array.isArray(inputItem)) {
            return inputItem.map(encodeDataComponent).join('&');
        }

        let encoded = encodeURIComponent(String(inputItem));
        encoded = encoded.replace(/!/g, "%21");
        encoded = encoded.replace(/\*/g, "%2A");
        encoded = encoded.replace(/'/g, "%27");
        encoded = encoded.replace(/\(/g, "%28");
        encoded = encoded.replace(/\)/g, "%29");
        return encoded;
    };

    const decodeDataComponent = (encodedString) => {
        if (encodedString === null || typeof encodedString === 'undefined') {
            return null;
        }
        return decodeURIComponent(String(encodedString).replace(/\+/g, " "));
    };

    const extractKeyValuePairs = (formData) => {
        return String(formData).split('&').filter(Boolean).map(segment => {
            const eqIndex = segment.indexOf('=');
            if (eqIndex < 0) {
                return [decodeDataComponent(segment), null];
            } else {
                return [
                    decodeDataComponent(segment.substring(0, eqIndex)),
                    decodeDataComponent(segment.substring(eqIndex + 1))
                ];
            }
        });
    };

    const obtainParameterTuples = (params) => {
        if (params === null || typeof params === 'undefined') {
            return [];
        }
        if (Array.isArray(params)) {
            return params;
        }
        if (typeof params !== 'object') {
            return extractKeyValuePairs(params);
        }
        return Object.keys(params).map(key => [key, params[key]]);
    };

    const obtainParameterObject = (params) => {
        if (params === null || typeof params === 'undefined') {
            return {};
        }
        if (typeof params !== 'object') {
            return obtainParameterObject(extractKeyValuePairs(params));
        }
        if (Array.isArray(params)) {
            return params.reduce((acc, current) => {
                const paramName = current[0];
                if (typeof acc[paramName] === 'undefined') {
                    acc[paramName] = String(current[1]);
                }
                return acc;
            }, {});
        }
        return params;
    };

    const fetchSingleParameter = (paramCollection, paramKey) => {
        if (Array.isArray(paramCollection)) {
            for (let i = 0; i < paramCollection.length; ++i) {
                if (paramCollection[i][0] === paramKey) {
                    return paramCollection[i][1];
                }
            }
        } else {
            return obtainParameterObject(paramCollection)[paramKey];
        }
        return null;
    };

    const createUrlEncodedString = (params) => {
        return obtainParameterTuples(params)
            .filter(tuple => tuple[0] !== null)
            .map(tuple => {
                const val = tuple[1] === null ? "" : tuple[1];
                return `${encodeDataComponent(tuple[0])}=${encodeDataComponent(val)}`;
            })
            .join('&');
    };

    const updateMessageParameter = (messageObject, paramName, paramValue) => {
        let currentParams = messageObject.parameters;

        if (Array.isArray(currentParams)) {
            let newParams = [];
            let found = false;
            for (let i = 0; i < currentParams.length; ++i) {
                if (currentParams[i][0] === paramName) {
                    if (typeof paramValue !== 'undefined') {
                        newParams.push([paramName, paramValue]);
                        found = true;
                    }
                } else {
                    newParams.push(currentParams[i]);
                }
            }
            if (!found && typeof paramValue !== 'undefined') {
                newParams.push([paramName, paramValue]);
            }
            messageObject.parameters = newParams;
        } else {
            let paramMap = obtainParameterObject(currentParams);
            if (typeof paramValue === 'undefined') {
                delete paramMap[paramName];
            } else {
                paramMap[paramName] = paramValue;
            }
            messageObject.parameters = paramMap;
        }
    };

    const applyMultipleParameters = (messageObject, newParams) => {
        obtainParameterTuples(newParams).forEach(tuple => {
            updateMessageParameter(messageObject, tuple[0], tuple[1]);
        });
    };

    const generateCurrentTimestamp = () => {
        const adjustedTime = new Date().getTime() + timeOffsetMilliseconds;
        return Math.floor(adjustedTime / 1000).toFixed(0);
    };

    const generateRandomString = (len) => {
        const possibleChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        return Array.from({ length: len }).map(() => {
            const randomIndex = Math.floor(Math.random() * possibleChars.length);
            return possibleChars[randomIndex];
        }).join('');
    };

    const adjustTimeBase = (newTimestampSeconds) => {
        timeOffsetMilliseconds = (newTimestampSeconds * 1000) - new Date().getTime();
    };

    const syncTimeFromScriptSource = (timeParamName) => {
        timeParamName = timeParamName || "oauth_timestamp";
        if (typeof document === 'undefined' || !document.getElementsByTagName) return;

        const scripts = Array.from(document.getElementsByTagName('script'));
        if (scripts.length === 0) return;

        const lastScriptSrc = scripts[scripts.length - 1].src;
        if (!lastScriptSrc) return;

        const queryPos = lastScriptSrc.indexOf("?");
        if (queryPos < 0) return;

        const queryParams = obtainParameterObject(extractKeyValuePairs(lastScriptSrc.substring(queryPos + 1)));
        const timestampValue = queryParams[timeParamName];
        if (timestampValue === null || typeof timestampValue === 'undefined') return;

        adjustTimeBase(Number(timestampValue));
    };

    const augmentUrlWithParameters = (originalUrl, additionalParams) => {
        if (additionalParams === null || typeof additionalParams === 'undefined') {
            return originalUrl;
        }
        const encodedParams = createUrlEncodedString(additionalParams);
        if (encodedParams.length === 0) {
            return originalUrl;
        }
        const hasQuery = originalUrl.indexOf('?') >= 0;
        return `${originalUrl}${hasQuery ? '&' : '?'}${encodedParams}`;
    };

    const buildAuthHeaderString = (realmIdentifier, authParams) => {
        const encodedRealm = encodeDataComponent(realmIdentifier);
        const paramSegments = obtainParameterTuples(authParams)
            .filter(tuple => String(tuple[0]).startsWith("oauth_"))
            .map(tuple => `${encodeDataComponent(tuple[0])}="${encodeDataComponent(tuple[1])}"`)
            .join(',');
        return `OAuth realm="${encodedRealm}"${paramSegments ? ',' + paramSegments : ''}`;
    };

    const dissectUrl = (fullUri) => {
        const parts = {};
        const urlRegex = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
        const match = urlRegex.exec(fullUri);

        parts.full = match[0] || '';
        parts.protocol = match[2] || '';
        parts.authority = match[4] || '';
        parts.path = match[5] || '';
        parts.query = match[7] || '';
        parts.fragment = match[9] || '';

        if (parts.authority) {
            const userPassHostPortRegex = /^(([^@]*)(@))?([^:]*)(:(\d*))?$/;
            const authMatch = userPassHostPortRegex.exec(parts.authority);
            if (authMatch) {
                parts.userInfo = authMatch[2] || '';
                parts.host = authMatch[4] || '';
                parts.port = authMatch[6] || '';
            }
        }
        return parts;
    };

    const standardizeResourceLocator = (rawUrl) => {
        const dissected = dissectUrl(rawUrl);
        const scheme = dissected.protocol.toLowerCase();
        let auth = dissected.authority.toLowerCase();

        const omitPort = (scheme === "http" && dissected.port === "80") ||
                         (scheme === "https" && dissected.port === "443");

        if (omitPort) {
            const colonIndex = auth.lastIndexOf(":");
            if (colonIndex >= 0) {
                auth = auth.substring(0, colonIndex);
            }
        }
        const p = dissected.path || "/";
        return `${scheme}://${auth}${p}`;
    };

    const sortAndSerializeParameters = (paramList) => {
        const sorted = obtainParameterTuples(paramList).sort((a, b) => {
            const nameA = encodeDataComponent(a[0]);
            const nameB = encodeDataComponent(b[0]);
            if (nameA !== nameB) {
                return nameA < nameB ? -1 : 1;
            }
            const valueA = encodeDataComponent(a[1] === null ? "" : a[1]);
            const valueB = encodeDataComponent(b[1] === null ? "" : b[1]);
            return valueA < valueB ? -1 : 1;
        });

        return sorted.map(tuple => {
            const val = tuple[1] === null ? "" : tuple[1];
            return `${encodeDataComponent(tuple[0])}=${encodeDataComponent(val)}`;
        }).join('&');
    };

    class CryptoStrategyBase {
        constructor() {
            this.secretKey = '';
        }

        configure(strategyName, credentials) {
            let consumerSecurityToken;
            if (credentials.accessorSecret !== null && typeof credentials.accessorSecret !== 'undefined' &&
                strategyName.length > 9 && strategyName.endsWith("-Accessor")) {
                consumerSecurityToken = credentials.accessorSecret;
            } else {
                consumerSecurityToken = credentials.consumerSecret;
            }
            this.secretKey = encodeDataComponent(consumerSecurityToken) + "&" + encodeDataComponent(credentials.tokenSecret || '');
        }

        calculateSignature(baseString) {
            throw new Error("Signature calculation not implemented by subclass.");
        }

        applySignature(messageData) {
            const inputString = GlobalAuthProcessor.createBaseSignatureInput(messageData);
            const generatedSignature = this.calculateSignature(inputString);
            updateMessageParameter(messageData, "oauth_signature", generatedSignature);
            return generatedSignature;
        }
    }

    const signatureMethodRegistry = new Map();

    const GlobalAuthProcessor = {
        encodeDataComponent: encodeDataComponent,
        decodeDataComponent: decodeDataComponent,
        obtainParameterTuples: obtainParameterTuples,
        obtainParameterObject: obtainParameterObject,
        fetchSingleParameter: fetchSingleParameter,
        createUrlEncodedString: createUrlEncodedString,
        extractKeyValuePairs: extractKeyValuePairs,
        updateMessageParameter: updateMessageParameter,
        applyMultipleParameters: applyMultipleParameters,

        generateCurrentTimestamp: generateCurrentTimestamp,
        generateRandomString: generateRandomString,
        adjustTimeBase: adjustTimeBase,
        syncTimeFromScriptSource: syncTimeFromScriptSource,

        augmentUrlWithParameters: augmentUrlWithParameters,
        buildAuthHeaderString: buildAuthHeaderString,

        prepareAuthRequest: (requestDetails, accessCredentials) => {
            if (requestDetails.method === null || typeof requestDetails.method === 'undefined') {
                requestDetails.method = "GET";
            }
            const currentParamMap = obtainParameterObject(requestDetails.parameters);

            if (currentParamMap.oauth_consumer_key === null || typeof currentParamMap.oauth_consumer_key === 'undefined') {
                updateMessageParameter(requestDetails, "oauth_consumer_key", accessCredentials.consumerKey || "");
            }
            if ((currentParamMap.oauth_token === null || typeof currentParamMap.oauth_token === 'undefined') && accessCredentials.token !== null) {
                updateMessageParameter(requestDetails, "oauth_token", accessCredentials.token);
            }
            if (currentParamMap.oauth_version === null || typeof currentParamMap.oauth_version === 'undefined') {
                updateMessageParameter(requestDetails, "oauth_version", "1.0");
            }
            if (currentParamMap.oauth_timestamp === null || typeof currentParamMap.oauth_timestamp === 'undefined') {
                updateMessageParameter(requestDetails, "oauth_timestamp", generateCurrentTimestamp());
            }
            if (currentParamMap.oauth_nonce === null || typeof currentParamMap.oauth_nonce === 'undefined') {
                updateMessageParameter(requestDetails, "oauth_nonce", generateRandomString(6));
            }
            GlobalAuthProcessor.signRequest(requestDetails, accessCredentials);
        },

        refreshAuthTimestamps: (messageData) => {
            updateMessageParameter(messageData, "oauth_timestamp", generateCurrentTimestamp());
            updateMessageParameter(messageData, "oauth_nonce", generateRandomString(6));
        },

        signRequest: (messageData, accessCredentials) => {
            let selectedMethodName = fetchSingleParameter(messageData.parameters, "oauth_signature_method");
            if (selectedMethodName === null || typeof selectedMethodName === 'undefined' || selectedMethodName === "") {
                selectedMethodName = "HMAC-SHA1";
                updateMessageParameter(messageData, "oauth_signature_method", selectedMethodName);
            }
            GlobalAuthProcessor.createSignatureStrategy(selectedMethodName, accessCredentials).applySignature(messageData);
        },

        createSignatureStrategy: (methodName, accessCredentials) => {
            const StrategyConstructor = signatureMethodRegistry.get(methodName);
            if (StrategyConstructor) {
                const strategyInstance = new StrategyConstructor();
                strategyInstance.configure(methodName, accessCredentials);
                return strategyInstance;
            }
            const errorObject = new Error("Unsupported_Signing_Algorithm");
            errorObject.acceptable_algorithms = Array.from(signatureMethodRegistry.keys()).map(encodeDataComponent).join('&');
            throw errorObject;
        },

        registerSigningAlgorithm: (methodNames, ConstructorClass) => {
            methodNames.forEach(name => signatureMethodRegistry.set(name, ConstructorClass));
        },

        createAlgorithmSubclass: (signatureFunction) => {
            class DerivedStrategy extends CryptoStrategyBase {
                calculateSignature(baseInput) {
                    return signatureFunction.call(this, baseInput);
                }
            }
            return DerivedStrategy;
        },

        createBaseSignatureInput: (messageDetails) => {
            const resourceUrl = messageDetails.action;
            const queryIndex = resourceUrl.indexOf('?');
            let combinedParameters;

            if (queryIndex < 0) {
                combinedParameters = messageDetails.parameters;
            } else {
                const urlQueryParams = extractKeyValuePairs(resourceUrl.substring(queryIndex + 1));
                const messageParams = obtainParameterTuples(messageDetails.parameters);
                combinedParameters = urlQueryParams.concat(messageParams);
            }

            return `${encodeDataComponent(String(messageDetails.method).toUpperCase())}` +
                   `&${encodeDataComponent(standardizeResourceLocator(resourceUrl))}` +
                   `&${encodeDataComponent(sortAndSerializeParameters(combinedParameters))}`;
        },

        _internal: {
            dissectUrl: dissectUrl,
            standardizeResourceLocator: standardizeResourceLocator,
            sortAndSerializeParameters: sortAndSerializeParameters,
            CryptoStrategyBase: CryptoStrategyBase
        }
    };

    class HmacSha1Strategy extends GlobalAuthProcessor._internal.CryptoStrategyBase {
        calculateSignature(baseInput) {
            return b64_hmac_sha1(this.secretKey, baseInput);
        }
    }
    GlobalAuthProcessor.registerSigningAlgorithm(["HMAC-SHA1"], HmacSha1Strategy);

    class PlaintextStrategy extends GlobalAuthProcessor._internal.CryptoStrategyBase {
        calculateSignature(baseInput) {
            return this.secretKey;
        }
    }
    GlobalAuthProcessor.registerSigningAlgorithm(["PLAINTEXT"], PlaintextStrategy);

    class RsaSha1Strategy extends GlobalAuthProcessor._internal.CryptoStrategyBase {
        calculateSignature(baseInput) {
            throw new Error("RSA-SHA1 signing requires an external library and is not implemented here.");
        }
    }
    GlobalAuthProcessor.registerSigningAlgorithm(["RSA-SHA1"], RsaSha1Strategy);

    if (typeof window !== 'undefined') {
        window.AuthEngine = GlobalAuthProcessor;
    } else if (typeof global !== 'undefined') {
        global.AuthEngine = GlobalAuthProcessor;
    }
})();