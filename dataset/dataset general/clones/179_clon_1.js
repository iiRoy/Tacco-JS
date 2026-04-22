$( function () {

  // This is the main entry point for the script
  // It's a jQuery ready function wrapper
  // All code inside will execute once the DOM is fully loaded.


  var sources = {
    // Definition for small screen sizes
    'small': {
      'src': 'http://placehold.it/320x240',   // Source URL for small image
      'min': null,                            // Minimum width for this source (null means no lower bound)
      'max': 319                              // Maximum width for this source
    },

    // Definition for medium screen sizes
    'medium': {
      'src': 'http://placehold.it/640x460',   // Source URL for medium image
      'min': 320,                             // Minimum width
      'max': 639                              // Maximum width
    },

    // Definition for large screen sizes
    'large': {
      'src': 'http://placehold.it/800x600',   // Source URL for large image
      'min': 640,                             // Minimum width
      'max': null                             // Maximum width (null means no upper bound)
    }
  }; // End of sources object definition


  // -------------------------------------------------------------------------
  // Helper function to generate source definition string for data-pufferfish attribute
  // -------------------------------------------------------------------------
  function getSourceDefinition () {

    var sourceDefinition = [ ]; // Initialize an empty array to hold parts of the definition string

    $.each( sources, function ( name, source ) {
      // Loop through each source definition (small, medium, large)

      sourceDefinition.push(
        // Construct the string for a single source definition
        '[' + source.src + ', (' +
        // Add min-width condition if 'min' is not null
        ( source.min !== null ? 'min-width: ' + source.min : '' ) +
        // Add a comma if both min and max conditions exist
        ( source.min !== null && source.max !== null ? ', ' : '' ) +
        // Add max-width condition if 'max' is not null
        ( source.max !== null ? 'max-width: ' + source.max : '' ) +
        ')]'
      ); // End of push
    } ); // End of $.each

    return sourceDefinition.join( ', ' ); // Join all parts with a comma and space
  } // End of getSourceDefinition function


  // -------------------------------------------------------------------------
  // QUnit Test Setup
  // -------------------------------------------------------------------------

  var log = [ ]; // Array to store failed test details

  var testName; // Variable to hold the name of the current test (not used directly in this clone, but kept for fidelity)


  QUnit.done( function ( test_results ) {
    // This function runs after all QUnit tests have completed.

    var tests = [ ]; // Array to hold simplified test results

    for ( var i = 0, len = log.length; i < len; i ++ ) {
      // Iterate through the collected log of failed tests
      var details = log[ i ];

      tests.push( {
        // Push relevant details of the failed test
        name: details.name,
        result: details.result,
        expected: details.expected,
        actual: details.actual,
        source: details.source
      } ); // End of push
    } // End of for loop

    test_results.tests = tests; // Attach the simplified failed tests to the overall test results object

    window.global_test_results = test_results; // Make the results globally accessible
  } ); // End of QUnit.done


  QUnit.testStart( function ( testDetails ) {
    // This function runs at the start of each individual test.

    QUnit.log( function ( details ) {
      // QUnit.log runs for each assertion within a test.
      if ( ! details.result ) {
        // If an assertion failed (result is false)
        details.name = testDetails.name; // Assign the current test's name to the failed assertion details
        log.push( details );             // Add the failed assertion details to our log array
      }
    } ); // End of QUnit.log
  } ); // End of QUnit.testStart


  // -------------------------------------------------------------------------
  // QUnit Test Cases
  // -------------------------------------------------------------------------

  QUnit.test( 'static-full', function ( assert ) {
    // Test case for a statically defined image on a large viewport

    var container = $( '#test-static-full' ); // Select the container element
    var img = container.find( 'img' );        // Find the image within the container (not directly used here, but kept)

    var done = assert.async( ); // Inform QUnit that this is an asynchronous test

    container.pufferfish( {
      'afterChange': function ( event ) {
        // Callback function executed after pufferfish changes the image source

        assert.equal( sources.large.src, event.element.attr( 'src' ), 'static image should be using larger image source' );
        done( ); // Signal QUnit that the async test is complete
      }
    } ); // End of container.pufferfish call

  } ); // End of QUnit.test 'static-full'


  QUnit.test( 'static-half', function ( assert ) {
    // Test case for a statically defined image on a medium viewport

    var container = $( '#test-static-half' ); // Select the container
    var img = container.find( 'img' );        // Find the image (not directly used)

    var done = assert.async( ); // Async test setup

    container.pufferfish( {
      'afterChange': function ( event ) {
        // Callback after source change

        assert.equal( sources.medium.src, event.element.attr( 'src' ), 'static image should be using smaller image source' );
        done( ); // Complete async test
      }
    } );

  } ); // End of QUnit.test 'static-half'


  QUnit.test( 'async-full', function ( assert ) {
    // Test case for an asynchronously added image on a large viewport

    var container = $( '#test-async-full' ); // Select the container
    // Create an image element dynamically and append it to the container,
    // setting its data-pufferfish attribute using the generated source definition.
    var img = $( '<img>', { 'data-pufferfish': getSourceDefinition( ) } ).appendTo( container );

    var done = assert.async( ); // Async test setup

    container.pufferfish( {
      'afterChange': function ( event ) {
        // Callback after source change

        assert.equal( sources.large.src, event.element.attr( 'src' ), 'async added image should be using larger image source' );
        done( ); // Complete async test
      }
    } );

  } ); // End of QUnit.test 'async-full'


  QUnit.test( 'async-half', function ( assert ) {
    // Test case for an asynchronously added image on a medium viewport

    var container = $( '#test-async-half' ); // Select the container
    // Dynamically create and append an image with data-pufferfish attribute
    var img = $( '<img>', { 'data-pufferfish': getSourceDefinition( ) } ).appendTo( container );

    var done = assert.async( ); // Async test setup

    container.pufferfish( {
      'afterChange': function ( event ) {
        // Callback after source change

        assert.equal( sources.medium.src, event.element.attr( 'src' ), 'async added image should be using smaller image source' );
        done( ); // Complete async test
      }
    } );

  } ); // End of QUnit.test 'async-half'


  QUnit.test( 'static-resize', function ( assert ) {
    // Test case for a static image that changes source on container resize

    var container = $( '#test-static-resize' ); // Select the container
    var img = container.find( 'img' );          // Find the image (not directly used)

    // Setup multiple async done callbacks for each stage of resizing
    var doneLarge = assert.async( );
    var doneMedium = assert.async( );
    var doneSmall = assert.async( );

    container.width( 200 ); // Set initial container width to trigger small image source

    container.pufferfish( {
      'afterChange': function ( event ) {
        // Callback after each image source change due to resize

        var width = container.width( ); // Get the current width of the container

        if ( width == 200 ) {
          // If container width is 200px (small)
          assert.equal( sources.small.src, event.element.attr( 'src' ), 'small image source should be used when container is 200px wide' );
          doneSmall( ); // Mark small test as complete
          container.width( 500 ); // Change width to trigger medium image
          $.pufferfish.reflow( ); // Manually trigger pufferfish reflow
        } else if ( width === 500 ) {
          // If container width is 500px (medium)
          assert.equal( sources.medium.src, event.element.attr( 'src' ), 'medium image source should be used when container is 500px wide' );
          doneMedium( ); // Mark medium test as complete
          container.width( 700 ); // Change width to trigger large image
          $.pufferfish.reflow( ); // Manually trigger pufferfish reflow
        } else if ( width === 700 ) {
          // If container width is 700px (large)
          assert.equal( sources.large.src, event.element.attr( 'src' ), 'large image source should be used when container is 700px wide' );
          doneLarge( ); // Mark large test as complete
        }

      } // End of afterChange callback
    } ); // End of container.pufferfish call

  } ); // End of QUnit.test 'static-resize'


  QUnit.test( 'prevent-default', function ( assert ) {
    // Test case to verify preventDefault functionality on onChange event

    var container = $( '#test-prevent-default' ); // Select the container
    var img = container.find( 'img' );             // Find the image (not directly used)

    var done = assert.async( ); // Async test setup

    container.pufferfish( {
      'onChange': function ( event ) {
        // This callback runs before the image source is changed.
        // Calling preventDefault() here should stop the default behavior.
        event.preventDefault( );
      },
      'afterChange': function ( event ) {
        // This callback runs after the (prevented) change.
        // The image source should remain its original, non-pufferfish source.
        assert.equal( 'http://placehold.it/50x50', event.element.attr( 'src' ) );
        done( ); // Complete async test
      }
    } );

  } ); // End of QUnit.test 'prevent-default'


  // -------------------------------------------------------------------------
  // Start QUnit Tests
  // -------------------------------------------------------------------------
  QUnit.start( ); // Begin running all defined QUnit tests

} ); // End of jQuery ready function