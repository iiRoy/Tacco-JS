angular.module(
    'newUserApp', /* The main module for the new user application */
    [
        'common',                               /* Common utilities and services */
        'spring-security-csrf-token-interceptor', /* Interceptor for CSRF token handling */
        'editableTableWidgets'                  /* Widgets for editable tables (if used elsewhere) */
    ]
)
    /*
     * Controller definition for managing new user creation.
     * It relies on Angular's $scope for data binding and $http for API communication.
     */
    .controller(
        'NewUserCtrl',
        [
            '$scope', // The scope object for the controller
            '$http',  // The HTTP service for making requests
            function (
                $scope, /* Injected $scope service */
                $http   /* Injected $http service */
            ) {

                /*
                 * Function to handle the user creation process.
                 * This method is typically invoked when the user submits the new user form.
                 */
                $scope.createUser = function()
                {
                    // Log the details of the user being created for debugging purposes.
                    // This includes the username and password provided by the user.
                    console.log(
                        'Creating user with username ' +
                        $scope.vm.username +
                        ' and password ' +
                        $scope.vm.password
                    );

                    // Set a flag to indicate that the form has been submitted.
                    // This can be used by the UI to show validation messages.
                    $scope.vm.submitted = true;

                    // Check if the form is in an invalid state according to its validation rules.
                    // If the form is invalid, prevent the user creation request.
                    if (
                        $scope.form.$invalid
                    )
                    {
                        // Exit the function early if validation fails.
                        return;
                    }

                    // Prepare the data object to be sent as the request payload.
                    // It includes the username, plain text password, and email.
                    var postData =
                        {
                            username:          $scope.vm.username,        // The username for the new account
                            plainTextPassword: $scope.vm.password,         // The password for the new account
                            email:             $scope.vm.email            // The email address for the new account
                        };

                    // Execute an HTTP POST request to the user creation endpoint.
                    $http(
                        {
                            method:  'POST',             // Specifies the HTTP method as POST
                            url:     '/user',            // The API endpoint for creating a user
                            data:    postData,           // The data payload constructed above
                            headers:                     // HTTP headers for the request
                                {
                                    "Content-Type": "application/json", // Indicates the request body is JSON
                                    "Accept":       "text/plain"        // Specifies the expected response type
                                }
                        }
                    )
                        // Handle the promise returned by the $http service.
                        // This block executes upon successful or failed API response.
                        .then(
                            function (response)
                            {
                                // Check the HTTP status code of the response.
                                // A status of 200 typically indicates success.
                                if (
                                    response.status == 200
                                )
                                {
                                    // If user creation is successful, attempt to log the user in immediately.
                                    // Note: $scope.vm.userName (capital N) should ideally be $scope.vm.username.
                                    // However, for a Type I clone, this must remain unchanged.
                                    $scope.login(
                                        $scope.vm.userName, // Username to be used for login
                                        $scope.vm.password  // Password to be used for login
                                    );
                                }
                                else // Handle cases where user creation failed (non-200 status).
                                {
                                    // Initialize an array to store error messages for display.
                                    $scope.vm.errorMessages = [];
                                    // Add the error description received from the server to the messages.
                                    $scope.vm.errorMessages.push(
                                        {
                                            description: response.data // The error message from the backend
                                        }
                                    );
                                    // Log the failure details for debugging and troubleshooting.
                                    console.log(
                                        "failed user creation: " +
                                        response.data
                                    );
                                }
                            }
                        );
                } // End of createUser function definition

            } // End of NewUserCtrl controller function
        ]
    ); // End of angular.module chain