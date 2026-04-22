$( function (  )
{
    // This variable 'pg' will serve as a reference for the PageGuide object instance.
    var pg = {}; /* It will be populated by tl.pg.init() within various test setups. */

    // Initialize a QUnit module specifically for testing the 'tl.pg' namespace.
    module( 'tl.pg' ) ;

    // Test case: Verify the fundamental existence of the 'tl.pg' namespace.
    test ( 'pageguide exists' , function (  )
    {
        // Use QUnit's 'ok' assertion to confirm that 'tl.pg' is a truthy value.
        ok( tl.pg, 'tl.pg namespace exists' ) ;
    } ) ;

    // Test suite for the 'destroy' method of the PageGuide.
    // This ensures all artifacts of an initialized PageGuide are properly removed.
    loadInitAndTest( 'destroy' , function (  )
    {
        // Declare that this test expects a total of 5 assertions to pass.
        expect( 5 ) ;

        // Invoke the destroy method on the PageGuide instance.
        tl.pg.destroy(  ) ;

        // Assertion 1: Confirm that the main PageGuide wrapper element is no longer in the DOM.
        equal( $( '#tlyPageGuideWrapper' ).length, 0, 'no wrapper' ) ;

        // Assertion 2: Confirm that the overlay element, if present, has been removed.
        equal( $( '#tlyPageGuideOverlay' ).length, 0, 'no overlay' ) ;

        // Assertion 3: Verify that the 'tlypageguide-open' class is absent from the body element.
        equal( $( 'body' ).hasClass( 'tlypageguide-open' ), false, 'no open class' ) ;

        // Assertion 4: Verify that the 'tlyPageGuideWelcomeOpen' class is absent from the body element.
        equal( $( 'body' ).hasClass( 'tlyPageGuideWelcomeOpen' ), false, 'no welcome open class' ) ;

        // Assertion 5: Confirm that all PageGuide shadow elements have been removed from the DOM.
        equal( $( '.tlypageguide_shadow' ).length, 0, 'no shadow elements' ) ;
    } ) ;

    // Test suite for the 'isScrolledIntoView' utility function.
    loadAndTest( 'isScrolledIntoView' , function (  )
    {
        // This test expects 2 assertions.
        expect( 2 ) ;

        // NOTE: The original comment highlights a necessary adaptation for QUnit's fixture offsetting.
        // Assertion 1: Check if a header element (typically at the top) is considered 'in view'.
        ok( tl.pg.isScrolledIntoView( '#qunit-header', 0 ), 'top element scrolled into view' ) ;

        // Assertion 2: Check if a 'data-block' at the bottom of the page is considered 'not in view'.
        equal( tl.pg.isScrolledIntoView( '.data-block:last' ), false, 'bottom element not scrolled into view' ) ;
    } ) ;


    // Define a new QUnit module focused on verifying the existence of DOM elements.
    module( 'DOM: elements exist' ) ;

    // Test case: Ensure the example content fixture is loaded into the QUnit environment.
    loadAndTest( 'fixture loaded' , function (  )
    {
        // Expect only one assertion for this test.
        expect( 1 ) ;

        // Verify that the '#exampleContent' element exists, indicating successful fixture loading.
        ok( $( '#exampleContent' ).length, 'fixture loaded correctly' ) ;
    } ) ;

    // Test case: Confirm the presence of core PageGuide elements after initialization.
    loadAndTest( 'default elements exist' , function (  )
    {
        // This test expects 2 assertions.
        expect( 2 ) ;

        // Initialize the PageGuide.
        tl.pg.init(  ) ;

        // Assertion 1: Check for the existence of the main PageGuide wrapper element.
        ok( $( '#tlyPageGuideWrapper' ).length, 'wrapper exists' ) ;

        // Assertion 2: Check for the existence of the PageGuide toggle button.
        ok( $( '.tlypageguide_toggle' ).length, 'toggle exists' ) ;
    } ) ;

    // Test case: Verify the behavior and existence of the welcome message feature.
    loadInitAndTest( 'welcome exists' , function (  )
    {
        // Expect 3 assertions.
        expect( 3 ) ;

        // Assertion 1: Confirm the welcome message element is correctly nested within the wrapper.
        ok( $( '#tlyPageGuideWrapper .tlyPageGuideWelcome' ).length, 'welcome inside wrapper' ) ;

        // Assertion 2: Ensure that precisely one overlay element is present.
        equal( $( '#tlyPageGuideOverlay' ).length, 1, 'only one overlay exists' ) ;

        // Assertion 3: Verify that the body element gains the 'tlyPageGuideWelcomeOpen' class.
        ok( $( 'body' ).hasClass( 'tlyPageGuideWelcomeOpen' ), 'body class' ) ;
    } , '#examplePlusWelcome' ) ;


    // Define a new QUnit module for testing basic user interactions with the PageGuide.
    module( 'DOM: basic interaction' ) ;

    // Test case: Confirm the PageGuide opens correctly upon clicking its toggle button.
    loadInitAndTest( 'open' , function (  )
    {
        // This test expects 6 assertions.
        expect( 6 ) ;

        // Simulate a click event on the PageGuide's toggle button.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Utilize a helper function to assert the common conditions expected when the PageGuide is open.
        testOpen(  ) ;
    } ) ;

    // Test case: Confirm the PageGuide closes correctly when its toggle button is clicked again.
    loadInitAndTest( 'close from toggle' , function (  )
    {
        // Use a helper function to perform and verify close operations, passing the toggle click action.
        testClose( function (  )
        {
            $( '.tlypageguide_toggle' ).trigger( 'click' ) ;
        } ) ;
    } ) ;

    // Test case: Confirm the PageGuide closes correctly when its dedicated close button is clicked.
    loadInitAndTest( 'close from button' , function (  )
    {
        // Use a helper function for close verification, passing the close button click.
        testClose( function (  )
        {
            $( '.tlypageguide_close' ).trigger( 'click' ) ;
        } ) ;
    } ) ;

    // Test case: Verify forward navigation through PageGuide steps using arrow controls.
    loadInitAndTest( 'arrow nav forward' , function (  )
    {
        // Determine the total number of steps defined in the PageGuide.
        var itemLength = $( '#tlyPageGuide > li' ).length ;

        // The number of expected assertions is equal to the number of steps.
        expect( itemLength ) ;

        // First, open the PageGuide to enable navigation.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Loop through each step to simulate forward navigation and verify content.
        for ( var i = 1 ; i <= itemLength ; i ++ )
        {
            // Calculate the expected index, assuming a modulo 4 cycle for demonstration.
            var index = i % 4 ;

            // Simulate a click on the forward navigation button.
            $( '.tlypageguide_fwd' ).trigger( 'click' ) ;

            // Assert that the displayed caption text matches the text of the corresponding list item.
            equal( $( '#tlyPageGuide > li:eq(' + index + ')' ).text(  ),
                $( '.tlypageguide_text' ).text(  ), 'caption ' + index + ' displayed' ) ;
        }
    } ) ;

    // Test case: Verify backward navigation through PageGuide steps using arrow controls.
    loadInitAndTest( 'arrow nav backward' , function (  )
    {
        // Get the total count of steps in the PageGuide.
        var itemLength = $( '#tlyPageGuide > li' ).length ;

        // Expect assertions equal to the number of steps.
        expect( itemLength ) ;

        // Open the PageGuide to begin navigation tests.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Loop backward through the steps to simulate and verify navigation.
        for ( var i = itemLength - 1 ; i >= 0 ; i -- )
        {
            // Simulate a click on the backward navigation button.
            $( '.tlypageguide_back' ).trigger( 'click' ) ;

            // Assert that the displayed caption matches the text of the corresponding step list item.
            equal( $( '#tlyPageGuide > li:eq(' + i + ')' ).text(  ),
                $( '.tlypageguide_text' ).text(  ), 'caption ' + i + ' displayed' ) ;
        }
    } ) ;

    // Test case: Verify navigation by clicking on individual step index bubbles.
    loadInitAndTest( 'bubble click nav' , function (  )
    {
        // Retrieve the total number of steps in the guide.
        var itemLength = $( '#tlyPageGuide > li' ).length ;

        // Expect assertions equal to the total number of steps.
        expect( itemLength ) ;

        // Open the PageGuide for interaction.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Iterate over each step index element (the numerical bubbles).
        $( '.tlyPageGuideStepIndex' ).each( function ( i, el )
        {
            // Simulate a click on the current step index bubble.
            $( el ).trigger( 'click' ) ;

            // Assert that the currently displayed caption matches the text of the corresponding step.
            equal( $( '#tlyPageGuide > li:eq(' + i + ')' ).text(  ),
                $( '.tlypageguide_text' ).text(  ), 'caption ' + i + ' displayed' ) ;
        } ) ;
    } ) ;

    // Define a new QUnit module for tests involving dynamic changes to target elements.
    module( 'DOM: target changes' ) ;

    // Test case: Removing a target element *before* the PageGuide is opened.
    loadInitAndTest( 'remove target before open' , function (  )
    {
        // Store the initial count of steps.
        var originalStepLength = $( '#tlyPageGuide > li' ).length ;

        // Expect assertions: original steps count plus an additional check.
        expect( originalStepLength + 1 ) ;

        // Remove the target element with ID 'second_element_to_target' from the DOM.
        $( '#second_element_to_target' ).remove(  ) ;

        // Now, open the PageGuide. It should adapt to the removed element.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Assertion 1: Verify that the number of visible step shadows is now one less than the original.
        equal( $( '.tlypageguide_shadow:visible' ).length, ( originalStepLength - 1 ),
            'correct number of step shadows' ) ;

        // Assertion 2: Verify that the number of visible step indices is also one less.
        equal( $( '.tlyPageGuideStepIndex:visible' ).length, ( originalStepLength - 1 ),
            'correct number of step indices' ) ;

        // Use a helper to confirm that the remaining step indices are still sequential.
        testSequentialIndices(  ) ;
    } ) ;

    // Test case: Adding a target element back into the DOM after it was removed and the PageGuide cycled.
    loadInitAndTest( 'add target back in after removing and opening' , function (  )
    {
        // Get the initial number of steps.
        var originalStepLength = $( '#tlyPageGuide > li' ).length ;

        // Expect assertions: original steps count plus two additional checks.
        expect( originalStepLength + 2 ) ;

        // Store the HTML content of the second target element before its removal.
        var secondElementHtml = $( '#second_element_to_target' ).html(  ) ;

        // Remove the target element.
        $( '#second_element_to_target' ).remove(  ) ;

        // Open the PageGuide; it will reflect the removal.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Close the PageGuide.
        $( '.tlypageguide_close' ).trigger( 'click' ) ;

        // Re-append the removed element back into the specified wrapper.
        $( '#exampleContent > .wrapper' ).append(
            '<div id="second_element_to_target">' + secondElementHtml + '</div>'
        ) ;

        // Open the PageGuide again. It should now recognize the re-added element.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Assertion 1: Verify that the visible step shadows count has returned to the original length.
        equal( $( '.tlypageguide_shadow:visible' ).length, originalStepLength,
            'correct number of step shadows' ) ;

        // Assertion 2: Verify that the visible step indices count has also returned to the original length.
        equal( $( '.tlyPageGuideStepIndex:visible' ).length, originalStepLength,
            'correct number of step indices' ) ;

        // Confirm sequential numbering of indices.
        testSequentialIndices(  ) ;
    } ) ;

    // Test case: Hiding a target element *before* the PageGuide is opened.
    loadInitAndTest( 'hide target before open' , function (  )
    {
        // Get the initial count of steps.
        var originalStepLength = $( '#tlyPageGuide > li' ).length ;

        // Expect assertions: original steps count plus one additional check.
        expect( originalStepLength + 1 ) ;

        // Hide the second target element using jQuery's hide() method.
        $( '#second_element_to_target' ).hide(  ) ;

        // Open the PageGuide. It should not consider hidden elements as targets.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Assertion 1: Verify that the count of visible step shadows reflects the hidden element.
        equal( $( '.tlypageguide_shadow:visible' ).length, ( originalStepLength - 1 ),
            '# of step shadows reflect missing element' ) ;

        // Assertion 2: Verify that the count of visible step indices also reflects the hidden element.
        equal( $( '.tlyPageGuideStepIndex:visible' ).length, ( originalStepLength - 1 ),
            '# of step indices reflect missing element' ) ;

        // Confirm sequential numbering of indices.
        testSequentialIndices(  ) ;
    } ) ;

    // Test case: Showing a target element after it was hidden and the PageGuide cycled.
    loadInitAndTest( 'show target after hiding and opening' , function (  )
    {
        // Get the initial number of steps.
        var originalStepLength = $( '#tlyPageGuide > li' ).length ;

        // Expect assertions: original steps count plus two additional checks.
        expect( originalStepLength + 2 ) ;

        // Hide the second target element.
        $( '#second_element_to_target' ).hide(  ) ;

        // Open the PageGuide (it will initially ignore the hidden element).
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Close the PageGuide.
        $( '.tlypageguide_close' ).trigger( 'click' ) ;

        // Show the previously hidden element.
        $( '#second_element_to_target' ).show(  ) ;

        // Open the PageGuide again. It should now include the previously hidden element.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Assertion 1: Verify that the count of visible step shadows is back to the original length.
        equal( $( '.tlypageguide_shadow:visible' ).length, originalStepLength,
            'correct number of step shadows' ) ;

        // Assertion 2: Verify that the count of visible step indices is back to the original length.
        equal( $( '.tlyPageGuideStepIndex:visible' ).length, originalStepLength,
            'correct number of step indices' ) ;

        // Confirm sequential numbering.
        testSequentialIndices(  ) ;
    } ) ;

    // Test case: Removing a target element *while* the PageGuide is currently open.
    loadInitAndTest( 'remove target while open' , function (  )
    {
        // Get the initial number of steps.
        var originalStepLength = $( '#tlyPageGuide > li' ).length ;

        // Expect assertions: original steps count plus one additional check.
        expect( originalStepLength + 1 ) ;

        // Open the PageGuide.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Remove the second target element from the DOM.
        $( '#second_element_to_target' ).remove(  ) ;

        // Manually trigger the PageGuide to update its visible steps.
        pg.updateVisible(  ) ;

        // Assertion 1: Verify that the count of visible step shadows has decreased appropriately.
        equal( $( '.tlypageguide_shadow:visible' ).length, ( originalStepLength - 1 ),
            'correct number of step shadows' ) ;

        // Assertion 2: Verify that the count of visible step indices has also decreased.
        equal( $( '.tlyPageGuideStepIndex:visible' ).length, ( originalStepLength - 1 ),
            'correct number of step indices' ) ;

        // Confirm sequential numbering of indices.
        testSequentialIndices(  ) ;
    } ) ;

    // Test case: Hiding current target elements *while* the PageGuide is open.
    loadInitAndTest( 'hide current targets while open' , function (  )
    {
        // Get the initial number of steps.
        var originalStepLength = $( '#tlyPageGuide > li' ).length ;

        // Calculate expected assertions: (original steps + 1 assertion per loop) * number of loops.
        expect( ( originalStepLength + 1 ) * originalStepLength ) ;

        // Iterate over each '.data-block' element, which serves as a target.
        $( '.data-block' ).each( function ( i, el )
        {
            // Open the PageGuide for each iteration.
            $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

            // Show a specific message/step in the PageGuide (corresponds to 'i').
            pg.show_message( i ) ;

            // Hide the current target element.
            $( el ).hide(  ) ;

            // Force the PageGuide to update its visible elements.
            pg.updateVisible(  ) ;

            // Assertions after hiding an element:
            equal( $( '.tlypageguide_shadow:visible' ).length, ( originalStepLength - 1 ),
                'correct number of step shadows' ) ;
            equal( $( '.tlyPageGuideStepIndex:visible' ).length, ( originalStepLength - 1 ),
                'correct number of step indices' ) ;
            testSequentialIndices(  ) ;

            // Show the element again to reset for the next iteration.
            $( el ).show(  ) ;

            // Close the PageGuide to reset for the next iteration.
            $( '.tlypageguide_close' ).trigger( 'click' ) ;
        } ) ;
    } ) ;

    // Test case: Showing current target elements *while* the PageGuide is open.
    loadInitAndTest( 'show current targets while open' , function (  )
    {
        // Get the initial number of steps.
        var originalStepLength = $( '#tlyPageGuide > li' ).length ;

        // Calculate expected assertions: (original steps + 2 assertions per loop) * number of loops.
        expect( ( originalStepLength + 2 ) * originalStepLength ) ;

        // Iterate over each '.data-block' element.
        $( '.data-block' ).each( function ( i, el )
        {
            // Hide the element initially.
            $( el ).hide(  ) ;

            // Open the PageGuide.
            $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

            // Show a specific message/step.
            pg.show_message( i ) ;

            // Show the element that was previously hidden.
            $( el ).show(  ) ;

            // Force the PageGuide to update its visible elements.
            pg.updateVisible(  ) ;

            // Assertions after showing an element:
            equal( $( '.tlypageguide_shadow:visible' ).length, originalStepLength,
                'correct number of step shadows' ) ;
            equal( $( '.tlyPageGuideStepIndex:visible' ).length, originalStepLength,
                'correct number of step indices' ) ;
            testSequentialIndices(  ) ;

            // Close the PageGuide.
            $( '.tlypageguide_close' ).trigger( 'click' ) ;
        } ) ;
    } ) ;

    // Define a new QUnit module for welcome message interactions.
    module( 'DOM: welcome message' ) ;

    // Test case: Clicking the 'Start' button on the welcome message.
    loadInitAndTest( 'welcome start click' , function (  )
    {
        // Expect 9 assertions for this test.
        expect( 9 ) ;

        // Simulate a click on the 'Start' button within the welcome message.
        $( '.tlypageguide_start' ).trigger( 'click' ) ;

        // Use the helper function to verify the PageGuide's open state.
        testOpen(  ) ;

        // Assertion 1: Confirm that a localStorage item indicating the welcome message was shown now exists.
        ok( checkLocalStorageItem(  ), 'localStorage item exists' ) ;

        // Assertion 2: Verify that the welcome message itself is no longer visible.
        ok( $( '.tlyPageGuideWelcome' ).not( ':visible' ), 'welcome hidden' ) ;

        // Assertion 3: Verify that the overlay associated with the welcome message is also hidden.
        ok( $( '.tlyPageGuideOverlay' ).not( ':visible' ), 'overlay hidden' ) ;

        // Clean up localStorage to ensure a fresh state for subsequent tests.
        localStorage.clear(  ) ;
    } , '#examplePlusWelcome' ) ;

    // Test case: Clicking 'Start', then immediately closing and reopening the PageGuide.
    loadInitAndTest( 'welcome start and open' , function (  )
    {
        // Expect 8 assertions.
        expect( 8 ) ;

        // Click 'Start' on the welcome message.
        $( '.tlypageguide_start' ).trigger( 'click' ) ;

        // Close the PageGuide.
        $( '.tlypageguide_close' ).trigger( 'click' ) ;

        // Open the PageGuide again using its main toggle.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Assertion 1: The welcome message should remain hidden.
        ok( $( '.tlyPageGuideWelcome' ).not( ':visible' ), 'welcome hidden' ) ;

        // Assertion 2: The welcome overlay should also remain hidden.
        ok( $( '#tlyPageGuideOverlay' ).not( ':visible' ), 'overlay hidden' ) ;

        // Verify the PageGuide itself is open and in the correct state.
        testOpen(  ) ;

        // Clear localStorage.
        localStorage.clear(  ) ;
    } , '#examplePlusWelcome' ) ;

    // Test case: Clicking the main PageGuide toggle button when the welcome message is active.
    loadInitAndTest( 'welcome toggle click' , function (  )
    {
        // Expect 9 assertions.
        expect( 9 ) ;

        // Simulate a click on the primary PageGuide toggle button.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Verify the PageGuide open state.
        testOpen(  ) ;

        // Check if the localStorage item is set.
        ok( checkLocalStorageItem(  ), 'localStorage item exists' ) ;

        // Assertion 1: The welcome message should be hidden.
        ok( $( '.tlyPageGuideWelcome' ).not( ':visible' ), 'welcome hidden' ) ;

        // Assertion 2: The overlay should be hidden.
        ok( $( '#tlyPageGuideOverlay' ).not( ':visible' ), 'overlay hidden' ) ;

        // Clear localStorage.
        localStorage.clear(  ) ;
    } , '#examplePlusWelcome' ) ;

    // Test case: Clicking the 'Ignore' button on the welcome message.
    loadInitAndTest( 'welcome ignore click' , function (  )
    {
        // Expect 5 assertions.
        expect( 5 ) ;

        // Click the 'Ignore' button.
        $( '.tlypageguide_ignore' ).trigger( 'click' ) ;

        // Assertion 1: The welcome message should become hidden.
        ok( $( '.tlyPageGuideWelcome' ).not( ':visible' ), 'welcome hidden' ) ;

        // Assertion 2: The overlay should become hidden.
        ok( $( '.tlyPageGuideOverlay' ).not( ':visible' ), 'overlay hidden' ) ;

        // Assertion 3: Crucially, no localStorage item should be created yet for 'ignore'.
        equal( checkLocalStorageItem(  ), false, 'no localStorage item yet' ) ;

        // Open the PageGuide again.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Assertion 4: Because it was 'ignored' (not dismissed), the welcome message should reappear.
        ok( $( '.tlyPageGuideWelcome' ).is( ':visible' ), 'welcome shown again' ) ;

        // Assertion 5: The overlay should also reappear.
        ok( $( '#tlyPageGuideOverlay' ).is( ':visible' ), 'overlay shown again' ) ;
    } , '#examplePlusWelcome' ) ;

    // Test case: Clicking the 'Dismiss' button on the welcome message.
    loadInitAndTest( 'welcome dismiss click' , function (  )
    {
        // Expect 11 assertions.
        expect( 11 ) ;

        // Click the 'Dismiss' button.
        $( '.tlypageguide_dismiss' ).trigger( 'click' ) ;

        // Assertion 1: The welcome message should be hidden.
        ok( $( '.tlyPageGuideWelcome' ).not( ':visible' ), 'welcome hidden' ) ;

        // Assertion 2: The overlay should be hidden.
        ok( $( '#tlyPageGuideOverlay' ).not( ':visible' ), 'overlay hidden' ) ;

        // Assertion 3: A localStorage item *should* exist, indicating dismissal.
        ok( checkLocalStorageItem(  ), 'localStorage item exists' ) ;

        // Open the PageGuide again.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Assertion 4: The welcome message should remain hidden after dismissal.
        ok( $( '.tlyPageGuideWelcome' ).not( ':visible' ), 'welcome hidden' ) ;

        // Assertion 5: The overlay should also remain hidden.
        ok( $( '#tlyPageGuideOverlay' ).not( ':visible' ), 'overlay hidden' ) ;

        // Verify the main PageGuide is now open.
        testOpen(  ) ;

        // Clear localStorage.
        localStorage.clear(  ) ;
    } , '#examplePlusWelcome' ) ;

    // Define a new QUnit module for testing scenarios with multiple PageGuides on one page.
    module( 'multiple pageguides' ) ;

    // Test case: Initializing and interacting with two separate PageGuides on a single page.
    loadInitAndTest( '2 pageguides 1 page' , function (  )
    {
        // Expect 8 assertions for this complex test.
        expect( 8 ) ;

        // Initialize a second PageGuide instance, targeting a different steps element.
        var pg2 = tl.pg.init( {
            steps_element: '#titlePageGuide' ,
            ready_callback: function (  )
            {
                // Assertion 1: Verify that two toggle buttons are present in the DOM.
                equal( $( '.tlypageguide_toggle' ).length, 2 ) ;

                // Assertion 2: Verify that only one main PageGuide wrapper exists (shared).
                equal( $( '#tlyPageGuideWrapper' ).length, 1 ) ;

                // --- Test the first PageGuide ---
                // Click the first toggle button to activate the first guide.
                $( '.tlypageguide_toggle:first' ).trigger( 'click' ) ;

                // Assertion 3: Verify the first caption of the first guide is displayed.
                equal( $( '#tlyPageGuide > li:eq(0)' ).text(  ),
                    $( '.tlypageguide_text' ).text(  ), 'first caption for first pg displayed' ) ;

                // Get the number of steps for the first guide.
                var numStepsFirst = $( '#tlyPageGuide > li' ).length ;

                // Assertion 4: Verify all step shadows for the first guide are visible.
                equal( $( '.tlypageguide_shadow:visible' ).length, numStepsFirst, 'all step shadows shown for first pg' ) ;

                // Assertion 5: Verify all step indices for the first guide are visible.
                equal( $( '.tlyPageGuideStepIndex:visible' ).length, numStepsFirst, 'all step indices shown for first pg' ) ;

                // Close the first PageGuide.
                $( '.tlypageguide_toggle:first' ).trigger( 'click' ) ;

                // --- Test the second PageGuide ---
                // Click the second toggle button to activate the second guide.
                $( '.tlypageguide_toggle:eq(1)' ).trigger( 'click' ) ;

                // Assertion 6: Verify the first caption of the second guide is displayed.
                equal( $( '#titlePageGuide > li:eq(0)' ).text(  ),
                    $( '.tlypageguide_text' ).text(  ), 'first caption for second pg displayed' ) ;

                // Get the number of steps for the second guide.
                // NOTE: The original code uses '#tlyPageGuide', which is likely incorrect for the second guide.
                // It should probably be '#titlePageGuide'. Keeping it as-is for Type I clone.
                var numStepsSecond = $( '#tlyPageGuide > li' ).length ;

                // Assertion 7: Verify all step shadows for the second guide are visible.
                equal( $( '.tlypageguide_shadow:visible' ).length, numStepsSecond, 'all step shadows shown for second pg' ) ;

                // Assertion 8: Verify all step indices for the second guide are visible.
                equal( $( '.tlyPageGuideStepIndex:visible' ).length, numStepsSecond, 'all step indices shown for second pg' ) ;

                // Close the second PageGuide.
                $( '.tlypageguide_toggle:eq(1)' ).trigger( 'click' ) ;

                // Signal QUnit to start running the assertions, as 'delayStart' was true.
                start(  ) ;

                // Destroy the PageGuide instances for cleanup.
                tl.pg.destroy(  ) ;
            }
        } ) ;
    } , null, true ) ;

    // --- HELPER FUNCTIONS FOR TESTING ---
    // These functions encapsulate common test setup and assertion patterns to reduce repetition.

    /**
     * Facilitates testing by loading example HTML content into the QUnit fixture
     * and then executing a provided test callback.
     * @param {string} title      - The descriptive title for the QUnit test.
     * @param {function} cb       - The callback function containing the core test logic.
     * @param {boolean} [delayStart] - Optional: If true, `start()` is not called automatically;
     *                                  it must be explicitly called within `cb` or a chained callback.
     * @param {string} [selector] - Optional: A CSS selector to specify a subset of the example
     *                                  page HTML to load. Defaults to '#exampleContent'.
     **/
    function loadAndTest ( title, cb, delayStart, selector )
    {
        // Determine the content selector, falling back to '#exampleContent' if none is provided.
        var sel = selector || '#exampleContent' ;

        // Define an asynchronous QUnit test, allowing for delayed execution.
        asyncTest( title , function (  )
        {
            // Load HTML content from the example page into the QUnit fixture element.
            $( '#qunit-fixture' ).load( '../../example/index.html ' + sel, function (  )
            {
                // Once the content is loaded, execute the main test callback.
                cb(  ) ;

                // If 'delayStart' is not explicitly set to true, automatically complete the test setup.
                if ( ! delayStart )
                {
                    start(  ) ;        // Signal QUnit to proceed with assertions.
                    tl.pg.destroy(  ) ; // Clean up PageGuide after the test.
                }
            } ) ;
        } ) ;
    }

    /**
     * A specialized helper for tests that require the PageGuide to be initialized
     * and its 'ready_callback' to fire before the test logic begins.
     * Useful for integration tests involving user interactions.
     * @param {string} title      - The descriptive title for the QUnit test.
     * @param {function} cb       - The callback function containing the core test logic.
     * @param {string} [selector] - Optional: A CSS selector for the example page content.
     * @param {boolean} [delayStart] - Optional: If true, `start()` is not called automatically
     *                                  after the `ready_callback` fires.
     **/
    function loadInitAndTest ( title, cb, selector, delayStart )
    {
        // Use `loadAndTest` to handle fixture loading, always delaying `start()` initially.
        loadAndTest( title , function (  )
        {
            // Initialize the PageGuide, providing a `ready_callback`.
            pg = tl.pg.init( {
                ready_callback: function (  )
                {
                    // Execute the test's main callback once the PageGuide reports itself as ready.
                    cb(  ) ;

                    // If `delayStart` is not true, automatically complete the test.
                    if ( ! delayStart )
                    {
                        start(  ) ;        // Signal QUnit to proceed.
                        tl.pg.destroy(  ) ; // Clean up.
                    }
                }
            } ) ;
        } , true, selector ) ; // Pass `true` for `delayStart` to `loadAndTest` to ensure `start()` is managed here.
    }

    /**
     * A helper function to consistently test pageguide close interactions.
     * All closing actions should lead to the same observable state.
     * @param {function} closeAction - A function that encapsulates the specific
     *                                  interaction (e.g., clicking a toggle, clicking a close button)
     *                                  that triggers the PageGuide to close.
     **/
    function testClose ( closeAction )
    {
        // This helper expects 3 specific assertions to pass.
        expect( 3 ) ;

        // First, ensure the PageGuide is open so it can be subsequently closed.
        $( '.tlypageguide_toggle' ).trigger( 'click' ) ;

        // Perform the actual close interaction provided by the test.
        closeAction(  ) ;

        // Assertion 1: Verify that the message display area is no longer visible.
        ok( $( '#tlyPageGuideMessages' ).not( ':visible' ), 'message area hidden' ) ;

        // Assertion 2: Verify that all step shadow elements are hidden.
        equal( $( '.tlypageguide_shadow:visible' ).length, 0, 'step shadows hidden' ) ;

        // Assertion 3: Verify that all step index bubbles are hidden.
        equal( $( '.tlyPageGuideStepIndex:visible' ).length, 0, 'step indices hidden' ) ;
    }

    /**
     * A helper function to consistently test pageguide open interactions.
     * All opening actions should lead to the same observable state.
     * NOTE: Due to animation delays, verifying the exact currently displayed index
     * immediately after opening is unreliable and is not included here.
     **/
    function testOpen (  )
    {
        // Assertion 1: Verify that the `<body>` element has the 'tlypageguide-open' class.
        ok( $( 'body' ).hasClass( 'tlypageguide-open' ), 'body class' ) ;

        // Assertion 2: Verify that the main message display area is visible.
        ok( $( '#tlyPageGuideMessages' ).is( ':visible' ), 'message area shown' ) ;

        // Assertion 3: Verify that precisely one element has the 'tlypageguide-active' class,
        // indicating the currently highlighted step.
        equal( $( '.tlypageguide-active' ).length, 1, 'only one active element' ) ;

        // Assertion 4: Verify that the text of the first PageGuide list item
        // matches the text displayed in the PageGuide's caption area.
        equal( $( '#tlyPageGuide > li:eq(0)' ).text(  ),
            $( '.tlypageguide_text' ).text(  ), 'first caption displayed' ) ;

        // Retrieve the total number of steps defined in the PageGuide.
        var numSteps = $( '#tlyPageGuide > li' ).length ;

        // Assertion 5: Verify that all step shadow elements are visible.
        equal( $( '.tlypageguide_shadow:visible' ).length, numSteps, 'all step shadows shown' ) ;

        // Assertion 6: Verify that all step index bubbles are visible.
        equal( $( '.tlyPageGuideStepIndex:visible' ).length, numSteps, 'all step indices shown' ) ;
    }

    /**
     * A helper function to verify that all currently visible step indices (number bubbles)
     * are sequentially numbered, starting from 1.
     **/
    function testSequentialIndices (  )
    {
        // Iterate over each visible step index element.
        $( '.tlyPageGuideStepIndex:visible' ).each( function ( i, el )
        {
            // Assert that the 0-based loop index `i` matches the element's text content
            // (converted to a number and made 0-based) for sequential verification.
            equal( i, ( parseFloat( $( el ).text(  ) ) - 1 ), 'step ' + i + ' has correct number' ) ;
        } ) ;
    }

    /**
     * A helper function to check for the existence of the specific localStorage item
     * that the PageGuide uses to determine if the welcome message has been shown previously.
     * @returns {boolean} `true` if the localStorage item exists and has a value, `false` otherwise.
     **/
    function checkLocalStorageItem (  )
    {
        // Return a boolean indicating whether the relevant localStorage item is present and non-empty.
        return !! localStorage.getItem( 'tlypageguide_welcome_shown_' + tl.pg.hashUrl(  ) ) ;
    }
} ) ;