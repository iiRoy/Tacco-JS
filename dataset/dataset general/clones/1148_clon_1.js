/*
 * This file contains integration tests for the Hulken load testing tool.
 * It uses 'colors' for console output, 'expect.js' for assertions,
 * and a custom 'testWebServer' for simulating a target server.
 *
 * All original logic, variable names, and expressions are preserved.
 * Only whitespace and comments have been altered for visual differentiation.
 */
var colors = require ( 'colors' ) ; // Import the colors module for console output styling.
var expect = require ( 'expect.js' ) ;//  Import the expectation library for test assertions.
var testWebServer = require ( './testWebServer' ) ; // Custom module to manage the test HTTP server.

var testStart ; /* Timestamp for test start */
var testStop ;  // Timestamp for test end
var numberOfHulkenAgentsInTest = 50 ; //  The number of simulated users (agents) for the test.

console . log ( '..::Hulken Integration tests::..'. bold . inverse . cyan ) ; // Log a header for the test suite.
console . log ( '' ) ; // Print an empty line for readability.

var runHulkenTestSuite = function ( ) {
  // Initiates the core Hulken test suite execution.
  console . log ( '.. calling on hulken'. bold . inverse . cyan ) ; // Informative message before starting Hulken.
  console . log ( '' ) ; // Another blank line.


  var hulken = require ( '../index.js' ) ; // Load the main Hulken application module.
  var hulken_options = {
    // Configuration object for the Hulken load test.
    targetUrl : 'http://127.0.0.1:5656' , // The URL of the target web server for testing.
    requestsFilePath : './tests/hulkenRequests.json' , // Path to the JSON file defining requests.
    timesToRunEachRequest : 3 , // How many times each request defined in the file should be executed.
    numberOfHulkenAgents : numberOfHulkenAgentsInTest , // Number of concurrent agents (users).
    happyTimeLimit : 10 , // Threshold in seconds for a request to be considered "happy".
    loginRequired : false , // Flag indicating if login is required for the target URL.
    slowRequestsTimeLimit : 0.5 , // Time in seconds above which a request is considered slow.
    angryOnFailedRequest : false , // Whether Hulken should get "angry" (fail) on any failed request.
    chatty : true , // Verbosity flag for Hulken's output.
    happyMessage : "HULKEN HAPPY!" , // Message displayed when tests pass.
    angryMessage : "HULKEN ANGRY!" , // Message displayed when tests fail.
    minWaitTime : 500 , // Minimum wait time in milliseconds between requests by an agent.
    maxWaitTime : 3000 , // Maximum wait time in milliseconds between requests by an agent.
    returnAllRequests : true , // If true, all individual request details are returned in stats.
    headers : { // Custom headers to be sent with requests.
      "key1" : "value1" ,
      "key2" : "value2" ,
      "accept-encoding" : "Overriden" // Example of overriding a default header.
    } ,
    requestValueLists : { // Lists of values to be used for dynamic request parameters.
      usernames : [ 'john' , 'jessica' , 'admin' ] ,
      cities : [ 'Stockholm' , 'London' , 'Berlin' , 'New York' ]
    }
  } ; // End of hulken_options object.

  testStart = Date . now ( ) ; // Record the start time of the test run.

  // Execute Hulken with the defined options and callbacks.
  hulken . run (
    function ( stats ) {
      // This callback is for intermediate stats or first phase completion.
      //console.log(stats); // Commented out: Original debug log.
      verify ( stats , hulken_options ) ; // Perform verification based on the collected statistics.
    } ,
    function ( stats ) {
      // This callback is for final stats or second phase completion.
      //console.log(stats); // Commented out: Original debug log.
      verify ( stats , hulken_options ) ; // Re-verify stats at the end of the run.
    } ,
    hulken_options // Pass the configuration options to Hulken.
  ) ;
} ; // End of runHulkenTestSuite function definition.


