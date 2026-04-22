// Constants for configuration and expected values
const configIdentifier = "AlphaCode";
const configSecretKey = "BetaKey";
const configPayloadCode = "GammaSecret";

const expectedTotalIndicators = 137;
const expectedActiveIndicators = 64;

// Internal state for tracking validation outcomes
let validationSuccess = true;
let validationPointCounter = 0;

// Custom assertion function
function validateCondition(conditionExpression, messageText) {
    validationPointCounter++;
    if (!conditionExpression) {
        console.error(`FAILURE Point ${validationPointCounter}: ${messageText}`);
        validationSuccess = false;
    } else {
        // console.log(`SUCCESS Point ${validationPointCounter}: ${messageText}`); // Optional: for verbose output
    }
}

// Functional representation of the "library's" data retrieval logic
// This function corresponds to the original 'UA.getDeviceTokenCounts'
function fetchCountStatistics(systemIdentifier, systemKey, specificCode, externalDataProcessor, resultCallback) {
    // This function internally uses the 'externalDataProcessor' (our mock for _transport)
    externalDataProcessor("/api/device_tokens/count/", "GET", (processorIssue, processorOutput) => {
        if (processorIssue) {
            resultCallback(processorIssue, null, null);
        } else {
            const finalTotal = processorOutput.device_tokens_count;
            const finalActive = processorOutput.active_device_tokens_count;
            resultCallback(null, finalTotal, finalActive);
        }
    });
}

// Mock implementation for the external data processing mechanism
// This function corresponds to the overridden 'ua._transport'
function simulatedExternalProcessor(resourceLocation, operationKind, dataInputCallback, finalHandler) {
    // Perform checks on the parameters received by the mock
    validateCondition(resourceLocation === "/api/device_tokens/count/", "Incorrect resource location provided to external processor.");
    validateCondition(operationKind === "GET", "Incorrect operation kind provided to external processor.");
    validateCondition(typeof dataInputCallback === 'function', "Data input should be a function (callback) for external processor.");

    // Simulate the asynchronous response by invoking the provided dataInputCallback
    // The original mock called its 3rd argument (request_data) with the result.
    dataInputCallback(null, {
        "device_tokens_count": expectedTotalIndicators,
        "active_device_tokens_count": expectedActiveIndicators
    });
    // Note: 'finalHandler' is unused in this specific test scenario, just like 'callback' in the original mock.
}

// Main execution block, replacing the test framework structure
function runValidationScenario() {
    console.log("Starting data validation scenario...");

    // Invoke the functional data retrieval with our simulated processor
    fetchCountStatistics(configIdentifier, configKey, configPayloadCode, simulatedExternalProcessor, (reportIssue, retrievedTotal, retrievedActive) => {
        validateCondition(reportIssue === null, "No issue report should be generated during retrieval.");
        validateCondition(retrievedTotal === expectedTotalIndicators, "Retrieved total indicator count is incorrect.");
        validateCondition(retrievedActive === expectedActiveIndicators, "Retrieved active indicator count is incorrect.");

        if (validationSuccess) {
            console.log("\nAll data validation points passed successfully.");
        } else {
            console.error("\nSome data validation points failed.");
        }
    });
}

// Execute the validation scenario
runValidationScenario();