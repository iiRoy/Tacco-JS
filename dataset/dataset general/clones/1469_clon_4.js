// Store original JSONCache dependencies and settings before any potential modifications by the test suite.
const initialAttemptCount = window.JSONCache.settings.numTries;
const initialDelayValue = window.JSONCache.settings.waitTime;
const originalDataFetcher = window.JSONCache._getJSONProxy;
const originalTimestampProvider = window.JSONCache._getTime;
const originalAttemptProcessor = window.JSONCache._tryGetJSON;

let samplePayload; // Custom name for the test data object.

// Custom test framework/runner to replace QUnit.
const EvaluationSuite = (() => {
    let checkCounter = 0;
    let assertionCounter = 0;
    let failedAssertionRecords = [];
    let currentCheckIdentifier = '';
    let anticipatedAssertions = 0;
    let deferredCheckQueue = [];
    let isDeferredRunning = false;
    let suiteStartEpoch = Date.now();

    // Mock localStorage for the duration of the tests to control it and diverge from the original's direct usage.
    const originalGlobalStorage = window.localStorage; // Store the actual browser localStorage.
    
    // Our custom, internal storage object.
    const mockStorageImplementation = {
        _internalData: {},
        length: 0,
        clear: function() {
            this._internalData = {};
            this.length = 0;
        },
        setItem: function(key, value) {
            if (!(key in this._internalData)) {
                this.length++;
            }
            this._internalData[key] = String(value); // localStorage stores strings
        },
        getItem: function(key) {
            return this._internalData[key] === undefined ? null : this._internalData[key];
        },
        removeItem: function(key) {
            if (key in this._internalData) {
                delete this._internalData[key];
                this.length--;
            }
        },
        key: function(index) {
            const keys = Object.keys(this._internalData);
            return keys[index] || null;
        }
    };

    // A Proxy handler to allow direct property access (e.g., `localStorage.myKey = 'value'`)
    // while redirecting to setItem/getItem for proper localStorage behavior.
    const storageProxyHandler = {
        set: function(target, prop, value) {
            if (typeof prop === 'string' && !['length', '_internalData', 'clear', 'setItem', 'getItem', 'removeItem', 'key'].includes(prop)) {
                target.setItem(prop, value);
            } else {
                target[prop] = value; // For internal properties or methods
            }
            return true;
        },
        get: function(target, prop) {
            if (typeof prop === 'string' && !['length', '_internalData', 'clear', 'setItem', 'getItem', 'removeItem', 'key'].includes(prop)) {
                return target.getItem(prop);
            }
            return target[prop]; // For methods, length, or internal properties
        },
        deleteProperty: function(target, prop) {
            if (typeof prop === 'string' && !['length', '_internalData', 'clear', 'setItem', 'getItem', 'removeItem', 'key'].includes(prop)) {
                target.removeItem(prop);
                return true;
            }
            return false;
        },
        ownKeys: function(target) {
            return Object.keys(target._internalData).concat(
                Object.keys(target).filter(k => k !== '_internalData' && !Object.prototype.hasOwnProperty.call(target._internalData, k))
            );
        },
        getOwnPropertyDescriptor: function(target, prop) {
             if (typeof prop === 'string' && !['length', '_internalData', 'clear', 'setItem', 'getItem', 'removeItem', 'key'].includes(prop)) {
                if (prop in target._internalData) {
                    return {
                        value: target.getItem(prop),
                        writable: true,
                        enumerable: true,
                        configurable: true
                    };
                }
            }
            return Object.getOwnPropertyDescriptor(target, prop);
        }
    };

    const proxiedLocalStorageInstance = new Proxy(mockStorageImplementation, storageProxyHandler);

    // Function to set up the mocked localStorage for each test.
    const establishStorageMock = () => {
        mockStorageImplementation.clear(); // Ensure it's clean for each test.
        window.localStorage = proxiedLocalStorageInstance; // Replace global localStorage.
    };

    // Function to restore the original localStorage after all tests.
    const revertStorageMock = () => {
        window.localStorage = originalGlobalStorage;
    };


    const reportOutcome = (status, message) => {
        console.log(`[${status.toUpperCase()}] ${currentCheckIdentifier}: ${message}`);
    };

    const registerFailure = (message, expected, actual) => {
        failedAssertionRecords.push({
            check: currentCheckIdentifier,
            message: message,
            expected: expected,
            actual: actual
        });
        reportOutcome('fail', message);
    };

    const makeAssertion = (condition, message, expected, actual) => {
        assertionCounter++;
        if (anticipatedAssertions > 0 && assertionCounter > anticipatedAssertions) {
            registerFailure(`Excessive assertions. Anticipated ${anticipatedAssertions}, encountered ${assertionCounter}.`, anticipatedAssertions, assertionCounter);
            return;
        }
        if (!condition) {
            registerFailure(message, expected, actual);
        } else {
            reportOutcome('pass', message);
        }
    };

    const checkValue = (actual, expected, message) => makeAssertion(actual === expected, message, expected, actual);
    const checkStructure = (actual, expected, message) => makeAssertion(JSON.stringify(actual) === JSON.stringify(expected), message, expected, actual);
    const confirmCondition = (actual, message) => makeAssertion(!!actual, message, true, actual);

    const anticipateAssertions = (count) => {
        anticipatedAssertions = count;
        assertionCounter = 0;
    };

    // This function replaces QUnit.reset().
    const resetTestSetup = () => {
        try {
            establishStorageMock(); // Use our mock.
        } catch (e) {
            // Silently fail if localStorage (even mock) is not supported.
        }

        // Restore original settings and functions for JSONCache (the library under test).
        window.JSONCache.settings.numTries = initialAttemptCount;
        window.JSONCache.settings.waitTime = initialDelayValue;
        window.JSONCache._getJSONProxy = originalDataFetcher;
        window.JSONCache._getTime = originalTimestampProvider;
        window.JSONCache._tryGetJSON = originalAttemptProcessor;

        samplePayload = {
            "success": true,
            "data": [
                "först item",
                "secönd itém"
            ],
            "Weird väl": 666
        };
    };

    const proceedWithNextDeferred = () => {
        if (deferredCheckQueue.length > 0) {
            isDeferredRunning = true;
            const nextCheck = deferredCheckQueue.shift();
            currentCheckIdentifier = nextCheck.name;
            checkCounter++;
            resetTestSetup(); // Reset before each test.
            nextCheck.func();
        } else {
            isDeferredRunning = false;
            // All tests finished.
            const suiteEndEpoch = Date.now();
            const duration = suiteEndEpoch - suiteStartEpoch;
            console.log('\n--- Test Evaluation Summary ---');
            console.log(`Total checks performed: ${checkCounter}`);
            console.log(`Total assertions made: ${assertionCounter}`);
            if (failedAssertionRecords.length > 0) {
                console.error(`FAILED: ${failedAssertionRecords.length} assertions failed.`);
                failedAssertionRecords.forEach(fail => {
                    console.error(`  Check: ${fail.check}`);
                    console.error(`  Message: ${fail.message}`);
                    console.error(`  Expected: ${JSON.stringify(fail.expected)}`);
                    console.error(`  Actual:   ${JSON.stringify(fail.actual)}`);
                });
            } else {
                console.log('ALL CHECKS PASSED!');
            }
            console.log(`Duration: ${duration} ms`);
            revertStorageMock(); // Restore original localStorage after all tests.
        }
    };

    const defineCheck = (name, func) => {
        currentCheckIdentifier = name;
        checkCounter++;
        resetTestSetup(); // Reset before each test.
        func({ checkValue, checkStructure, confirmCondition, anticipateAssertions });
        if (anticipatedAssertions > 0 && assertionCounter !== anticipatedAssertions) {
            registerFailure(`Anticipated ${anticipatedAssertions} assertions but found ${assertionCounter}.`, anticipatedAssertions, assertionCounter);
        }
        anticipatedAssertions = 0; // Reset for next test.
        assertionCounter = 0;
    };

    const defineDeferredCheck = (name, func) => {
        deferredCheckQueue.push({ name, func: () => func({ checkValue, checkStructure, confirmCondition, anticipateAssertions, proceedWithNextDeferred }) });
        if (!isDeferredRunning) {
            proceedWithNextDeferred();
        }
    };

    // Initial setup mimicking QUnit.reset() and module() for the entire suite.
    resetTestSetup();
    console.log('--- Evaluation Suite Initialized ---');
    console.log('Test Group: DataVault Operations'); // Renamed from JSONCache module.

    return {
        defineCheck,
        defineDeferredCheck,
        proceedWithNextDeferred // This is called by deferred checks to signal completion.
    };
})();

