angular.module('accountManagementModule', ['commonServices', 'securityInterceptor', 'uiWidgets'])
    .controller('AccountCreationController', ['$context', '$webClient', function ($context, $webClient)
    {
        // View model initialization and default values.
        // This ensures the view model exists and has necessary properties.
        $context.model = $context.model || {};
        $context.model.userIdentifier = '';
        $context.model.secretKey = '';
        $context.model.contactEmail = '';
        $context.model.formSubmitted = false; // Flag to indicate if the form has been submitted
        $context.model.isProcessing = false;  // Flag to show loading state during API calls
        $context.model.validationErrors = []; // Array to store server-side or custom validation messages

        // Helper function to clear all current validation messages.
        const resetValidationMessages = function() {
            $context.model.validationErrors = [];
        };

        // Function to initiate the new user account registration process.
        $context.registerAccount = function ()
        {
            // Log the start of the account creation attempt for debugging.
            console.info(`Initiating registration for new account: ${$context.model.userIdentifier || 'N/A'}`);

            // Set formSubmitted to true to enable client-side validation feedback to the user.
            $context.model.formSubmitted = true;
            resetValidationMessages(); // Clear any previous error messages before new submission.

            // Perform client-side form validation.
            // If the form is invalid based on Angular's validation, stop processing.
            if ($context.creationForm.$invalid) {
                $context.model.validationErrors.push({ messageText: 'Please review and correct the errors in the form fields.' });
                console.warn('Account registration aborted due to client-side input validation failures.');
                return; // Exit early if validation fails.
            }

            // Construct the data payload required by the server API.
            // Using different property names for the request object.
            const requestPayload = {
                userIdentifier: $context.model.userIdentifier,
                contactEmail: $context.model.contactEmail,
                rawCredential: $context.model.secretKey
            };

            // Additional guard clause: Check if critical payload data is present.
            if (!requestPayload.userIdentifier || !requestPayload.rawCredential) {
                $context.model.validationErrors.push({ messageText: 'Crucial account details (username or password) are missing from the request.' });
                console.error('Registration payload incomplete: Missing user identifier or credential.');
                return;
            }

            $context.model.isProcessing = true; // Set processing flag to true.

            // Execute the asynchronous HTTP POST request to the account creation endpoint.
            $webClient({
                httpMethod: 'POST', // Renamed 'method' to 'httpMethod'.
                resourcePath: '/api/v1/user-accounts', // Renamed 'url' to 'resourcePath' and updated endpoint.
                bodyContent: requestPayload, // Renamed 'data' to 'bodyContent'.
                requestHeaders: { // Renamed 'headers' to 'requestHeaders'.
                    "Content-Type": "application/json; charset=utf-8",
                    "Accept": "application/json" // Requesting JSON response.
                }
            })
            .then(function (serverResponse) { // Renamed 'response' to 'serverResponse'.
                // Check if the server responded with a successful status code (2xx range).
                if (serverResponse.status >= 200 && serverResponse.status < 300) {
                    console.log('User account successfully created. Attempting automatic login...');
                    // Upon successful creation, attempt to authenticate the newly created user.
                    $context.authenticateUser($context.model.userIdentifier, $context.model.secretKey);
                }
                else
                {
                    // Handle non-2xx HTTP responses (server-side errors).
                    resetValidationMessages(); // Clear previous messages before showing new errors.
                    const serverErrorMessage = (serverResponse.data && serverResponse.data.message)
                                               ? serverResponse.data.message
                                               : `Server error occurred with status: ${serverResponse.status}`;
                    $context.model.validationErrors.push({ messageText: serverErrorMessage });
                    console.error(`Account creation failed: ${serverErrorMessage} (HTTP Status: ${serverResponse.status})`);
                }
            })
            .catch(function(requestError) { // Added a specific catch block for network or request failures.
                resetValidationMessages();
                const networkIssue = requestError.statusText || 'A network error occurred. Please verify your internet connection.';
                $context.model.validationErrors.push({ messageText: `Request failed: ${networkIssue}` });
                console.error('HTTP request encountered an error:', requestError);
            })
            .finally(function() { // Always execute this block, regardless of success or failure.
                $context.model.isProcessing = false; // Reset processing flag.
                console.debug('Account registration process completed.');
            });
        };

        // Placeholder function for user authentication after successful registration.
        // In a full application, this would typically redirect or set a session.
        $context.authenticateUser = function (identifier, credential) {
            console.log(`Initiating mock authentication for user: ${identifier}`);
            // This would normally involve another service call or a redirect.
            // For cloning purposes, we simulate success.
            $context.model.isAuthenticated = true; // Example: update a global state.
            console.info(`User "${identifier}" has been mock-authenticated.`);
            // Example: window.location.href = '/app/dashboard';
        };

        // Initialization logic for the controller.
        $context.initializeController = function() {
            console.log('AccountCreationController has been initialized.');
            // Any setup or data loading on controller instantiation can go here.
        };

        // Call the initialization function when the controller loads.
        $context.initializeController();
    }]);