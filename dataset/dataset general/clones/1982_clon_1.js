/* This file contains a set of tests for the 'invoke' library, demonstrating its
 * sequential, parallel, and mixed execution capabilities, as well as robust error
 * handling mechanisms. It uses a helper 'delay' function to simulate
 * asynchronous operations with variable timing, ensuring realistic test conditions.
 */
var    invoke   =   require('../lib/invoke')   ; // Import the core 'invoke' functionality.


// Helper function: Introduces a random delay before executing a callback.
// This is crucial for simulating real-world asynchronous behavior and
// ensuring tests account for out-of-order callback scenarios.
function delay ( cb, err , data )
{
    // Calculate a pseudo-random delay in milliseconds, up to 99ms.
    var ms = Math.floor(Math.random() * 100) ;

    // Schedule the callback to be executed after the determined delay.
    setTimeout(function() {
        cb(err, data); // Invoke the provided callback with error and data.
    }, ms) ;
}


// --- Test Suite: Sequential Function Execution ---
// This block defines tests specifically for 'invoke' chains that execute functions
// in a strict, ordered sequence using the '.then()' method.
exports [ 'sequential function execution' ] = {

    'immediately resolved': function ( t )
    {
        // Test case: Verifies basic functionality where a single function
        // is immediately resolved by the 'invoke' chain.
        invoke( function ( data, cb )
        {
            // Assert that the initial data passed to the function is 'foo'.
            t.strictEqual(data, 'foo') ;
            // Call the callback after a delay, modifying the data.
            delay(cb, null, data + 'bar') ;
        })
        .end( 'foo', function ( data )
        {
            // The final data should reflect the modification: 'foobar'.
            t.strictEqual(data, 'foobar') ;
            t.done() ; // Signal test completion.
        }) ;
    }

    , 'two functions in series': function (t)
    {
        // Test case: Demonstrates two functions executing sequentially.
        invoke(function (data, cb)
        {
            // Initial data is expected to be an empty array.
            t.deepEqual(data, []) ;
            data.push('first') ; // Add an element to the data array.
            delay(cb, null, data) ; // Pass the updated array to the next step.
        })
        .then(function (data, cb)
        {
            // After the first step, the data array should contain 'first'.
            t.deepEqual(data, [ 'first' ]) ;
            data.push('second') ; // Add another element.
            delay(cb, null, data) ; // Continue the chain.
        })
        .end([], function (data)
        {
            // Verify the final state of the data array after both steps.
            t.deepEqual(data, ['first', 'second']) ;
            t.done() ;
        }) ;
    }

    , 'three functions in series': function (t)
    {
        // Test case: Extends the sequential execution to three functions.
        invoke(function (data, cb)
        {
            t.deepEqual(data, []) ;
            data.push('first') ;
            delay(cb, null, data) ;
        })
        .then(function (data, cb)
        {
            t.deepEqual(data, [ 'first' ]) ;
            data.push('second') ;
            delay(cb, null, data) ;
        })
        .then(function (data, cb)
        {
            t.deepEqual(data, [ 'first', 'second' ]) ;
            data.push('third') ;
            delay(cb, null, data) ;
        })
        .end([], function (data)
        {
            t.deepEqual(data, ['first', 'second', 'third' ]) ;
            t.done() ;
        }) ;
    }

    , 'error rescuing': function (t)
    {
        // Test case: Verifies that the 'rescue' mechanism correctly catches errors
        // in a sequential chain, preventing subsequent 'then' or 'end' calls.
        var errMsg = 'WTF' ; // The expected error message.
        invoke(function (data, cb)
        {
            t.deepEqual(data, []) ;
            data.push('first') ;
            delay(cb, null, data) ;
        })
        .then(function (data, cb)
        {
            // This step intentionally introduces an error into the chain.
            delay(cb, new Error(errMsg)) ;
        })
        .then(function (data, cb)
        {
            // This 'then' block should be skipped due to the error.
            throw new Error('This should not be executed due to error rescue') ;
        })
        .rescue(function (err)
        {
            // The 'rescue' callback should be executed, receiving the error.
            t.equal(err.message, errMsg) ;
            t.done() ;
        })
        .end([], function (data)
        {
            // The 'end' callback should also be skipped after an error is rescued.
            throw new Error('This should not be executed due to error rescue') ;
        }) ;
    }

} ;


