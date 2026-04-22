angular.module(
    'accountProvisionerModule',
    [
        'coreUtilities',          // Core utility functions for the application
        'securityTokenInterceptor', // Interceptor for handling CSRF tokens securely
        'dataGridComponents'      // Reusable components for displaying data in grids
    ]
)
.controller(
    'AccountCreationController',
    [
        '$context',   // Renamed from $scope, provides the controller's execution context
        '$webService', // Renamed from $http, handles HTTP communication
        function (ctx, webSvc) { // Injected services mapped to local variables

            // Defines the function to initiate the account provisioning process
            ctx.provisionAccount = function () {
                // Log an informative message about the pending account creation
                console.info('Initiating account setup for: ' + ctx.viewModel.accountName + '. Password will be encrypted server-side.');

                // Mark the form as submitted, which can trigger validation UI updates
                ctx.viewModel.formSubmitted = true;

                // Check if the current registration form contains any invalid fields
                if (ctx.registrationForm.$invalid) {
                    console.warn('Account creation halted due to invalid input fields.');
                    return; // Abort the submission if the form data is not valid
                }

                // Construct the data payload for the server request
                var submissionPayload = {
                    accountName: ctx.viewModel.accountName,       // The desired name for the new account
                    rawPassword: ctx.viewModel.secretKey,         // The plain text password provided by the user
                    contactEmail: ctx.viewModel.contactEmail      // The user's associated email address
                };

                // Execute the web service call to create the new account
                webSvc({
                    requestMethod: 'POST', // Specifies the HTTP method as POST
                    endpoint: '/accounts', // The API endpoint for account creation
                    payload: submissionPayload, // The data to be sent in the request body
                    requestHeaders: {
                        "Content-Type": "application/json", // Indicate that the request body is JSON
                        "Accept": "text/plain"             // Specify that a plain text response is acceptable
                    }
                })
                .then(function (serverReply) { // Callback function executed upon successful response from the server
                    // Evaluate the HTTP status code of the server's reply
                    if (serverReply.status === 200) {
                        console.log('Account for ' + ctx.viewModel.accountName + ' successfully established. Attempting automatic user authentication.');
                        // If account creation is successful, proceed with user authentication
                        ctx.authenticateUser(ctx.viewModel.accountName, ctx.viewModel.secretKey);
                    } else {
                        // Log an error message if account creation failed
                        console.error("Account establishment failed: " + serverReply.details);
                        // Initialize or clear the list of validation errors
                        ctx.viewModel.validationErrors = [];
                        // Add the server's error description to the view model for display
                        ctx.viewModel.validationErrors.push({issueDescription: serverReply.details});
                    }
                }); // End of the .then() promise chain
            }; // End of provisionAccount function definition
        }
    ]
); // End of controller and module configuration