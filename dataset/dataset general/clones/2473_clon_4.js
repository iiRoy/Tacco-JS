const webFramework = require("express");
const httpVerbsList = require("methods");
const NodeEventStream = require("events").EventEmitter;

// --- Custom Deep Comparison Utility ---
const valueVerifier = {
    deepComparison: function compareObjects(obj1, obj2, path = '') {
        if (obj1 === obj2) return; // Strict equality for primitives and same object reference

        // Handle null separately as typeof null is 'object'
        if (obj1 === null || obj2 === null) {
            throw new Error(`Value mismatch at ${path || 'root'}: ${JSON.stringify(obj1)} vs ${JSON.stringify(obj2)}`);
        }

        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
            throw new Error(`Type mismatch at ${path || 'root'}: ${typeof obj1} vs ${typeof obj2}`);
        }

        // Handle arrays
        if (Array.isArray(obj1) !== Array.isArray(obj2)) {
            throw new Error(`Array type mismatch at ${path || 'root'}`);
        }
        if (Array.isArray(obj1) && obj1.length !== obj2.length) {
            throw new Error(`Array length mismatch at ${path || 'root'}: ${obj1.length} vs ${obj2.length}`);
        }

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
            throw new Error(`Key count mismatch at ${path || 'root'}: ${keys1.length} vs ${keys2.length}`);
        }

        // Compare keys and their values
        for (const key of keys1) {
            const currentPath = path ? `${path}.${key}` : key;
            if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
                throw new Error(`Missing key in second object at ${currentPath}`);
            }
            compareObjects(obj1[key], obj2[key], currentPath);
        }
    }
};

// --- Query String Decoding Utility (mimics querystring.parse) ---
const queryUtil = {
    decodeParams: function(inputString) {
        const result = {};
        if (typeof inputString !== 'string' || inputString.length === 0) {
            return result;
        }
        inputString.split('&').forEach(pair => {
            if (!pair) return;
            let [key, value] = pair.split('=').map(decodeURIComponent); // Assuming UTF-8
            if (Object.prototype.hasOwnProperty.call(result, key)) {
                if (Array.isArray(result[key])) {
                    result[key].push(value);
                } else {
                    result[key] = [result[key], value];
                }
            } else {
                result[key] = value;
            }
        });
        return result;
    }
};

// --- Custom Middleware for Raw Text Body ---
function rawTextBodyInterceptor(request, response, proceed) {
    const contentType = request.headers['content-type'];
    // Approximates req.is('text/*')
    if (contentType && contentType.startsWith('text/')) {
        request._rawBodyContent = '';
        request.setEncoding('utf8');
        request.on('data', (chunk) => {
            request._rawBodyContent += chunk;
        });
        request.on('end', proceed);
    } else {
        proceed();
    }
}

// --- InteractionMonitor Class (replaces Handler) ---
class InteractionMonitor extends NodeEventStream {
    constructor(blueprintReference) {
        super();
        this._settings = {
            timeoutDefault: 2000
        };
        this._blueprint = blueprintReference;
        this._isAchieved = false;
        this.on("interactionAchieved", () => {
            this._isAchieved = true;
        });
    }

    ensureCompleted() {
        if (!this._isAchieved) {
            throw new Error(`Mock endpoint for ${this._blueprint._expectedOperation.toUpperCase()} ${this._blueprint._targetPath} was not reached.`);
        }
    }

    awaitCompletion(durationOrCallback, optionalCallback) {
        let duration = this._settings.timeoutDefault;
        let callbackFn;

        if (typeof durationOrCallback === "function") {
            callbackFn = durationOrCallback;
        } else {
            duration = durationOrCallback;
            callbackFn = optionalCallback;
        }

        if (typeof callbackFn !== "function") {
            throw new Error("Callback function is required for awaitCompletion.");
        }

        let timeoutHandle = null;
        const completionHandler = () => {
            clearTimeout(timeoutHandle);
            callbackFn();
        };

        this.once("interactionAchieved", completionHandler);
        timeoutHandle = setTimeout(() => {
            this.removeListener("interactionAchieved", completionHandler);
            callbackFn(new Error(`Mock endpoint for ${this._blueprint._expectedOperation.toUpperCase()} ${this._blueprint._targetPath} was not reached within ${duration}ms.`));
        }, duration);
    }
}