// Provide aliases for convenience within test functions.
const { defineCheck, defineDeferredCheck, proceedWithNextDeferred } = EvaluationSuite;

// Test cases rewritten with new names and structure.

// Test 1: Requirements
defineCheck('Prerequisites for Operation', ({ anticipateAssertions, checkValue, confirmCondition }) => {
    anticipateAssertions(9);

    const jsonAvailability = () => {
        return window.JSON &&
               typeof window.JSON.parse === 'function' &&
               typeof window.JSON.stringify === 'function';
    };

    const storageAvailability = () => {
        try {
            // Check against our mock, which should always be available.
            return 'localStorage' in window && window.localStorage !== null;
        } catch (e) {
            return false;
        }
    };

    checkValue(typeof window.jQuery, 'function', 'jQuery library must be present');
    checkValue(jsonAvailability(), true, 'JSON parsing capabilities are essential');
    checkValue(storageAvailability(), true, 'Local data storage support is mandatory');
    checkValue(typeof window.JSONCache, 'object', 'JSONCache utility must be accessible');
    checkValue(typeof window.JSONCache.getCachedJSON, 'function', 'JSONCache retrieval method must be available');

    confirmCondition(window.JSONCache.settings.browserOk, 'JSONCache.browserOk flag indicates environment readiness');

    checkValue(window.JSONCache.settings.numTries, 5, 'Default attempt count should be five.');
    checkValue(window.JSONCache.settings.waitTime, 200, 'Default delay duration should be 200ms.');
    checkValue(window.JSONCache.settings.itemLifetime, 5 * 60 * 1000, 'Default item validity period should be 5 minutes.');
});

