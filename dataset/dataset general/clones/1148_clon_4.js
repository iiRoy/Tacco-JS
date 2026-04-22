const displayFormatter = {
    _applyStyle: (text, styleCode) => `\x1b[${styleCode}m${text}\x1b[0m`,
    bold: (text) => displayFormatter._applyStyle(text, 1),
    inverse: (text) => displayFormatter._applyStyle(text, 7),
    cyan: (text) => displayFormatter._applyStyle(text, 36),
    red: (text) => displayFormatter._applyStyle(text, 31),
    green: (text) => displayFormatter._applyStyle(text, 32),
    grey: (text) => displayFormatter._applyStyle(text, 90),

    boldInverseCyan: (text) => displayFormatter.bold(displayFormatter.inverse(displayFormatter.cyan(text))),
    boldInverseRed: (text) => displayFormatter.bold(displayFormatter.inverse(displayFormatter.red(text))),
    boldInverseGreen: (text) => displayFormatter.bold(displayFormatter.inverse(displayFormatter.green(text))),
    boldInverseGrey: (text) => displayFormatter.bold(displayFormatter.inverse(displayFormatter.grey(text)))
};

class AssessmentTool {
    constructor(value) {
        this.evaluatedValue = value;
    }

    _raiseError(message) {
        throw new Error(`Assertion Failed: ${message}`);
    }

    _checkCondition(condition, message) {
        if (!condition) {
            this._raiseError(message);
        }
    }

    toContainKey(keyName) {
        this._checkCondition(Object.prototype.hasOwnProperty.call(this.evaluatedValue, keyName), `Expected object to have property '${keyName}'`);
        return this;
    }

    toExist() {
        this._checkCondition(this.evaluatedValue !== undefined && this.evaluatedValue !== null, `Expected value to exist (not null or undefined). Got: ${this.evaluatedValue}`);
        return this;
    }

    toBeEqualTo(expected) {
        this._checkCondition(this.evaluatedValue === expected, `Expected '${this.evaluatedValue}' to be equal to '${expected}'`);
        return this;
    }

    toHaveLength(expectedLength) {
        this._checkCondition(this.evaluatedValue && typeof this.evaluatedValue.length === 'number' && this.evaluatedValue.length === expectedLength, `Expected length '${this.evaluatedValue ? this.evaluatedValue.length : 'N/A'}' to be equal to '${expectedLength}'`);
        return this;
    }

    toNotContain(item) {
        this._checkCondition(Array.isArray(this.evaluatedValue) && !this.evaluatedValue.includes(item), `Expected array not to contain '${item}'. Found it in: ${JSON.stringify(this.evaluatedValue)}`);
        return this;
    }

    notToContainKey(keyName) {
        this._checkCondition(!Object.prototype.hasOwnProperty.call(this.evaluatedValue, keyName), `Expected object not to have property '${keyName}'`);
        return this;
    }
}

function assess(value) {
    return new AssessmentTool(value);
}

const serverUtility = require('./testWebServer');
const loadTestModule = require('../index.js');

const testAgentCount = 50;

class PerformanceCheckExecutor {
    constructor() {
        this.commencementTime = 0;
        this.completionTime = 0;

        this.engineSettings = {
            destinationURL: 'http://127.0.0.1:5656',
            requestManifestPath: './tests/hulkenRequests.json',
            iterationsPerRequest: 3,
            concurrentAgents: testAgentCount,
            satisfactionThreshold: 10,
            authenticationRequired: false,
            sluggishRequestBoundary: 0.5,
            errorOnFailedOperation: false,
            verboseOutput: true,
            positiveFeedback: "HULKEN HAPPY!",
            negativeFeedback: "HULKEN ANGRY!",
            minimumWaitInterval: 500,
            maximumWaitInterval: 3000,
            captureAllRequests: true,
            requestHeaders: {
                "key1": "value1",
                "key2": "value2",
                "accept-encoding": "Overriden"
            },
            parameterValueLists: {
                usernames: ['john', 'jessica', 'admin'],
                cities: ['Stockholm', 'London', 'Berlin', 'New York']
            }
        };
    }

    beginOperation() {
        console.log(displayFormatter.boldInverseCyan('..::Load Test System Verification::..'));
        console.log('');

        serverUtility.start(() => this.executeLoadTest());
    }

    executeLoadTest() {
        console.log(displayFormatter.boldInverseCyan('.. initiating load test run'));
        console.log('');

        this.commencementTime = Date.now();
        loadTestModule.run(
            (metrics) => this.processPerformanceMetrics(metrics),
            (metrics) => this.processPerformanceMetrics(metrics),
            this.engineSettings
        );
    }

