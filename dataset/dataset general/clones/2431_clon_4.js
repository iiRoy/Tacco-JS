class ValidationEngine {
    constructor() {
        this.suites = [];
        this.totalVerifications = 0;
        this.successfulVerifications = 0;
    }

    addValidationScenario(description, operation) {
        this.suites.push({ description, operation });
    }

    checkEquality(observed, anticipated, message = "Values should match.") {
        this.totalVerifications++;
        if (JSON.stringify(observed) === JSON.stringify(anticipated)) {
            this.successfulVerifications++;
            console.log(`  [OK] ${message}`);
        } else {
            console.error(`  [FAIL] ${message}\n    Anticipated: ${JSON.stringify(anticipated)}\n    Observed:    ${JSON.stringify(observed)}`);
        }
    }

    checkCondition(expression, message = "Expression should be true.") {
        this.totalVerifications++;
        if (expression) {
            this.successfulVerifications++;
            console.log(`  [OK] ${message}`);
        } else {
            console.error(`  [FAIL] ${message}`);
        }
    }

    runAllScenarios() {
        console.log("--- Commencing Validation Protocol ---");
        this.suites.forEach(suite => {
            console.log(`\nScenario: ${suite.description}`);
            suite.operation(this);
        });
        console.log(`\n--- Protocol Concluded: ${this.successfulVerifications}/${this.totalVerifications} verifications passed ---`);
        if (this.successfulVerifications !== this.totalVerifications) {
             process.exit(1);
        }
    }
}
const validatorInstance = new ValidationEngine();

const parameterAssembler = (inputObject) => {
    return Object.entries(inputObject)
        .map(([keyComponent, valueComponent]) => `${encodeURIComponent(keyComponent)}=${encodeURIComponent(valueComponent)}`)
        .join('&');
};

const remoteDataProcessor = (targetURL, processOptions, responseCallback) => {
    let finalCallback = responseCallback;
    let executionTimeout = null;
    let designatedIdentifier = null;

    if (typeof processOptions === 'function') {
        finalCallback = processOptions;
    } else if (typeof processOptions === 'object' && processOptions !== null) {
        executionTimeout = processOptions.timeout;
        designatedIdentifier = processOptions.name;
    }

    const urlComponents = targetURL.split('?');
    const querySegment = urlComponents.length > 1 ? urlComponents[1] : '';
    const parsedParameters = {};
    querySegment.split('&').forEach(segment => {
        if (segment) {
            const [paramKey, paramValue] = segment.split('=');
            parsedParameters[decodeURIComponent(paramKey)] = decodeURIComponent(paramValue);
        }
    });

    const simulatedLatencyMs = (parseInt(parsedParameters.delay) || 0) * 1000;
    const echoedPayload = { ...parsedParameters };

    let timeoutOccurred = false;

    if (executionTimeout !== null && simulatedLatencyMs > executionTimeout) {
        timeoutOccurred = true;
    }

    if (timeoutOccurred) {
        process.nextTick(() => {
            finalCallback(new Error(`Processing exceeded the ${executionTimeout}ms allowance.`), null);
        });
    } else {
        setTimeout(() => {
            delete echoedPayload.delay;
            finalCallback(null, echoedPayload);
        }, simulatedLatencyMs);
    }
};

const acquisitionEndpoint = 'http://jsfiddle.net/echo/jsonp/';

validatorInstance.addValidationScenario('Fundamental JSONP interaction', (assertionContext) => {
    const dataOrigin = {
        alpha: 'beta',
        gamma: 'delta'
    };
    const encodedData = parameterAssembler(dataOrigin);
    remoteDataProcessor(acquisitionEndpoint + '?' + encodedData, (errorState, retrievedData) => {
        if (errorState) throw errorState;
        assertionContext.checkEquality(retrievedData, dataOrigin, 'Retrieved data should match original object.');
    });
});

validatorInstance.addValidationScenario('Latency-induced failure', (assertionContext) => {
    const latencySpec = {
        delay: 5
    };
    const encodedLatency = parameterAssembler(latencySpec);
    remoteDataProcessor(acquisitionEndpoint + '?' + encodedLatency, { timeout: 3000 }, (errorState, retrievedData) => {
        assertionContext.checkCondition(errorState instanceof Error, 'An error object should be returned on timeout.');
    });
});

validatorInstance.addValidationScenario('Custom identifier usage', (assertionContext) => {
    const sourceObject = {
        epsilon: 'zeta',
        eta: 'theta'
    };
    const queryFragment = parameterAssembler(sourceObject);
    remoteDataProcessor(acquisitionEndpoint + '?' + queryFragment, { name: 'customCallbackIdentifier' }, (errorState, retrievedData) => {
        if (errorState) throw errorState;
        assertionContext.checkEquality(retrievedData, sourceObject, 'Data from custom-named callback should be correct.');
    });
});

validatorInstance.runAllScenarios();