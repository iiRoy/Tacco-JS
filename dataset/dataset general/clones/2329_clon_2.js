$( function() {
  var tourRef = {}; // Object to maintain a handle to the instructional system.

  module( 'tour.system' ); // Establish a QUnit test module for the instructional system.

  test( 'instructional system exists', function() {
    ok( tut.sys, 'tut.sys namespace is properly defined' ); // Verify the primary namespace for the instructional system.
  } );

  primeAndValidate( 'terminate', function() {
    expect( 5 ); // Anticipate 5 assertions within this test segment.

    tut.sys.terminate(); // Invoke the termination routine for the instructional system.
    equal( $( '#tutorialContainer' ).length, 0, 'no main wrapper element is present' ); // Confirm the absence of the primary container.
    equal( $( '#guidanceOverlay' ).length, 0, 'no overlay screen is present' ); // Confirm the absence of the overlay screen.
    equal( $( 'body' ).hasClass( 'tutorial-active' ), false, 'body element lacks the active tutorial class' ); // Ensure the body class indicating an active tutorial is removed.
    equal( $( 'body' ).hasClass( 'introPanel-open' ), false, 'body element lacks the intro panel open class' ); // Ensure the body class for an open intro panel is removed.
    equal( $( '.instruction_mask' ).length, 0, 'no highlight elements remain on the page' ); // Check for the removal of all highlight elements.
  } );

  loadAndVerify( 'checkVisibilityInViewport', function() {
    expect( 2 ); // Anticipate 2 assertions.

    // Remark: Testing against a QUnit-specific DOM element as the test fixture might have an inherent offset.
    ok( tut.sys.checkVisibilityInViewport( '#test-suite-header', 0 ), 'the element at the top is within the visible viewport' ); // Validate visibility of a top-positioned element.
    equal( tut.sys.checkVisibilityInViewport( '.info-section:last' ), false, 'the element at the bottom is not within the visible viewport' ); // Validate non-visibility of a bottom-positioned element.
  } );


  module( 'DOM: structural component validation' ); // New module dedicated to testing DOM structure.

  loadAndVerify( 'fixture content loaded', function() {
    expect( 1 ); // Anticipate 1 assertion.

    ok( $( '#demonstrationContent' ).length, 'the fixture demonstration content loaded accurately' ); // Confirm correct loading of demonstration content.
  } );

  loadAndVerify( 'default components present', function() {
    expect( 2 ); // Anticipate 2 assertions.

    tut.sys.initialize(); // Initialize the instructional system.
    ok( $( '#tutorialContainer' ).length, 'the main tutorial container exists' ); // Check for the presence of the main tutorial container.
    ok( $( '.guide_switcher' ).length, 'the tutorial toggle button exists' ); // Check for the presence of the tutorial toggle button.
  } );

  primeAndValidate( 'intro panel exists', function() {
    expect( 3 ); // Anticipate 3 assertions.

    ok( $( '#tutorialContainer .guidanceIntroPanel' ).length, 'the intro panel is located within the main container' ); // Verify the intro panel's containment.
    equal( $( '#guidanceOverlay' ).length, 1, 'precisely one overlay screen is present' ); // Ensure only a single overlay exists.
    ok( $( 'body' ).hasClass( 'introPanel-open' ), 'body element possesses the intro panel open class' ); // Check for the body class indicating an open intro panel.
  }, '#demonstrationContentPlusIntro' ); // Specify a different selector for content that includes an intro panel.


  module( 'DOM: fundamental user interaction' ); // New module for basic interaction tests.

  primeAndValidate( 'open tutorial', function() {
    expect( 6 ); // Anticipate 6 assertions.

    $( '.guide_switcher' ).trigger( 'click' ); // Simulate a click event on the tutorial toggle.
    verifyOpening(); // Invoke a helper function to confirm the tutorial's opening state.
  } );

  primeAndValidate( 'close via toggle button', function() {
    verifyClosure( function() {
      $( '.guide_switcher' ).trigger( 'click' ); // Simulate a click on the toggle button to initiate closing.
    } );
  } );

  primeAndValidate( 'close via termination button', function() {
    verifyClosure( function() {
      $( '.guide_terminator' ).trigger( 'click' ); // Simulate a click on the dedicated close button.
    } );
  } );

  primeAndValidate( 'step navigation in forward direction', function() {
    var stepCount = $( '#instructionSteps > li' ).length; // Retrieve the total count of instructional steps.
    expect( stepCount ); // Anticipate an assertion for each individual step.

    $( '.guide_switcher' ).trigger( 'click' ); // Open the tutorial interface.
    for ( var idx = 1; idx <= stepCount; idx++ ) {
      var currentPos = idx % 4; // Utilise modulo for potential cyclical navigation.
      $( '.guide_forward' ).trigger( 'click' ); // Trigger a click on the forward navigation control.
      equal( $( '#instructionSteps > li:eq(' + currentPos + ')' ).text(),
        $( '.instruction_description' ).text(), 'caption for step ' + currentPos + ' is displayed accurately' ); // Confirm the correct caption is visible.
    }
  } );

  primeAndValidate( 'step navigation in backward direction', function() {
    var stepCount = $( '#instructionSteps > li' ).length; // Retrieve the total count of instructional steps.
    expect( stepCount ); // Anticipate an assertion for each individual step.

    $( '.guide_switcher' ).trigger( 'click' ); // Open the tutorial interface.
    for ( var idx = stepCount - 1; idx >= 0; idx-- ) {
      $( '.guide_backward' ).trigger( 'click' ); // Trigger a click on the backward navigation control.
      equal( $( '#instructionSteps > li:eq(' + idx + ')' ).text(),
        $( '.instruction_description' ).text(), 'caption for step ' + idx + ' is displayed accurately' ); // Confirm the correct caption is visible.
    }
  } );

  primeAndValidate( 'bubble click-based navigation', function() {
    var stepCount = $( '#instructionSteps > li' ).length; // Retrieve the total count of instructional steps.
    expect( stepCount ); // Anticipate an assertion for each individual step.

    $( '.guide_switcher' ).trigger( 'click' ); // Open the tutorial interface.
    $( '.guideStepBubble' ).each( function( idx, domNode ) {
      $( domNode ).trigger( 'click' ); // Simulate a click on each step bubble.
      equal( $( '#instructionSteps > li:eq(' + idx + ')' ).text(),
        $( '.instruction_description' ).text(), 'caption for step ' + idx + ' is displayed accurately' ); // Confirm the correct caption is visible.
    } );
  } );

  module( 'DOM: dynamic target modifications' ); // New module for dynamic target element tests.

  primeAndValidate( 'remove target before tutorial activation', function() {
    var initialStepCount = $( '#instructionSteps > li' ).length; // Obtain the initial number of steps.
    expect( initialStepCount + 1 ); // Anticipate initial steps plus one additional assertion.

    $( '#auxiliary_target_element' ).remove(); // Remove a specified target element.
    $( '.guide_switcher' ).trigger( 'click' ); // Activate the tutorial.
    equal( $( '.instruction_mask:visible' ).length, ( initialStepCount - 1 ),
      'the visible count of step highlights is correct' ); // Verify the number of visible highlights.
    equal( $( '.guideStepBubble:visible' ).length, ( initialStepCount - 1 ),
      'the visible count of step markers is correct' ); // Verify the number of visible step markers.
    verifyOrderedIndices(); // Confirm the sequential ordering of step indices.
  } );

  primeAndValidate( 're-add target after removal and activation', function() {
    var initialStepCount = $( '#instructionSteps > li' ).length; // Obtain the initial number of steps.
    expect( initialStepCount + 2 ); // Anticipate initial steps plus two additional assertions.

    var secondaryElementContent = $( '#auxiliary_target_element' ).html(); // Store the content of the element.
    $( '#auxiliary_target_element' ).remove(); // Remove the element from the DOM.
    $( '.guide_switcher' ).trigger( 'click' ); // Activate the tutorial.

    $( '.guide_terminator' ).trigger( 'click' ); // Terminate the tutorial.
    $( '#demonstrationContent > .container' ).append(
      '<div id="auxiliary_target_element">' + secondaryElementContent + '</div>'
    ); // Append the element back into the DOM.

    $( '.guide_switcher' ).trigger( 'click' ); // Reactivate the tutorial.
    equal( $( '.instruction_mask:visible' ).length, initialStepCount,
      'the visible count of step highlights is correct' ); // Verify the number of visible highlights.
    equal( $( '.guideStepBubble:visible' ).length, initialStepCount,
      'the visible count of step markers is correct' ); // Verify the number of visible step markers.
    verifyOrderedIndices(); // Confirm the sequential ordering of step indices.
  } );

  primeAndValidate( 'conceal target before tutorial activation', function() {
    var initialStepCount = $( '#instructionSteps > li' ).length; // Obtain the initial number of steps.
    expect( initialStepCount + 1 ); // Anticipate initial steps plus one additional assertion.

    $( '#auxiliary_target_element' ).hide(); // Hide a specified target element.
    $( '.guide_switcher' ).trigger( 'click' ); // Activate the tutorial.
    equal( $( '.instruction_mask:visible' ).length, ( initialStepCount - 1 ),
      'the number of step highlights reflects the concealed element' ); // Verify the number of visible highlights.
    equal( $( '.guideStepBubble:visible' ).length, ( initialStepCount - 1 ),
      'the number of step markers reflects the concealed element' ); // Verify the number of visible step markers.
    verifyOrderedIndices(); // Confirm the sequential ordering of step indices.
  } );

  primeAndValidate( 'reveal target after concealment and activation', function() {
    var initialStepCount = $( '#instructionSteps > li' ).length; // Obtain the initial number of steps.
    expect( initialStepCount + 2 ); // Anticipate initial steps plus two additional assertions.

    $( '#auxiliary_target_element' ).hide(); // Hide the element.
    $( '.guide_switcher' ).trigger( 'click' ); // Activate the tutorial.

    $( '.guide_terminator' ).trigger( 'click' ); // Terminate the tutorial.
    $( '#auxiliary_target_element' ).show(); // Show the element.
    $( '.guide_switcher' ).trigger( 'click' ); // Reactivate the tutorial.
    equal( $( '.instruction_mask:visible' ).length, initialStepCount,
      'the visible count of step highlights is correct' ); // Verify the number of visible highlights.
    equal( $( '.guideStepBubble:visible' ).length, initialStepCount,
      'the visible count of step markers is correct' ); // Verify the number of visible step markers.
    verifyOrderedIndices(); // Confirm the sequential ordering of step indices.
  } );

  primeAndValidate( 'remove target while tutorial is active', function() {
    var initialStepCount = $( '#instructionSteps > li' ).length; // Obtain the initial number of steps.
    expect( initialStepCount + 1 ); // Anticipate initial steps plus one additional assertion.

    $( '.guide_switcher' ).trigger( 'click' ); // Activate the tutorial.
    $( '#auxiliary_target_element' ).remove(); // Remove the element.
    tourRef.refreshDisplayStatus(); // Refresh the tutorial's display status.

    equal( $( '.instruction_mask:visible' ).length, ( initialStepCount - 1 ),
      'the visible count of step highlights is correct' ); // Verify the number of visible highlights.
    equal( $( '.guideStepBubble:visible' ).length, ( initialStepCount - 1 ),
      'the visible count of step markers is correct' ); // Verify the number of visible step markers.
    verifyOrderedIndices(); // Confirm the sequential ordering of step indices.
  } );

  primeAndValidate( 'conceal current targets while tutorial is active', function() {
    var initialStepCount = $( '#instructionSteps > li' ).length; // Obtain the initial number of steps.
    expect( ( initialStepCount + 1 ) * initialStepCount ); // Anticipate (initial steps + 1) multiplied by initial steps assertions.

    $( '.info-section' ).each( function( idx, domNode ) {
      $( '.guide_switcher' ).trigger( 'click' ); // Activate the tutorial.
      tourRef.presentGuidance( idx ); // Present a specific guidance message.
      $( domNode ).hide(); // Hide the current DOM element.
      tourRef.refreshDisplayStatus(); // Refresh the tutorial's display status.
      equal( $( '.instruction_mask:visible' ).length, ( initialStepCount - 1 ),
        'the visible count of step highlights is correct' ); // Verify the number of visible highlights.
      equal( $( '.guideStepBubble:visible' ).length, ( initialStepCount - 1 ),
        'the visible count of step markers is correct' ); // Verify the number of visible step markers.
      verifyOrderedIndices(); // Confirm the sequential ordering of step indices.
      $( domNode ).show(); // Show the DOM element again.
      $( '.guide_terminator' ).trigger( 'click' ); // Terminate the tutorial.
    } );
  } );

  primeAndValidate( 'reveal current targets while tutorial is active', function() {
    var initialStepCount = $( '#instructionSteps > li' ).length; // Obtain the initial number of steps.
    expect( ( initialStepCount + 2 ) * initialStepCount ); // Anticipate (initial steps + 2) multiplied by initial steps assertions.

    $( '.info-section' ).each( function( idx, domNode ) {
      $( domNode ).hide(); // Hide the DOM element.
      $( '.guide_switcher' ).trigger( 'click' ); // Activate the tutorial.
      tourRef.presentGuidance( idx ); // Present a specific guidance message.
      $( domNode ).show(); // Show the DOM element.
      tourRef.refreshDisplayStatus(); // Refresh the tutorial's display status.
      equal( $( '.instruction_mask:visible' ).length, initialStepCount,
        'the visible count of step highlights is correct' ); // Verify the number of visible highlights.
      equal( $( '.guideStepBubble:visible' ).length, initialStepCount,
        'the visible count of step markers is correct' ); // Verify the number of visible step markers.
      verifyOrderedIndices(); // Confirm the sequential ordering of step indices.
      $( '.guide_terminator' ).trigger( 'click' ); // Terminate the tutorial.
    } );
  } );

  module( 'DOM: introductory message behavior' ); // New module for introductory message tests.

  primeAndValidate( 'intro panel begin click', function() {
    expect( 9 ); // Anticipate 9 assertions.

    $( '.guide_commence' ).trigger( 'click' ); // Simulate a click on the 'begin' action button.
    verifyOpening(); // Confirm the tutorial's opening state.
    ok( checkPersistedSetting(), 'local storage item indicating completion exists' ); // Verify the presence of the local storage item.
    ok( $( '.guidanceIntroPanel' ).not( ':visible' ), 'the introductory panel is now concealed' ); // Confirm the intro panel is hidden.
    ok( $( '.guidanceOverlay' ).not( ':visible' ), 'the overlay screen is now concealed' ); // Confirm the overlay is hidden.
    localStorage.clear(); // Clear all items from local storage.
  }, '#demonstrationContentPlusIntro' ); // Specify the content selector.

  primeAndValidate( 'intro panel begin and subsequent open', function() {
    expect( 8 ); // Anticipate 8 assertions.

    $( '.guide_commence' ).trigger( 'click' ); // Simulate a click on the 'begin' action button.
    $( '.guide_terminator' ).trigger( 'click' ); // Terminate the tutorial.
    $( '.guide_switcher' ).trigger( 'click' ); // Reactivate the tutorial.
    ok( $( '.guidanceIntroPanel' ).not( ':visible' ), 'the introductory panel is now concealed' ); // Confirm the intro panel is hidden.
    ok( $( '#guidanceOverlay' ).not( ':visible' ), 'the overlay screen is now concealed' ); // Confirm the overlay is hidden.
    verifyOpening(); // Confirm the tutorial's opening state.
    localStorage.clear(); // Clear all items from local storage.
  }, '#demonstrationContentPlusIntro' ); // Specify the content selector.

  primeAndValidate( 'intro panel toggle click', function() {
    expect( 9 ); // Anticipate 9 assertions.

    $( '.guide_switcher' ).trigger( 'click' ); // Simulate a click on the toggle button.
    verifyOpening(); // Confirm the tutorial's opening state.
    ok( checkPersistedSetting(), 'local storage item indicating completion exists' ); // Verify the presence of the local storage item.
    ok( $( '.guidanceIntroPanel' ).not( ':visible' ), 'the introductory panel is now concealed' ); // Confirm the intro panel is hidden.
    ok( $( '#guidanceOverlay' ).not( ':visible' ), 'the overlay screen is now concealed' ); // Confirm the overlay is hidden.
    localStorage.clear(); // Clear all items from local storage.
  }, '#demonstrationContentPlusIntro' ); // Specify the content selector.

  primeAndValidate( 'intro panel disregard click', function() {
    expect( 5 ); // Anticipate 5 assertions.

    $( '.guide_disregard' ).trigger( 'click' ); // Simulate a click on the 'disregard' action button.
    ok( $( '.guidanceIntroPanel' ).not( ':visible' ), 'the introductory panel is now concealed' ); // Confirm the intro panel is hidden.
    ok( $( '.guidanceOverlay' ).not( ':visible' ), 'the overlay screen is now concealed' ); // Confirm the overlay is hidden.
    equal( checkPersistedSetting(), false, 'no local storage item has been set yet' ); // Confirm the absence of the local storage item.
    $( '.guide_switcher' ).trigger( 'click' ); // Reactivate the tutorial.
    ok( $( '.guidanceIntroPanel' ).is( ':visible' ), 'the introductory panel is shown again' ); // Confirm the intro panel is visible.
    ok( $( '#guidanceOverlay' ).is( ':visible' ), 'the overlay screen is shown again' ); // Confirm the overlay is visible.
  }, '#demonstrationContentPlusIntro' ); // Specify the content selector.

  primeAndValidate( 'intro panel dismiss click', function() {
    expect( 11 ); // Anticipate 11 assertions.

    $( '.guide_close_permanently' ).trigger( 'click' ); // Simulate a click on the 'dismiss' action button.
    ok( $( '.guidanceIntroPanel' ).not( ':visible' ), 'the introductory panel is now concealed' ); // Confirm the intro panel is hidden.
    ok( $( '#guidanceOverlay' ).not( ':visible' ), 'the overlay screen is now concealed' ); // Confirm the overlay is hidden.
    ok( checkPersistedSetting(), 'local storage item indicating completion exists' ); // Verify the presence of the local storage item.
    $( '.guide_switcher' ).trigger( 'click' ); // Reactivate the tutorial.
    ok( $( '.guidanceIntroPanel' ).not( ':visible' ), 'the introductory panel is now concealed' ); // Confirm the intro panel is hidden.
    ok( $( '#guidanceOverlay' ).not( ':visible' ), 'the overlay screen is now concealed' ); // Confirm the overlay is hidden.
    verifyOpening(); // Confirm the tutorial's opening state.
    localStorage.clear(); // Clear all items from local storage.
  }, '#demonstrationContentPlusIntro' ); // Specify the content selector.

  module( 'multiple tutorial instances' ); // New module for testing multiple tutorial instances.

  primeAndValidate( 'two tutorials on a single page', function() {
    expect( 8 ); // Anticipate 8 assertions.
    var anotherTourRef = tut.sys.initialize( {
      step_elements: '#headerGuideSteps', // Designate a different element for tutorial steps.
      completion_callback: function() {
        equal( $( '.guide_switcher' ).length, 2 ); // Verify that two toggle buttons are present.
        equal( $( '#tutorialContainer' ).length, 1 ); // Verify that only one primary tutorial container exists.

        // Validate the first tutorial instance.
        $( '.guide_switcher:first' ).trigger( 'click' ); // Click the first toggle button.
        equal( $( '#instructionSteps > li:eq(0)' ).text(),
          $( '.instruction_description' ).text(), 'the first caption for the first tutorial is displayed' ); // Confirm the caption.
        var firstTourSteps = $( '#instructionSteps > li' ).length; // Get the step count for the first tutorial.
        equal( $( '.instruction_mask:visible' ).length, firstTourSteps, 'all step highlights are shown for the first tutorial' ); // Verify highlights.
        equal( $( '.guideStepBubble:visible' ).length, firstTourSteps, 'all step markers are shown for the first tutorial' ); // Verify markers.
        $( '.guide_switcher:first' ).trigger( 'click' ); // Close the first tutorial.

        // Validate the second tutorial instance.
        $( '.guide_switcher:eq(1)' ).trigger( 'click' ); // Click the second toggle button.
        equal( $( '#headerGuideSteps > li:eq(0)' ).text(),
          $( '.instruction_description' ).text(), 'the first caption for the second tutorial is displayed' ); // Confirm the caption.
        var secondTourSteps = $( '#instructionSteps > li' ).length; // Get the step count for the second tutorial.
        equal( $( '.instruction_mask:visible' ).length, secondTourSteps, 'all step highlights are shown for the second tutorial' ); // Verify highlights.
        equal( $( '.guideStepBubble:visible' ).length, secondTourSteps, 'all step markers are shown for the second tutorial' ); // Verify markers.
        $( '.guide_switcher:eq(1)' ).trigger( 'click' ); // Close the second tutorial.
        start(); // Resume QUnit test execution.
        tut.sys.terminate(); // Terminate the instructional system.
      }
    } );
  }, null, true ); // No specific content selector, defer the QUnit start.

  // HELPER FUNCTIONS FOR TEST EXECUTION

  /**
   * For validating the loading of the instructional system within the DOM:
   * This function loads sample page HTML into the QUnit fixture element,
   * then proceeds to execute the provided callback function.
   * - unitName: The descriptive title of the test unit.
   * - callbackFn: The function containing the primary logic for the test.
   * - deferTestStart: An optional boolean indicating whether to postpone the `start()` call.
   * - contentSelector: An optional string selector targeting a specific area within the sample page.
   **/
  function loadAndVerify( unitName, callbackFn, deferTestStart, contentSelector ) {
    var contentArea = contentSelector || '#demonstrationContent'; // Determine the specific content area to load.
    asyncTest( unitName, function() {
      $( '#qunit-fixture' ).load( '../../example/index.html ' + contentArea, function() {
        callbackFn(); // Execute the test's designated callback function.
        if ( !deferTestStart ) {
          start(); // Initiate QUnit if not explicitly deferred.
          tut.sys.terminate(); // Terminate the instructional system following the test.
        }
      } );
    } );
  }

  /**
   * For executing a test specifically when the instructional system has reached a 'ready' state.
   * It waits for `tut.sys.ready()` to fire before proceeding with the test logic,
   * making it suitable for interaction-based tests.
   * - unitName: The descriptive title of the test unit.
   * - callbackFn: The function containing the primary logic for the test.
   * - contentSelector: An optional string selector targeting a specific area within the sample page.
   * - deferTestStart: An optional boolean indicating whether to postpone the `start()` call.
   **/
  function primeAndValidate( unitName, callbackFn, contentSelector, deferTestStart ) {
    loadAndVerify( unitName, function() {
      tourRef = tut.sys.initialize( {
        completion_callback: function() {
          callbackFn(); // Execute the test's designated callback function.
          if ( !deferTestStart ) {
            start(); // Initiate QUnit if not explicitly deferred.
            tut.sys.terminate(); // Terminate the instructional system following the test.
          }
        }
      } );
    }, true, contentSelector ); // Always defer the QUnit start for this helper.
  }

  /**
   * Confirms a tutorial closure interaction. Given that all closing actions result in
   * a consistent set of observable states, this function centralizes the relevant assertions.
   * - closureAction: The function encapsulating the specific closing interaction to simulate.
   **/
  function verifyClosure( closureAction ) {
    expect( 3 ); // Anticipate 3 assertions.
    $( '.guide_switcher' ).trigger( 'click' ); // First, activate the tutorial.
    closureAction(); // Execute the specified closing action.
    ok( $( '#instructionDisplay' ).not( ':visible' ), 'the display area is now concealed' ); // Verify the message area is hidden.
    equal( $( '.instruction_mask:visible' ).length, 0, 'all step highlights are concealed' ); // Verify all highlight elements are hidden.
    equal( $( '.guideStepBubble:visible' ).length, 0, 'all step markers are concealed' ); // Verify all step markers are hidden.
  }

  /**
   * Confirms a tutorial opening interaction. All opening actions lead to a consistent
   * system state, facilitating the reuse of assertions.
   * Note: The currently displayed index cannot be immediately verified due to an inherent animation delay.
   **/
  function verifyOpening() {
    ok( $( 'body' ).hasClass( 'tutorial-active' ), 'body element possesses the active tutorial class' ); // Check for the body class indicating an active tutorial.
    ok( $( '#instructionDisplay' ).is( ':visible' ), 'the display area is now visible' ); // Verify the message area is visible.
    equal( $( '.guide-current-step' ).length, 1, 'only one element is marked as the current step' ); // Verify only one element has the current step class.
    equal( $( '#instructionSteps > li:eq(0)' ).text(),
      $( '.instruction_description' ).text(), 'the initial caption is displayed' ); // Verify the first caption is visible.

    var numSteps = $( '#instructionSteps > li' ).length; // Retrieve the total count of steps.
    equal( $( '.instruction_mask:visible' ).length, numSteps, 'all step highlights are shown' ); // Verify all highlight elements are visible.
    equal( $( '.guideStepBubble:visible' ).length, numSteps, 'all step markers are shown' ); // Verify all step markers are visible.
  }

  /**
   * Traverses all visible step markers (represented as numbered bubbles) and validates
   * that their numerical values increment sequentially by one.
   **/
  function verifyOrderedIndices() {
    $( '.guideStepBubble:visible' ).each( function( idx, domNode ) {
      equal( idx, ( parseFloat( $( domNode ).text() ) - 1 ), 'step ' + idx + ' has the correct sequential number' ); // Verify the index matches the text content.
    } );
  }

  /**
   * Checks for the existence of a specific local storage item, which is typically used
   * to determine whether the introductory message has already been presented to the user.
   **/
  function checkPersistedSetting() {
    return !!localStorage.getItem( 'tutorial_intro_displayed_' + tut.sys.computePathKey() ); // Returns a boolean based on the local storage item's presence.
  }
} );