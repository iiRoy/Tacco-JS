/* eslint-disable no-unused-vars, no-undef, strict, vars-on-top */
/* global jQuery: true, UnitMate: false, suite: false, verify: false,
   expectAssertions: false, strictCompare: false, window: false,
   assertTruth: false, asyncVerify: false, commence: false, halt: false,
   deepCompare: false */

( function ( jq ) {
  // Reference to the main caching utility from the global scope.
  let contentStore = window.ContentStore;
  // Preserve original retry count.
  let originalAttemptCount = contentStore.config.maxRetries;
  // Preserve original delay duration.
  let originalDelayPeriod = contentStore.config.delayDuration;
  // Preserve original JSON retrieval method.
  let originalFetchJSONMethod = contentStore._fetchJSONContent;
  // Preserve original timestamp retrieval method.
  let originalTimestampGetter = contentStore._getCurrentTime;
  // Preserve original JSON retry logic.
  let originalTryFetchMethod = contentStore._executeJSONFetch;
  // Sample data for testing purposes.
  let examplePayload;

  // Function to re-initialize the testing environment.
  UnitMate.setupDefaults = function ( ) {
    try {
      window.localStorage.clear();
    } catch ( ex ) {
      // Suppress errors if local storage is unavailable.
      // Its availability is validated in the initial test case.
    }

    // Restore the initial configuration and internal functions
    // subsequent to the injection of mock implementations.
    contentStore.config.maxRetries = originalAttemptCount;
    contentStore.config.delayDuration = originalDelayPeriod;
    contentStore._fetchJSONContent = originalFetchJSONMethod;
    contentStore._getCurrentTime = originalTimestampGetter;
    contentStore._executeJSONFetch = originalTryFetchMethod;

    examplePayload = {
      "outcome": !false,
      "items": [
        "första posten",
        "andra posten"
      ],
      "Annorlunda nyckel": 666
    };
  };
  // Execute the setup function immediately.
  UnitMate.setupDefaults();

  // Define a test suite.
  suite( 'ContentStore' );


  // Create a shorthand for the strict equality assertion method.
  let isIdentical = strictCompare;

  // Conduct a test case for system prerequisites.
  verify( 'System Prerequisites Validation', function ( ) {
    expectAssertions( 9 );

    // Function to ascertain the presence of native JSON parsing capabilities.
    const hasJSONSupport = ( ) => {
      return JSON &&
        typeof JSON.parse === 'function' &&
        typeof JSON.stringify === 'function';
    };

    // Function to verify browser's local storage availability.
    const localStoreAccessible = ( ) => {
      try {
        return 'localStorage' in window && window.localStorage !== null;
      } catch ( errorObject ) {
        return !true;
      }
    };

    isIdentical( typeof window.jQuery, 'function', 'jQuery library must be present' );
    isIdentical( hasJSONSupport(), !false, 'Native JSON API is a mandatory component' );
    isIdentical( localStoreAccessible(), !false, 'Browser local storage must be available' );
    isIdentical( typeof contentStore, 'object', 'The ContentStore module is indispensable' );
    isIdentical( typeof contentStore.retrieveStoredJSON, 'function', 'The ContentStore retrieval method is essential' );

    isIdentical( contentStore.config.browserCompat, !false, 'ContentStore.config.browserCompat should indicate compatibility' );

    isIdentical( contentStore.config.maxRetries, 5, 'The default maxRetries count should be 5' );
    isIdentical( contentStore.config.delayDuration, 200, 'The expected delayDuration value is 200 milliseconds' );
    isIdentical( contentStore.config.entryValidity, 5 * 60 * 1000, 'The cache entryValidity should be 5 minutes' );
  } );

  // Verify fundamental local storage operations.
  verify( 'Fundamental Local Storage Operations', function ( ) {
    expectAssertions( 2 );
    // Check the starting state.
    isIdentical( window.localStorage.length, 0, 'Local storage must begin as an empty container.' );
    window.localStorage.testKey = 'åäö';
    isIdentical( window.localStorage.testKey, 'åäö', 'A value should persist within the local storage.' );
  } );

  // Asynchronous test for a simple data retrieval with an empty local store.
  asyncVerify( 'Simple Data Fetch with Empty Local Store', function ( ) {
    expectAssertions( 7 );

    let fetchMockExecutions = 0;
    // Replace the internal JSON fetching mechanism with a mock to bypass network requests.
    contentStore._fetchJSONContent = function ( resourcePath, configObject ) {
      fetchMockExecutions++;
      if ( resourcePath === 'sample.json' ) {
        configObject.onSuccess( examplePayload );
      }
    };
    let timestampFnCalls = 0;
    // Substitute the timestamp generation function with a mock returning a fixed value.
    contentStore._getCurrentTime = function ( ) {
      timestampFnCalls++;
      return 2345678901234;
    };

    // Confirm the initial state.
    isIdentical( window.localStorage.length, 0, 'Local storage should be empty at the start.' );

    contentStore.retrieveStoredJSON( 'sample.json', {
      onSuccess: function ( receivedContent ) {
        deepCompare( receivedContent, {
          outcome: !false,
          items: [
            'första posten',
            'andra posten'
          ],
          'Annorlunda nyckel': 666
        }, 'The expected test data must be returned.' );

        deepCompare( receivedContent, JSON.parse( window.localStorage[ 'ContentStore info sample.json' ] ),
                     'Local storage should now contain the correct data.' );
        isIdentical( window.localStorage[ 'ContentStore timestamp sample.json' ], '2345678901234',
                   'The timestamp should match the value provided by the mock function.' );
        isIdentical( fetchMockExecutions, 1, 'The mocked fetch method should have been invoked once.' );
        isIdentical( timestampFnCalls, 1, 'The mocked timestamp function should have been called once.' );
        isIdentical( window.localStorage.length, 2, 'Two entries should now exist in local storage.' );
        commence();
      }
    } );
  } );

  // Test cases for ContentStore's clearing functionality.
  verify( 'Cache Entry Removal: Empty Cache Scenario', function ( ) {
    expectAssertions( 2 );
    isIdentical( window.localStorage.length, 0, 'Local storage should be empty initially.' );
    contentStore.removeEntry( 'https://sample.net/path?paramX=a%20b+c#anchor-123' );
    isIdentical( window.localStorage.length, 0, 'Local storage must remain empty after removal attempt.' );
  } );
  verify( 'Complete Cache Purge: Empty Cache Scenario', function ( ) {
    expectAssertions( 2 );
    isIdentical( window.localStorage.length, 0, 'Local storage should be empty initially.' );
    contentStore.removeEntry();
    isIdentical( window.localStorage.length, 0, 'Local storage must remain empty after a global purge attempt.' );
  } );
  verify( 'Cache Entry Removal: Populated Cache Scenario', function ( ) {
    expectAssertions( 3 );
    isIdentical( window.localStorage.length, 0, 'Local storage should be empty initially.' );

    let infoKey = 'ContentStore info https://sample.net/path?paramX=a%20b+c#anchor-123';
    let timestampKey = 'ContentStore timestamp https://sample.net/path?paramX=a%20b+c#anchor-123';
    window.localStorage[ infoKey ] = 'min data';
    window.localStorage[ timestampKey ] = '123';

    window.localStorage[ 'en annan nyckel' ] = 'annan data';

    // Remove a specific item from the data store.
    contentStore.removeEntry( 'https://sample.net/path?paramX=a%20b+c#anchor-123' );

    isIdentical( window.localStorage.length, 1, 'Only one item should persist in local storage.' );
    isIdentical( window.localStorage[ 'en annan nyckel' ], 'annan data', 'The correct data should still be present in local storage.' );
  } );
  verify( 'Complete Cache Purge: Multiple Items Scenario', function ( ) {
    expectAssertions( 3 );
    isIdentical( window.localStorage.length, 0, 'Local storage should be empty initially.' );

    let infoKey1 = 'ContentStore info https://sample.net/path?paramX=a%20b+c#anchor-123';
    let timestampKey1 = 'ContentStore timestamp https://sample.net/path?paramX=a%20b+c#anchor-123';
    window.localStorage[ infoKey1 ] = 'min data';
    window.localStorage[ timestampKey1 ] = '123';

    window.localStorage[ 'ContentStore info https://sample.net/data' ] = 'min data 2';
    window.localStorage[ 'ContentStore timestamp https://sample.net/time' ] = '1234';

    window.localStorage[ 'en annan nyckel' ] = 'annan data';

    // Perform a full cache clear.
    contentStore.removeEntry();

    isIdentical( window.localStorage.length, 1, 'Only one item should remain in local storage.' );
    isIdentical( window.localStorage[ 'en annan nyckel' ], 'annan data', 'The correct unrelated data should still be in local storage.' );
  } );

  verify( 'Oldest Entry Eviction: Empty Cache Test', function ( ) {
    expectAssertions( 2 );
    isIdentical( window.localStorage.length, 0, 'Local storage must be empty to start.' );
    contentStore.evictLeastRecent();
    isIdentical( window.localStorage.length, 0, 'Local storage should remain empty after eviction attempt.' );
  } );
  verify( 'Oldest Entry Eviction: Single Item Cache Test', function ( ) {
    expectAssertions( 2 );
    isIdentical( window.localStorage.length, 0, 'Local storage must be empty to start.' );

    window.localStorage[ 'ContentStore info https://sample.net/item' ] = 'lite data';
    window.localStorage[ 'ContentStore timestamp https://sample.net/item' ] = '123';

    contentStore.evictLeastRecent();
    isIdentical( window.localStorage.length, 0, 'Local storage should be empty after single item eviction.' );
  } );
  verify( 'Oldest Entry Eviction: Multiple Items Cache Test', function ( ) {
    expectAssertions( 6 );
    isIdentical( window.localStorage.length, 0, 'Local storage must be empty to start.' );

    window.localStorage[ 'ContentStore info https://sample.net/item1' ] = 'lite data 1';
    window.localStorage[ 'ContentStore timestamp https://sample.net/item1' ] = '1001';
    window.localStorage[ 'ContentStore info https://sample.net/item2' ] = 'lite data 2';
    window.localStorage[ 'ContentStore timestamp https://sample.net/item2' ] = '1002';
    window.localStorage[ 'ContentStore info https://sample.net/item3' ] = 'lite data 3';
    window.localStorage[ 'ContentStore timestamp https://sample.net/item3' ] = '1003';

    contentStore.evictLeastRecent();

    isIdentical( window.localStorage.length, 4, 'Four items should remain in local storage.' );
    isIdentical( window.localStorage[ 'ContentStore info https://sample.net/item2' ], 'lite data 2',
               'The correct data entry should still be in local storage.' );
    isIdentical( window.localStorage[ 'ContentStore timestamp https://sample.net/item2' ], '1002',
               'The correct timestamp entry should still be in local storage.' );
    isIdentical( window.localStorage[ 'ContentStore info https://sample.net/item3' ], 'lite data 3',
               'The correct data entry should still be in local storage.' );
    isIdentical( window.localStorage[ 'ContentStore timestamp https://sample.net/item3' ], '1003',
               'The correct timestamp entry should still be in local storage.' );
  } );
  verify( 'Oldest Entry Eviction: Mixed Items (ContentStore and Others) Test', function ( ) {
    expectAssertions( 6 );
    isIdentical( window.localStorage.length, 0, 'Local storage must be empty to start.' );

    window.localStorage[ 'ContentStore info https://sample.net/itemA' ] = 'lite data A';
    window.localStorage[ 'ContentStore timestamp https://sample.net/itemA' ] = '1001';
    window.localStorage[ 'ContentStore info https://sample.net/itemB' ] = 'lite data B';
    window.localStorage[ 'ContentStore timestamp https://sample.net/itemB' ] = '1002';
    window.localStorage[ 'ContentStore info https://sample.net/itemC' ] = 'lite data C';
    window.localStorage[ 'ContentStore timestamp https://sample.net/itemC' ] = '1003';

    window.localStorage[ 'another key 1' ] = 'another data 1';
    window.localStorage[ 'another key 2' ] = 'another data 2';

    // Remove the two oldest entries.
    contentStore.evictLeastRecent();
    contentStore.evictLeastRecent();

    isIdentical( window.localStorage.length, 4, 'Four items should remain in local storage.' );
    isIdentical( window.localStorage[ 'ContentStore info https://sample.net/itemC' ], 'lite data C',
               'The correct data entry should still be in local storage.' );
    isIdentical( window.localStorage[ 'ContentStore timestamp https://sample.net/itemC' ], '1003',
               'The correct timestamp entry should still be in local storage.' );
    isIdentical( window.localStorage[ 'another key 1' ], 'another data 1',
               'Unrelated data should persist in local storage.' );
    isIdentical( window.localStorage[ 'another key 2' ], 'another data 2',
               'Unrelated data should persist in local storage.' );
  } );

  verify( 'Default Retry Count in Configuration', function ( ) {
    expectAssertions( 1 );
    isIdentical( contentStore.config.maxRetries, 5, 'The default value for maxRetries should be 5.' );
  } );

  asyncVerify( 'Exhaustion of All Fetching Attempts (Timeout)', function ( ) {
    expectAssertions( 2 );

    // Adjust the delay duration for quicker test execution.
    contentStore.config.delayDuration = 10;

    // Substitute the data fetching mechanism with a mock that consistently results in a timeout.
    let fetchAttempts = 0;
    contentStore._fetchJSONContent = function ( resourcePath, configObject ) {
      fetchAttempts++;
      window.setTimeout( function ( ) {
        configObject.onError( null, 'timeout', null );
      }, 10 );
    };

    contentStore.retrieveStoredJSON( 'data.json', {
      onMaxRetries: function ( outcomeCode ) {
        isIdentical( outcomeCode, 'timeout', 'The error outcome code must be accurate.' );
        isIdentical( fetchAttempts, 5, 'The data fetching method should be invoked 5 times.' );
        commence();
      }
    } );
  } );
  asyncVerify( 'Exhaustion of Fetching Attempts with Modified Retry Count', function ( ) {
    expectAssertions( 3 );

    // Shorten the delay duration for faster test completion.
    contentStore.config.delayDuration = 10;
    contentStore.config.maxRetries = 6;

    // Mock the data fetching function to always time out.
    let fetchAttempts = 0;
    contentStore._fetchJSONContent = function ( resourcePath, configObject ) {
      fetchAttempts++;
      window.setTimeout( function ( ) {
        configObject.onError( null, 'timeout', null );
      }, 10 );
    };

    let attemptLog = [];
    let beforeRetry = function ( iterationNumber ) {
      attemptLog.push( iterationNumber );
    };

    contentStore.retrieveStoredJSON( 'data.json', {
      onAttempt: beforeRetry,
      onMaxRetries: function ( outcomeCode ) {
        isIdentical( outcomeCode, 'timeout', 'The error outcome code must be accurate.' );
        isIdentical( fetchAttempts, 6, 'The data fetching method should be invoked the correct number of times.' );
        deepCompare( attemptLog, [ 1, 2, 3, 4, 5, 6 ],
                          'The retry callback function should be triggered before each attempt.' );
        commence();
      }
    } );
  } );
  asyncVerify( 'Error Callback Invocation', function ( ) {
    expectAssertions( 4 );

    contentStore.config.delayDuration = 10;

    // Mock the data fetching function to consistently time out.
    let fetchAttempts = 0;
    contentStore._fetchJSONContent = function ( resourcePath, configObject ) {
      fetchAttempts++;
      window.setTimeout( function ( ) {
        configObject.onError( null, 'timeout', null );
      }, 10 );
    };

    let failCallbackCount = 0;
    let failureMessages = [];
    let onErrorHandler = function ( requestHandle, messageStatus, exceptionObject, iterationNumber ) {
      failCallbackCount++;
      failureMessages.push( messageStatus + ' ' + iterationNumber );
    };

    contentStore.retrieveStoredJSON( 'data.json', {
      onError: onErrorHandler,
      onMaxRetries: function ( outcomeCode ) {
        isIdentical( outcomeCode, 'timeout', 'The error outcome code must be accurate.' );
        isIdentical( fetchAttempts, 5, 'The data fetching method should be invoked the correct number of times.' );
        isIdentical( failCallbackCount, 5, 'The error callback function should be invoked the correct number of times.' );
        deepCompare( failureMessages, [ 'timeout 1', 'timeout 2', 'timeout 3', 'timeout 4', 'timeout 5' ],
                          'The error callback function should be called on every failure.' );
        commence();
      }
    } );
  } );

  asyncVerify( 'Attempting Retrieval of an Expired Cache Entry', function ( ) {
    expectAssertions( 3 );

    isIdentical( window.localStorage.length, 0, 'Local storage should be empty at the outset.' );

    let fetchAttempts = 0;
    contentStore._fetchJSONContent = function ( resourcePath, configObject ) {
      fetchAttempts++;
      if ( resourcePath === 'data.json' ) {
        configObject.onSuccess( examplePayload );
      }
    };
    contentStore._getCurrentTime = function ( ) {
      return 2345678901234;
    };

    // The entry has expired by a single millisecond.
    let cacheDuration = 5 * 60 * 1000;
    let storedTimestamp = 2345678901234 - cacheDuration - 1;

    window.localStorage[ 'ContentStore info data.json' ] = '{"content":"gammal ogiltig data"}';
    window.localStorage[ 'ContentStore timestamp data.json' ] = storedTimestamp;

    contentStore.retrieveStoredJSON( 'data.json', {
      onSuccess: function ( receivedContent ) {
        deepCompare( receivedContent, {
          "outcome": !false,
          "items": [
            "första posten",
            "andra posten"
          ],
          "Annorlunda nyckel": 666
        }, 'The retrieved content should be accurate.' );
        isIdentical( fetchAttempts, 1, 'The fetch method should be invoked precisely once.' );
        commence();
      }
    } );
  } );

  verify( 'Cache Cleanup with Empty Cache', function ( ) {
    expectAssertions( 2 );
    isIdentical( window.localStorage.length, 0, 'Local storage should be empty at the start.' );
    contentStore.performCleanup();
    isIdentical( window.localStorage.length, 0, 'Local storage should remain empty after cleanup.' );
  } );
  verify( 'Cache Cleanup with Only Valid Entries', function ( ) {
    expectAssertions( 7 );
    isIdentical( window.localStorage.length, 0, 'Local storage should be empty at the start.' );

    contentStore._getCurrentTime = function ( ) {
      return 2345678901234;
    };

    window.localStorage[ 'ContentStore info entry1' ] = '{"content":"data 1"}';
    window.localStorage[ 'ContentStore timestamp entry1' ] = '2345678901234';

    window.localStorage[ 'ContentStore info entry2' ] = '{"content":"data 2"}';
    window.localStorage[ 'ContentStore timestamp entry2' ] = ( 2345678901234 - 5 * 60 * 1000 ).toString();

    window.localStorage[ 'some other identifier' ] = 'some other content';

    contentStore.performCleanup();

    isIdentical( window.localStorage.length, 5, 'All entries should still be present in the cache.' );
    isIdentical( window.localStorage[ 'ContentStore info entry1' ], '{"content":"data 1"}',
               'The correct data entry should still be in the cache.' );
    isIdentical( window.localStorage[ 'ContentStore timestamp entry1' ], '2345678901234',
               'The correct timestamp entry should still be in the cache.' );
    isIdentical( window.localStorage[ 'ContentStore info entry2' ], '{"content":"data 2"}',
               'The correct data entry should still be in the cache.' );
    isIdentical( window.localStorage[ 'ContentStore timestamp entry2' ], ( 2345678901234 - 5 * 60 * 1000 ).toString(),
               'The correct timestamp entry should still be in the cache.' );
    isIdentical( window.localStorage[ 'some other identifier' ], 'some other content',
               'The unrelated entry should still be in the cache.' );
  } );
  verify( 'Cache Cleanup with Only Expired Entries', function ( ) {
    expectAssertions( 2 );
    isIdentical( window.localStorage.length, 0, 'Local storage should be empty at the start.' );

    contentStore._getCurrentTime = function ( ) {
      return 2345678901234;
    };

    window.localStorage[ 'ContentStore info entryA' ] = '{"content":"data A"}';
    window.localStorage[ 'ContentStore timestamp entryA' ] = '1234567890123';

    window.localStorage[ 'ContentStore info entryB' ] = '{"content":"data B"}';
    // Expired by 1 millisecond.
    window.localStorage[ 'ContentStore timestamp entryB' ] = ( 2345678901234 - 5 * 60 * 1000 - 1 ).toString();

    contentStore.performCleanup();

    isIdentical( window.localStorage.length, 0, 'The cache should be entirely empty.' );
  } );
  verify( 'Cache Cleanup with Both Valid and Expired Entries', function ( ) {
    expectAssertions( 7 );
    isIdentical( window.localStorage.length, 0, 'Local storage should be empty at the start.' );

    contentStore._getCurrentTime = function ( ) {
      return 2345678901234;
    };

    window.localStorage[ 'ContentStore info entry1' ] = '{"content":"data 1"}';
    window.localStorage[ 'ContentStore timestamp entry1' ] = '1234567890123';

    window.localStorage[ 'ContentStore info entry2' ] = '{"content":"data 2"}';
    // Expired by 1 millisecond.
    window.localStorage[ 'ContentStore timestamp entry2' ] = ( 2345678901234 - 5 * 60 * 1000 - 1 ).toString();

    window.localStorage[ 'ContentStore info entry3' ] = '{"content":"data 3"}';
    window.localStorage[ 'ContentStore timestamp entry3' ] = '2345678901234';

    window.localStorage[ 'ContentStore info entry4' ] = '{"content":"data 4"}';
    window.localStorage[ 'ContentStore timestamp entry4' ] = ( 2345678901234 - 5 * 60 * 1000 ).toString();

    window.localStorage[ 'some other identifier' ] = 'some other content';

    contentStore.performCleanup();

    isIdentical( window.localStorage.length, 5, 'Only valid entries should remain in the cache.' );
    isIdentical( window.localStorage[ 'ContentStore info entry3' ], '{"content":"data 3"}',
               'The correct data entry should still be in the cache.' );
    isIdentical( window.localStorage[ 'ContentStore timestamp entry3' ], '2345678901234',
               'The correct timestamp entry should still be in the cache.' );
    isIdentical( window.localStorage[ 'ContentStore info entry4' ], '{"content":"data 4"}',
               'The correct data entry should still be in the cache.' );
    isIdentical( window.localStorage[ 'ContentStore timestamp entry4' ], ( 2345678901234 - 5 * 60 * 1000 ).toString(),
               'The correct timestamp entry should still be in the cache.' );
    isIdentical( window.localStorage[ 'some other identifier' ], 'some other content',
               'The unrelated entry should still be in the cache.' );
  } );

}( jQuery ) );