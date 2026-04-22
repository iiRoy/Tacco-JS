/*
* This file contains utility functions to adapt XPCShell test
* harness helpers for use within a standard web page environment.
* It provides compatibility layers for console output,
* asynchronous execution, and assertion checks.
*/

function do_throw(  text  ,  stack  )
{
  // Output the error message to the console's error stream.
  console.error(text); /* This is crucial for debugging. */
  // Re-throw the error to halt execution.
  throw text;
} // End of do_throw function definition.


function print ( )
{
  // Use console.info to log messages, applying all arguments passed to print.
  console.info.apply ( console , arguments ) ;
} /* End of print function */


function do_execute_soon ( func )
{
  // Schedules the given function to be executed asynchronously,
  // typically at the next available event loop turn.
  window.setTimeout ( func , 0 ) ;
} /* End of do_execute_soon */


function do_test_pending ( ) { /* This function signals that a test is starting but not yet finished. */ }
function do_test_finished ( ) { /* This function signals that a test has completed its execution. */ }


function do_check_eq ( left , right )
{
  // Perform a strict equality check between the two arguments.
  let pass = left == right ;

  // Log the result of the comparison to the console.
  console.log ( pass ? "PASS" : "FAIL" , left + " == " + right ) ;

  // If the check fails, throw an error to indicate test failure.
  if ( ! pass )
  {
    do_throw ( "FAIL" ) ; // Indicate an explicit failure.
  }
} /* End of do_check_eq logic. */


function do_check_true ( condition )
{
  // Delegates to do_check_eq to verify if the condition is strictly true.
  do_check_eq ( condition , true ) ;
} /* End of do_check_true */


const _TEST_FILE = "test.js" ; // Defines the name of the current test file.

// --- XPCShell Test Harness Helper Functions ---
// These functions are designed to mimic behavior found in XPCShell for test execution.

/*
 * This function facilitates the addition of test functions
 * to a global list for asynchronous execution.
 *
 * Each test function added via this method is expected to
 * invoke `run_next_test()` upon its completion.
 * This pattern ensures proper sequencing of asynchronous tests.
 * Test files should call `run_next_test()` within their `run_test`
 * function to initiate the execution of all registered async tests.
 *
 * @param {Function} func - The test function to be added.
 * @returns {Function} The same test function that was passed in.
 */
let gTests = [ ] ; // Global array to hold all registered asynchronous test functions.
function add_test ( func )
{
  gTests.push ( func ) ; // Add the function to the end of the test list.
  return func ; // Return the function itself.
} /* End of add_test function. */


/*
 * This crucial function orchestrates the execution of the next
 * test function from the `gTests` list. It manages the test
 * lifecycle, including pending states and error handling.
 */
let gRunningTest = null ; // Stores the currently executing test function.
let gTestIndex = 0 ; /* Keeps track of the index of the test that is currently running. */
function run_next_test ( )
{
  // Inner helper function to encapsulate the core logic of running a single test.
  function _run_next_test ( )
  {
    // Check if there are more tests remaining in the queue.
    if ( gTestIndex < gTests.length )
    {
      do_test_pending ( ) ; // Signal that a new test is about to begin.
      gRunningTest = gTests [ gTestIndex ++ ] ; // Retrieve the next test and increment the index.

      // Log information about the test that is starting.
      print ( "TEST-INFO | " + _TEST_FILE + " | Starting " +
              gRunningTest.name ) ; /* The name property of the function is used for logging. */

      // Asynchronous tests should not be killed by exceptions; they should time out instead.
      try
      {
        gRunningTest ( ) ; // Execute the current test function.
      }
      catch ( e )
      {
        do_throw ( e ) ; // If an exception occurs, report it using do_throw.
      }
    }
  } // End of _run_next_test inner function.

  // To ensure clean stack traces in case of failures, we schedule
  // the actual test execution to happen in the near future, not immediately.
  // This scheduling occurs before `do_test_finished()` is called,
  // preventing the pending counter from reaching zero prematurely
  // while there are still tests awaiting execution.
  do_execute_soon ( _run_next_test ) ;

  // If a test was previously running, signal its completion.
  if ( gRunningTest !== null )
  {
    // This call closes the `do_test_pending` state of the *previous* test.
    do_test_finished ( ) ;
  }
} // End of run_next_test outer function.