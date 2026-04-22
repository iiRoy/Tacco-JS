var appConfiguration;

var defaultAppConfig = {
    requestVerb: '',
    resourcePathPattern: '',
    examplePayloads: {},
    pathParameters: [],
    baseEndpoint: '/'
};

(function () {
    // Utility for constructing the final URI path from a template and parameter values.
    function constructResourcePath(pathTemplateString, resourceParams) {
        let currentPathSegment = pathTemplateString;
        const paramRegex = /\{(\w+)\}/g;

        // Guard clause: if no parameters, clean up and return.
        if (!Array.isArray(resourceParams) || resourceParams.length === 0) {
            return currentPathSegment.replace(paramRegex, '');
        }

        // Iterate through each resource parameter to substitute values.
        for (let paramItem of resourceParams) {
            // Check if the parameter is enabled and has a non-empty value.
            const paramValue = paramItem.value && paramItem.value();
            const isParamEnabled = paramItem.isEnabled && paramItem.isEnabled();
            const hasValidValue = paramValue !== null && paramValue !== undefined && String(paramValue).trim() !== "";

            if (isParamEnabled && hasValidValue) {
                const placeholder = `{${paramItem.key}}`;
                currentPathSegment = currentPathSegment.replace(placeholder, encodeURIComponent(paramValue));
            } else {
                // If disabled or value is empty, remove its placeholder and any associated query part.
                currentPathSegment = prunePathParameter(currentPathSegment, paramItem.key);
            }
        }

        // Final cleanup: remove any remaining unsubstituted placeholders and normalize query string syntax.
        currentPathSegment = currentPathSegment.replace(paramRegex, '');
        currentPathSegment = currentPathSegment.replace(/\/\?/g, '?');
        currentPathSegment = currentPathSegment.replace(/\?&/g, '?');

        // Remove trailing '?' or '&' if present.
        const lastChar = currentPathSegment.charAt(currentPathSegment.length - 1);
        if (lastChar === '?' || lastChar === '&') {
            currentPathSegment = currentPathSegment.slice(0, -1);
        }

        return currentPathSegment;
    }

    // Helper function to remove a specific URI parameter's placeholder from a path.
    function prunePathParameter(inputPath, paramKey) {
        let modifiedPath = inputPath;
        const paramPlaceholder = `{${paramKey}}`;

        // Attempt to remove as a query parameter (e.g., ?param=value or &param=value)
        // This regex is designed to remove the parameter and its value,
        // and adjust the preceding '?' or '&' to maintain a valid query string structure.
        const queryParamRegex = new RegExp(`([\\?&])${paramKey}(=[^&]*)?(&|$)`, 'g');
        modifiedPath = modifiedPath.replace(queryParamRegex, (match, separator, valuePart, nextSeparator) => {
            if (nextSeparator === '&') {
                return separator === '?' ? '?' : '&'; // Keep separator if more params follow
            }
            return ''; // Remove separator if no more params follow
        });

        // Remove the placeholder from the path segment itself.
        modifiedPath = modifiedPath.replace(paramPlaceholder, '');
        return modifiedPath;
    }

    // Main ViewModel for handling API client interactions.
    function ApiInteractionViewModel(initialData) {
        const thisInstance = this;

        // Initialize observable properties for request configuration.
        thisInstance.requestVerb = ko.observable(initialData.requestVerb || initialData.HttpMethod || 'GET'); // Default to GET
        thisInstance.uriTemplateStr = initialData.resourcePathPattern || initialData.UriPathTemplate || '';
        thisInstance.computedUriPath = ko.observable(thisInstance.uriTemplateStr);

        thisInstance.pathParameters = ko.observableArray([]);

        // Populate path parameters from initial data.
        const paramsToProcess = initialData.pathParameters || initialData.UriParameters;
        if (Array.isArray(paramsToProcess)) {
            paramsToProcess.forEach(paramConfig => {
                const paramValueObservable = ko.observable(paramConfig.value);
                const paramEnabledObservable = ko.observable(true);

                // Subscribe to changes to automatically update the computed URI path.
                const updatePath = () => {
                    thisInstance.computedUriPath(constructResourcePath(thisInstance.uriTemplateStr, thisInstance.pathParameters()));
                };
                paramValueObservable.subscribe(updatePath);
                paramEnabledObservable.subscribe(updatePath);

                thisInstance.pathParameters.push({
                    key: paramConfig.name,
                    value: paramValueObservable,
                    isEnabled: paramEnabledObservable
                });
            });
        }

        thisInstance.requestHeaders = ko.observableArray([]);
        thisInstance.selectedMediaType = ko.observable();

        // Prepare available sample types for dropdown.
        let availableSampleTypes = [];
        const samplesData = initialData.examplePayloads || initialData.Samples;
        if (samplesData) {
            for (let typeKey in samplesData) {
                if (samplesData.hasOwnProperty(typeKey)) {
                    availableSampleTypes.push(typeKey);
                }
            }
        }
        thisInstance.availableSampleTypes = availableSampleTypes;

        thisInstance.displayBodyInput = ko.observable(thisInstance.availableSampleTypes.length > 0);
        thisInstance.requestPayload = ko.observable();

        // Subscribe to media type selection changes.
        thisInstance.selectedMediaType.subscribe(chosenType => {
            if (chosenType) {
                const sampleContent = (samplesData && samplesData[chosenType]) || "";
                thisInstance.requestPayload(deserializeSampleContent(sampleContent));
                manageHttpHeaders(thisInstance.requestHeaders, "Content-Type", chosenType);
            } else {
                thisInstance.requestPayload("");
                manageHttpHeaders(thisInstance.requestHeaders, "Content-Type", ""); // Clear content-type header.
            }
        });

        // Subscribe to request payload changes to update content-length header.
        thisInstance.requestPayload.subscribe(currentPayload => {
            const payloadLength = currentPayload ? currentPayload.length : 0;
            manageHttpHeaders(thisInstance.requestHeaders, "Content-Length", payloadLength);
        });

        // Function to add a new custom header row.
        thisInstance.addNewHeader = function () {
            thisInstance.requestHeaders.unshift({ name: ko.observable(""), value: ko.observable("") });
        };

        // Function to remove a header row.
        thisInstance.removeHeaderEntry = function (headerItem) {
            thisInstance.requestHeaders.remove(headerItem);
        };

        thisInstance.apiResponse = ko.observable();

        // Computed observable to enable/disable the "Send Request" button.
        thisInstance.canInitiateRequest = ko.computed(function () {
            return thisInstance.requestVerb() && thisInstance.computedUriPath();
        }, thisInstance);

        // Core function to send the HTTP request.
        thisInstance.initiateRequest = function () {
            if (!thisInstance.canInitiateRequest()) {
                alert("Please ensure HTTP Method and URI Path are valid before sending the request.");
                return;
            }

            let effectiveUri = thisInstance.computedUriPath();
            const httpPrefix = "http://";
            const httpsPrefix = "https://";

            // Prepend base endpoint if the URI is relative.
            const isAbsolute = effectiveUri.startsWith(httpPrefix) || effectiveUri.startsWith(httpsPrefix);
            if (!isAbsolute) {
                effectiveUri = (initialData.baseEndpoint || initialData.BaseAddress || '') + effectiveUri;
            }

            const method = thisInstance.requestVerb();
            // Map observable header values to plain objects for the XMLHttpRequest.
            const headersToSend = thisInstance.requestHeaders().map(h => ({
                name: ko.isObservable(h.name) ? h.name() : h.name,
                value: ko.isObservable(h.value) ? h.value() : h.value
            }));
            const bodyContent = thisInstance.displayBodyInput() ? thisInstance.requestPayload() : null;

            // Dispatch the request and handle the response.
            dispatchHttpRequest(method, effectiveUri, headersToSend, bodyContent, function (xhrResponse) {
                const parsedResponse = parseHttpResponse(xhrResponse);
                thisInstance.apiResponse(parsedResponse);
                $("#responseDisplayModal").dialog("open");
            });
        };

        // jQuery UI Dialog initialization for the request configuration modal.
        $("#requestConfigModal").dialog({
            autoOpen: false,
            height: "auto",
            width: "700px",
            modal: true,
            open: function () {
                $('body').addClass('modal-open'); // Add class to body for modal styling.
                jQuery('.ui-widget-overlay').on('click', function () {
                    jQuery('#requestConfigModal').dialog('close');
                });
            },
            close: function () {
                $('body').removeClass('modal-open'); // Remove class on close.
            },
            buttons: {
                "Dispatch Request": function () {
                    thisInstance.initiateRequest();
                },
                "Close": function () {
                    $(this).dialog("close");
                }
            }
        });

        // jQuery UI Dialog initialization for the response display modal.
        $("#responseDisplayModal").dialog({
            autoOpen: false,
            height: "auto",
            width: "550px",
            modal: true,
            open: function () {
                $('body').addClass('modal-open');
                jQuery('.ui-widget-overlay').on('click', function () {
                    jQuery('#responseDisplayModal').dialog('close');
                });
            },
            close: function () {
                $('body').removeClass('modal-open');
            }
        });

        // Event handler for the button that opens the main API client dialog.
        $("#openApiClientButton").on('click', function () {
            $("#requestConfigModal").dialog("open");
        });

        // Ensure the computed URI path is initialized at the end.
        thisInstance.computedUriPath(constructResourcePath(thisInstance.uriTemplateStr, thisInstance.pathParameters()));
    }

    // Apply Knockout bindings to the generated ViewModel.
    const effectiveModelData = appConfiguration || defaultAppConfig;
    ko.applyBindings(new ApiInteractionViewModel(effectiveModelData));
})();