// --- Test Suite: Parallel Function Execution ---
// This block defines tests for 'invoke' chains where multiple functions
// are executed concurrently using the '.and()' method.
exports [ 'parallel function execution' ] = {

    'two functions in parallel': function ( t )
    {
        // Test case: Executes two functions in parallel.
        invoke( function ( data, cb )
        {
            t.strictEqual(data, 'foo') ;
            delay(cb, null, data + 'bar') ;
        })
        .and( function ( data, cb )
        {
            t.strictEqual(data, 'foo') ;
            delay(cb, null, data + 'baz') ;
        })
        .end( 'foo', function ( data )
        {
            // The result should be an array containing outputs from both parallel functions.
            t.deepEqual(data, [ 'foobar', 'foobaz' ]) ;
            t.done() ;
        }) ;
    }

    , 'three functions in parallel': function (t)
    {
        // Test case: Executes three functions in parallel.
        invoke(function (data, cb)
        {
            t.strictEqual(data, 'foo') ;
            delay(cb, null, data + 'bar') ;
        })
        .and(function (data, cb)
        {
            t.strictEqual(data, 'foo') ;
            delay(cb, null, data + 'baz') ;
        })
        .and(function (data, cb)
        {
            delay(cb, null, data + 'bam') ;
            t.strictEqual(data, 'foo') ;
        })
        .end('foo', function (data)
        {
            // The final data array should contain results from all three.
            t.deepEqual(data, [ 'foobar', 'foobaz', 'foobam' ]) ;
            t.done() ;
        }) ;
    }

    , 'error rescuing': function (t)
    {
        // Test case: Error handling in a parallel execution chain.
        var errMsg = 'WTF' ;
        invoke(function (data, cb)
        {
            delay(cb, null, data + 'bar') ;
        })
        .and(function (data, cb)
        {
            // This parallel branch introduces an error.
            delay(cb, new Error(errMsg)) ;
        })
        .and(function (data, cb)
        {
            delay(cb, null, data + 'bam') ;
        })
        .rescue(function (err)
        {
            // The 'rescue' callback should catch the error from any parallel branch.
            t.equal(err.message, errMsg) ;
            t.done() ;
        })
        .end('foo', function (data)
        {
            // The 'end' callback should not be reached due to the rescued error.
            throw new Error('This should not be executed due to error rescue') ;
        }) ;
    }
} ;


