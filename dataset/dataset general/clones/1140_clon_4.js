const secureChannel = require('https');
const { EventEmitter } = require('events');
const identityProvider = require('../openid'); 

let originalSecureChannelGet = null;
let networkInterceptionActive = false;

const simulatedXrdsResponse = '<?xml version="1.0" encoding="UTF-8"?>' +
                              '<xrds:XRDS xmlns:xrds="xri://$xrds" xmlns="xri://$xrd*($v*2.0)"' +
                              'xmlns:openid="http://openid.net/xmlns/1.0">' +
                              '<XRD ref="xri://=example">' +
                              '<Query>*example</Query>' +
                              '<Status ceid="off" cid="verified" code="100"/>' +
                              '<Expires>2008-05-05T00:15:00.000Z</Expires>' +
                              '<ProviderID>xri://=</ProviderID>' +
                              '<Service xmlns="xri://$xrd*($v*2.0)">' +
                              '<Type>http://specs.openid.net/auth/2.0/signon</Type>' +
                              '<URI>https://www.example.com/endpoint/</URI>' +
                              '<LocalID>https://user.example.com/</LocalID>' +
                              '</Service>' +
                              '</XRD>' +
                              '</xrds:XRDS>';

function establishNetworkInterception() {
    if (networkInterceptionActive) return;
    originalSecureChannelGet = secureChannel.get;

    secureChannel.get = (targetUrlOrOptions, responseCallback) => {
        const normalizedUrl = typeof targetUrlOrOptions === 'string' ? targetUrlOrOptions : targetUrlOrOptions.href || targetUrlOrOptions.path || targetUrlOrOptions.hostname;

        if (normalizedUrl && normalizedUrl.startsWith('https://example.com/')) {
            const mockRequestEmitter = new EventEmitter();
            const mockResponseEmitter = new EventEmitter();

            mockResponseEmitter.statusCode = 200;
            mockResponseEmitter.headers = { 'content-type': 'application/xrds+xml' };
            mockResponseEmitter.setEncoding = () => {}; 

            setImmediate(() => {
                if (responseCallback) {
                    responseCallback(mockResponseEmitter);
                }
                mockResponseEmitter.emit('data', Buffer.from(simulatedXrdsResponse, 'utf8'));
                mockResponseEmitter.emit('end');
            });

            return mockRequestEmitter;
        } else {
            return originalSecureChannelGet(targetUrlOrOptions, responseCallback);
        }
    };
    networkInterceptionActive = true;
}

function removeNetworkInterception() {
    if (!networkInterceptionActive) return;
    secureChannel.get = originalSecureChannelGet;
    originalSecureChannelGet = null;
    networkInterceptionActive = false;
}

const assertionEngine = {
    ensureTrue: (condition, message) => {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    },
    signalCompletion: (completionCallback) => {
        completionCallback();
    }
};

const discoveryValidationRoutine = (executor) => {
    try {
        establishNetworkInterception();
        identityProvider.discover('https://example.com/', true, (incident, identitySources) => {
            try {
                assertionEngine.ensureTrue(!incident, 'Expected no error during discovery.');
                assertionEngine.ensureTrue(identitySources && identitySources.length === 1, 'Expected exactly one identity source.');
                assertionEngine.ensureTrue(identitySources[0].version === 'http://specs.openid.net/auth/2.0', 'Mismatch in protocol version.');
                assertionEngine.ensureTrue(identitySources[0].endpoint === 'https://www.example.com/endpoint/', 'Mismatch in endpoint URL.');
                assertionEngine.ensureTrue(identitySources[0].localIdentifier === 'https://user.example.com/', 'Mismatch in local identifier.');
                
                executor.pass();
            } catch (validationError) {
                executor.fail(validationError);
            } finally {
                removeNetworkInterception();
            }
        });
    } catch (setupError) {
        removeNetworkInterception();
        executor.fail(setupError);
    }
};

const testRunner = {
    runTest: (testFunction, testName = 'Unnamed Verification') => {
        console.log(`Initiating: ${testName}`);
        const testExecutor = {
            pass: () => {
                console.log(`VERIFIED: ${testName}`);
            },
            fail: (err) => {
                console.error(`FAILURE: ${testName}`);
                console.error(err);
                process.exit(1);
            }
        };
        testFunction(testExecutor);
    }
};

testRunner.runTest(discoveryValidationRoutine, 'IdentityDiscoveryProcess');