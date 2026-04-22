//  This file contains a series of asynchronous flow tests for a JavaScript application.
//  It utilizes 'assert' for verification, 'flow' for control flow, and 'keystore' for data storage.

//  Standard library import for assertion functions.
var assert   = require ( 'assert' ) ;

//  Local module import for asynchronous flow control utilities.
var flow     = require ( './flow' ) ;

//  Local module import for the keystore example implementation.
var keystore = require ( './examples/keystore' ) ;


//  A global counter to track the successful completion of individual test flows.
var flowsComplete = 0 ;


/*
 *  A delayed assertion check to ensure all expected asynchronous flows
 *  have completed within a given timeframe. This acts as a final validation step.
 */
setTimeout (
    function ( ) {
        //  The total number of flows anticipated to complete.
        var expected = 5 ;

        //  Asserts that the actual number of completed flows matches the expected count.
        //  A descriptive message is provided in case of a mismatch.
        assert . strictEqual (
            flowsComplete ,
            expected ,
            flowsComplete + "/" + expected + " flows finished"
        ) ;
    } ,
    1000 //  The delay in milliseconds before executing the assertion.
) ;


//  ----- Test Case 1: Simple Increment Operation -----
//  This test verifies the basic functionality of incrementing a value in the keystore.
flow . exec (
    function ( ) {
        //  Asynchronously increments the 'counter' key by 1.
        //  'this' refers to the flow context for callback management.
        keystore . increment (
            "counter" , //  The key to increment.
            1         , //  The value to add to the key.
            this        //  The context for the asynchronous operation.
        ) ;
    } ,
    function ( err , newValue ) {
        //  Callback function executed after the increment operation completes.

        //  Checks if the new value of 'counter' is 1.
        assert . strictEqual ( newValue , 1 , "increment test didn't work" ) ;

        //  Increments the global completion counter.
        flowsComplete += 1 ;
    }
) ;


//  ----- Test Case 2: Multi-Command Execution (MULTI) -----
//  This test demonstrates executing multiple keystore commands in a single flow step.
flow . exec (
    function ( ) {
        //  Sets 'firstName' to "Bob". The MULTI() method queues this command.
        keystore . set ( "firstName" , "Bob" , this . MULTI ( ) ) ;

        //  Sets 'lastName' to "Vance". This is also queued via MULTI().
        keystore . set ( "lastName" , "Vance" , this . MULTI ( ) ) ;
    } ,
    function ( ) {
        //  Callback function after both MULTI commands have executed.

        //  Retrieves the entire keystore database object to verify changes.
        var db = keystore . getDb ( ) ;

        //  Asserts that 'firstName' was correctly set.
        assert . strictEqual ( db . firstName , "Bob" , "multi test didn't work" ) ;

        //  Asserts that 'lastName' was correctly set.
        assert . strictEqual ( db . lastName , "Vance" , "multi test didn't work" ) ;

        //  Updates the global completion counter.
        flowsComplete += 1 ;
    }
) ;


//  ----- Test Case 3: MULTI with Result Identifiers -----
//  Tests the ability to assign custom identifiers to results from MULTI operations.
flow . exec (
    function ( ) {
        //  Obtains a reference to the underlying database.
        var db = keystore . getDb ( ) ;

        //  Directly sets values in the database for the purpose of this test.
        db [ 'firstName' ] = "Bob" ;
        db [ 'lastName' ] = "Vance" ;

        //  Retrieves 'firstName', assigning its result to 'first-name' in the callback.
        keystore . get ( "firstName" , this . MULTI ( 'first-name' ) ) ;

        //  Retrieves 'lastName', assigning its result to 'last-name' in the callback.
        keystore . get ( "lastName" , this . MULTI ( 'last-name' ) ) ;
    } ,
    function ( results ) {
        //  Callback receives an object 'results' where keys are the identifiers.

        //  Verifies the 'first-name' result. The [1] index assumes result is [error, value].
        assert . strictEqual (
            results [ 'first-name' ] [ 1 ] ,
            "Bob" ,
            "multi with result identifier test didn't work"
        ) ;

        //  Verifies the 'last-name' result.
        assert . strictEqual (
            results [ 'last-name' ] [ 1 ] ,
            "Vance" ,
            "multi with result identifier test didn't work"
        ) ;

        //  Increments the completion counter.
        flowsComplete += 1 ;
    }
) ;


//  ----- Test Case 4: MULTI with Result Identifiers for Single Return Values -----
//  Similar to Test Case 3, but specifically for commands that return a single value (e.g., boolean).
flow . exec (
    function ( ) {
        var db = keystore . getDb ( ) ;

        //  Sets a value in the database.
        db [ 'bob' ] = "Bob Vance" ;

        //  Checks for existence of 'bob', result identified as 'bob-exists'.
        keystore . exists ( "bob" , this . MULTI ( 'bob-exists' ) ) ;

        //  Checks for existence of 'john', result identified as 'john-exists'.
        keystore . exists ( "john" , this . MULTI ( 'john-exists' ) ) ;
    } ,
    function ( results ) {
        //  Callback receives 'results' object.

        //  Asserts that 'bob' exists, expecting a direct boolean result.
        assert . strictEqual (
            results [ 'bob-exists' ] ,
            true ,
            "multi with result identifier for single return value test didn't work"
        ) ;

        //  Asserts that 'john' does not exist.
        assert . strictEqual (
            results [ 'john-exists' ] ,
            false ,
            "multi with result identifier for single return value test didn't work"
        ) ;

        //  Increments the completion counter.
        flowsComplete += 1 ;
    }
) ;


//  ----- Test Case 5: Serial For Each Loop -----
//  Tests the `serialForEach` utility for iterating over an array with asynchronous operations.

//  An array to store the cumulative values generated by the loop.
var valueSequence = [ ] ;

/*
 *  Executes a series of operations, one after another, for each item in an array.
 *  The next operation only starts after the current one's callback is invoked.
 */
flow . serialForEach (
    [ 1 , 2 , 3 , 4 ] , //  The array whose elements will be processed sequentially.

    function ( val ) {
        //  The asynchronous task to perform for each 'val'.
        keystore . increment (
            "forEachCounter" , //  The key to increment.
            val              , //  The value from the array to add.
            this               //  The flow context.
        ) ;
    } ,

    function ( error , newVal ) {
        //  Callback for each individual increment operation.
        if ( error ) {
            //  If an error occurs during increment, immediately throw it.
            throw error ;
        }

        //  Adds the new (cumulative) value of "forEachCounter" to our sequence.
        valueSequence . push ( newVal ) ;
    } ,

    function ( ) {
        //  Final callback executed after all items in the array have been processed.

        //  Asserts that the collected sequence of values matches the expected cumulative sums.
        assert . deepEqual (
            valueSequence ,
            [ 1 , 3 , 6 , 10 ] , //  Expected sequence: 1, (1+2)=3, (3+3)=6, (6+4)=10.
            "sequence of values is incorrect: " + JSON . stringify ( valueSequence )
        ) ;

        //  Marks this entire serialForEach flow as complete.
        flowsComplete += 1 ;
    }
) ;