// --- Test Suite: Mixed Sequence and Parallel Function Execution ---
// This block tests complex scenarios combining both sequential '.then()'
// and parallel '.and()' operations within a single 'invoke' chain.
exports [ 'mixed sequence and parallel function execution' ] = {

    'sequence of two steps with two parallel calls in each step': function (t)
    {
        // Test case: A sequence where each step involves parallel operations.
        invoke(function (data, cb)
        {
            t.strictEqual(data, 'foo') ;
            delay(cb, null, data + 'bar') ;
        })
        .and(function (data, cb)
        {
            t.strictEqual(data, 'foo') ;
            delay(cb, null, data + 'baz') ;
        })
        .then(function (data, cb)
        {
            // After the first parallel block, data is an array of results.
            t.deepEqual(data, [ 'foobar', 'foobaz' ]) ;
            delay(cb, null, data.join(' ') + 'a') ;
        })
        .and(function (data, cb)
        {
            // This is the second parallel block, operating on the results of the first 'then'.
            t.deepEqual(data, [ 'foobar', 'foobaz' ]) ;
            delay(cb, null, data.join(' ') + 'b') ;
        })
        .end('foo', function (data)
        {
            // Final data should be an array of results from the second parallel step.
            t.deepEqual(data,[ 'foobar foobaza', 'foobar foobazb']) ;
            t.done() ;
        }) ;
    }

    , 'sequence of three steps with mixed parallel calls': function (t)
    {
        // Test case: A more complex chain involving multiple sequential steps,
        // some of which include parallel execution.
        invoke(function (data, cb)
        {
            t.strictEqual(data, 'a') ;
            delay(cb, null, data + 'b') ;
        })
        .and(function (data, cb)
        {
            t.strictEqual(data, 'a') ;
            delay(cb, null, data + 'c') ;
        })
        .and(function (data, cb)
        {
            t.strictEqual(data, 'a') ;
            delay(cb, null, data + 'd') ;
        })
        .then(function (data, cb)
        {
            t.deepEqual(data, [ 'ab', 'ac', 'ad' ]) ;
            delay(cb, null, data.join(' ') + ' ae') ;
        })
        .and(function (data, cb)
        {
            t.deepEqual(data, [ 'ab', 'ac', 'ad' ]) ;
            delay(cb, null, data.join(' ') + ' af') ;
        })
        .then(function (data, cb)
        {
            t.deepEqual(data, [ 'ab ac ad ae', 'ab ac ad af' ]) ;
            delay(cb, null, data.join(' ')) ;
        })
        .end('a', function (data, cb)
        {
            t.strictEqual(data, 'ab ac ad ae ab ac ad af') ;
            t.done() ;
        }) ;
    }

    , 'error rescuing': function (t)
    {
        // Test case: Error handling in a mixed sequential and parallel chain.
        var errorMsg = 'WTF' ;
        invoke(function (data, cb)
        {
            t.strictEqual(data, 'foo') ;
            delay(cb, null, data + 'bar') ;
        })
        .and(function (data, cb)
        {
            t.strictEqual(data, 'foo') ;
            // This parallel branch throws an error.
            delay(cb, new Error(errorMsg)) ;
        })
        .then(function (data, cb)
        {
            // These 'then' and 'and' blocks should be skipped.
            throw new Error('This should not be executed due to error rescue') ;
        })
        .and(function (data, cb)
        {
            throw new Error('This should not be executed due to error rescue') ;
        })
        .rescue(function (err)
        {
            // The 'rescue' callback should capture the error.
            t.strictEqual(err.message, errorMsg) ;
            t.done() ;
        })
        .end('foo', function (data)
        {
            // The 'end' callback should not be executed.
            throw new Error('This should not be executed due to error rescue') ;
        }) ;
    }
} ;


// --- Test Suite: Parallel Error Rescuing ---
// This suite specifically focuses on scenarios where multiple errors might occur
// simultaneously in parallel branches, and how 'rescue' handles them.
exports [ 'parallel error rescuing' ] = {

  'multiple errors': function ( t )
  {
    // Test case: Multiple errors occurring in parallel branches.
    // 'invoke' is expected to call 'rescue' only once for the first error encountered.

    var errorCount = 0 ; // Counter for how many times 'rescue' is called.
    var delayValue = 100 ; // Delay for simulated errors.

    invoke( function ( data, cb )
    {
      // First parallel branch, introduces an error.
      setTimeout(function () { cb(new Error()) }, delayValue) ;
    })
    .and( function ( data, cb )
    {
      // Second parallel branch, introduces another error.
      setTimeout(function () { cb(new Error()) }, delayValue) ;
    })
    .and( function ( data, cb )
    {
      // Third parallel branch, introduces yet another error.
      setTimeout(function () { cb(new Error()) }, delayValue) ;
    })
    .rescue( function( err )
    {
      // The rescue callback should be triggered only once, for the first error.
      errorCount++ ;
      setTimeout(function () {
        // Assert that 'rescue' was called exactly once.
        t.strictEqual(errorCount, 1) ;
        t.done() ;
      }, delayValue * 5) ; // Give enough time for all errors to potentially propagate.
    })
    .end('foo', function ( data )
    {
      // The 'end' callback should not be executed if an error is rescued.
      throw new Error('This should not be executed due to error rescue') ;
    }) ;

  }

} ;