// --- InteractionBlueprint Class (replaces Assertion) ---
class InteractionBlueprint {
    constructor(operationMethod, targetPath, engineInstance) {
        this._expectedOperation = operationMethod.toLowerCase();
        this._targetPath = targetPath;
        this._engine = engineInstance;
        this._expectedHeaders = {};
        this._expectedQuery = null;
        this._incomingPayloadRaw = null; // raw data from .send()
        this._incomingPayloadParsed = null; // parsed data
        this._outgoingStatus = 200;
        this._outgoingContent = '';
        this._outgoingHeaders = null;
        this._responseDelayMs = 0;
        this._isPersistent = false;
        this._monitor = new InteractionMonitor(this);
    }

    transmitPayload(data) {
        this._incomingPayloadRaw = data;
        return this;
    }

    specifyQuery(queryParams) {
        let parsedQuery;
        if (typeof queryParams === "string") {
            parsedQuery = queryUtil.decodeParams(queryParams);
        } else {
            parsedQuery = queryParams;
        }
        this._expectedQuery = parsedQuery;
        return this;
    }

    setHeaderField(keyName, value) {
        this._expectedHeaders[keyName.toLowerCase()] = value;
        return this;
    }

    setResponseDelay(milliseconds) {
        this._responseDelayMs = milliseconds;
        return this;
    }

    keepActive() {
        this._isPersistent = true;
        return this;
    }

    _processExpectedPayload() {
        if (!this._incomingPayloadRaw) {
            return;
        }

        const contentTypeHeader = this._expectedHeaders["content-type"];
        if (!contentTypeHeader) { // If no content-type is explicitly set in expected headers
            if (typeof this._incomingPayloadRaw === "string") {
                // If it's a string, treat as querystring-encoded payload
                this._incomingPayloadParsed = queryUtil.decodeParams(this._incomingPayloadRaw);
                return;
            }
        }
        // Otherwise, use the raw payload as is (e.g., for JSON objects, buffers, etc.)
        this._incomingPayloadParsed = this._incomingPayloadRaw;
    }

    finalizeInteraction(status, content, headers) {
        this._outgoingStatus = status;
        this._outgoingContent = content;
        this._outgoingHeaders = headers;
        this._processExpectedPayload();
        this._engine._registerBlueprint(this); // Register with the central engine
        return this._monitor;
    }

    // Checks if an incoming request matches this blueprint's method and path
    checkMatch(incomingRequest) {
        return incomingRequest.method.toLowerCase() === this._expectedOperation &&
               incomingRequest.path === this._targetPath;
    }

    // Verifies all expectations against an incoming request
    verifyExpectations(incomingRequest) {
        // Query parameters comparison
        if (this._expectedQuery) {
            try {
                valueVerifier.deepComparison(incomingRequest.query, this._expectedQuery);
            } catch (e) {
                throw new Error(`Query parameter mismatch: ${e.message}`);
            }
        }

        // Request body comparison
        if (this._incomingPayloadParsed) {
            const actualBody = incomingRequest._rawBodyContent || incomingRequest.body;
            try {
                valueVerifier.deepComparison(actualBody, this._incomingPayloadParsed);
            } catch (e) {
                throw new Error(`Request body mismatch: ${e.message}`);
            }
        }

        // Headers comparison
        for (const headerName in this._expectedHeaders) {
            if (Object.prototype.hasOwnProperty.call(this._expectedHeaders, headerName)) {
                const expectedValue = this._expectedHeaders[headerName];
                const actualValue = incomingRequest.headers[headerName];
                // Express lowercases incoming header names
                if (actualValue === undefined) {
                    throw new Error(`Missing expected header: ${headerName}`);
                }
                if (actualValue !== expectedValue) {
                    throw new Error(`Header mismatch for '${headerName}': Expected '${expectedValue}', Got '${actualValue}'`);
                }
            }
        }
    }
}