function verify ( stats , hulken_options ) {
  // This function performs all the assertions to validate Hulken's output.
  try {
    // Assertions for general statistics properties.
    expect ( stats ) . to . have . property ( 'numberOfConcurrentRequests' ) ;
    expect ( stats . numberOfConcurrentRequests ) . to . be . ok ( ) ;

    expect ( stats ) . to . have . property ( 'numberOfUniqueRequests' ) ;
    expect ( stats . numberOfUniqueRequests ) . to . be . ok ( ) ;

    expect ( stats ) . to . have . property ( 'totalSecondsElapsed' ) ;
    expect ( stats . totalSecondsElapsed ) . to . be . ok ( ) ;

    expect ( stats ) . to . have . property ( 'avgReqResponseTime' ) ;
    expect ( stats . avgReqResponseTime ) . to . be . ok ( ) ;

    expect ( stats ) . to . have . property ( 'reqsPerSecond' ) ;
    expect ( stats . reqsPerSecond ) . to . be . ok ( ) ;

    expect ( stats ) . to . have . property ( 'randomRequestWaitTime' ) ;
    expect ( stats . randomRequestWaitTime ) . to . be . ok ( ) ;
    expect ( stats . randomRequestWaitTime ) . to . equal ( ( hulken_options . minWaitTime /
      1000 ) + '-' + ( hulken_options . maxWaitTime / 1000 ) ) ; // Verify wait time format.

    expect ( stats ) . to . have . property ( 'numberOfHulkenAgents' ) ;
    expect ( stats . numberOfHulkenAgents ) . to . be . ok ( ) ;

    // Assertions comparing Hulken stats with the test web server's recorded activity.
    expect ( stats . numberOfConcurrentRequests ) . to . equal ( testWebServer . getReqsReceived ( ) ) ;


    expect ( stats . numberOfUniqueRequests ) . to . equal ( testWebServer . getReqsReceived ( ) /
      ( numberOfHulkenAgentsInTest * hulken_options . timesToRunEachRequest ) ) ;

    expect ( testWebServer . getStartPageReqsReceived ( ) ) . to . equal (
      numberOfHulkenAgentsInTest * hulken_options . timesToRunEachRequest ) ;

    expect ( testWebServer . getSomeotherPageReqsReceived ( ) ) . to . equal (
      numberOfHulkenAgentsInTest * hulken_options . timesToRunEachRequest ) ;

    expect ( testWebServer . getPostsToStartPage ( ) ) . to . equal (
      numberOfHulkenAgentsInTest * hulken_options . timesToRunEachRequest ) ;

    // Specific assertion for failed requests, one request in hulkenRequests.json expects a wrong text.
    expect ( stats . failedRequests ) . to . have . length ( numberOfHulkenAgentsInTest * hulken_options . timesToRunEachRequest ) ;


    // Call helper verification functions for specific aspects.
    veryPostValues ( ) ;
    verify_returnAllRequests ( stats , hulken_options ) ;
    verify_headers ( hulken_options ) ;
    verify_randomized_post_values ( hulken_options ) ;
    verify_random_list_post_values ( hulken_options ) ;

    // If all assertions pass, proceed to mark the test as successful.
    passTest ( ) ;

  } catch ( expectError ) {
    // Error handling block for failed assertions.
    printMaxNumberOfConnections ( ) ;
    console . log ( '.. Integration tests failed! =('. bold . inverse . red ) ; // Failure message.
    console . log ( expectError . stack . toString ( ) . bold . inverse . red ) ; // Print the error stack.
    console . log ( '' ) ; // Blank line.
    process . exit ( code = 1 ) ; // Exit with a non-zero code to indicate failure.
  }

} // End of verify function.


function veryPostValues ( ) {
  // Verifies the values of POST requests captured by the test web server.
  var postValues = testWebServer . getPostVars ( ) ;
  expect ( postValues ) . to . have . property ( 'foo' ) ;
  expect ( postValues . foo ) . to . be . ok ( ) ;
  expect ( postValues . foo ) . to . equal ( 'bar' ) ;
} // End of veryPostValues.


