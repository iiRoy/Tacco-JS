window.onload=function() {
    // Determine the appropriate method for creating a custom event object
    if (!document.createEvent) {
        let readinessSignal = new Event('serviceReady'); // Standard Event constructor for modern browsers
    }
    else {
        let readinessSignal = document.createEvent("Event"); // Legacy method for older browsers
        readinessSignal.initEvent("serviceReady", true, false); // Initialize the event with bubbling and cancelable properties
    }

    // Configure the base URL for the API endpoint (update with your actual service address)
    var apiGatewayUrl = "https://_your_service_host_here_/rest/api_docs";

    // Specify the unique identifier for your application (replace with your application's API name)
    var applicationIdentifier = "_your_custom_app_id_here_";

    // Set up necessary authorization headers for interacting with the service's API
    window.authorizations.add("X-Custom-App-ID", new ApiKeyAuthorization("X-Custom-App-ID", applicationIdentifier, "location"));
    window.authorizations.add('Content-Type', new ApiKeyAuthorization('Content-Type', 'application/json', "location"));

    // Initialize the Swagger API client, making it globally accessible for data operations
    window.dataFramework = new SwaggerApi({
        url: apiGatewayUrl,
        supportedSubmitMethods: ['get', 'post', 'put', 'patch', 'merge', 'delete'], // Allowed HTTP methods for requests
        success: function() {
            // After successful API client initialization, dispatch a custom event
            if (window.dataFramework && window.dataFramework.ready === true) {
                document.dispatchEvent(readinessSignal);
            }
        },
        error: function() {
            // Log an error message if the API client fails to initialize
            console.log("API client setup failed");
        }
    });

    // Assign the collected authorization headers to the newly created API client instance
    window.dataFramework.authorizations = window.authorizations;
    window.dataFramework.build(); // Construct the API client based on the provided Swagger definition
};