// Decodes a URL-encoded sample string, handling plus signs and line breaks.
function deserializeSampleContent(encodedString) {
    if (!encodedString) return "";
    try {
        // Use decodeURIComponent for standard URL decoding. Replace '+' with space first
        // as decodeURIComponent does not handle '+' for spaces.
        let decoded = decodeURIComponent(String(encodedString).replace(/\+/g, " "));
        return decoded.replace(/\r\n/gi, "\n"); // Normalize line endings.
    } catch (e) {
        console.error("Error decoding sample content:", e);
        return encodedString; // Return original if decoding fails.
    }
}

// Manages HTTP headers in a Knockout observableArray, adding, replacing, or removing entries.
function manageHttpHeaders(headerCollection, keyToManage, valToSet) {
    if (!headerCollection || !ko.isObservableArray(headerCollection)) {
        console.warn("Invalid header collection provided to manageHttpHeaders.");
        return;
    }

    const currentHeaders = headerCollection();
    const lowerCaseKey = keyToManage.toLowerCase();
    let headerFound = false;

    for (let i = 0; i < currentHeaders.length; i++) {
        const headerEntry = currentHeaders[i];
        const entryName = ko.isObservable(headerEntry.name) ? headerEntry.name() : headerEntry.name;

        if (entryName && entryName.toLowerCase() === lowerCaseKey) {
            // If value is empty/null, remove the header.
            if (valToSet === null || valToSet === undefined || String(valToSet).trim() === "") {
                headerCollection.splice(i, 1); // Remove header.
            } else {
                // Otherwise, update the header value.
                if (ko.isObservable(headerEntry.value)) {
                    headerEntry.value(valToSet);
                } else {
                    // Replace the entire object if value is not observable.
                    headerCollection.replace(headerEntry, { name: entryName, value: valToSet });
                }
            }
            headerFound = true;
            break;
        }
    }

    // If header not found and value is valid, add it.
    if (!headerFound && valToSet !== null && valToSet !== undefined && String(valToSet).trim() !== "") {
        headerCollection.push({ name: keyToManage, value: valToSet });
    }
}

