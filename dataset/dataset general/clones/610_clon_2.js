jQuery(function(domUtil) {
    // This routine is responsible for dispatching an API request
    var performRequest = function(endpointURL, httpVerb, additionalPayload) {
        // Reveal the loading spinner to indicate activity
        domUtil('#loading').show();

        // Initiate the AJAX call with specified configurations
        domUtil.ajax({
            url: endpointURL + urlPathSuffix, // Concatenate base and suffix for the full URL
            type: httpVerb, // The HTTP method (e.g., 'GET', 'POST')
            dataType: responseFormat, // Expected data format from the server
            headers: customHeaders, // Any special HTTP headers required
            data: additionalPayload // Data object to send with the request
        })
        .done(function(responseData, statusMsg, xhrObject) { // Handler for successful responses
            if (responseData) {
                // Display the received data in a JSON viewer
                domUtil.JSONView(responseData, domUtil('#result'));
            } else {
                // If no data is returned, show an empty JSON view and a descriptive message
                domUtil.JSONView({}, domUtil('#result'));
                domUtil('#result').html('<ol><li>Remote server provided no content. (HTTP Code: ' + xhrObject.status + ' – ' + xhrObject.statusText + ')</li></ol>'); // For example, a 204 status
            }
            // Conceal the loading spinner after operation completes
            domUtil('#loading').hide();
        })
        .fail(function(xhrObject, statusMsg, failureReason) { // Handler for failed requests
            // Display error information, parsing response text if available
            domUtil.JSONView(xhrObject.responseText ? JSON.parse(xhrObject.responseText) : {}, domUtil('#result'));
            // Hide the loading spinner following the error
            domUtil('#loading').hide();
        });
    }; // End of request execution function

    // Attach click event handlers to sidebar navigation links
    domUtil('#sidebar').on('click', 'a', function(eventObject, suppressHistory) {
        eventObject.preventDefault(); // Prevent the browser's default link navigation
        // Proceed only if no other request is currently active
        if (domUtil('#loading').is(':hidden')) {
            // Remove the 'active' class from all sidebar links
            domUtil('#sidebar a').removeClass('active');
            // Add the 'active' class to the currently clicked link
            domUtil(this).addClass('active');

            // Retrieve the target URL and HTTP method from the clicked link's attributes
            var targetPath = domUtil(this).attr('href');
            var chosenVerb = domUtil(this).data('requestmethod').toLowerCase() || 'get';

            // Populate the API URL and request method input fields
            domUtil('#apiurl').val(serviceRootURL + targetPath);
            domUtil('#requestmethod').val(chosenVerb.toUpperCase());

            // If not suppressed, push the current state to the browser's history
            !suppressHistory && history.pushState({
                'destinationRef': targetPath,
                'verb': chosenVerb
            }, 'accessed ' + targetPath, '#' + chosenVerb + '|' + targetPath);

            // Invoke the API request function with the gathered parameters
            performRequest(serviceRootURL + targetPath, chosenVerb, domUtil(this).data('extradata') || {});
        }
    }); // End of sidebar click event listener

    // Bind event handler for form submissions
    domUtil('form').on('submit', function(eventObject, suppressHistory) {
        eventObject.preventDefault(); // Halt the default form submission behavior
        // Verify that the entered API URL starts with the allowed base URL
        if (domUtil('#apiurl').val().indexOf(serviceRootURL) === 0) {
            // Extract the relative path and HTTP method from the form fields
            var targetPath = domUtil('#apiurl').val().replace(serviceRootURL, '');
            var verb = domUtil('#requestmethod').val().toLowerCase();

            // Reset active states for sidebar links and activate the relevant one
            domUtil('#sidebar a').removeClass('active');
            domUtil('#sidebar a[href="' + targetPath + '"][data-requestmethod="' + verb + '"]').addClass('active');

            // Conditionally update the browser's history
            !suppressHistory && history.pushState({
                'destinationRef': targetPath,
                'verb': verb
            }, 'accessed ' + targetPath, '#' + verb + '|' + targetPath);

            // Execute the API request using the form's method
            performRequest(serviceRootURL + targetPath, domUtil('#requestmethod').val());
        } else {
            // Display an alert if the URL is not permitted
            alert('You are only permitted to make calls to ' + serviceRootURL);
        }
    }); // End of form submit event listener

    // Listen for browser history state changes (back/forward button)
    domUtil(window).on('popstate', function(eventObject) {
        eventObject.preventDefault(); // Prevent default popstate handling
        domUtil('#sidebar a').removeClass('active'); // Clear all active sidebar links

        // Check if a valid history state object with a destination reference exists
        if (eventObject.originalEvent.state && eventObject.originalEvent.state.destinationRef) {
            // Populate the form fields with data from the history state
            domUtil('#apiurl').val(serviceRootURL + eventObject.originalEvent.state.destinationRef);
            domUtil('#requestmethod').val(eventObject.originalEvent.state.verb.toUpperCase());
            domUtil('form').trigger('submit', true); // Trigger form submission, preventing new history entry
        }
        // If no relevant history state, do nothing (e.g., initial page load without state)
        else {
            return;
        }
    }); // End of popstate event listener

    // Logic to be executed when the page finishes loading
    // If the URL contains a hash fragment with method and URL components
    if (window.location.hash && (window.location.hash.indexOf('|') > -1)) {
        // Parse the HTTP method and target URL from the hash
        var verb = window.location.hash.substring(1).split('|')[0].toLowerCase();
        var targetPath = window.location.hash.substring(1).split('|')[1];

        // Pre-fill the form inputs with the extracted values
        domUtil('#apiurl').val(serviceRootURL + targetPath);
        domUtil('#requestmethod').val(verb.toUpperCase());
        domUtil('form').trigger('submit', true); // Submit the form, suppressing history update
    }
    // If no hash fragment is present, simulate a click on the first sidebar link
    else {
        domUtil('#sidebar a:first').addClass('active').trigger('click', true);
    }
}); // End of DOM ready block