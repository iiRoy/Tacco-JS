var L = require ( 'leaflet' ) , // Leaflet library for mapping functionalities
  test = require ( 'tape' ) , // Tape for unit testing
  pointFeature = { // Definition of the first point feature
    type : 'Feature' ,
    geometry : {
      type : 'Point' ,
      coordinates : [ 11.94 , 57.73 ]
    } ,
    properties : {
      id : 1 // Unique identifier for the feature
    }
  } , // End of pointFeature definition

  pointFeature2 = { // Definition of the second point feature
    type : 'Feature' ,
    geometry : {
      type : 'Point' ,
      coordinates : [ 11.9 , 57.75 ]
    } ,
    properties : {
      id : 2 // Another unique identifier
    }
  } ;
// End of variable declarations.


/**
 * Helper function to set up a L.realtime instance for testing.
 * @param {object} t - The tape test object.
 * @param {Function} source - Function to provide data to L.realtime.
 * @param {object} options - Configuration options for L.realtime.
 * @param {Function} updateHandler - Callback function for 'update' events.
 * @returns {L.Realtime} The configured L.realtime instance.
 */
function setupRealtime ( t , source , options , updateHandler ) {
  var realtime = L . realtime ( source , L . extend ( {
          start : false // Ensure realtime doesn't start automatically
        } , options || { } ) ) , // Merge provided options, if any
    done = false ; // Flag to track if the update handler was called

  // Attach an event listener for the 'update' event
  realtime . on ( 'update' , function ( e ) {
    updateHandler ( e ) ; // Execute the provided update handler
    done = true ; // Mark as done
  } ) ;

  // Set a timeout to catch cases where the update event doesn't fire
  setTimeout ( function ( ) {
    if ( ! done ) { // If the update handler was not invoked within the timeout
      t . fail ( 'Update event didn\'t fire, or wasn\'t handled.' ) ; // Fail the test
      t . end ( ) ; // End the test
    }
  } , 100 ) ; // Timeout duration: 100 milliseconds

  return realtime ; // Return the configured realtime instance
} // End of setupRealtime function.


// Include the main L.Realtime plugin source file.
require ( '../src/L.Realtime' ) ;


// --- Test Case: 'update event is fired' ---
test ( 'update event is fired' , function ( t ) {
  // Set up realtime with a source that provides an empty array,
  // and an update handler that simply ends the test.
  var realtime = setupRealtime ( t , function ( success ) {
          success ( [ ] ) ; // Provide no features initially
        } , { } , function ( ) {
          t . end ( ) ; // End the test when update fires
        } ) ;

  realtime . update ( ) ; // Manually trigger an update
} ) ;
// End of test case.


// --- Test Case: 'enter set is valid' ---
test ( 'enter set is valid' , function ( t ) {
  // Configure realtime to initially provide a single pointFeature.
  // The update handler checks if this feature appears in the 'enter' set.
  var realtime = setupRealtime ( t , function ( success ) {
          success ( pointFeature ) ; // Provide the first point feature
        } , { } , function ( e ) {
          // Retrieve the feature from the 'enter' set using its ID.
          var f = e . enter [ pointFeature . properties . id ] ;

          t . ok ( f ) ; // Assert that the feature exists in 'enter'
          t . deepEqual ( f , pointFeature ) ; // Assert deep equality with the original feature
          t . end ( ) ; // Conclude the test
        } ) ;

  realtime . update ( ) ; // Initiate the update process
} ) ;
// End of test case.


// --- Test Case: 'enter set does not contain updates' ---
test ( 'enter set does not contain updates' , function ( t ) {
  var updateCount = 0 , // Counter for update events
    realtime = setupRealtime ( t , function ( success ) {
          success ( pointFeature ) ; // Always provide the same point feature
        } , { } , function ( e ) {
          var f = e . enter [ pointFeature . properties . id ] ; // Check for feature in 'enter' set
          updateCount ++ ; // Increment the update counter

          // After the first update, subsequent updates should not have the feature in 'enter'.
          if ( updateCount > 1 ) {
            t . notOk ( f ) ; // Assert that the feature is NOT in 'enter' for subsequent updates
            t . end ( ) ; // End the test
          }
        } ) ;

  realtime . update ( ) ; // First update: feature should be in 'enter'
  realtime . update ( ) ; // Second update: feature should NOT be in 'enter'
} ) ;
// End of test case.


// --- Test Case: 'update set contains updates' ---
test ( 'update set contains updates' , function ( t ) {
  var updateCount = 0 , // Initialize update event counter
    realtime = setupRealtime ( t , function ( success ) {
          success ( pointFeature ) ; // Always provide the same point feature
        } , { } , function ( e ) {
          var f = e . update [ pointFeature . properties . id ] ; // Check for feature in 'update' set
          updateCount ++ ; // Increment counter

          if ( updateCount === 1 ) {
            t . notOk ( f ) ; // First update: feature should NOT be in 'update' (it's new)
          } else if ( updateCount > 1 ) {
            t . ok ( f ) ; // Subsequent updates: feature SHOULD be in 'update' (it's already present)
          }
        } ) ;

  t . plan ( 3 ) ; // Expect 3 assertions to be made
  realtime . update ( ) ; // Trigger first update
  realtime . update ( ) ; // Trigger second update
  realtime . update ( ) ; // Trigger third update
} ) ;
// End of test case.