function verify_returnAllRequests ( stats , hulken_options ) {
  // Checks if 'allRequests' property is present and correct based on options.
  if ( hulken_options . returnAllRequests ) {
    expect ( stats ) . to . have . property ( 'allRequests' ) ;
    expect ( stats . allRequests ) . to . be . ok ( ) ;
    expect ( stats . allRequests ) . to . have . length ( stats . numberOfConcurrentRequests ) ;
  } else {
    expect ( stats ) . not . to . have . property ( 'allRequests' ) ;
  }
} // End of verify_returnAllRequests.


function verify_headers ( hulken_options ) {
  // Verifies that custom headers were correctly sent and received.
  if ( hulken_options . headers ) {
    var headersFromGets = testWebServer . getHeadersFromGets ( ) ;
    expect ( headersFromGets [ 'accept-encoding' ] ) . to . be ( 'Overriden' ) ; // Check overridden header.
    for ( var key in hulken_options . headers ) {
      if ( hulken_options . headers . hasOwnProperty ( key ) ) {
        expect ( testWebServer . getHeadersFromGets ( ) ) . to . have . property ( key ) ; // Check GET headers.
        expect ( testWebServer . getHeadersFromPosts ( ) ) . to . have . property ( key ) ; // Check POST headers.
      }
    }
  }
} // End of verify_headers.


function verify_randomized_post_values ( hulken_options ) {
  // Verifies that randomized POST values are unique and correctly handled.
  var randomPayloads = testWebServer . getRandomPayload ( ) ;
  expect ( randomPayloads . length ) . to . equal ( numberOfHulkenAgentsInTest * hulken_options . timesToRunEachRequest ) ;
  var uniqueRandomPostValues = [ ] ;
  randomPayloads . forEach ( function ( str ) {
    var payload = JSON . parse ( str ) ;
    for ( var property in payload ) {
      expect ( uniqueRandomPostValues ) . to . not . contain ( payload [ property ] ) ; // Ensure uniqueness.
      uniqueRandomPostValues . push ( payload [ property ] ) ;
    }
  } ) ;
} // End of verify_randomized_post_values.


function verify_random_list_post_values ( hulken_options ) {
  // Verifies the count of requests using values from a predefined list.
  var randomListPayloads = testWebServer . getRandomListPayloadRequests ( ) ;
  expect ( randomListPayloads . length ) . to . equal ( numberOfHulkenAgentsInTest * hulken_options . timesToRunEachRequest ) ;
} // End of verify_random_list_post_values.


function passTest ( ) {
  // Actions to take when all tests have passed successfully.
  printMaxNumberOfConnections ( ) ;
  testStop = Date . now ( ) ; // Record the exact end time.
  var testExecutionTime = ( testStop - testStart ) / 1000 ; // Calculate total execution time in seconds.
  console . log ( '.. Integration tests passed! =)'. bold . inverse . green ) ; // Success message.
  printExecutionTime ( ) ; // Display the execution time.
  console . log ( '' ) ; // Blank line.
  process . exit ( code = 0 ) ; // Exit with a zero code to indicate success.
} // End of passTest.


function printMaxNumberOfConnections ( ) {
  // Logs the maximum number of concurrent HTTP connections observed by the test server.
  console . log ( ( 'maximum number of http connections during test:' +
      testWebServer . getMaxNumberOfConcurrentConnections ( ) . toString ( ) ) . bold . inverse
    . grey ) ;
} // End of printMaxNumberOfConnections.


function printExecutionTime ( ) {
  // Logs the total execution time of the test suite.
  testStop = Date . now ( ) ; // Re-capture stop time to ensure accuracy.
  var testExecutionTime = ( testStop - testStart ) / 1000 ; // Recalculate execution time.
  console . log ( ( '.. execution time: ' + testExecutionTime + ' seconds' ) . bold . inverse
    . green ) ;
} // End of printExecutionTime.

// Final step: Start the test web server and then initiate the Hulken test suite.
testWebServer . start ( runHulkenTestSuite ) ; // The test server must be running before Hulken starts.