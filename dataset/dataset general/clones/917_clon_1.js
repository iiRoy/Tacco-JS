/*
 * This file contains a benchmark suite for the 'Bits' utility.
 * It uses the 'benchmark.js' library to measure performance
 * of 'set' and 'test' operations under different conditions.
 */
( function () {

  // Load necessary modules for the benchmarking process.
  // Benchmark.js provides the framework for creating benchmark suites.
  var Benchmark = require( 'benchmark' ) ;

  // Bits.js is the library being tested. We specifically import the 'Bits' class.
  var Bits = require( './../lib/Bits.js' ).Bits ;

  // Instantiate a new Bits object. This object will be reused across different benchmarks.
  var bits = new Bits() ;

  // Create a new benchmark suite.
  // This suite will group together various tests for the Bits class.
  var suite = new Benchmark.Suite() ;

  // Define the benchmark tests and add them to the suite.
  suite
    // Test case 1: Sparse Bits#set operation
    // This benchmark measures the performance of setting bits in a sparse scenario
    // where the indices are relatively far apart.
    . add(
      'Sparse Bits#set',
      function () {
        bits.set( 1200 ) ;
        bits.set( 1500 ) ;
        bits.set( 8000 ) ;
      },
      {
        // Setup function: ensures the bits object is reset before each run.
        onStart: function () {
          bits.reset() ;
        }
      }
    )

    // Test case 2: Sparse Bits#test operation
    // Measures the performance of testing bits in a sparse scenario.
    . add(
      'Sparse Bits#test',
      function () {
        bits.test( 1000 ) ;
        bits.test( 1500 ) ;
        bits.test( 9000 ) ;
      },
      {
        // Setup function: ensures the bits object is cleared before each test.
        onStart: function () {
          bits.reset() ;
        }
      }
    )

    // Test case 3: Fixed non-filled Bits#set operation
    // This tests setting bits within a predefined, but not pre-filled, range.
    . add(
      'Fixed non-filled Bits#set',
      function () {
        bits.set( 1200 ) ;
        bits.set( 1500 ) ;
        bits.set( 8000 ) ;
      },
      {
        // Setup: resets the bits object with a fixed size (10000), default fill (false).
        onStart: function () {
          bits.reset( 10000 ) ;
        }
      }
    )

    // Test case 4: Fixed non-filled Bits#test operation
    // Tests checking bits within a predefined, non-filled range.
    . add(
      'Fixed non-filled Bits#test',
      function () {
        bits.test( 1000 ) ;
        bits.test( 1500 ) ;
        bits.test( 9000 ) ;
      },
      {
        // Setup: ensures the bits object is reset to a fixed size (10000) for each run.
        onStart: function () {
          bits.reset( 10000 ) ;
        }
      }
    )

    // Test case 5: Fixed filled Bits#set(fill) operation
    // Measures setting bits when the entire range is initially filled (e.g., all true).
    . add(
      'Fixed filled Bits#set(fill)',
      function () {
        bits.set( 1200 ) ;
        bits.set( 1500 ) ;
        bits.set( 8000 ) ;
      },
      {
        // Setup: resets the bits object with a fixed size (10000) and initial fill value (0, meaning false).
        onStart: function () {
          bits.reset( 10000, 0 ) ;
        }
      }
    )

    // Test case 6: Fixed filled Bits#test(fill) operation
    // Measures checking bits when the entire range is initially filled.
    . add(
      'Fixed filled Bits#test(fill)',
      function () {
        bits.test( 1000 ) ;
        bits.test( 1500 ) ;
        bits.test( 9000 ) ;
      },
      {
        // Setup: ensures the bits object is reset to a fixed size and filled state.
        onStart: function () {
          bits.reset( 10000, 0 ) ;
        }
      }
    )

    // Event listener for the 'cycle' event.
    // This event fires after each benchmark completes a full cycle.
    . on(
      'cycle',
      function ( event, bench ) {
        // Log the string representation of the benchmark result to the console.
        console.log( String( bench ) ) ;
      }
    )

    // Run the benchmark suite.
    // This will execute all added benchmarks and report their results.
    . run() ;

} ) () ;
// End of the Immediately Invoked Function Expression (IIFE)
// This structure helps to encapsulate variables and avoid global scope pollution.