// Test 2: Basic localStorage functionality
defineCheck('Fundamental Local Storage Operations', ({ anticipateAssertions, checkValue }) => {
    anticipateAssertions(2);
    // Initial conditions.
    checkValue(window.localStorage.length, 0, 'Local storage should commence empty.');
    window.localStorage.userEntry = 'alpha-beta-gamma'; // Renamed `test` to `userEntry`.
    checkValue(window.localStorage.userEntry, 'alpha-beta-gamma', 'Value should persist in local storage.');
});

// Test 3: Async fetch with empty localStorage
defineDeferredCheck('Initial Data Retrieval with Empty Local Storage', ({ anticipateAssertions, checkStructure, checkValue, proceedWithNextDeferred }) => {
    anticipateAssertions(7);

    let proxyInvocationCounter = 0; // Renamed proxyMockCallCount.
    // Mock the json proxy to avoid networking.
    window.JSONCache._getJSONProxy = (address, options) => { // Renamed url to address.
        proxyInvocationCounter++;
        if (address === 'data.json') {
            options.success(samplePayload); // Renamed testData to samplePayload.
        }
    };
    let timeInvocationCounter = 0; // Renamed timeMockCallCount.
    // Mock the timestamp function for a static timestamp.
    window.JSONCache._getTime = () => {
        timeInvocationCounter++;
        return 2345678901234;
    };

    // Initial conditions.
    checkValue(window.localStorage.length, 0, 'Local storage should be clear.');

    window.JSONCache.getCachedJSON('data.json', {
        success: (retrievedData) => { // Renamed data to retrievedData.
            checkStructure(retrievedData, {
                success: true,
                data: [
                    'först item',
                    'secönd itém'
                ],
                'Weird väl': 666
            }, 'Correct sample data should be returned.');

            checkStructure(retrievedData, JSON.parse(window.localStorage['JSONCache data data.json']),
                      'Local storage should hold the appropriate data.');
            checkValue(window.localStorage['JSONCache time data.json'], '2345678901234',
                       'Timestamp should match the static mock output.');
            checkValue(proxyInvocationCounter, 1, 'Mocked data fetcher should be invoked once.');
            checkValue(timeInvocationCounter, 1, 'Mocked time function should be invoked once.');
            checkValue(window.localStorage.length, 2, 'Two items should reside in local storage.');
            proceedWithNextDeferred(); // Renamed start().
        }
    });
});

// Test 4: Cache item clearing with empty cache.
defineCheck('Cache Item Eviction from Empty Cache', ({ anticipateAssertions, checkValue }) => {
    anticipateAssertions(2);
    checkValue(window.localStorage.length, 0, 'Local storage should be empty initially.');
    window.JSONCache.clear('http://example.org/key?param1=a%20b+c#hash-123');
    checkValue(window.localStorage.length, 0, 'Local storage should remain empty.');
});