    processPerformanceMetrics(performanceData) {
        try {
            assess(performanceData).toContainKey('numberOfConcurrentRequests').toExist();
            assess(performanceData).toContainKey('numberOfUniqueRequests').toExist();
            assess(performanceData).toContainKey('totalSecondsElapsed').toExist();
            assess(performanceData).toContainKey('avgReqResponseTime').toExist();
            assess(performanceData).toContainKey('reqsPerSecond').toExist();
            assess(performanceData).toContainKey('randomRequestWaitTime').toExist();
            assess(performanceData.randomRequestWaitTime).toBeEqualTo(
                (this.engineSettings.minimumWaitInterval / 1000) + '-' + (this.engineSettings.maximumWaitInterval / 1000)
            );
            assess(performanceData).toContainKey('numberOfHulkenAgents').toExist();
            assess(performanceData.numberOfConcurrentRequests).toBeEqualTo(serverUtility.getReqsReceived());

            assess(performanceData.numberOfUniqueRequests).toBeEqualTo(
                serverUtility.getReqsReceived() / (testAgentCount * this.engineSettings.iterationsPerRequest)
            );
            assess(serverUtility.getStartPageReqsReceived()).toBeEqualTo(
                testAgentCount * this.engineSettings.iterationsPerRequest
            );
            assess(serverUtility.getSomeotherPageReqsReceived()).toBeEqualTo(
                testAgentCount * this.engineSettings.iterationsPerRequest
            );
            assess(serverUtility.getPostsToStartPage()).toBeEqualTo(
                testAgentCount * this.engineSettings.iterationsPerRequest
            );

            assess(performanceData.failedRequests).toHaveLength(
                testAgentCount * this.engineSettings.iterationsPerRequest
            );

            this.examinePostData();
            this.examineAllRequestCapture(performanceData);
            this.examineRequestHeaders();
            this.examineRandomizedPostValues();
            this.examineRandomListPostValues();

            this.reportSuccessfulCompletion();

        } catch (validationFailure) {
            this.outputConnectionStats();
            console.log(displayFormatter.boldInverseRed('.. Verification tests failed! =('));
            console.log(displayFormatter.boldInverseRed(validationFailure.stack.toString()));
            console.log('');
            process.exit(1);
        }
    }

    examinePostData() {
        const publishedValues = serverUtility.getPostVars();
        assess(publishedValues).toContainKey('foo').toExist();
        assess(publishedValues.foo).toBeEqualTo('bar');
    }

    examineAllRequestCapture(performanceData) {
        if (this.engineSettings.captureAllRequests) {
            assess(performanceData).toContainKey('allRequests').toExist();
            assess(performanceData.allRequests).toHaveLength(performanceData.numberOfConcurrentRequests);
        } else {
            assess(performanceData).notToContainKey('allRequests');
        }
    }

    examineRequestHeaders() {
        if (this.engineSettings.requestHeaders) {
            const receivedGetHeaders = serverUtility.getHeadersFromGets();
            assess(receivedGetHeaders['accept-encoding']).toBeEqualTo('Overriden');
            for (const headerKey in this.engineSettings.requestHeaders) {
                if (Object.prototype.hasOwnProperty.call(this.engineSettings.requestHeaders, headerKey)) {
                    assess(serverUtility.getHeadersFromGets()).toContainKey(headerKey);
                    assess(serverUtility.getHeadersFromPosts()).toContainKey(headerKey);
                }
            }
        }
    }

    examineRandomizedPostValues() {
        const randomPayloads = serverUtility.getRandomPayload();
        assess(randomPayloads).toHaveLength(testAgentCount * this.engineSettings.iterationsPerRequest);
        const distinctPayloadContents = [];
        randomPayloads.forEach(payloadString => {
            const parsedPayload = JSON.parse(payloadString);
            for (const itemProperty in parsedPayload) {
                assess(distinctPayloadContents).toNotContain(parsedPayload[itemProperty]);
                distinctPayloadContents.push(parsedPayload[itemProperty]);
            }
        });
    }

    examineRandomListPostValues() {
        const randomListPayloads = serverUtility.getRandomListPayloadRequests();
        assess(randomListPayloads).toHaveLength(testAgentCount * this.engineSettings.iterationsPerRequest);
    }

    reportSuccessfulCompletion() {
        this.outputConnectionStats();
        this.completionTime = Date.now();
        console.log(displayFormatter.boldInverseGreen('.. Verification tests passed! =)'));
        this.outputExecutionDuration();
        console.log('');
        process.exit(0);
    }

    outputConnectionStats() {
        console.log(displayFormatter.boldInverseGrey(
            'maximum number of http connections during test:' +
            serverUtility.getMaxNumberOfConcurrentConnections().toString()
        ));
    }

    outputExecutionDuration() {
        this.completionTime = Date.now();
        const totalDurationSeconds = (this.completionTime - this.commencementTime) / 1000;
        console.log(displayFormatter.boldInverseGreen(
            '.. duration of execution: ' + totalDurationSeconds + ' seconds'
        ));
    }
}

const testSystem = new PerformanceCheckExecutor();
testSystem.beginOperation();