// Dispatches an XMLHttpRequest to a specified URL with given parameters.
function dispatchHttpRequest(methodType, targetUrl, reqHeaders, payloadContent, responseHandler) {
    // Basic input validation.
    if (!methodType || methodType.trim() === "") {
        alert("HTTP Method must be specified.");
        return false;
    }
    if (!targetUrl || targetUrl.trim() === "") {
        alert("Target URL must not be empty.");
        return false;
    }

    // Check for XMLHttpRequest API availability.
    if (typeof XMLHttpRequest === 'undefined') {
        alert("XMLHttpRequest is not supported in this environment. Cannot send request.");
        return false;
    }

    const xhrRequest = new XMLHttpRequest();

    try {
        // The original code uses synchronous request (false).
        // While deprecated, maintaining this for functional similarity in a Type III clone.
        xhrRequest.open(methodType, encodeURI(targetUrl), false);
    } catch (e) {
        alert("Failed to initialize request. Ensure target URL is valid and CORS policies allow the request. Error: " + e.message);
        return false;
    }

    try {
        // Set request headers, performing basic validation.
        reqHeaders.forEach(header => {
            if (header.name && header.value !== null && header.value !== undefined) {
                xhrRequest.setRequestHeader(header.name, String(header.value));
            }
        });
    } catch (e) {
        alert("Failed to set request headers. Ensure headers are valid. Error: " + e.message);
        return false;
    }

    // Configure timeout for the request.
    xhrRequest.timeout = 30000; // 30 seconds.

    // Event handler for request completion.
    xhrRequest.onreadystatechange = function () {
        if (this.readyState === 4) {
            responseHandler(xhrRequest);
        }
    };

    // Event handler for request timeouts.
    xhrRequest.ontimeout = function () {
        alert("API request timed out after " + (xhrRequest.timeout / 1000) + " seconds.");
    };

    // Event handler for network-related errors.
    xhrRequest.onerror = function () {
        alert("A network error occurred during the request. Check your internet connection or server availability.");
    };

    try {
        // Send the request body/payload.
        xhrRequest.send(payloadContent);
    } catch (e) {
        alert("Failed to send request payload. Ensure content is correctly formatted. Error: " + e.message);
        return false;
    }

    return true;
}

// Parses and formats the HTTP response from an XMLHttpRequest object.
function parseHttpResponse(xhrObject) {
    const httpStatus = xhrObject.status;
    let statusDescription = xhrObject.statusText;
    const allHeaders = xhrObject.getAllResponseHeaders();
    const responsePayload = xhrObject.responseText;

    let finalStatusCode = httpStatus; // Variable to hold potentially corrected status.

    // Handle IE-specific status code anomaly (1223 for 204 No Content).
    if (httpStatus === 1223) {
        finalStatusCode = 204;
        statusDescription = "No Content (IE compatibility)";
    }

    return {
        status: `${finalStatusCode} / ${statusDescription}`,
        headers: allHeaders,
        content: responsePayload,
        rawStatusCode: httpStatus, // Include original status for debugging.
        effectiveStatusCode: finalStatusCode // Include potentially corrected status.
    };
}