// Test 5: Whole cache clearing with empty cache.
defineCheck('Complete Cache Eviction from Empty Cache', ({ anticipateAssertions, checkValue }) => {
    anticipateAssertions(2);
    checkValue(window.localStorage.length, 0, 'Local storage should be empty at the outset.');
    window.JSONCache.clear();
    checkValue(window.localStorage.length, 0, 'Local storage should be devoid of items.');
});

// Test 6: Cache item clearing with items in the cache.
defineCheck('Targeted Cache Item Eviction', ({ anticipateAssertions, checkValue }) => {
    anticipateAssertions(3);
    checkValue(window.localStorage.length, 0, 'Local storage should be vacant initially.');

    const payloadIdentifier = 'JSONCache data http://example.org/key?param1=a%20b+c#hash-123'; // Renamed dataKey.
    const timeIdentifier = 'JSONCache time http://example.org/key?param1=a%20b+c#hash-123'; // Renamed timeKey.
    window.localStorage[payloadIdentifier] = 'my dätä';
    window.localStorage[timeIdentifier] = '123';

    window.localStorage['another key'] = 'another value'; // Renamed öther kéy.

    // Remove a certain item from the cache.
    window.JSONCache.clear('http://example.org/key?param1=a%20b+c#hash-123');

    checkValue(window.localStorage.length, 1, 'Only one item should remain in local storage.');
    checkValue(window.localStorage['another key'], 'another value', 'The correct data should persist.');
});

// Test 7: Whole cache clearing with several items in the cache.
defineCheck('Comprehensive Cache Eviction with Multiple Items', ({ anticipateAssertions, checkValue }) => {
    anticipateAssertions(3);
    checkValue(window.localStorage.length, 0, 'Local storage should be empty initially.');

    const firstPayloadId = 'JSONCache data http://example.org/key?param1=a%20b+c#hash-123';
    const firstTimeId = 'JSONCache time http://example.org/key?param1=a%20b+c#hash-123';
    window.localStorage[firstPayloadId] = 'my dätä';
    window.localStorage[firstTimeId] = '123';

    window.localStorage['JSONCache data http://example.org/data'] = 'my dätä 2';
    window.localStorage['JSONCache time http://example.org/time'] = '1234';

    window.localStorage['distinct key'] = 'distinct value'; // Renamed öther kéy.

    // Clear the whole cache.
    window.JSONCache.clear();

    checkValue(window.localStorage.length, 1, 'One item should be left in local storage.');
    checkValue(window.localStorage['distinct key'], 'distinct value', 'The distinct data should remain.');
});

// Test 8: Test oldest item removing with empty cache.
defineCheck('Oldest Item Removal from Empty Cache', ({ anticipateAssertions, checkValue }) => {
    anticipateAssertions(2);
    checkValue(window.localStorage.length, 0, 'Local storage should start empty.');
    window.JSONCache.purgeOldest();
    checkValue(window.localStorage.length, 0, 'Local storage should conclude empty.');
});

// Test 9: Test oldest item removing with one item in the cache.
defineCheck('Oldest Item Removal with Single Cache Entry', ({ anticipateAssertions, checkValue }) => {
    anticipateAssertions(2);
    checkValue(window.localStorage.length, 0, 'Local storage should be empty initially.');

    window.localStorage['JSONCache data http://example.org/data'] = 'some content'; // Renamed söme dätä.
    window.localStorage['JSONCache time http://example.org/data'] = '123';

    window.JSONCache.purgeOldest();
    checkValue(window.localStorage.length, 0, 'Local storage should be cleared.');
});

// Test 10: Test oldest item removing with several items in the cache.
defineCheck('Oldest Item Removal with Multiple Cache Entries', ({ anticipateAssertions, checkValue }) => {
    anticipateAssertions(6);
    checkValue(window.localStorage.length, 0, 'Local storage should be empty initially.');

    window.localStorage['JSONCache data http://example.org/data1'] = 'content 1'; // Renamed söme dätä 1.
    window.localStorage['JSONCache time http://example.org/data1'] = '1001';
    window.localStorage['JSONCache data http://example.org/data2'] = 'content 2';
    window.localStorage['JSONCache time http://example.org/data2'] = '1002';
    window.localStorage['JSONCache data http://example.org/data3'] = 'content 3';
    window.localStorage['JSONCache time http://example.org/data3'] = '1003';

    window.JSONCache.purgeOldest();

    checkValue(window.localStorage.length, 4, 'Four items should remain in local storage.');
    checkValue(window.localStorage['JSONCache data http://example.org/data2'], 'content 2',
               'Correct data entry 2 should be present.');
    checkValue(window.localStorage['JSONCache time http://example.org/data2'], '1002',
               'Correct timestamp entry 2 should be present.');
    checkValue(window.localStorage['JSONCache data http://example.org/data3'], 'content 3',
               'Correct data entry 3 should be present.');
    checkValue(window.localStorage['JSONCache time http://example.org/data3'], '1003',
               'Correct timestamp entry 3 should be present.');
});

