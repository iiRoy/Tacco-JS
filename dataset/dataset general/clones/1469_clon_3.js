/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global jQuery: false, module: false, test: false, expect: false,
  strictEqual: false, window: false, ok: false, QUnit: false,
  asyncTest: false, start: false, stop: false, deepEqual: false */

(function (domUtil) {

    // Internal references to the cache utility and its configuration.
    const CacheUtility = window.CacheUtility || window.JSONCache; // Allow fallback for legacy name
    let _attemptLimit = CacheUtility.config.maxRetries;
    let _delayDuration = CacheUtility.config.retryDelayMs;
    const _remoteDataFetcher = CacheUtility._fetchRemoteData;
    const _timeProvider = CacheUtility._getTimestamp;
    const _performDataFetch = CacheUtility._executeDataFetch;
    let sampleApiPayload; // Holds data for mock API responses

    /**
     * Resets the QUnit testing environment to a clean state.
     * This includes clearing localStorage and restoring original CacheUtility settings.
     */
    QUnit.setupTestEnvironment = function () {
        try {
            // Attempt to clear all stored data for a fresh test run.
            window.localStorage.clear();
        } catch (storageError) {
            // Silently handle cases where localStorage isn't available.
            // This scenario is typically verified in initial compatibility checks.
        }

        // Revert any modifications made to CacheUtility's internal functions or settings
        // during previous test cases, ensuring isolation between tests.
        CacheUtility.config.maxRetries = _attemptLimit;
        CacheUtility.config.retryDelayMs = _delayDuration;
        CacheUtility._fetchRemoteData = _remoteDataFetcher;
        CacheUtility._getTimestamp = _timeProvider;
        CacheUtility._executeDataFetch = _performDataFetch;

        // Define a standard data structure for mock API responses.
        sampleApiPayload = {
            "isSuccessful": true,
            "resultData": [
                "first entry",
                "second entry"
            ],
            "SpecialValue": 123
        };
    };
    QUnit.setupTestEnvironment(); // Initialize the environment once on script load.

    module('CacheUtility Module Operations'); // Updated module name for clarity.


    // Shorthand for QUnit's strict equality comparison.
    const checkStrictEqual = strictEqual;

    test('Core Dependencies and Browser Compatibility Checks', function () {
        expect(9); // Declaring the expected number of assertions for this test.

        // Helper to check for native JSON parsing capabilities.
        const hasNativeJsonSupport = () => {
            return typeof JSON !== 'undefined' &&
                   typeof JSON.parse === 'function' &&
                   typeof JSON.stringify === 'function';
        };

        // Helper to determine if localStorage is available and usable.
        const isLocalStorageOperational = () => {
            try {
                const testKey = '__storage_test__';
                window.localStorage.setItem(testKey, testKey);
                window.localStorage.removeItem(testKey);
                return 'localStorage' in window && window.localStorage !== null;
            } catch (e) {
                return false;
            }
        };

        checkStrictEqual(typeof window.jQuery, 'function', 'jQuery library must be loaded');
        checkStrictEqual(hasNativeJsonSupport(), true, 'Native JSON parser support is mandatory');
        checkStrictEqual(isLocalStorageOperational(), true, 'Browser localStorage functionality is required');
        checkStrictEqual(typeof CacheUtility, 'object', 'CacheUtility main object must exist');
        checkStrictEqual(typeof CacheUtility.retrieveCachedData, 'function', 'CacheUtility.retrieveCachedData function must be available');

        checkStrictEqual(CacheUtility.config.isBrowserCompatible, true, 'CacheUtility should report browser compatibility');

        checkStrictEqual(CacheUtility.config.maxRetries, 5, 'Default number of retries should be 5.');
        checkStrictEqual(CacheUtility.config.retryDelayMs, 200, 'Default retry delay should be 200ms.');
        checkStrictEqual(CacheUtility.config.entryExpirationMs, 5 * 60 * 1000, 'Default cache entry lifetime should be 5 minutes.');
    });

    test('Fundamental localStorage Read/Write Verification', function () {
        expect(2); // Two assertions expected for this test.
        // Ensure localStorage starts empty for this specific test.
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should be initially empty.');

        const tempStorageKey = 'temporaryTestItem';
        const testValue = 'a_b_c_123';
        window.localStorage.setItem(tempStorageKey, testValue); // Store a test value.
        checkStrictEqual(window.localStorage.getItem(tempStorageKey), testValue, 'A value stored in localStorage should be retrievable.');
    });

    asyncTest('Asynchronous Data Fetch with Empty Local Storage', function () {
        expect(7); // Expecting seven assertions.

        let apiMockInvocationCount = 0;
        // Mock the external API call function to prevent actual network requests.
        CacheUtility._fetchRemoteData = (resourcePath, callOptions) => {
            apiMockInvocationCount++;
            if (resourcePath === 'api/records.json') {
                callOptions.onSuccess(sampleApiPayload);
            }
        };

        let timestampMockInvocationCount = 0;
        // Mock the timestamp generator for predictable cache expiration logic.
        CacheUtility._getTimestamp = () => {
            timestampMockInvocationCount++;
            return 1678886400000; // A fixed timestamp (e.g., March 15, 2023 12:00:00 PM UTC)
        };

        // Initial state check for localStorage.
        checkStrictEqual(window.localStorage.length, 0, 'localStorage must be empty at the start of this test.');

        const dataKeyPrefix = 'CacheUtil_payload_';
        const timeKeyPrefix = 'CacheUtil_timestamp_';
        const requestedUrl = 'api/records.json';

        CacheUtility.retrieveCachedData(requestedUrl, {
            onSuccess: (retrievedData) => {
                // Verify the data returned by the callback matches the mock payload.
                deepEqual(retrievedData, sampleApiPayload, 'The callback should receive the correct mocked data.');

                // Verify the data stored in localStorage matches the mock payload.
                const storedData = JSON.parse(window.localStorage.getItem(dataKeyPrefix + requestedUrl));
                deepEqual(storedData, sampleApiPayload, 'localStorage should store the fetched data correctly.');

                // Verify the timestamp associated with the cached data.
                checkStrictEqual(window.localStorage.getItem(timeKeyPrefix + requestedUrl), '1678886400000',
                   'The timestamp in localStorage should match the static mock value.');

                checkStrictEqual(apiMockInvocationCount, 1, 'The mocked API fetcher should be called exactly once.');
                checkStrictEqual(timestampMockInvocationCount, 1, 'The mocked timestamp function should be called once.');
                checkStrictEqual(window.localStorage.length, 2, 'Two items (data and timestamp) should be present in localStorage.');
                start(); // Signal QUnit that the async test has completed.
            }
        });
    });

    // Helper function to construct cache keys
    const createCacheKey = (prefix, url) => `CacheUtil_${prefix}_${url}`;

    // Cache clearing tests
    test('Clearing a specific cache item from an empty cache', function () {
        expect(2);
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should be empty initially.');
        CacheUtility.clearCacheEntry('https://example.com/api/v1/resource?id=123');
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should still be empty after attempting to clear a non-existent item.');
    });

    test('Clearing the entire cache when it is empty', function () {
        expect(2);
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should be empty before global clear.');
        CacheUtility.clearCacheEntry(); // Calling without arguments implies clearing all.
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should remain empty after global clear on an empty cache.');
    });

    test('Clearing a specific item from a populated cache', function () {
        expect(3);
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should be empty at the start.');

        const targetUrl = 'https://example.com/api/item?param=foo';
        const otherUrl = 'https://example.com/api/other';

        window.localStorage.setItem(createCacheKey('payload', targetUrl), '{"data":"specific_data"}');
        window.localStorage.setItem(createCacheKey('timestamp', targetUrl), '10000');
        window.localStorage.setItem('unrelated_key', 'unrelated_value');
        window.localStorage.setItem(createCacheKey('payload', otherUrl), '{"data":"other_data"}');
        window.localStorage.setItem(createCacheKey('timestamp', otherUrl), '20000');


        CacheUtility.clearCacheEntry(targetUrl); // Clear the specific item.

        checkStrictEqual(window.localStorage.length, 3, 'After clearing one item, 3 items should remain (1 unrelated, 2 other cache entries).');
        checkStrictEqual(window.localStorage.getItem('unrelated_key'), 'unrelated_value', 'Unrelated key should still be present.');
        ok(window.localStorage.getItem(createCacheKey('payload', otherUrl)), 'Other cache item payload should still exist.');
    });

    test('Clearing the entire cache with multiple items present', function () {
        expect(3);
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should be empty initially.');

        window.localStorage.setItem(createCacheKey('payload', 'url1'), '{"val":1}');
        window.localStorage.setItem(createCacheKey('timestamp', 'url1'), '100');
        window.localStorage.setItem(createCacheKey('payload', 'url2'), '{"val":2}');
        window.localStorage.setItem(createCacheKey('timestamp', 'url2'), '200');
        window.localStorage.setItem('external_system_key', 'external_data'); // Non-cache utility item

        CacheUtility.clearCacheEntry(); // Clear all CacheUtility items.

        checkStrictEqual(window.localStorage.length, 1, 'Only the external system key should remain.');
        checkStrictEqual(window.localStorage.getItem('external_system_key'), 'external_data', 'External key must be unaffected.');
        ok(!window.localStorage.getItem(createCacheKey('payload', 'url1')), 'CacheUtility item 1 should be removed.');
    });

    test('Purging oldest item from an empty cache', function () {
        expect(2);
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should be empty at the start.');
        CacheUtility.removeOldestEntry();
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should remain empty.');
    });

    test('Purging oldest item from a cache with a single entry', function () {
        expect(2);
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should be empty initially.');

        const singleUrl = 'http://api.single.com/data';
        window.localStorage.setItem(createCacheKey('payload', singleUrl), '{"content":"only_one"}');
        window.localStorage.setItem(createCacheKey('timestamp', singleUrl), '500');

        CacheUtility.removeOldestEntry();
        checkStrictEqual(window.localStorage.length, 0, 'Cache should be empty after purging the only item.');
    });

    test('Purging oldest item from a cache with multiple entries', function () {
        expect(6);
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should be empty initially.');

        const urlA = 'http://api.multi.com/a';
        const urlB = 'http://api.multi.com/b';
        const urlC = 'http://api.multi.com/c';

        window.localStorage.setItem(createCacheKey('payload', urlA), 'payload_A');
        window.localStorage.setItem(createCacheKey('timestamp', urlA), '1000');
        window.localStorage.setItem(createCacheKey('payload', urlB), 'payload_B');
        window.localStorage.setItem(createCacheKey('timestamp', urlB), '2000');
        window.localStorage.setItem(createCacheKey('payload', urlC), 'payload_C');
        window.localStorage.setItem(createCacheKey('timestamp', urlC), '3000');

        CacheUtility.removeOldestEntry(); // Should remove A (timestamp 1000)

        checkStrictEqual(window.localStorage.length, 4, 'Four items should remain (B and C payload/timestamp pairs).');
        ok(!window.localStorage.getItem(createCacheKey('payload', urlA)), 'Payload A should be removed.');
        ok(window.localStorage.getItem(createCacheKey('payload', urlB)), 'Payload B should still exist.');
        ok(window.localStorage.getItem(createCacheKey('timestamp', urlB)), 'Timestamp B should still exist.');
        ok(window.localStorage.getItem(createCacheKey('payload', urlC)), 'Payload C should still exist.');
        ok(window.localStorage.getItem(createCacheKey('timestamp', urlC)), 'Timestamp C should still exist.');
    });

    test('Purging oldest items while preserving non-cache entries', function () {
        expect(6);
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should be empty at first.');

        const url1 = 'http://api.mixed.com/res1';
        const url2 = 'http://api.mixed.com/res2';
        const url3 = 'http://api.mixed.com/res3';

        window.localStorage.setItem(createCacheKey('payload', url1), 'data_one');
        window.localStorage.setItem(createCacheKey('timestamp', url1), '1000');
        window.localStorage.setItem(createCacheKey('payload', url2), 'data_two');
        window.localStorage.setItem(createCacheKey('timestamp', url2), '2000');
        window.localStorage.setItem(createCacheKey('payload', url3), 'data_three');
        window.localStorage.setItem(createCacheKey('timestamp', url3), '3000');

        window.localStorage.setItem('other_app_setting_1', 'value_alpha');
        window.localStorage.setItem('other_app_setting_2', 'value_beta');

        CacheUtility.removeOldestEntry(); // Removes url1
        CacheUtility.removeOldestEntry(); // Removes url2

        checkStrictEqual(window.localStorage.length, 4, 'Two cache items and two other items should remain.');
        ok(!window.localStorage.getItem(createCacheKey('payload', url1)), 'Payload 1 should be gone.');
        ok(!window.localStorage.getItem(createCacheKey('payload', url2)), 'Payload 2 should be gone.');
        ok(window.localStorage.getItem(createCacheKey('payload', url3)), 'Payload 3 should still be present.');
        checkStrictEqual(window.localStorage.getItem('other_app_setting_1'), 'value_alpha', 'Other app setting 1 must be untouched.');
        checkStrictEqual(window.localStorage.getItem('other_app_setting_2'), 'value_beta', 'Other app setting 2 must be untouched.');
    });

    test('Verification of default retry count setting', function () {
        expect(1);
        checkStrictEqual(CacheUtility.config.maxRetries, 5, 'The default maximum retry count should be 5.');
    });

    asyncTest('All fetch attempts timing out', function () {
        expect(2);

        // Configure a short delay for quicker test execution.
        CacheUtility.config.retryDelayMs = 15;

        let mockApiCallCounter = 0;
        // Override the data fetcher to simulate consistent timeouts.
        CacheUtility._fetchRemoteData = (requestUrl, requestOptions) => {
            mockApiCallCounter++;
            window.setTimeout(() => {
                requestOptions.onError(null, 'request_timed_out', null);
            }, 10); // Simulate a slight delay before timeout.
        };

        CacheUtility.retrieveCachedData('some/api/resource', {
            onFailure: (failureReason) => {
                checkStrictEqual(failureReason, 'request_timed_out', 'The reported error status should be "request_timed_out".');
                checkStrictEqual(mockApiCallCounter, 5, 'The API fetcher should have been called 5 times (default maxRetries).');
                start();
            }
        });
    });

    asyncTest('Timeout across custom number of fetch attempts', function () {
        expect(3);

        // Adjust settings for this specific test case.
        CacheUtility.config.retryDelayMs = 10;
        CacheUtility.config.maxRetries = 7; // Custom retry count.

        let apiRequestCounter = 0;
        // Mock the data fetcher to always result in a timeout.
        CacheUtility._fetchRemoteData = (requestEndpoint, requestOptions) => {
            apiRequestCounter++;
            window.setTimeout(() => {
                requestOptions.onError(null, 'timeout_error', null);
            }, 5);
        };

        const attemptLog = [];
        const onAttemptCallback = (currentAttemptNumber) => {
            attemptLog.push(currentAttemptNumber);
        };

        CacheUtility.retrieveCachedData('another/api/path', {
            onAttempt: onAttemptCallback,
            onFailure: (finalStatus) => {
                checkStrictEqual(finalStatus, 'timeout_error', 'The final error status should reflect a timeout.');
                checkStrictEqual(apiRequestCounter, 7, 'The API fetcher should be invoked exactly 7 times as configured.');
                deepEqual(attemptLog, [1, 2, 3, 4, 5, 6, 7], 'The attempt hook should log each retry sequentially.');
                start();
            }
        });
    });

    asyncTest('Error callback invocation during retries', function () {
        expect(4);

        CacheUtility.config.retryDelayMs = 10; // Fast retry.

        let apiInvocationCount = 0;
        // Mock API call to consistently fail with a timeout.
        CacheUtility._fetchRemoteData = (targetUrl, targetOptions) => {
            apiInvocationCount++;
            window.setTimeout(() => {
                targetOptions.onError(null, 'timed_out_response', null);
            }, 5);
        };

        let errorCallbackCounter = 0;
        const errorDetailsLogged = [];
        const onErrorCallback = (jqXHR, statusText, errorThrown, attemptIteration) => {
            errorCallbackCounter++;
            errorDetailsLogged.push(`${statusText} - ${attemptIteration}`);
        };

        CacheUtility.retrieveCachedData('error/prone/endpoint', {
            onError: onErrorCallback,
            onFailure: (finalFailureStatus) => {
                checkStrictEqual(finalFailureStatus, 'timed_out_response', 'The ultimate failure status must be "timed_out_response".');
                checkStrictEqual(apiInvocationCount, 5, 'The API fetcher should be called 5 times (default retries).');
                checkStrictEqual(errorCallbackCounter, 5, 'The custom error callback should be triggered 5 times.');
                deepEqual(errorDetailsLogged, ['timed_out_response - 1', 'timed_out_response - 2', 'timed_out_response - 3', 'timed_out_response - 4', 'timed_out_response - 5'],
                          'The error callback should capture details for each failed attempt.');
                start();
            }
        });
    });

    asyncTest('Retrieving an expired item from cache triggers a fresh fetch', function () {
        expect(3);

        checkStrictEqual(window.localStorage.length, 0, 'localStorage must be empty initially for this test.');

        let proxyCallCounter = 0;
        CacheUtility._fetchRemoteData = (requestPath, requestOptions) => {
            proxyCallCounter++;
            if (requestPath === 'expired/data.json') {
                requestOptions.onSuccess(sampleApiPayload);
            }
        };
        CacheUtility._getTimestamp = () => {
            return 1678886400000; // Current time for this test.
        };

        // Calculate an expiration time: current time minus lifetime minus a small offset.
        const cacheEntryLifetime = CacheUtility.config.entryExpirationMs;
        const expiredTimestamp = 1678886400000 - cacheEntryLifetime - 100; // Expired by 100ms.

        const expiredUrl = 'expired/data.json';
        window.localStorage.setItem(createCacheKey('payload', expiredUrl), '{"status":false, "message":"stale data"}');
        window.localStorage.setItem(createCacheKey('timestamp', expiredUrl), expiredTimestamp.toString());

        CacheUtility.retrieveCachedData(expiredUrl, {
            onSuccess: (responseData) => {
                deepEqual(responseData, sampleApiPayload, 'The returned data should be the fresh data from the mock API.');
                checkStrictEqual(proxyCallCounter, 1, 'The API fetcher should be called once, as the cached item was expired.');
                start();
            }
        });
    });

    test('Cache cleanup operation with an empty cache', function () {
        expect(2);
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should be empty at the beginning.');
        CacheUtility.cleanExpiredEntries();
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should remain empty after cleanup.');
    });

    test('Cache cleanup with only currently valid items', function () {
        expect(7);
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should be empty initially.');

        CacheUtility._getTimestamp = () => 1678886400000; // Fixed current time.
        const lifetime = CacheUtility.config.entryExpirationMs;

        const urlA = 'valid/data/A';
        const urlB = 'valid/data/B';

        window.localStorage.setItem(createCacheKey('payload', urlA), '{"value":"data_A"}');
        window.localStorage.setItem(createCacheKey('timestamp', urlA), '1678886400000'); // Exactly current time.

        window.localStorage.setItem(createCacheKey('payload', urlB), '{"value":"data_B"}');
        window.localStorage.setItem(createCacheKey('timestamp', urlB), (1678886400000 - lifetime + 1000).toString()); // Still valid by 1 second.

        window.localStorage.setItem('random_key_outside_cache', 'some_other_value');

        CacheUtility.cleanExpiredEntries();

        checkStrictEqual(window.localStorage.length, 5, 'All items (2 cache pairs + 1 unrelated) should still be present.');
        ok(window.localStorage.getItem(createCacheKey('payload', urlA)), 'Payload A should remain.');
        ok(window.localStorage.getItem(createCacheKey('timestamp', urlA)), 'Timestamp A should remain.');
        ok(window.localStorage.getItem(createCacheKey('payload', urlB)), 'Payload B should remain.');
        ok(window.localStorage.getItem(createCacheKey('timestamp', urlB)), 'Timestamp B should remain.');
        checkStrictEqual(window.localStorage.getItem('random_key_outside_cache'), 'some_other_value', 'Unrelated key should be untouched.');
    });

    test('Cache cleanup with only expired items', function () {
        expect(2);
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should be empty initially.');

        CacheUtility._getTimestamp = () => 1678886400000; // Fixed current time.
        const lifetime = CacheUtility.config.entryExpirationMs;

        const urlX = 'expired/data/X';
        const urlY = 'expired/data/Y';

        window.localStorage.setItem(createCacheKey('payload', urlX), '{"item":"X"}');
        window.localStorage.setItem(createCacheKey('timestamp', urlX), '1600000000000'); // Long ago.

        window.localStorage.setItem(createCacheKey('payload', urlY), '{"item":"Y"}');
        window.localStorage.setItem(createCacheKey('timestamp', urlY), (1678886400000 - lifetime - 500).toString()); // Expired by 500ms.

        CacheUtility.cleanExpiredEntries();

        checkStrictEqual(window.localStorage.length, 0, 'Cache should be entirely empty as all items were expired.');
    });

    test('Cache cleanup with a mix of valid and expired items', function () {
        expect(7);
        checkStrictEqual(window.localStorage.length, 0, 'localStorage should be empty at the start.');

        CacheUtility._getTimestamp = () => 1678886400000; // Fixed current time.
        const lifetime = CacheUtility.config.entryExpirationMs;

        const urlE1 = 'mixed/expired/1';
        const urlE2 = 'mixed/expired/2';
        const urlV1 = 'mixed/valid/1';
        const urlV2 = 'mixed/valid/2';

        // Expired items
        window.localStorage.setItem(createCacheKey('payload', urlE1), '{"content":"E1"}');
        window.localStorage.setItem(createCacheKey('timestamp', urlE1), '1650000000000'); // Old.

        window.localStorage.setItem(createCacheKey('payload', urlE2), '{"content":"E2"}');
        window.localStorage.setItem(createCacheKey('timestamp', urlE2), (1678886400000 - lifetime - 1).toString()); // Just expired.

        // Valid items
        window.localStorage.setItem(createCacheKey('payload', urlV1), '{"content":"V1"}');
        window.localStorage.setItem(createCacheKey('timestamp', urlV1), '1678886400000'); // Current.

        window.localStorage.setItem(createCacheKey('payload', urlV2), '{"content":"V2"}');
        window.localStorage.setItem(createCacheKey('timestamp', urlV2), (1678886400000 - lifetime + 100).toString()); // Still valid.

        window.localStorage.setItem('external_data_source', 'important_info');

        CacheUtility.cleanExpiredEntries();

        checkStrictEqual(window.localStorage.length, 5, 'Only valid cache items and external data should remain.');
        ok(!window.localStorage.getItem(createCacheKey('payload', urlE1)), 'Expired payload E1 should be removed.');
        ok(!window.localStorage.getItem(createCacheKey('payload', urlE2)), 'Expired payload E2 should be removed.');

        ok(window.localStorage.getItem(createCacheKey('payload', urlV1)), 'Valid payload V1 should remain.');
        ok(window.localStorage.getItem(createCacheKey('timestamp', urlV1)), 'Valid timestamp V1 should remain.');
        ok(window.localStorage.getItem(createCacheKey('payload', urlV2)), 'Valid payload V2 should remain.');
        ok(window.localStorage.getItem(createCacheKey('timestamp', urlV2)), 'Valid timestamp V2 should remain.');
        checkStrictEqual(window.localStorage.getItem('external_data_source'), 'important_info', 'External data should be preserved.');
    });

}(jQuery));