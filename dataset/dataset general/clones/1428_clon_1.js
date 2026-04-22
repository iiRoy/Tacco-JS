/*
 * This is the constructor function for our Test utility.
 * It initializes the state for tracking test results.
 */
function Test()
{
    // Initialize the total count of tests added.
    this.count  =  0;

    // Initialize the count of tests that have passed successfully.
    this.passed = 0;

    // An array to store the test functions and their corresponding assertions/descriptions.
    this.tests = [];

}; // End of Test constructor function. Note the semicolon as per original.


/**
 * Adds a new test case to the collection.
 * Each test case consists of a function to execute and a string
 * describing what the test is asserting.
 *
 * @param {Function} fn        The test function to be executed.
 * @param {string}   assertion A description of the test.
 */
Test.prototype.add = function ( fn ,  assertion )
{
    // Store the test function and its description as a pair.
    this.tests.push( [ fn , assertion ] );

    // Increment the total count of tests.
    this.count++;
}; // End of add method.


/**
 * Executes all registered test cases and reports the results.
 * It iterates through each test, runs it, and then logs the outcome.
 * Finally, it provides a summary of all tests.
 */
Test.prototype.run = function()
{
    // Local reference to the array of tests for cleaner access.
    var tests = this.tests;

    // Declare variables used within the loop and for results.
    var i, len, result, pct;


    // Loop through each test function in the 'tests' array.
    for ( i = 0 , len = tests.length ;  i < len ;  i++ )
    {
        // Execute the test function. The function is expected to return a boolean.
        result = tests[ i ][ 0 ]();

        // Check if the test passed (returned true).
        if ( result )
        {
            // Log a success message to the console.
            console.log( 'Test passed: ' + tests[ i ][ 1 ] );

            // Increment the count of passed tests.
            this.passed++;
        }
        else // The test failed (returned false).
        {
            // Log a warning message for the failed test.
            console.warn( 'Test failed: ' + tests[ i ][ 1 ] );
        }
    } // End of test execution loop.


    // Calculate the percentage of tests that passed, formatted to two decimal places.
    pct = ( ( this.passed / this.count ) * 100 ) . toFixed( 2 );


    // Output the final summary of the test run.
    console.log( 'Passed ' + this.passed + ' of ' + this.count + ' tests. (' + pct + '%)' );


    // If not all tests passed, issue a general warning.
    if ( this.passed < this.count )
    {
        console.warn( 'There seem to be some errors with the package' );
    }

}; // End of run method.


// Export an instance of the Test utility for use in other modules.
module.exports = new Test();