// --- ServerEngine Class (replaces the augmented server object) ---
class ServerEngine {
    constructor(appReference, listenerHandle) {
        this._applicationRef = appReference;
        this._listenerRef = listenerHandle;
        this._registeredBlueprints = [];

        // Add the central matching middleware
        // This middleware intercepts all requests and tries to match them against registered blueprints.
        this._applicationRef.use(this._processIncomingRequest.bind(this));
    }

    _registerBlueprint(blueprint) {
        this._registeredBlueprints.push(blueprint);
    }

    _processIncomingRequest(request, response, next) {
        let foundBlueprintIndex = -1;
        let foundBlueprint = null;

        // Iterate through blueprints to find the first match
        for (let i = 0; i < this._registeredBlueprints.length; i++) {
            if (this._registeredBlueprints[i].checkMatch(request)) {
                foundBlueprintIndex = i;
                foundBlueprint = this._registeredBlueprints[i];
                break;
            }
        }

        if (foundBlueprint) {
            try {
                foundBlueprint.verifyExpectations(request); // Throws if expectations fail

                const respondToRequest = () => {
                    foundBlueprint._monitor.emit("interactionAchieved");
                    if (!foundBlueprint._isPersistent) {
                        this._registeredBlueprints.splice(foundBlueprintIndex, 1);
                    }
                    if (foundBlueprint._outgoingHeaders) {
                        response.set(foundBlueprint._outgoingHeaders);
                    }
                    response.status(foundBlueprint._outgoingStatus).send(foundBlueprint._outgoingContent);
                };

                if (foundBlueprint._responseDelayMs > 0) {
                    setTimeout(respondToRequest, foundBlueprint._responseDelayMs);
                } else {
                    respondToRequest();
                }
            } catch (error) {
                // If verification fails, re-throw to trigger the global error handler
                // which then re-throws, matching original behavior (crashing on assertion fail)
                throw error;
            }
        } else {
            next(); // No blueprint matched, proceed to the next middleware/route handler
        }
    }

    establishEndpoint(operationMethod, targetPath) {
        return new InteractionBlueprint(operationMethod, targetPath, this);
    }

    clearAllEndpoints() {
        this._registeredBlueprints = [];
    }

    shutDown() {
        this._listenerRef.close();
    }
}

// --- Main Exported Function (replaces module.exports) ---
function createMockGateway(listeningPort, interceptors) {
    const webFrameworkInstance = webFramework();

    webFrameworkInstance.on("error", function(err) {
        throw err;
    });

    webFrameworkInstance.use(webFramework.json());
    // Using { extended: true } for urlencoded, common for modern Express usage.
    webFrameworkInstance.use(webFramework.urlencoded({ extended: true }));

    // If custom interceptors are provided
    if (interceptors) {
        interceptors.forEach(function(interceptor) {
            webFrameworkInstance.use(interceptor);
        });
    }

    webFrameworkInstance.use(rawTextBodyInterceptor); // Custom text body parser

    let listenerHandle;
    if (listeningPort) {
        listenerHandle = webFrameworkInstance.listen(listeningPort);
    } else {
        listenerHandle = webFrameworkInstance.listen(); // Listen on an ephemeral port
    }

    const activeServerEngine = new ServerEngine(webFrameworkInstance, listenerHandle);

    // Dynamically add HTTP verb methods to the server engine
    httpVerbsList.forEach(function(verb) {
        activeServerEngine[verb] = function(targetPath) {
            return activeServerEngine.establishEndpoint(verb, targetPath);
        }
    });

    // Alias for cleaning endpoints, consistent with original 'clean'
    activeServerEngine.clean = activeServerEngine.clearAllEndpoints;
    // Alias for shutting down the listener, consistent with server.close()
    activeServerEngine.close = activeServerEngine.shutDown;

    return activeServerEngine;
}

module.exports = createMockGateway;