// Test 11: Test oldest item removing with several items (including non JSONCache items).
defineCheck('Oldest Item Removal with Mixed Cache Entries', ({ anticipateAssertions, checkValue }) => {
    anticipateAssertions(6);
    checkValue(window.localStorage.length, 0, 'Local storage should be empty initially.');

    window.localStorage['JSONCache data http://example.org/data1'] = 'content 1';
    window.localStorage['JSONCache time http://example.org/data1'] = '1001';
    window.localStorage['JSONCache data http://example.org/data2'] = 'content 2';
    window.localStorage['JSONCache time http://example.org/data2'] = '1002';
    window.localStorage['JSONCache data http://example.org/data3'] = 'content 3';
    window.localStorage['JSONCache time http://example.org/data3'] = '1003';

    window.localStorage['miscellaneous key 1'] = 'miscellaneous data 1'; // Renamed öther key 1.
    window.localStorage['miscellaneous key 2'] = 'miscellaneous data 2'; // Renamed öther key 2.

    // Clear two oldest items.
    window.JSONCache.purgeOldest();
    window.JSONCache.purgeOldest();

    checkValue(window.localStorage.length, 4, 'Four items should remain in local storage.');
    checkValue(window.localStorage['JSONCache data http://example.org/data3'], 'content 3',
               'Correct data entry 3 should be present.');
    checkValue(window.localStorage['JSONCache time http://example.org/data3'], '1003',
               'Correct timestamp entry 3 should be present.');
    checkValue(window.localStorage['miscellaneous key 1'], 'miscellaneous data 1',
               'Miscellaneous data 1 should persist.');
    checkValue(window.localStorage['miscellaneous key 2'], 'miscellaneous data 2',
               'Miscellaneous data 2 should persist.');
});

// Test 12: Default numTries in settings.
defineCheck('Default Attempt Count Configuration', ({ anticipateAssertions, checkValue }) => {
    anticipateAssertions(1);
    checkValue(window.JSONCache.settings.numTries, 5, 'The default try count value should be 5.');
});

// Test 13: Timeout for all fetching tries.
defineDeferredCheck('Comprehensive Fetching Timeout Scenario', ({ anticipateAssertions, checkValue, proceedWithNextDeferred }) => {
    anticipateAssertions(2);

    // Set shorter wait time for faster tests.
    window.JSONCache.settings.waitTime = 10;

    // Mock the proxy function to always time out.
    let fetchInvocationCounter = 0; // Renamed proxyCallCount.
    window.JSONCache._getJSONProxy = (address, opts) => { // Renamed url to address, options to opts.
        fetchInvocationCounter++;
        window.setTimeout(() => {
            opts.error(null, 'timeout', null);
        }, 10);
    };

    window.JSONCache.getCachedJSON('data.json', {
        ongiveup: (condition) => { // Renamed status to condition.
            checkValue(condition, 'timeout', 'Error condition should be accurate.');
            checkValue(fetchInvocationCounter, 5, 'Fetching proxy should be invoked 5 times.');
            proceedWithNextDeferred();
        }
    });
});

