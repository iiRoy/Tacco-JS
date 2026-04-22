/* This file contains QUnit tests for the JSONCache library. */
/*
 * JSLint and JSHint directives for code quality and global variable declarations.
 */
/* jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
   regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
   indent: 4 */
/* global jQuery: false, module: false, test: false, expect: false,
   strictEqual: false, window: false, ok: false, QUnit: false,
   asyncTest: false, start: false, stop: false, deepEqual: false */


( function ( $ ) {

  // Store original JSONCache settings and functions for restoration after tests.
  var JSONCache     = window.JSONCache;
  var _numTries     = JSONCache.settings.numTries;
  var _waitTime     = JSONCache.settings.waitTime;
  var _getJSONProxy = JSONCache._getJSONProxy;
  var _getTime      = JSONCache._getTime;
  var _tryGetJSON   = JSONCache._tryGetJSON;

  // Variable to hold common test data.
  var testData;


  // QUnit reset hook: This function is called before each test to ensure a clean state.
  QUnit.reset = function () {
    try {
      // Attempt to clear localStorage to prevent test interference.
      window.localStorage.clear();
    }
    catch ( e ) {
      // If localStorage is not supported or throws an error, fail silently.
      // The first test case verifies localStorage support.
    }

    // Restore original JSONCache settings and internal functions.
    // This is crucial for isolating test side effects.
    JSONCache.settings.numTries   = _numTries;
    JSONCache.settings.waitTime   = _waitTime;
    JSONCache._getJSONProxy = _getJSONProxy;
    JSONCache._getTime      = _getTime;
    JSONCache._tryGetJSON   = _tryGetJSON;

    // Define standard test data for use across multiple tests.
    testData = {
      "success"   : true,
      "data"      : [
        "först item",
        "secönd itém"
      ],
      "Weird väl" : 666
    };
  };

  // Execute the reset function once to set up the initial test environment.
  QUnit.reset();


  // QUnit module definition: Grouping related tests under 'JSONCache'.
  module( 'JSONCache' );


  // Create a convenient alias for QUnit's strict equality assertion (===).
  var eq = strictEqual;


  // Test case: Verify all external and internal requirements for JSONCache.
  test( 'Requirements.', function () {
    // We expect 9 assertions to be made in this test.
    expect( 9 );

    // Helper function to detect native JSON parser support.
    var jsonSupported = function () {
      return JSON &&
        typeof JSON.parse   === 'function' &&
        typeof JSON.stringify === 'function';
    };

    // Helper function to detect localStorage support.
    var localStorageSupported = function () {
      try {
        return 'localStorage' in window && window.localStorage !== null;
      }
      catch ( e ) {
        // If accessing localStorage throws an error (e.g., security restrictions), it's not supported.
        return false;
      }
    };

    // Assert that jQuery is available and is a function.
    eq( typeof window.jQuery, 'function', 'jQuery is required' );
    // Assert that native JSON parsing functions are available.
    eq( jsonSupported(), true, 'JSON is required' );
    // Assert that localStorage is available and functional.
    eq( localStorageSupported(), true, 'localStorage is required' );
    // Assert that the JSONCache object itself exists.
    eq( typeof JSONCache, 'object', 'JSONCache is required' );
    // Assert that the main caching function `getCachedJSON` exists.
    eq( typeof JSONCache.getCachedJSON, 'function', 'JSONCache is required' );

    // Assert the browser compatibility flag.
    eq( JSONCache.settings.browserOk, true, 'JSONCache.browserOk' );

    // Assert default settings values.
    eq( JSONCache.settings.numTries,     5,             'numTries should be the one expected.' );
    eq( JSONCache.settings.waitTime,     200,           'waitTime should be the one expected.' );
    eq( JSONCache.settings.itemLifetime, 5 * 60 * 1000, 'itemLifetime should be the one expected.' );
  } );


  // Test case: Basic functionality of browser's localStorage.
  test( 'Basic localStorage functionality', function () {
    // This test expects 2 assertions.
    expect( 2 );

    // Initial condition: localStorage should be empty before the test.
    eq( window.localStorage.length, 0, 'localStorage should be empty.' );

    // Store a test value in localStorage.
    window.localStorage.test = 'åäö';

    // Assert that the value was correctly stored and can be retrieved.
    eq( window.localStorage.test, 'åäö', 'Value should be saved in the localStorage.' );
  } );


  // Asynchronous test case: Verify basic fetching and caching with an empty localStorage.
  asyncTest( 'Basic fetch with an empty localStorage.', function () {
    // This asynchronous test expects 7 assertions.
    expect( 7 );

    var proxyMockCallCount = 0;
    // Mock the internal _getJSONProxy function to simulate network calls without actual HTTP requests.
    JSONCache._getJSONProxy = function ( url, options ) {
      proxyMockCallCount++; // Increment call counter for verification.
      if ( url === 'data.json' ) {
        options.success( testData ); // Simulate a successful JSON response.
      }
    };

    var timeMockCallCount = 0;
    // Mock the internal _getTime function to provide a static, predictable timestamp.
    JSONCache._getTime = function () {
      timeMockCallCount++; // Increment call counter for verification.
      return 2345678901234;
    };

    // Initial condition: Ensure localStorage is empty before this test starts.
    eq( window.localStorage.length, 0, 'localStorage should be empty.' );

    // Call getCachedJSON to fetch data.
    JSONCache.getCachedJSON( 'data.json', {
      success : function ( data ) {
        // Assert that the returned data matches the expected test data.
        deepEqual( data, {
          success     : true,
          data        : [
            'först item',
            'secönd itém'
          ],
          'Weird väl' : 666
        }, 'Correct test data should be returned.' );

        // Assert that localStorage was populated with the correct JSON data.
        deepEqual( data, JSON.parse( window.localStorage[ 'JSONCache data data.json' ] ),
                   'localStorage should be populated with the correct data.' );
        // Assert that the timestamp was stored correctly using the mock function's return value.
        eq( window.localStorage[ 'JSONCache time data.json' ], '2345678901234',
           'Timestamp should be the one returned by the static mock function.' );
        // Verify that the mocked proxy function was called exactly once.
        eq( proxyMockCallCount, 1, 'Mocked json proxy should be called once.' );
        // Verify that the mocked time function was called exactly once.
        eq( timeMockCallCount, 1, 'Mocked timestamp function should be called once.' );
        // Verify that two items (data and time) were stored in localStorage.
        eq( window.localStorage.length, 2, 'There should be two items in the localStorage.' );
        start(); // Signal QUnit that the asynchronous test has completed.
      }
    } );
  } );


  // JSONCache.clear() tests.

  // Test case: Clearing a specific item from an empty cache.
  test( 'Cache item clearing with empty cache.', function () {
    expect( 2 );
    eq( window.localStorage.length, 0, 'localStorage should be empty in the beginning.' );
    JSONCache.clear( 'http://example.org/key?param1=a%20b+c#hash-123' );
    eq( window.localStorage.length, 0, 'localStorage should be empty in the end.' );
  } );

  // Test case: Clearing the entire cache when it's already empty.
  test( 'Whole cache clearing with empty cache.', function () {
    expect( 2 );
    eq( window.localStorage.length, 0, 'localStorage should be empty in the beginning.' );
    JSONCache.clear();
    eq( window.localStorage.length, 0, 'localStorage should be empty in the end.' );
  } );

  // Test case: Clearing a specific item from a cache containing other items.
  test( 'Cache item clearing with items in the cache.', function () {
    expect( 3 );
    eq( window.localStorage.length, 0, 'localStorage should be empty in the beginning.' );

    // Define keys for cached data and time.
    var dataKey = 'JSONCache data http://example.org/key?param1=a%20b+c#hash-123';
    var timeKey = 'JSONCache time http://example.org/key?param1=a%20b+c#hash-123';
    // Populate localStorage with a cache item.
    window.localStorage[ dataKey ] = 'my dätä';
    window.localStorage[ timeKey ] = '123';

    // Add another non-JSONCache item to localStorage.
    window.localStorage[ 'öther kéy' ] = 'öther dätä';

    // Call clear to remove the specific cache item.
    JSONCache.clear( 'http://example.org/key?param1=a%20b+c#hash-123' );

    // Assert that only the non-JSONCache item remains.
    eq( window.localStorage.length, 1, 'There should be one item in the localStorage.' );
    eq( window.localStorage[ 'öther kéy' ], 'öther dätä', 'Correct data should be in the localStorage.' );
  } );

  // Test case: Clearing the entire cache when it contains several items, including non-JSONCache ones.
  test( 'Whole cache clearing with several items in the cache.', function () {
    expect( 3 );
    eq( window.localStorage.length, 0, 'localStorage should be empty in the beginning.' );

    // Populate with several JSONCache items.
    var dataKey = 'JSONCache data http://example.org/key?param1=a%20b+c#hash-123';
    var timeKey = 'JSONCache time http://example.org/key?param1=a%20b+c#hash-123';
    window.localStorage[ dataKey ] = 'my dätä';
    window.localStorage[ timeKey ] = '123';

    window.localStorage[ 'JSONCache data http://example.org/data' ] = 'my dätä 2';
    window.localStorage[ 'JSONCache time http://example.org/time' ] = '1234';

    // Add a non-JSONCache item.
    window.localStorage[ 'öther kéy' ] = 'öther dätä';

    // Clear the entire JSONCache.
    JSONCache.clear();

    // Assert that only the non-JSONCache item remains.
    eq( window.localStorage.length, 1, 'There should be one item in the localStorage.' );
    eq( window.localStorage[ 'öther kéy' ], 'öther dätä', 'Correct data should be in the localStorage.' );
  } );


  // JSONCache.purgeOldest() tests.

  // Test case: Purging the oldest item from an empty cache.
  test( 'Test oldest item removing with empty cache.', function () {
    expect( 2 );
    eq( window.localStorage.length, 0, 'localStorage should be empty in the beginning.' );
    JSONCache.purgeOldest();
    eq( window.localStorage.length, 0, 'localStorage should be empty in the end.' );
  } );

  // Test case: Purging the oldest item when only one item exists.
  test( 'Test oldest item removing with one item in the cache.', function () {
    expect( 2 );
    eq( window.localStorage.length, 0, 'localStorage should be empty in the beginning.' );

    // Add a single JSONCache item.
    window.localStorage[ 'JSONCache data http://example.org/data' ] = 'söme dätä';
    window.localStorage[ 'JSONCache time http://example.org/data' ] = '123';

    // Purge the oldest item.
    JSONCache.purgeOldest();
    eq( window.localStorage.length, 0, 'localStorage should be empty in the end.' );
  } );

  // Test case: Purging the oldest item from a cache with multiple JSONCache items.
  test( 'Test oldest item removing with several items in the cache.', function () {
    expect( 6 );
    eq( window.localStorage.length, 0, 'localStorage should be empty in the beginning.' );

    // Add three JSONCache items with different timestamps.
    window.localStorage[ 'JSONCache data http://example.org/data1' ] = 'söme dätä 1';
    window.localStorage[ 'JSONCache time http://example.org/data1' ] = '1001'; // Oldest
    window.localStorage[ 'JSONCache data http://example.org/data2' ] = 'söme dätä 2';
    window.localStorage[ 'JSONCache time http://example.org/data2' ] = '1002';
    window.localStorage[ 'JSONCache data http://example.org/data3' ] = 'söme dätä 3';
    window.localStorage[ 'JSONCache time http://example.org/data3' ] = '1003'; // Newest

    // Purge the oldest item (data1).
    JSONCache.purgeOldest();

    // After purging, data1 (and its time) should be gone, leaving data2 and data3 (4 items total).
    eq( window.localStorage.length, 4, 'There should be four items in localStorage.' );
    eq( window.localStorage[ 'JSONCache data http://example.org/data2' ], 'söme dätä 2',
       'Correct data should be in localStorage.' );
    eq( window.localStorage[ 'JSONCache time http://example.org/data2' ], '1002',
       'Correct data should be in localStorage.' );
    eq( window.localStorage[ 'JSONCache data http://example.org/data3' ], 'söme dätä 3',
       'Correct data should be in localStorage.' );
    eq( window.localStorage[ 'JSONCache time http://example.org/data3' ], '1003',
       'Correct data should be in localStorage.' );
  } );

  // Test case: Purging oldest items when cache contains both JSONCache and non-JSONCache items.
  test( 'Test oldest item removing with several items (including non JSONCache items).', function () {
    expect( 6 );
    eq( window.localStorage.length, 0, 'localStorage should be empty in the beginning.' );

    // Add three JSONCache items.
    window.localStorage[ 'JSONCache data http://example.org/data1' ] = 'söme dätä 1';
    window.localStorage[ 'JSONCache time http://example.org/data1' ] = '1001';
    window.localStorage[ 'JSONCache data http://example.org/data2' ] = 'söme dätä 2';
    window.localStorage[ 'JSONCache time http://example.org/data2' ] = '1002';
    window.localStorage[ 'JSONCache data http://example.org/data3' ] = 'söme dätä 3';
    window.localStorage[ 'JSONCache time http://example.org/data3' ] = '1003';

    // Add two non-JSONCache items.
    window.localStorage[ 'öther key 1' ] = 'öther dätä 1';
    window.localStorage[ 'öther key 2' ] = 'öther dätä 2';

    // Clear two oldest JSONCache items (data1 and data2).
    JSONCache.purgeOldest();
    JSONCache.purgeOldest();

    // Remaining items should be data3 and the two 'other' keys.
    eq( window.localStorage.length, 4, 'There should be four items in localStorage.' );
    eq( window.localStorage[ 'JSONCache data http://example.org/data3' ], 'söme dätä 3',
       'Correct data should be in localStorage.' );
    eq( window.localStorage[ 'JSONCache time http://example.org/data3' ], '1003',
       'Correct data should be in localStorage.' );
    eq( window.localStorage[ 'öther key 1' ], 'öther dätä 1',
       'Correct data should be in localStorage.' );
    eq( window.localStorage[ 'öther key 2' ], 'öther dätä 2',
       'Correct data should be in localStorage.' );
  } );


  // Test case: Verifying the default number of tries for fetching.
  test( 'Default numTries in settings.', function () {
    expect( 1 );
    eq( JSONCache.settings.numTries, 5, 'Default tryCount value should be 5.' );
  } );


  // Asynchronous test case: Simulate network timeouts for all fetching attempts.
  asyncTest( 'Timeout for all fetching tries.', function () {
    expect( 2 );

    // Temporarily reduce wait time for quicker test execution.
    JSONCache.settings.waitTime = 10;

    var proxyCallCount = 0;
    // Mock the proxy function to always simulate a timeout error after a short delay.
    JSONCache._getJSONProxy = function ( url, options ) {
      proxyCallCount++;
      window.setTimeout( function () {
        options.error( null, 'timeout', null ); // Simulate a timeout error.
      }, 10 );
    };

    // Call getCachedJSON and expect the ongiveup callback to be triggered.
    JSONCache.getCachedJSON( 'data.json', {
      ongiveup : function ( status ) {
        eq( status, 'timeout', 'Error status should be correct.' );
        // Assert that the proxy function was called `numTries` (default 5) times.
        eq( proxyCallCount, 5, 'Proxy function should be called 5 times.' );
        start(); // Signal QUnit that the async test is done.
      }
    } );
  } );


  // Asynchronous test case: Test timeout behavior with a custom number of tries.
  asyncTest( 'Timeout for all fetching tries with changed number of tries.', function () {
    expect( 3 );

    // Set shorter wait time for faster tests.
    JSONCache.settings.waitTime = 10;
    // Change the number of tries for this specific test.
    JSONCache.settings.numTries = 6;

    var proxyCallCount = 0;
    // Mock the proxy function to always time out.
    JSONCache._getJSONProxy = function ( url, options ) {
      proxyCallCount++;
      window.setTimeout( function () {
        options.error( null, 'timeout', null );
      }, 10 );
    };

    var retryArgs = [];
    // Define a callback for the 'ontry' hook to track call arguments.
    var ontry = function ( tryNumber ) {
      retryArgs.push( tryNumber );
    };

    JSONCache.getCachedJSON( 'data.json', {
      ontry    : ontry, // Assign the 'ontry' hook.
      ongiveup : function ( status ) {
        eq( status, 'timeout', 'Error status should be correct.' );
        // Verify the proxy was called the custom number of times.
        eq( proxyCallCount, 6, 'Proxy function should be called the correct amount of times.' );
        // Verify the 'ontry' hook was called for each attempt with correct try numbers.
        deepEqual( retryArgs, [ 1, 2, 3, 4, 5, 6 ],
                  'The retry hook function should be called before each try.' );
        start();
      }
    } );
  } );


  // Asynchronous test case: Verify the 'onerror' hook functionality during retries.
  asyncTest( 'Error hook calling.', function () {
    expect( 4 );

    JSONCache.settings.waitTime = 10;

    var proxyCallCount = 0;
    // Mock the proxy function to always simulate a timeout error.
    JSONCache._getJSONProxy = function ( url, options ) {
      proxyCallCount++;
      window.setTimeout( function () {
        options.error( null, 'timeout', null );
      }, 10 );
    };

    var errorCallCount = 0;
    var errorArgs      = [];
    // Define a callback for the 'onerror' hook to track call arguments.
    var onerror = function ( jqXHR, textStatus, errorThrown, tryNumber ) {
      errorCallCount++;
      errorArgs.push( textStatus + ' ' + tryNumber );
    };

    JSONCache.getCachedJSON( 'data.json', {
      onerror  : onerror, // Assign the 'onerror' hook.
      ongiveup : function ( status ) {
        eq( status, 'timeout', 'Error status should be correct.' );
        eq( proxyCallCount, 5, 'Proxy function should be called the correct amount of times.' );
        // Verify the 'onerror' hook was called for each failed attempt.
        eq( errorCallCount, 5, 'Error function should be called the correct amount of times.' );
        // Verify the arguments passed to the 'onerror' hook for each call.
        deepEqual( errorArgs, [ 'timeout 1', 'timeout 2', 'timeout 3', 'timeout 4', 'timeout 5' ],
                  'The error hook function should be called on every error.' );
        start();
      }
    } );
  } );


  // Asynchronous test case: Test behavior when trying to retrieve an expired item from cache.
  asyncTest( 'Trying to get an expired item from the cache.', function () {
    expect( 3 );

    eq( window.localStorage.length, 0, 'localStorage should be empty initially.' );

    var proxyCallCount = 0;
    // Mock the proxy function to provide data when called.
    JSONCache._getJSONProxy = function ( url, options ) {
      proxyCallCount++;
      if ( url === 'data.json' ) {
        options.success( testData );
      }
    };
    // Mock the time function to provide a static, future timestamp for current time.
    JSONCache._getTime = function () {
      return 2345678901234;
    };

    // Calculate a timestamp that is one millisecond past the item's lifetime.
    var lifetime = 5 * 60 * 1000;
    var time     = 2345678901234 - lifetime - 1;

    // Manually populate localStorage with an expired item.
    window.localStorage[ 'JSONCache data data.json' ] = '{"data":"öld invalid dätä"}';
    window.localStorage[ 'JSONCache time data.json' ] = time;

    // Call getCachedJSON for the expired item. It should trigger a fresh fetch.
    JSONCache.getCachedJSON( 'data.json', {
      success : function ( data ) {
        // Assert that the returned data is the freshly fetched data, not the expired one.
        deepEqual( data, {
          "success"   : true,
          "data"      : [
            "först item",
            "secönd itém"
          ],
          "Weird väl" : 666
        }, 'Returned data should be correct.' );
        // Assert that the proxy function was called, indicating a fresh fetch.
        eq( proxyCallCount, 1, 'Proxy function should be called once.' );
        start();
      }
    } );
  } );


  // JSONCache.clean() tests.

  // Test case: Cleaning an empty cache.
  test( 'Cache clean with empty cache.', function () {
    expect( 2 );
    eq( window.localStorage.length, 0, 'localStorage should be empty initially.' );
    JSONCache.clean();
    eq( window.localStorage.length, 0, 'localStorage should be empty in the end.' );
  } );

  // Test case: Cleaning a cache containing only valid items.
  test( 'Cache clean with only valid items.', function () {
    expect( 7 );
    eq( window.localStorage.length, 0, 'localStorage should be empty initially.' );

    // Mock time for consistent validation.
    JSONCache._getTime = function () {
      return 2345678901234;
    };

    // Add two valid JSONCache items (one current, one at the edge of validity).
    window.localStorage[ 'JSONCache data data1' ] = '{"data":"dätä 1"}';
    window.localStorage[ 'JSONCache time data1' ] = '2345678901234';

    window.localStorage[ 'JSONCache data data2' ] = '{"data":"dätä 2"}';
    window.localStorage[ 'JSONCache time data2' ] = ( 2345678901234 - 5 * 60 * 1000 ).toString();

    // Add a non-JSONCache item.
    window.localStorage[ 'söme öther key' ] = 'söme öther dätä';

    // Perform the clean operation.
    JSONCache.clean();

    // All items should remain as they are all valid or not managed by JSONCache.
    eq( window.localStorage.length, 5, 'All items should still be in the cache.' );
    eq( window.localStorage[ 'JSONCache data data1' ], '{"data":"dätä 1"}',
       'Correct data should still be in the cache.' );
    eq( window.localStorage[ 'JSONCache time data1' ], '2345678901234',
       'Correct data should still be in the cache.' );
    eq( window.localStorage[ 'JSONCache data data2' ], '{"data":"dätä 2"}',
       'Correct data should still be in the cache.' );
    eq( window.localStorage[ 'JSONCache time data2' ], ( 2345678901234 - 5 * 60 * 1000 ).toString(),
       'Correct data should still be in the cache.' );
    eq( window.localStorage[ 'söme öther key' ], 'söme öther dätä',
       'Correct data should still be in the cache.' );
  } );

  // Test case: Cleaning a cache containing only expired items.
  test( 'Cache clean with only expired items.', function () {
    expect( 2 );
    eq( window.localStorage.length, 0, 'localStorage should be empty initially.' );

    // Mock time.
    JSONCache._getTime = function () {
      return 2345678901234;
    };

    // Add two expired JSONCache items.
    window.localStorage[ 'JSONCache data data1' ] = '{"data":"dätä 1"}';
    window.localStorage[ 'JSONCache time data1' ] = '1234567890123'; // Clearly expired.

    window.localStorage[ 'JSONCache data data2' ] = '{"data":"dätä 2"}';
    // Expired by just 1 millisecond.
    window.localStorage[ 'JSONCache time data2' ] = ( 2345678901234 - 5 * 60 * 1000 - 1 ).toString();

    // Perform the clean operation.
    JSONCache.clean();

    // All JSONCache items should be removed.
    eq( window.localStorage.length, 0, 'Cache should be empty.' );
  } );

  // Test case: Cleaning a cache with a mix of valid, expired, and non-JSONCache items.
  test( 'Cache clean with valid and expired items.', function () {
    expect( 7 );
    eq( window.localStorage.length, 0, 'localStorage should be empty initially.' );

    // Mock time.
    JSONCache._getTime = function () {
      return 2345678901234;
    };

    // Add expired JSONCache item 1.
    window.localStorage[ 'JSONCache data data1' ] = '{"data":"dätä 1"}';
    window.localStorage[ 'JSONCache time data1' ] = '1234567890123';

    // Add expired JSONCache item 2.
    window.localStorage[ 'JSONCache data data2' ] = '{"data":"dätä 2"}';
    window.localStorage[ 'JSONCache time data2' ] = ( 2345678901234 - 5 * 60 * 1000 - 1 ).toString();

    // Add valid JSONCache item 3.
    window.localStorage[ 'JSONCache data data3' ] = '{"data":"dätä 3"}';
    window.localStorage[ 'JSONCache time data3' ] = '2345678901234';

    // Add valid JSONCache item 4 (at the edge of validity).
    window.localStorage[ 'JSONCache data data4' ] = '{"data":"dätä 4"}';
    window.localStorage[ 'JSONCache time data4' ] = ( 2345678901234 - 5 * 60 * 1000 ).toString();

    // Add a non-JSONCache item.
    window.localStorage[ 'söme öther key' ] = 'söme öther dätä';

    // Perform the clean operation.
    JSONCache.clean();

    // Only valid JSONCache items and the non-JSONCache item should remain.
    eq( window.localStorage.length, 5, 'Valid items should still be in the cache.' );
    eq( window.localStorage[ 'JSONCache data data3' ], '{"data":"dätä 3"}',
       'Correct data should still be in the cache.' );
    eq( window.localStorage[ 'JSONCache time data3' ], '2345678901234',
       'Correct data should still be in the cache.' );
    eq( window.localStorage[ 'JSONCache data data4' ], '{"data":"dätä 4"}',
       'Correct data should still be in the cache.' );
    eq( window.localStorage[ 'JSONCache time data4' ], ( 2345678901234 - 5 * 60 * 1000 ).toString(),
       'Correct data should still be in the cache.' );
    eq( window.localStorage[ 'söme öther key' ], 'söme öther dätä',
       'Correct data should still be in the cache.' );
  } );

} ( jQuery ) ); // Immediately Invoked Function Expression (IIFE) closing.