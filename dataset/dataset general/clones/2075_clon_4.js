// --- Custom Test Runner Core ---

let currentTestContextLabel = '';
let preTestActions = [];
let executionOutcomes = [];

function defineTestContext(contextLabel, contextFunction) {
    currentTestContextLabel = contextLabel;
    preTestActions = [];
    contextFunction();
    // A simple reporting mechanism for the custom runner
    console.log(`--- Test Context: ${contextLabel} ---`);
    executionOutcomes.forEach(result => console.log(result));
    executionOutcomes = []; // Clear for next context
}

function beforeEachOperation(actionFunction) {
    preTestActions.push(actionFunction);
}

function executePreTestActions() {
    preTestActions.forEach(op => op());
}

function defineTestScenario(scenarioLabel, scenarioFunction) {
    try {
        executePreTestActions();
        scenarioFunction();
        executionOutcomes.push(`✅ ${currentTestContextLabel} - ${scenarioLabel}`);
    } catch (error) {
        executionOutcomes.push(`❌ ${currentTestContextLabel} - ${scenarioLabel}\n   Error: ${error.message}`);
    }
}

// --- Custom Assertion Utility ---

function verifyOutcome(actualValue) {
    return {
        isIdenticalTo: function(expectedValue) {
            // Simple deep comparison for primitive types, arrays, and plain objects
            if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
                throw new Error(`Assertion failed: Expected ${JSON.stringify(actualValue)} to be identical to ${JSON.stringify(expectedValue)}`);
            }
        },
        isExecutable: function() {
            if (typeof actualValue !== 'function') {
                throw new Error(`Assertion failed: Expected value ${actualValue} to be an executable function`);
            }
        }
    };
}

// --- Custom HTTP Request Simulation (replacing $httpBackend) ---

let anticipatedRequests = [];
let activeRequests = [];

function createRequestSimulator() {
    let simulator = {
        expectGetRequest: function(resourcePath) {
            let pendingResponseConfig = { path: resourcePath };
            anticipatedRequests.push(pendingResponseConfig);
            return {
                respondWithData: function(dataPayload) {
                    pendingResponseConfig.responseContent = { data: dataPayload, status: 200 };
                }
            };
        },
        initiateGetRequest: function(path, completionCallback) {
            activeRequests.push({ path: path, callback: completionCallback });
        },
        processQueue: function() {
            activeRequests.forEach(currentReq => {
                let matchingAnticipated = anticipatedRequests.find(ant => ant.path === currentReq.path);
                if (matchingAnticipated && matchingAnticipated.responseContent) {
                    currentReq.callback(matchingAnticipated.responseContent);
                } else {
                    throw new Error(`Request simulation error: No response configured for GET ${currentReq.path}`);
                }
            });
            activeRequests = [];
            anticipatedRequests = []; // Clear configurations after processing
        }
    };
    return simulator;
}

// --- Custom Dependency Management (replacing Angular's module/inject) ---

let managedComponents = {};

function provisionComponents(componentMap) {
    // This function mimics the effect of Angular's `inject`
    // making services available to the test functions.
    Object.assign(managedComponents, componentMap);
}

// --- Reconstructed `dataService` (as `informationRepository`) ---
// This assumes the internal implementation of the original dataService based
// on how it's used in the test.

function createInformationRepository(httpClient) {
    return {
        retrieveLibraries: function(callbackFunction) {
            httpClient.initiateGetRequest('./data/libs.json', function(responseObject) {
                callbackFunction(responseObject);
            });
        }
    };
}

// --- The Type IV Cloned Test Suite ---

defineTestContext('Component: dataAccessManager', function () {

    // The original `beforeEach(module('htmlNow'))` is a setup for Angular's
    // module loading. In this clone, we directly manage the component instances.

    let libraryInfoRepository;
    let networkCommunicationMock;

    beforeEachOperation(function () {
        // This simulates `beforeEach(inject(function (_dataService_, $httpBackend) { ... }));`
        networkCommunicationMock = createRequestSimulator();
        libraryInfoRepository = createInformationRepository(networkCommunicationMock);

        provisionComponents({
            infoRepository: libraryInfoRepository,
            networkMock: networkCommunicationMock
        });
    });

    defineTestScenario('should expose a retrieveLibraries() method', function () {
        verifyOutcome(managedComponents.infoRepository.retrieveLibraries).isExecutable();
    });

    defineTestScenario('should correctly validate library version information', function () {

        let expectedPayload = [{
                "name": "jQuery v1",
                "url": "//cdn.jsdelivr.net/jquery/###/jquery.js",
                "version": "1.11.2",
                "type": "js"
            },
            {
                "name": "jQuery-migrate",
                "url": "//cdn.jsdelivr.net/jquery.migrate/###/jquery-migrate.js",
                "version": "1.2.1",
                "type": "js"
            },
            {
                "name": "jQuery v2",
                "url": "//cdn.jsdelivr.net/jquery/###/jquery.js",
                "version": "2.1.3",
                "type": "js"
            }
        ];

        managedComponents.networkMock.expectGetRequest('./data/libs.json').respondWithData(expectedPayload);

        let finalReceivedData;
        managedComponents.infoRepository.retrieveLibraries(function (responseObject) {
            finalReceivedData = responseObject;
        });

        managedComponents.networkMock.processQueue();

        verifyOutcome([
            finalReceivedData.data[0].version,
            finalReceivedData.data[1].version,
            finalReceivedData.data[2].version
        ]).isIdenticalTo([
            '1.11.2',
            '1.2.1',
            '2.1.3'
        ]);
    });
});