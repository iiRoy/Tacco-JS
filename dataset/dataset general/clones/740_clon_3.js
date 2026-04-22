// Comprehensive suite for validating core library functionalities
testGroup("System Module Verifications", function() {

    // Centralized configuration for test data and expected values.
    const TEST_CONFIGURATION = {
        API_IDENTIFIER: "app_id_alpha",
        AUTH_TOKEN: "master_secret_beta",
        APP_ACCESS_SECRET: "app_secret_gamma",
        EXPECTED_TOTAL_DEVICES: 137,
        EXPECTED_ACTIVE_DEVICES: 64
    };

    // Import the subject under test and the assertion utility.
    const CoreModule = require("../lib/urban-airship"); // The library being tested.
    const assertUtility = require("assert"); // Node's built-in assertion module.

    scenario("Core API Request Handling", function() {
        // For all test cases within this block, the internal network communication
        // layer (`_transport`) is overridden. This allows us to verify the
        // library's request generation without hitting actual external APIs,
        // focusing solely on unit testing the library's logic.
        focusArea("Device Token Metrics Retrieval (`fetchTokenMetrics`)", function() {
            verifyBehavior("should accurately report the total and active device counts", function(testCompletionCallback) {
                // Instantiate the core library with predetermined security credentials.
                let moduleInstance = new CoreModule(
                    TEST_CONFIGURATION.API_IDENTIFIER,
                    TEST_CONFIGURATION.AUTH_TOKEN,
                    TEST_CONFIGURATION.APP_ACCESS_SECRET
                );

                // Define the anticipated API path and HTTP method for this operation.
                const TARGET_API_PATH = "/api/device_tokens/count/";
                const REQUEST_HTTP_METHOD = "GET";

                // Construct the mock response payload that the overridden transport
                // function will return.
                const simulatedApiResponse = {
                    "device_tokens_count": TEST_CONFIGURATION.EXPECTED_TOTAL_DEVICES,
                    "active_device_tokens_count": TEST_CONFIGURATION.EXPECTED_ACTIVE_DEVICES
                };

                // Override the internal `_transport` method to intercept calls and
                // provide mock responses.
                moduleInstance._transport = (targetPath, httpVerb, dataPayloadCallback, resultProcessor) => {
                    // Basic input validation for the mock transport.
                    if (typeof targetPath !== 'string' || typeof httpVerb !== 'string' || typeof dataPayloadCallback !== 'function') {
                        resultProcessor(new Error("Invalid parameters provided to mocked transport layer."));
                        return;
                    }

                    // Verify that the library constructs the request with the correct path.
                    assertUtility.strictEqual(targetPath, TARGET_API_PATH, "Mismatch in the requested API endpoint.");
                    // Verify that the library uses the correct HTTP method.
                    assertUtility.strictEqual(httpVerb, REQUEST_HTTP_METHOD, "Incorrect HTTP method employed for the request.");

                    // For this specific API call, no request body data is expected.
                    // The `dataPayloadCallback` here functions as the final callback
                    // to deliver the mock response.
                    dataPayloadCallback(null, simulatedApiResponse);
                };

                // Execute the library function under examination.
                moduleInstance.fetchTokenMetrics((operationError, actualTotalDevices, actualActiveDevices) => {
                    // If an error propagates from the library, the test should fail.
                    if (operationError) {
                        assertUtility.fail(`An unexpected error occurred during operation: ${operationError.message}`);
                        return; // Ensure testCompletionCallback is not called if fail() throws.
                    }

                    // Assert that the total device count returned by the library matches expectations.
                    assertUtility.strictEqual(actualTotalDevices, TEST_CONFIGURATION.EXPECTED_TOTAL_DEVICES, "The reported total device count is incorrect.");
                    // Assert that the active device count returned by the library matches expectations.
                    assertUtility.strictEqual(actualActiveDevices, TEST_CONFIGURATION.EXPECTED_ACTIVE_DEVICES, "The reported active device count is incorrect.");
                    
                    // Signal the asynchronous test completion.
                    testCompletionCallback();
                });
            });
        });
    });
});