const AppRoot = jQuery; // Renamed jQuery global alias

AppRoot(function(domUtil) {
    // This section contains application-wide configuration parameters.
    // These constants define how API requests are constructed and handled.
    const APP_CONFIG = Object.freeze({
        BASE_API_ENDPOINT: 'https://api.example.com/v1', // Renamed apiBaseUrl
        ENDPOINT_PATH_SUFFIX: '/items', // Renamed apiUrlSuffix
        DEFAULT_RESPONSE_TYPE: 'json', // Renamed apiDataType
        REQUEST_HEADERS: { // Renamed apiExtraHeaders
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        UI_LOADING_INDICATOR_SELECTOR: '#progressIndicator', // Renamed #loading
        UI_OUTPUT_AREA_SELECTOR: '#apiResponseDisplay', // Renamed #result
        UI_NAV_PANEL_SELECTOR: '#leftNavigation', // Renamed #sidebar
        UI_FORM_SELECTOR: 'form#apiInteractionForm', // Renamed form
        UI_ENDPOINT_INPUT_SELECTOR: '#apiEndpointUrl', // Renamed #apiurl
        UI_METHOD_INPUT_SELECTOR: '#requestMethodType', // Renamed #requestmethod
        ACTIVE_CLASS_NAME: 'is-active', // New constant for active class
        HISTORY_STATE_KEY_HREF: 'resourcePath', // Renamed history state key
        HISTORY_STATE_KEY_METHOD: 'operationType', // Renamed history state key
        DEFAULT_REQUEST_METHOD: 'GET' // New constant
    });

    // Helper to visualize JSON data within a specified DOM element.
    // This replaces the original $.JSONView, providing a basic equivalent.
    const visualizeJsonInContainer = (jsonData, targetElement) => {
        if (!targetElement || !targetElement.length) {
            console.error('Target element for JSON visualization not found.');
            return;
        }
        try {
            // Attempt to pretty-print the JSON.
            const formattedJson = JSON.stringify(jsonData, null, 2);
            targetElement.html(`<pre><code>${formattedJson}</code></pre>`);
        } catch (parseError) {
            // Fallback for non-JSON or malformed data.
            targetElement.html(`<div class="error-message">Error rendering JSON: ${parseError.message}</div>`);
            console.warn('Could not parse JSON for display:', jsonData, parseError);
        }
    };

    // Displays a user-friendly message in a designated UI area.
    const displayUserFeedback = (messageText, isError = false) => {
        const feedbackContainer = domUtil('#notificationArea'); // New UI element
        if (feedbackContainer.length) {
            feedbackContainer.removeClass('alert-success alert-danger').addClass(isError ? 'alert-danger' : 'alert-success').text(messageText).show();
            setTimeout(() => feedbackContainer.fadeOut('slow'), 5000); // Auto-hide
        } else {
            console.log(`User Feedback (${isError ? 'ERROR' : 'INFO'}): ${messageText}`);
            if (isError) alert(messageText); // Fallback to alert if no specific area
        }
    };

    // Updates the primary form fields with given endpoint and method.
    const updateRequestFormFields = (path, method) => {
        domUtil(APP_CONFIG.UI_ENDPOINT_INPUT_SELECTOR).val(APP_CONFIG.BASE_API_ENDPOINT + path);
        domUtil(APP_CONFIG.UI_METHOD_INPUT_SELECTOR).val(method.toUpperCase());
    };

    // Manages the active state of navigation links.
    const setActiveNavigationItem = (targetPath, targetMethod) => {
        const navLinks = domUtil(`${APP_CONFIG.UI_NAV_PANEL_SELECTOR} a`);
        navLinks.removeClass(APP_CONFIG.ACTIVE_CLASS_NAME); // Clear all active states first

        // Find and activate the matching link.
        const matchingLink = navLinks.filter(function() {
            const linkPath = domUtil(this).attr('href');
            const linkMethod = (domUtil(this).data('requestmethod') || APP_CONFIG.DEFAULT_REQUEST_METHOD).toLowerCase();
            return linkPath === targetPath && linkMethod === targetMethod.toLowerCase();
        });

        if (matchingLink.length) {
            matchingLink.addClass(APP_CONFIG.ACTIVE_CLASS_NAME);
        }
    };

    // Helper to manage browser history state.
    const manageBrowserHistory = (path, method, shouldPush) => {
        if (shouldPush) {
            const stateData = {};
            stateData[APP_CONFIG.HISTORY_STATE_KEY_HREF] = path;
            stateData[APP_CONFIG.HISTORY_STATE_KEY_METHOD] = method;
            const historyTitle = `API Call: ${method.toUpperCase()} ${path}`;
            const historyUrl = `#${method.toLowerCase()}|${path}`;
            history.pushState(stateData, historyTitle, historyUrl);
        }
    };

    /**
     * Executes an asynchronous API request.
     * @param {string} endpointPath - The relative path for the API endpoint.
     * @param {string} httpVerb - The HTTP method (e.g., 'GET', 'POST').
     * @param {object} [payloadObject={}] - Data to send with the request.
     */
    const initiateApiRequest = (endpointPath, httpVerb, payloadObject = {}) => {
        // Guard clause: Ensure a valid endpoint path is provided.
        if (!endpointPath || typeof endpointPath !== 'string' || endpointPath.trim().length === 0) {
            displayUserFeedback('Invalid API endpoint path provided.', true);
            return;
        }

        const fullApiUrl = APP_CONFIG.BASE_API_ENDPOINT + endpointPath + APP_CONFIG.ENDPOINT_PATH_SUFFIX;
        const progressSpinner = domUtil(APP_CONFIG.UI_LOADING_INDICATOR_SELECTOR);
        const outputContainer = domUtil(APP_CONFIG.UI_OUTPUT_AREA_SELECTOR);

        // Display the loading visual cue.
        progressSpinner.css('display', 'block'); // Use CSS property directly

        // Make the AJAX call using a Promise-like structure.
        domUtil.ajax({
            url: fullApiUrl,
            type: httpVerb.toUpperCase(),
            dataType: APP_CONFIG.DEFAULT_RESPONSE_TYPE,
            headers: APP_CONFIG.REQUEST_HEADERS,
            data: payloadObject
        })
        .done(function(responsePayload, statusText, xhrObject) {
            // Process successful responses.
            if (xhrObject.status === 204 || Object.keys(responsePayload).length === 0) { // Check for No Content or empty object
                outputContainer.html(`
                    <div class="api-info">
                        <p>No data returned by server (HTTP Status: ${xhrObject.status} – ${xhrObject.statusText}).</p>
                        <small>Consider checking the API documentation for expected responses.</small>
                    </div>
                `);
                visualizeJsonInContainer({}, outputContainer); // Still show an empty JSON view
            } else {
                visualizeJsonInContainer(responsePayload, outputContainer);
            }
            displayUserFeedback(`Request to ${endpointPath} succeeded.`, false);
        })
        .fail(function(xhrObject, statusText, errorThrown) {
            // Handle request failures.
            let errorDetails = {};
            try {
                errorDetails = xhrObject.responseText ? JSON.parse(xhrObject.responseText) : {};
            } catch (jsonParseError) {
                errorDetails = {
                    message: "Failed to parse error response.",
                    rawResponse: xhrObject.responseText
                };
            }
            visualizeJsonInContainer(errorDetails, outputContainer);
            displayUserFeedback(`API call failed: ${errorThrown || statusText} (Status: ${xhrObject.status})`, true);
        })
        .always(function() {
            // Always hide the loading spinner, potentially with a slight delay for better UX.
            setTimeout(() => progressSpinner.css('display', 'none'), 200);
        });
    };

    // Attach event listeners for user interactions.

    // Hook navigation panel clicks.
    domUtil(APP_CONFIG.UI_NAV_PANEL_SELECTOR).on('click', 'a', function(eventObject, suppressHistoryUpdate) {
        eventObject.preventDefault(); // Stop default link navigation

        const currentSpinnerDisplay = domUtil(APP_CONFIG.UI_LOADING_INDICATOR_SELECTOR).css('display');
        if (currentSpinnerDisplay === 'none') { // Only proceed if no API call is active
            const clickedLink = domUtil(this);
            const resourcePath = clickedLink.attr('href');
            const operationType = (clickedLink.data('requestmethod') || APP_CONFIG.DEFAULT_REQUEST_METHOD).toLowerCase();
            const additionalData = clickedLink.data('extradata') || {};

            // Update UI elements and state
            setActiveNavigationItem(resourcePath, operationType);
            updateRequestFormFields(resourcePath, operationType);
            manageBrowserHistory(resourcePath, operationType, !suppressHistoryUpdate);

            // Execute the API request
            initiateApiRequest(resourcePath, operationType, additionalData);
        } else {
            displayUserFeedback('Please wait for the current operation to complete.', false);
        }
    });

    // Hook form submission behavior.
    domUtil(APP_CONFIG.UI_FORM_SELECTOR).on('submit', function(submitEvent, omitHistoryEntry) {
        submitEvent.preventDefault(); // Prevent standard form submission

        const endpointInput = domUtil(APP_CONFIG.UI_ENDPOINT_INPUT_SELECTOR);
        const methodInput = domUtil(APP_CONFIG.UI_METHOD_INPUT_SELECTOR);

        const fullEndpointValue = endpointInput.val();
        const requestMethodValue = methodInput.val().toLowerCase();

        // Validate the entered endpoint against the base URL.
        if (!fullEndpointValue.startsWith(APP_CONFIG.BASE_API_ENDPOINT)) {
            displayUserFeedback(`Endpoint must start with ${APP_CONFIG.BASE_API_ENDPOINT}.`, true);
            return; // Exit if validation fails
        }

        const relativePath = fullEndpointValue.replace(APP_CONFIG.BASE_API_ENDPOINT, '');

        // Update UI and history.
        setActiveNavigationItem(relativePath, requestMethodValue);
        manageBrowserHistory(relativePath, requestMethodValue, !omitHistoryEntry);

        // Trigger the API call.
        initiateApiRequest(relativePath, requestMethodValue);
    });

    // Handle browser history navigation (popstate event).
    domUtil(window).on('popstate', function(historyEvent) {
        historyEvent.preventDefault(); // Stop default popstate behavior

        // Check if there's actual state data from a pushState operation.
        if (historyEvent.originalEvent.state && historyEvent.originalEvent.state[APP_CONFIG.HISTORY_STATE_KEY_HREF]) {
            const storedPath = historyEvent.originalEvent.state[APP_CONFIG.HISTORY_STATE_KEY_HREF];
            const storedMethod = historyEvent.originalEvent.state[APP_CONFIG.HISTORY_STATE_KEY_METHOD];

            // Re-populate the form and simulate a submission (without pushing to history again).
            updateRequestFormFields(storedPath, storedMethod);
            domUtil(APP_CONFIG.UI_FORM_SELECTOR).trigger('submit', [true]); // Pass true to suppress history push
            setActiveNavigationItem(storedPath, storedMethod); // Ensure nav item is active
        }
        // If state is null or empty, it's likely a page load or initial visit,
        // which will be handled by the initial load logic below.
    });

    // Initial page load logic: Determine what to do based on URL hash or default.
    const currentHash = document.location.hash; // Use document.location for clarity

    // Check if a hash route is present (e.g., #get|/users).
    if (currentHash && currentHash.indexOf('|') > 0) {
        // Extract method and URL from the hash.
        const hashParts = currentHash.substring(1).split('|'); // Remove '#' prefix
        const parsedMethod = (hashParts[0] || APP_CONFIG.DEFAULT_REQUEST_METHOD).toLowerCase();
        const parsedUrlPath = hashParts[1] || '';

        // Validate parsed components.
        if (parsedUrlPath.trim().length > 0) {
            // Fill form fields and trigger a submit (suppressing history update).
            updateRequestFormFields(parsedUrlPath, parsedMethod);
            domUtil(APP_CONFIG.UI_FORM_SELECTOR).trigger('submit', [true]);
            setActiveNavigationItem(parsedUrlPath, parsedMethod);
        } else {
            displayUserFeedback('Invalid URL hash format detected. Using default action.', true);
            // Fall through to the 'no hash' case if parsing fails.
            domUtil(`${APP_CONFIG.UI_NAV_PANEL_SELECTOR} a:first`).addClass(APP_CONFIG.ACTIVE_CLASS_NAME).trigger('click', [true]);
        }
    } else {
        // No valid hash route, so activate and click the first navigation item.
        domUtil(`${APP_CONFIG.UI_NAV_PANEL_SELECTOR} a:first`).addClass(APP_CONFIG.ACTIVE_CLASS_NAME).trigger('click', [true]);
    }

});