// Test 14: Timeout for all fetching tries with changed number of tries.
defineDeferredCheck('Adjusted Fetching Timeout with Modified Attempt Count', ({ anticipateAssertions, checkValue, checkStructure, proceedWithNextDeferred }) => {
    anticipateAssertions(3);

    // Set shorter wait time for faster tests.
    window.JSONCache.settings.waitTime = 10;
    window.JSONCache.settings.numTries = 6;

    // Mock the proxy function to always time out.
    let fetchInvocationCounter = 0;
    window.JSONCache._getJSONProxy = (address, opts) => {
        fetchInvocationCounter++;
        window.setTimeout(() => {
            opts.error(null, 'timeout', null);
        }, 10);
    };

    let retryArguments = []; // Renamed retryArgs.
    const onTrial = (trialNumber) => { // Renamed ontry to onTrial, tryNumber to trialNumber.
        retryArguments.push(trialNumber);
    };

    window.JSONCache.getCachedJSON('data.json', {
        ontry: onTrial,
        ongiveup: (condition) => {
            checkValue(condition, 'timeout', 'Error condition should be accurate.');
            checkValue(fetchInvocationCounter, 6, 'Fetching proxy should be invoked the correct number of times.');
            checkStructure(retryArguments, [1, 2, 3, 4, 5, 6],
                          'The trial hook function should be invoked before each attempt.');
            proceedWithNextDeferred();
        }
    });
});

// Test 15: Error hook calling.
defineDeferredCheck('Error Callback Invocation', ({ anticipateAssertions, checkValue, checkStructure, proceedWithNextDeferred }) => {
    anticipateAssertions(4);

    window.JSONCache.settings.waitTime = 10;

    // Mock the proxy function to always time out.
    let fetchInvocationCounter = 0;
    window.JSONCache._getJSONProxy = (address, opts) => {
        fetchInvocationCounter++;
        window.setTimeout(() => {
            opts.error(null, 'timeout', null);
        }, 10);
    };

    let errorCallbackCounter = 0; // Renamed errorCallCount.
    let errorCallbackArguments = []; // Renamed errorArgs.
    const onProblem = (jqXHR, textStatus, errorThrown, trialNumber) => { // Renamed onerror to onProblem.
        errorCallbackCounter++;
        errorCallbackArguments.push(textStatus + ' ' + trialNumber);
    };

    window.JSONCache.getCachedJSON('data.json', {
        onerror: onProblem,
        ongiveup: (condition) => {
            checkValue(condition, 'timeout', 'Error condition should be accurate.');
            checkValue(fetchInvocationCounter, 5, 'Fetching proxy should be invoked the correct number of times.');
            checkValue(errorCallbackCounter, 5, 'Error callback should be invoked the correct number of times.');
            checkStructure(errorCallbackArguments, ['timeout 1', 'timeout 2', 'timeout 3', 'timeout 4', 'timeout 5'],
                          'The error hook function should be invoked on every error.');
            proceedWithNextDeferred();
        }
    });
});

// Test 16: Trying to get an expired item from the cache.
defineDeferredCheck('Retrieval of Expired Cache Entry', ({ anticipateAssertions, checkValue, checkStructure, proceedWithNextDeferred }) => {
    anticipateAssertions(3);

    checkValue(window.localStorage.length, 0, 'Local storage should be empty initially.');

    let proxyInvocationCounter = 0;
    window.JSONCache._getJSONProxy = (address, opts) => {
        proxyInvocationCounter++;
        if (address === 'data.json') {
            opts.success(samplePayload);
        }
    };
    window.JSONCache._getTime = () => {
        return 2345678901234;
    };

    // Expired one millisecond.
    const itemValidityPeriod = 5 * 60 * 1000; // Renamed lifetime.
    const pastTime = 2345678901234 - itemValidityPeriod - 1; // Renamed time.

    window.localStorage['JSONCache data data.json'] = '{"data":"old invalid data"}'; // Renamed öld invalid dätä.
    window.localStorage['JSONCache time data.json'] = pastTime;

    window.JSONCache.getCachedJSON('data.json', {
        success: (retrievedData) => {
            checkStructure(retrievedData, {
                "success": true,
                "data": [
                    "först item",
                    "secönd itém"
                ],
                "Weird väl": 666
            }, 'Returned data should be correct and refreshed.');
            checkValue(proxyInvocationCounter, 1, 'Fetching proxy should be invoked once to refresh data.');
            proceedWithNextDeferred();
        }
    });
});

// Test 17: Cache clean with empty cache.
defineCheck('Cache Cleanup on Empty Cache', ({ anticipateAssertions, checkValue }) => {
    anticipateAssertions(2);
    checkValue(window.localStorage.length, 0, 'Local storage should be empty initially.');
    window.JSONCache.clean();
    checkValue(window.localStorage.length, 0, 'Local storage should remain empty after cleanup.');
});

