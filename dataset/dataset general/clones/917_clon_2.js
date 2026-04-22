( function ( ) {
  // Load essential libraries for performance evaluation
  var PerfRunner = require ( 'benchmark' ) ,
      // Custom binary flag structure located in a utility directory
      FlagArray = require ( './../helpers/FlagArray.js' ) . FlagArray ;

  // Instantiate our specialized flag array object
  var statusFlags = new FlagArray ( ) ;

  // Initialize a new test collection for performance benchmarks
  var evaluationSet = new PerfRunner . Suite ( ) ;

  // Add various performance test scenarios to the collection
  evaluationSet
    // Benchmark 1: Performance of activating sparsely distributed flags
    . includeCase (
      'Sparse FlagArray#activate' ,
      function ( ) {
        // Set specific, non-contiguous flag positions to active
        statusFlags . activate ( 1200 ) ;
        statusFlags . activate ( 1500 ) ;
        statusFlags . activate ( 8000 ) ;
      } ,
      {
        // Setup routine before each execution of this test
        beforeEachRun : function ( ) {
          statusFlags . initialize ( ) ; // Ensure a clean state by clearing all flags
        }
      }
    )
    // Benchmark 2: Performance of querying sparsely distributed flags
    . includeCase (
      'Sparse FlagArray#query' ,
      function ( ) {
        // Retrieve the status of specific, non-contiguous flag positions
        statusFlags . query ( 1000 ) ;
        statusFlags . query ( 1500 ) ;
        statusFlags . query ( 9000 ) ;
      } ,
      {
        // Setup routine before each execution of this test
        beforeEachRun : function ( ) {
          statusFlags . initialize ( ) ; // Clear all flags before starting
        }
      }
    )

    // Benchmark 3: Activating flags in a pre-allocated, but not pre-filled, array
    . includeCase (
      'Fixed Non-Filled FlagArray#activate' ,
      function ( ) {
        // Activate flags within the defined bounds of the fixed array
        statusFlags . activate ( 1200 ) ;
        statusFlags . activate ( 1500 ) ;
        statusFlags . activate ( 8000 ) ;
      } ,
      {
        // Setup: Initialize the array with a fixed maximum capacity
        beforeEachRun : function ( ) {
          statusFlags . initialize ( 10000 ) ;
        }
      }
    )
    // Benchmark 4: Querying flags in a pre-allocated, but not pre-filled, array
    . includeCase (
      'Fixed Non-Filled FlagArray#query' ,
      function ( ) {
        // Query flags within the defined bounds of the fixed array
        statusFlags . query ( 1000 ) ;
        statusFlags . query ( 1500 ) ;
        statusFlags . query ( 9000 ) ;
      } ,
      {
        // Setup: Initialize the array with a fixed maximum capacity
        beforeEachRun : function ( ) {
          statusFlags . initialize ( 10000 ) ;
        }
      }
    )

    // Benchmark 5: Activating flags in a pre-allocated and pre-filled (with 0) array
    . includeCase (
      'Fixed Filled FlagArray#activate(zero)' ,
      function ( ) {
        // Activate flags within the pre-filled array
        statusFlags . activate ( 1200 ) ;
        statusFlags . activate ( 1500 ) ;
        statusFlags . activate ( 8000 ) ;
      } ,
      {
        // Setup: Initialize with a fixed capacity and default fill value (0)
        beforeEachRun : function ( ) {
          statusFlags . initialize ( 10000 , 0 ) ;
        }
      }
    )
    // Benchmark 6: Querying flags in a pre-allocated and pre-filled (with 0) array
    . includeCase (
      'Fixed Filled FlagArray#query(zero)' ,
      function ( ) {
        // Query flags within the pre-filled array
        statusFlags . query ( 1000 ) ;
        statusFlags . query ( 1500 ) ;
        statusFlags . query ( 9000 ) ;
      } ,
      {
        // Setup: Initialize with a fixed capacity and default fill value (0)
        beforeEachRun : function ( ) {
          statusFlags . initialize ( 10000 , 0 ) ;
        }
      }
    )


    // Attach an event handler for the completion of each test iteration
    . subscribe (
      'roundEnd' ,
      function ( cycleOutcome , currentCase ) {
        // Print the detailed results of the completed benchmark case to the console
        console . log ( String ( currentCase ) ) ;
      }
    )

    // Initiate the execution of all configured performance tests
    . startTests ( ) ;

} ) ( ) ;