// --- Test Case: 'exit set contains removed features' ---
test ( 'exit set contains removed features' , function ( t ) {
  var updateCount = 0 , // Update event counter
    realtime = setupRealtime ( t , function ( success ) {
          // Source provides pointFeature only on the first call (updateCount === 0),
          // then an empty array on subsequent calls, simulating removal.
          success ( updateCount === 0 ? pointFeature : [ ] ) ;
        } , { } , function ( e ) {
          var f = e . exit [ pointFeature . properties . id ] ; // Check for feature in 'exit' set
          updateCount ++ ; // Increment the counter

          // The feature should appear in 'exit' on the second update (when it's removed).
          if ( updateCount === 2 ) {
            t . ok ( f ) ; // Assert that the feature IS in 'exit'
          } else {
            t . notOk ( f ) ; // Assert that the feature is NOT in 'exit' otherwise
          }
        } ) ;

  t . plan ( 3 ) ; // Expect 3 assertions
  realtime . update ( ) ; // First update: feature added (not in exit)
  realtime . update ( ) ; // Second update: feature removed (should be in exit)
  realtime . update ( ) ; // Third update: no features (not in exit)
} ) ;
// End of test case.


// --- Test Case: 'features set contains current features' ---
test ( 'features set contains current features' , function ( t ) {
  var updateCount = 0 , // Counter for updates
    realtime = setupRealtime ( t , function ( success ) {
          // Source provides pointFeature for the first two updates (0 and 1),
          // then an empty array for the third update (2), simulating removal.
          success ( updateCount < 2 ? pointFeature : [ ] ) ;
        } , { } , function ( e ) {
          var f = e . features [ pointFeature . properties . id ] ; // Check for feature in the main 'features' set
          updateCount ++ ; // Increment update counter

          // For the first two updates, the feature should be present.
          if ( updateCount < 3 ) {
            t . ok ( f ) ; // Assert feature exists
            t . equal ( Object . keys ( e . features ) . length , 1 ) ; // Assert only one feature
          } else {
            // For the third update, the feature should be removed.
            t . notOk ( f ) ; // Assert feature does not exist
            t . equal ( Object . keys ( e . features ) . length , 0 ) ; // Assert no features
          }
        } ) ;

  t . plan ( 6 ) ; // Expect 6 assertions (2 per update)
  realtime . update ( ) ; // Update 1: feature added
  realtime . update ( ) ; // Update 2: feature still present
  realtime . update ( ) ; // Update 3: feature removed
} ) ;
// End of test case.


// --- Test Case: 'update with explicit data adds data' ---
test ( 'update with explicit data adds data' , function ( t ) {
  var updateCount = 0 , // Event counter
    realtime = setupRealtime ( t , undefined , { } , function ( e ) {
          updateCount ++ ; // Increment counter on each update event

          // Check event properties based on the update sequence
          switch ( updateCount ) {
          case 1 : // First update: Adding pointFeature
            t . equal ( e . enter [ pointFeature . properties . id ] , pointFeature ) ; // pointFeature should be in 'enter'
            t . equal ( Object . keys ( e . update ) . length , 0 ) ; // No updates
            t . equal ( Object . keys ( e . exit ) . length , 0 ) ; // No exits
            break ;
          case 2 : // Second update: Adding pointFeature2, pointFeature is now an update
            t . equal ( e . enter [ pointFeature2 . properties . id ] , pointFeature2 ) ; // pointFeature2 should be in 'enter'
            t . equal ( e . update [ pointFeature . properties . id ] , pointFeature ) ; // pointFeature should be in 'update'
            t . equal ( Object . keys ( e . exit ) . length , 0 ) ; // No exits
            break ;
          case 3 : // Third update: Providing an empty array, all features removed
            t . equal ( Object . keys ( e . enter ) . length , 0 ) ; // No new features
            t . equal ( Object . keys ( e . update ) . length , 0 ) ; // No updated features
            t . equal ( Object . keys ( e . exit ) . length , 0 ) ; // The test expects exit to be empty in this case.
            break ;
          }
        } ) ;

  t . plan ( 9 ) ; // Expect 9 assertions across the three updates
  realtime . update ( pointFeature ) ; // Explicitly update with pointFeature
  realtime . update ( [ pointFeature , pointFeature2 ] ) ; // Explicitly update with both features
  realtime . update ( [ ] ) ; // Explicitly update with an empty array (removes all)
} ) ;
// End of test case.


// --- Test Case: 'remove removes data' ---
test ( 'remove removes data' , function ( t ) {
  var updateCount = 0 , // Update event counter
    realtime = setupRealtime ( t , undefined , { } , function ( e ) {
          updateCount ++ ; // Increment counter

          // On the second update (after explicit remove call), check results.
          if ( updateCount === 2 ) {
            t . equal ( Object . keys ( e . features ) . length , 0 , 'Feature set empty after removal' ) ; // Assert no features remain
            t . equal ( e . exit [ pointFeature . properties . id ] , pointFeature , 'Removed feature is in exit set' ) ; // Assert removed feature is in 'exit'
          }
        } ) ;

  t . plan ( 2 ) ; // Expect 2 assertions
  realtime . update ( pointFeature ) ; // Add pointFeature
  realtime . remove ( pointFeature ) ; // Explicitly remove pointFeature
} ) ;
// End of test case.