// Test 18: Cache clean with only valid items.
defineCheck('Cache Cleanup with Only Valid Entries', ({ anticipateAssertions, checkValue }) => {
    anticipateAssertions(7);
    checkValue(window.localStorage.length, 0, 'Local storage should be empty initially.');

    window.JSONCache._getTime = () => {
        return 2345678901234;
    };

    window.localStorage['JSONCache data data1'] = '{"data":"entry 1"}'; // Renamed dätä 1.
    window.localStorage['JSONCache time data1'] = '2345678901234';

    window.localStorage['JSONCache data data2'] = '{"data":"entry 2"}';
    window.localStorage['JSONCache time data2'] = (2345678901234 - 5 * 60 * 1000).toString();

    window.localStorage['another key here'] = 'another value here'; // Renamed söme öther key.

    window.JSONCache.clean();

    checkValue(window.localStorage.length, 5, 'All items, including non-cache, should persist.');
    checkValue(window.localStorage['JSONCache data data1'], '{"data":"entry 1"}',
               'Valid data entry 1 should be retained.');
    checkValue(window.localStorage['JSONCache time data1'], '2345678901234',
               'Valid timestamp entry 1 should be retained.');
    checkValue(window.localStorage['JSONCache data data2'], '{"data":"entry 2"}',
               'Valid data entry 2 should be retained.');
    checkValue(window.localStorage['JSONCache time data2'], (2345678901234 - 5 * 60 * 1000).toString(),
               'Valid timestamp entry 2 should be retained.');
    checkValue(window.localStorage['another key here'], 'another value here',
               'Non-cache data should be unaffected.');
});

// Test 19: Cache clean with only expired items.
defineCheck('Cache Cleanup with Only Expired Entries', ({ anticipateAssertions, checkValue }) => {
    anticipateAssertions(2);
    checkValue(window.localStorage.length, 0, 'Local storage should be empty initially.');

    window.JSONCache._getTime = () => {
        return 2345678901234;
    };

    window.localStorage['JSONCache data data1'] = '{"data":"entry 1"}';
    window.localStorage['JSONCache time data1'] = '1234567890123';

    window.localStorage['JSONCache data data2'] = '{"data":"entry 2"}';
    // Expired 1 millisecond.
    window.localStorage['JSONCache time data2'] = (2345678901234 - 5 * 60 * 1000 - 1).toString();

    window.JSONCache.clean();

    checkValue(window.localStorage.length, 0, 'Cache should be entirely empty after cleanup.');
});

// Test 20: Cache clean with valid and expired items.
defineCheck('Cache Cleanup with Mixed Valid and Expired Entries', ({ anticipateAssertions, checkValue }) => {
    anticipateAssertions(7);
    checkValue(window.localStorage.length, 0, 'Local storage should be empty initially.');

    window.JSONCache._getTime = () => {
        return 2345678901234;
    };

    window.localStorage['JSONCache data data1'] = '{"data":"entry 1"}';
    window.localStorage['JSONCache time data1'] = '1234567890123';

    window.localStorage['JSONCache data data2'] = '{"data":"entry 2"}';
    // Expired 1 millisecond.
    window.localStorage['JSONCache time data2'] = (2345678901234 - 5 * 60 * 1000 - 1).toString();

    window.localStorage['JSONCache data data3'] = '{"data":"entry 3"}';
    window.localStorage['JSONCache time data3'] = '2345678901234';

    window.localStorage['JSONCache data data4'] = '{"data":"entry 4"}';
    window.localStorage['JSONCache time data4'] = (2345678901234 - 5 * 60 * 1000).toString();

    window.localStorage['miscellaneous item key'] = 'miscellaneous item data'; // Renamed söme öther key.

    window.JSONCache.clean();

    checkValue(window.localStorage.length, 5, 'Only valid and non-cache items should remain.');
    checkValue(window.localStorage['JSONCache data data3'], '{"data":"entry 3"}',
               'Valid data entry 3 should be retained.');
    checkValue(window.localStorage['JSONCache time data3'], '2345678901234',
               'Valid timestamp entry 3 should be retained.');
    checkValue(window.localStorage['JSONCache data data4'], '{"data":"entry 4"}',
               'Valid data entry 4 should be retained.');
    checkValue(window.localStorage['JSONCache time data4'], (2345678901234 - 5 * 60 * 1000).toString(),
               'Valid timestamp entry 4 should be retained.');
    checkValue(window.localStorage['miscellaneous item key'], 'miscellaneous item data',
               'Non-cache data should remain untouched.');
});