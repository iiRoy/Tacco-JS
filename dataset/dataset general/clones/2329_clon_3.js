"use strict";

// This self-executing function encapsulates the QUnit test suite,
// ensuring the DOM is fully loaded before test execution begins.
jQuery(function () {
    // A variable to hold the reference to the currently active application tour instance.
    // This allows test functions to interact with the tour's methods.
    let tourGuideRef = {};

    // --- QUnit Module Definitions ---

    // Establishes a new QUnit module for testing the core functionality of the application tour.
    QUnit.module('app.tour.core');

    // Test scenario: Confirm the primary 'app.tour' namespace is correctly initialized and accessible.
    QUnit.test('Tour namespace is present', function () {
        // Assertion: Verify that the `app.tour` object is truthy, indicating its existence.
        QUnit.ok(app.tour, 'The "app.tour" global object should be successfully defined and accessible.');
    });

    // --- Helper Functions for Test Setup ---

    /**
     * Orchestrates the loading of DOM content, initialization of the tour guide, and execution of a test callback.
     * This ensures a consistent environment for tests requiring an active tour.
     * @param {string} testTitle - The descriptive title for the QUnit test.
     * @param {Function} testCallback - The actual test logic to be executed once the tour is ready.
     * @param {string} [domSelector] - An optional CSS selector to specify which part of the example HTML to load.
     * @param {boolean} [deferQUnitStart=false] - If true, QUnit.start() will not be called automatically,
     *                                            requiring manual invocation within the testCallback.
     */
    const setupTourAndExecuteTest = function (testTitle, testCallback, domSelector, deferQUnitStart = false) {
        // Utilizes `prepareDOMForTest` to handle the initial DOM setup.
        prepareDOMForTest(testTitle, function () {
            // Initializes the tour guide, passing a configuration object.
            tourGuideRef = app.tour.initialize({
                // The `onTourReady` callback is crucial; it ensures the test logic runs only after
                // the tour guide has completed its internal setup and is ready for interaction.
                onTourReady: function () {
                    testCallback(); // Execute the specific test logic.
                    // If `deferQUnitStart` is not explicitly true, automatically finalize the QUnit test.
                    if (!deferQUnitStart) {
                        QUnit.start();
                        app.tour.resetTour(); // Clean up the tour instance to prevent interference with subsequent tests.
                    }
                }
            });
        }, true, domSelector); // Always defer `start()` initially for `onTourReady` to manage it.
    };

    /**
     * Loads specified HTML content into the QUnit fixture element before running a test callback.
     * This function is suitable for tests that primarily interact with the DOM or don't require
     * immediate tour initialization.
     * @param {string} testName - The name of the test to be displayed in the QUnit report.
     * @param {Function} callbackFunc - The function containing the test assertions and logic.
     * @param {boolean} [shouldDeferStart=false] - If true, QUnit.start() must be called manually inside callbackFunc.
     * @param {string} [targetElementSelector] - A CSS selector to target specific content within the example HTML.
     */
    const prepareDOMForTest = function (testName, callbackFunc, shouldDeferStart = false, targetElementSelector) {
        // Defaults to loading the entire example content if no specific selector is provided.
        const contentToLoad = targetElementSelector || '#exampleContent';
        QUnit.asyncTest(testName, function () {
            // Uses jQuery's `.load()` method to fetch and insert HTML.
            jQuery('#qunit-fixture').load('../../example/index.html ' + contentToLoad, function (response, status, xhr) {
                // Incorporating a basic error check for the fixture loading process.
                if (status === "error") {
                    console.error("Fixture content loading failed: " + xhr.status + " " + xhr.statusText);
                    QUnit.ok(false, "Failed to load test fixture content. Aborting test.");
                    QUnit.start(); // Ensure QUnit continues even on fixture load error.
                    return;
                }
                callbackFunc(); // Execute the provided test logic.
                // If `shouldDeferStart` is false, automatically signal QUnit to proceed.
                if (!shouldDeferStart) {
                    QUnit.start();
                    // Perform a general tour reset as a cleanup measure.
                    app.tour.resetTour();
                }
            });
        });
    };

    // --- Application Tour Core Functionality Tests ---

    // Test case: Verifying the tour's reset/destruction mechanism.
    setupTourAndExecuteTest('Tour reset operation', function () {
        QUnit.expect(5); // Explicitly state the number of expected assertions.

        app.tour.resetTour(); // Invoke the tour reset method.

        // Assertions to confirm all tour-related DOM elements are removed or states are reverted.
        QUnit.equal(jQuery('#appTourContainer').length, 0, 'Main tour container element should be completely removed from the DOM.');
        QUnit.equal(jQuery('#appTourDimmer').length, 0, 'The tour overlay element should no longer be present.');
        QUnit.equal(jQuery('body').hasClass('app-tour-active'), false, 'The body tag should not possess the "app-tour-active" class.');
        QUnit.equal(jQuery('body').hasClass('app-tour-welcome-visible'), false, 'The body class indicating welcome visibility should be absent.');
        QUnit.equal(jQuery('.tour-step-highlight').length, 0, 'No tour step highlight elements should remain in the document.');
    });

    // Test case: Validating the `isElementVisibleInViewport` utility function.
    prepareDOMForTest('Element visibility check', function () {
        QUnit.expect(2); // Two assertions for this test.

        // Note: Using QUnit's own header for a reliable "in view" test, as fixture elements can have unpredictable offsets.
        QUnit.ok(app.tour.isElementVisibleInViewport('#qunit-header', 0), 'The QUnit header, positioned at the top, should be deemed visible.');
        QUnit.equal(app.tour.isElementVisibleInViewport('.tour-target-item:last'), false, 'The last tour target item should initially be scrolled out of the viewport.');
    });

    // --- DOM Element Presence Verification Module ---

    QUnit.module('DOM: Element Presence Verification');

    // Test case: Ensuring the test fixture content loads correctly.
    prepareDOMForTest('Fixture content loaded successfully', function () {
        QUnit.expect(1);
        QUnit.ok(jQuery('#exampleContent').length, 'The example content fixture must be successfully loaded into the DOM.');
    });

    // Test case: Verifying the existence of essential tour components after initialization.
    setupTourAndExecuteTest('Default tour components exist', function () {
        QUnit.expect(2);
        QUnit.ok(jQuery('#appTourContainer').length, 'The main tour container element should be present.');
        QUnit.ok(jQuery('.tour-control-button').length, 'The tour activation toggle button should be present.');
    });

    // Test case: Confirming the welcome message's presence and initial state.
    setupTourAndExecuteTest('Welcome message display', function () {
        QUnit.expect(3);

        QUnit.ok(jQuery('#appTourContainer .tour-welcome-dialog').length, 'The welcome dialog should be correctly nested within the tour container.');
        QUnit.equal(jQuery('#appTourDimmer').length, 1, 'Precisely one tour overlay element should exist.');
        QUnit.ok(jQuery('body').hasClass('app-tour-welcome-visible'), 'The body tag should have the class indicating the welcome message is visible.');
    }, '#examplePlusWelcome'); // Loads specific fixture content that includes a welcome message.

    // --- Basic User Interaction Tests Module ---

    QUnit.module('DOM: Basic User Interaction Tests');

    /**
     * Helper function to encapsulate common assertions for when the tour is expected to be open.
     * This reduces redundancy and improves test maintainability.
     */
    const verifyTourOpenState = function () {
        QUnit.ok(jQuery('body').hasClass('app-tour-active'), 'Body should have the "app-tour-active" class when the tour is open.');
        QUnit.ok(jQuery('#tourMessageArea').is(':visible'), 'The tour message display area must be visible.');
        QUnit.equal(jQuery('.tour-current-step').length, 1, 'Exactly one step element should be marked as the current/active step.');
        QUnit.equal(jQuery('#tourStepsList > li:eq(0)').text().trim(),
            jQuery('.tour-step-description').text().trim(), 'The first step\'s descriptive caption should match the text currently displayed.');

        const totalSteps = jQuery('#tourStepsList > li').length;
        QUnit.equal(jQuery('.tour-step-highlight:visible').length, totalSteps, 'All tour step highlight elements should be visible.');
        QUnit.equal(jQuery('.tour-step-indicator:visible').length, totalSteps, 'All tour step indicator bubbles should be visible.');
    };

    /**
     * Helper function to encapsulate common assertions for when the tour is expected to be closed.
     * @param {Function} closeActionFunc - A function that simulates the user action to close the tour.
     */
    const verifyTourClosedState = function (closeActionFunc) {
        QUnit.expect(3);
        jQuery('.tour-control-button').trigger('click'); // First, open the tour to ensure a state from which to close.
        closeActionFunc(); // Execute the specific closing action provided by the test.
        QUnit.ok(jQuery('#tourMessageArea').is(':hidden'), 'The tour message area should be completely hidden.');
        QUnit.equal(jQuery('.tour-step-highlight:visible').length, 0, 'No step highlight elements should be visible after closing.');
        QUnit.equal(jQuery('.tour-step-indicator:visible').length, 0, 'No step indicator bubbles should be visible after closing.');
    };

    // Test case: Activating the tour via its main toggle button.
    setupTourAndExecuteTest('Tour activation', function () {
        QUnit.expect(6);
        jQuery('.tour-control-button').trigger('click'); // Simulate a click event on the tour toggle.
        verifyTourOpenState(); // Verify the tour's state after opening.
    });

    // Test case: Closing the tour by clicking the main toggle button again.
    setupTourAndExecuteTest('Closure from main toggle', function () {
        verifyTourClosedState(function () {
            jQuery('.tour-control-button').trigger('click'); // Simulate another click on the toggle.
        });
    });

    // Test case: Closing the tour using a dedicated close button.
    setupTourAndExecuteTest('Closure from dedicated close button', function () {
        verifyTourClosedState(function () {
            jQuery('.tour-dismiss-button').trigger('click'); // Simulate clicking the tour's explicit close button.
        });
    });

    // Test case: Navigating through tour steps sequentially using the "Next" arrow.
    setupTourAndExecuteTest('Next step navigation with arrow', function () {
        const stepCount = jQuery('#tourStepsList > li').length;
        QUnit.expect(stepCount); // Expect one assertion for each step navigated.

        jQuery('.tour-control-button').trigger('click'); // Open the tour to begin navigation.
        for (let k = 1; k <= stepCount; k++) {
            // Calculate the 0-based index for comparison, handling cyclic navigation if applicable.
            const currentStepIdx = (k - 1) % stepCount;
            jQuery('.tour-next-step').trigger('click'); // Simulate clicking the forward navigation button.
            QUnit.equal(jQuery('#tourStepsList > li').eq(currentStepIdx).text().trim(),
                jQuery('.tour-step-description').text().trim(), `Caption for step ${currentStepIdx} should be accurately displayed.`);
        }
    });

    // Test case: Navigating backward through tour steps using the "Previous" arrow.
    setupTourAndExecuteTest('Previous step navigation with arrow', function () {
        const stepCount = jQuery('#tourStepsList > li').length;
        QUnit.expect(stepCount);

        jQuery('.tour-control-button').trigger('click'); // Open the tour.
        // First, advance to the last step to ensure we have steps to navigate backward from.
        for (let i = 0; i < stepCount - 1; i++) {
            jQuery('.tour-next-step').trigger('click');
        }

        for (let j = stepCount - 1; j >= 0; j--) {
            jQuery('.tour-prev-step').trigger('click'); // Simulate clicking the backward navigation button.
            QUnit.equal(jQuery('#tourStepsList > li').eq(j).text().trim(),
                jQuery('.tour-step-description').text().trim(), `Caption for step ${j} should be accurately displayed.`);
        }
    });

    // Test case: Directly navigating to specific steps by clicking their indicator bubbles.
    setupTourAndExecuteTest('Direct step navigation via indicators', function () {
        const stepCount = jQuery('#tourStepsList > li').length;
        QUnit.expect(stepCount);

        jQuery('.tour-control-button').trigger('click'); // Open the tour.
        jQuery('.tour-step-indicator').each(function (idx, element) {
            jQuery(element).trigger('click'); // Simulate clicking each step indicator.
            QUnit.equal(jQuery('#tourStepsList > li').eq(idx).text().trim(),
                jQuery('.tour-step-description').text().trim(), `Caption for step ${idx} should be accurately displayed.`);
        });
    });

    // --- Dynamic Target Modifications Module ---

    QUnit.module('DOM: Dynamic Target Modifications');

    /**
     * Helper function to verify that visible tour step indicators are sequentially numbered (1-based).
     * This ensures the tour dynamically re-indexes steps when targets are added/removed.
     */
    const validateSequentialStepNumbers = function () {
        let expectedNumber = 1; // Tour indicators typically start counting from 1.
        jQuery('.tour-step-indicator:visible').each(function (idx, elem) {
            const displayedNumber = parseFloat(jQuery(elem).text());
            QUnit.strictEqual(displayedNumber, expectedNumber, `Step indicator at index ${idx} should correctly display number ${expectedNumber}.`);
            expectedNumber++;
        });
    };

    // Test case: Removing a target element from the DOM before the tour is initiated.
    setupTourAndExecuteTest('Target removal before tour launch', function () {
        const initialStepCount = jQuery('#tourStepsList > li').length;
        QUnit.expect(initialStepCount + 2); // Additional assertions for shadow and indicator counts.

        jQuery('#second_element_to_target').remove(); // Permanently remove a target element.
        jQuery('.tour-control-button').trigger('click'); // Open the tour.

        QUnit.equal(jQuery('.tour-step-highlight:visible').length, (initialStepCount - 1),
            'The number of visible step highlights should decrease by one due to the removed element.');
        QUnit.equal(jQuery('.tour-step-indicator:visible').length, (initialStepCount - 1),
            'The number of visible step indicators should also decrease by one.');
        validateSequentialStepNumbers(); // Verify sequential numbering after removal.
    });

    // Test case: Re-adding a previously removed target element after a tour open/close cycle.
    setupTourAndExecuteTest('Target re-addition after initial removal', function () {
        const initialStepCount = jQuery('#tourStepsList > li').length;
        QUnit.expect(initialStepCount + 2);

        const backupElementHtml = jQuery('#second_element_to_target').html();
        jQuery('#second_element_to_target').remove(); // Remove the element initially.
        jQuery('.tour-control-button').trigger('click'); // Open tour (it will detect fewer steps).

        jQuery('.tour-dismiss-button').trigger('click'); // Close the tour.
        // Re-append the element to its original parent, ensuring it's a valid tour target.
        jQuery('#exampleContent > .wrapper').append(
            `<div id="second_element_to_target" class="tour-target-item">${backupElementHtml}</div>`
        );

        jQuery('.tour-control-button').trigger('click'); // Re-open the tour.
        QUnit.equal(jQuery('.tour-step-highlight:visible').length, initialStepCount,
            'All step highlights should be visible again after the target element is re-added.');
        QUnit.equal(jQuery('.tour-step-indicator:visible').length, initialStepCount,
            'All step indicators should be visible again after the target element is re-added.');
        validateSequentialStepNumbers();
    });

    // Test case: Hiding a target element (making it invisible) before the tour is launched.
    setupTourAndExecuteTest('Target concealment before tour launch', function () {
        const initialStepCount = jQuery('#tourStepsList > li').length;
        QUnit.expect(initialStepCount + 2);

        jQuery('#second_element_to_target').hide(); // Hide the target element.
        jQuery('.tour-control-button').trigger('click'); // Open the tour.
        QUnit.equal(jQuery('.tour-step-highlight:visible').length, (initialStepCount - 1),
            'The number of visible step highlights should reflect the hidden element.');
        QUnit.equal(jQuery('.tour-step-indicator:visible').length, (initialStepCount - 1),
            'The number of visible step indicators should reflect the hidden element.');
        validateSequentialStepNumbers();
    });

    // Test case: Revealing a previously hidden target element after a tour open/close cycle.
    setupTourAndExecuteTest('Target reappearance after initial concealment', function () {
        const initialStepCount = jQuery('#tourStepsList > li').length;
        QUnit.expect(initialStepCount + 2);

        jQuery('#second_element_to_target').hide(); // Hide the element.
        jQuery('.tour-control-button').trigger('click'); // Open the tour (with one hidden).

        jQuery('.tour-dismiss-button').trigger('click'); // Close the tour.
        jQuery('#second_element_to_target').show(); // Show the element again.
        jQuery('.tour-control-button').trigger('click'); // Re-open the tour.
        QUnit.equal(jQuery('.tour-step-highlight:visible').length, initialStepCount,
            'All step highlights should be visible after showing the target again.');
        QUnit.equal(jQuery('.tour-step-indicator:visible').length, initialStepCount,
            'All step indicators should be visible after showing the target again.');
        validateSequentialStepNumbers();
    });

    // Test case: Removing a target element dynamically while the tour is already active and open.
    setupTourAndExecuteTest('Target removal during active tour', function () {
        const initialStepCount = jQuery('#tourStepsList > li').length;
        QUnit.expect(initialStepCount + 2);

        jQuery('.tour-control-button').trigger('click'); // Open the tour.
        jQuery('#second_element_to_target').remove(); // Remove the element.
        tourGuideRef.refreshActiveSteps(); // Manually trigger the tour to update its visible steps.

        QUnit.equal(jQuery('.tour-step-highlight:visible').length, (initialStepCount - 1),
            'The number of visible step highlights should update dynamically after removal.');
        QUnit.equal(jQuery('.tour-step-indicator:visible').length, (initialStepCount - 1),
            'The number of visible step indicators should update dynamically after removal.');
        validateSequentialStepNumbers();
    });

    // Test case: Hiding target elements one by one while the tour is active and iterating through steps.
    setupTourAndExecuteTest('Concealing targets during active tour', function () {
        const initialStepCount = jQuery('#tourStepsList > li').length;
        // The expected number of assertions is complex due to the nested loop and multiple checks per iteration.
        QUnit.expect((initialStepCount + 2) * initialStepCount);

        jQuery('.tour-target-item').each(function (idx, targetElement) {
            jQuery('.tour-control-button').trigger('click'); // Open tour for each iteration.
            tourGuideRef.displayStepMessage(idx); // Navigate to a specific step.
            jQuery(targetElement).hide(); // Hide the current target element.
            tourGuideRef.refreshActiveSteps(); // Instruct the tour to re-evaluate visible steps.

            QUnit.equal(jQuery('.tour-step-highlight:visible').length, (initialStepCount - 1),
                'Highlights count should decrease after hiding a target element.');
            QUnit.equal(jQuery('.tour-step-indicator:visible').length, (initialStepCount - 1),
                'Indicators count should decrease after hiding a target element.');
            validateSequentialStepNumbers();
            jQuery(targetElement).show(); // Re-show the element for the next iteration's setup.
            jQuery('.tour-dismiss-button').trigger('click'); // Close tour for cleanup.
        });
    });

    // Test case: Revealing target elements one by one while the tour is active.
    setupTourAndExecuteTest('Revealing targets during active tour', function () {
        const initialStepCount = jQuery('#tourStepsList > li').length;
        // Expected assertions: (initial steps + 2 checks) * number of steps.
        QUnit.expect((initialStepCount + 2) * initialStepCount);

        jQuery('.tour-target-item').each(function (idx, targetElement) {
            jQuery(targetElement).hide(); // Initially hide one element for this iteration.
            jQuery('.tour-control-button').trigger('click'); // Open tour (it will start with one hidden).
            tourGuideRef.displayStepMessage(idx); // Navigate to the step.
            jQuery(targetElement).show(); // Reveal the previously hidden element.
            tourGuideRef.refreshActiveSteps(); // Force the tour to update its step visibility.

            QUnit.equal(jQuery('.tour-step-highlight:visible').length, initialStepCount,
                'Highlights count should return to full after revealing a target.');
            QUnit.equal(jQuery('.tour-step-indicator:visible').length, initialStepCount,
                'Indicators count should return to full after revealing a target.');
            validateSequentialStepNumbers();
            jQuery('.tour-dismiss-button').trigger('click'); // Close tour for the next iteration.
        });
    });

    // --- Welcome Message Interactions Module ---

    QUnit.module('DOM: Welcome Message Interactions');

    /**
     * Helper to check for the presence of the local storage item that indicates
     * the welcome message has been acknowledged or dismissed.
     * @returns {boolean} True if the item exists, false otherwise.
     */
    const hasTourWelcomeBeenAcknowledged = function () {
        // Guard clause: Ensure localStorage is available to prevent errors in certain environments.
        if (typeof localStorage === 'undefined' || localStorage === null) {
            console.warn("localStorage is not available in the current test environment.");
            return false;
        }
        // Construct the storage key using a unique identifier from the tour instance.
        const storageKey = 'appTour_welcome_seen_' + app.tour.generateUniqueTourId();
        return !!localStorage.getItem(storageKey);
    };

    // Test case: Clicking the "Start Tour" button within the welcome message.
    setupTourAndExecuteTest('Welcome "Start" button click', function () {
        QUnit.expect(9);

        jQuery('.tour-start-button').trigger('click'); // Simulate click on the "Start Tour" button.
        verifyTourOpenState(); // Verify that the tour transitions to an open state.
        QUnit.ok(hasTourWelcomeBeenAcknowledged(), 'LocalStorage item should be present after starting the tour from welcome.');
        QUnit.ok(jQuery('.tour-welcome-dialog').is(':hidden'), 'The welcome dialog should become hidden.');
        QUnit.ok(jQuery('.appTourDimmer').is(':hidden'), 'The tour overlay should also become hidden after starting the tour.');
        // Cleanup: Clear localStorage to ensure tests are isolated.
        if (typeof localStorage !== 'undefined') localStorage.clear();
    }, '#examplePlusWelcome'); // Use fixture with welcome message.

    // Test case: Starting the tour from welcome, then closing and re-opening it.
    setupTourAndExecuteTest('Welcome start then re-open', function () {
        QUnit.expect(8);

        jQuery('.tour-start-button').trigger('click'); // Start the tour.
        jQuery('.tour-dismiss-button').trigger('click'); // Close it immediately.
        jQuery('.tour-control-button').trigger('click'); // Re-open the tour via the toggle.
        QUnit.ok(jQuery('.tour-welcome-dialog').is(':hidden'), 'The welcome dialog should remain hidden on subsequent re-open.');
        QUnit.ok(jQuery('#appTourDimmer').is(':hidden'), 'The overlay should remain hidden on subsequent re-open.');
        verifyTourOpenState(); // Verify the tour opens correctly.
        if (typeof localStorage !== 'undefined') localStorage.clear();
    }, '#examplePlusWelcome');

    // Test case: Clicking the main tour toggle button when the welcome message is active.
    setupTourAndExecuteTest('Welcome toggle click behavior', function () {
        QUnit.expect(9);

        jQuery('.tour-control-button').trigger('click'); // Click the main toggle button.
        verifyTourOpenState(); // The tour should open directly.
        QUnit.ok(hasTourWelcomeBeenAcknowledged(), 'LocalStorage item should be set when opening from welcome via toggle.');
        QUnit.ok(jQuery('.tour-welcome-dialog').is(':hidden'), 'Welcome dialog should be hidden after toggle click.');
        QUnit.ok(jQuery('#appTourDimmer').is(':hidden'), 'Overlay should be hidden after toggle click.');
        if (typeof localStorage !== 'undefined') localStorage.clear();
    }, '#examplePlusWelcome');

    // Test case: Clicking the "Ignore" button on the welcome message.
    setupTourAndExecuteTest('Welcome "Ignore" button click', function () {
        QUnit.expect(5);

        jQuery('.tour-ignore-button').trigger('click'); // Click the ignore button.
        QUnit.ok(jQuery('.tour-welcome-dialog').is(':hidden'), 'Welcome dialog should be hidden after ignoring.');
        QUnit.ok(jQuery('#appTourDimmer').is(':hidden'), 'Overlay should be hidden after ignoring.');
        QUnit.equal(hasTourWelcomeBeenAcknowledged(), false, 'No localStorage item should be set yet after ignoring.');
        jQuery('.tour-control-button').trigger('click'); // Try to re-open the tour.
        QUnit.ok(jQuery('.tour-welcome-dialog').is(':visible'), 'Welcome dialog should reappear when re-opening after ignoring.');
        QUnit.ok(jQuery('#appTourDimmer').is(':visible'), 'Overlay should reappear along with the welcome dialog.');
    }, '#examplePlusWelcome');

    // Test case: Clicking the "Dismiss Permanently" button on the welcome message.
    setupTourAndExecuteTest('Welcome "Dismiss" button click', function () {
        QUnit.expect(11);

        jQuery('.tour-dismiss-permanent').trigger('click'); // Click the dismiss button.
        QUnit.ok(jQuery('.tour-welcome-dialog').is(':hidden'), 'Welcome dialog should be hidden after permanent dismissal.');
        QUnit.ok(jQuery('#appTourDimmer').is(':hidden'), 'Overlay should be hidden after permanent dismissal.');
        QUnit.ok(hasTourWelcomeBeenAcknowledged(), 'LocalStorage item should exist after permanent dismissal.');
        jQuery('.tour-control-button').trigger('click'); // Attempt to re-open the tour.
        QUnit.ok(jQuery('.tour-welcome-dialog').is(':hidden'), 'Welcome dialog should remain hidden even after subsequent re-open attempts.');
        QUnit.ok(jQuery('#appTourDimmer').is(':hidden'), 'Overlay should remain hidden even after subsequent re-open attempts.');
        verifyTourOpenState(); // The tour should open directly, bypassing the welcome.
        if (typeof localStorage !== 'undefined') localStorage.clear();
    }, '#examplePlusWelcome');

    // --- Multiple Tour Guides Scenarios Module ---

    QUnit.module('Multiple Tour Guides Scenarios');

    // Test case: Verifying behavior when two distinct tour guides are present on a single page.
    // This test defers QUnit's start() to allow for complex async setup and multiple tour interactions.
    prepareDOMForTest('Multiple tour guides on one page', function () {
        QUnit.expect(8);

        // Initialize a second, distinct tour guide instance, targeting different steps.
        const secondaryTourGuide = app.tour.initialize({
            stepListElement: '#titlePageGuide', // Specify a different DOM element for its steps.
            onTourReady: function () {
                // Assertions for the presence of elements related to two tour instances.
                QUnit.equal(jQuery('.tour-control-button').length, 2, 'There should be two tour toggle buttons for two tour instances.');
                // Note: The main container might be shared or a singleton depending on implementation.
                QUnit.equal(jQuery('#appTourContainer').length, 1, 'Only one main tour container should exist, even with multiple guides.');

                // --- Test the interaction with the first (primary) tour guide ---
                jQuery('.tour-control-button:first').trigger('click'); // Activate the primary tour.
                QUnit.equal(jQuery('#tourStepsList > li:eq(0)').text().trim(),
                    jQuery('.tour-step-description').text().trim(), 'The first caption for the primary tour is correctly displayed.');
                const primaryTourSteps = jQuery('#tourStepsList > li').length;
                QUnit.equal(jQuery('.tour-step-highlight:visible').length, primaryTourSteps, 'All step highlights are shown for the primary tour.');
                QUnit.equal(jQuery('.tour-step-indicator:visible').length, primaryTourSteps, 'All step indicators are shown for the primary tour.');
                jQuery('.tour-control-button:first').trigger('click'); // Close the primary tour.

                // --- Test the interaction with the second tour guide ---
                jQuery('.tour-control-button:eq(1)').trigger('click'); // Activate the secondary tour.
                QUnit.equal(jQuery('#titlePageGuide > li:eq(0)').text().trim(),
                    jQuery('.tour-step-description').text().trim(), 'The first caption for the secondary tour is correctly displayed.');
                const secondaryTourSteps = jQuery('#titlePageGuide > li').length; // Get the step count specific to the second guide.
                QUnit.equal(jQuery('.tour-step-highlight:visible').length, secondaryTourSteps, 'All step highlights are shown for the secondary tour.');
                QUnit.equal(jQuery('.tour-step-indicator:visible').length, secondaryTourSteps, 'All step indicators are shown for the secondary tour.');
                jQuery('.tour-control-button:eq(1)').trigger('click'); // Close the secondary tour.

                QUnit.start(); // Manually signal QUnit to complete this async test.
                app.tour.resetTour(); // Clean up the primary tour instance.
                secondaryTourGuide.resetTour(); // Ensure the secondary tour instance is also reset.
            }
        });
    }, null, true); // Defer start for this complex async test.

    // --- Dummy `app.tour` Object for Test Execution ---
    // This block provides a minimal, dummy `app.tour` object if the actual tour guide library
    // is not loaded. This prevents `ReferenceError`s during testing. In a real application,
    // `app.tour` would be populated by the tour guide's JavaScript file.
    if (typeof app === 'undefined') {
        var app = {};
    }
    if (typeof app.tour === 'undefined') {
        app.tour = {
            initialize: function (options) {
                console.warn("Dummy app.tour.initialize called. The actual tour guide library might not be loaded.");
                // Simulate an asynchronous ready callback.
                if (options && typeof options.onTourReady === 'function') {
                    setTimeout(options.onTourReady, 50);
                }
                // Return a dummy tour instance with placeholder methods.
                return {
                    resetTour: function () { console.log("Dummy tour instance reset."); },
                    isElementVisibleInViewport: function (selector, offset = 0) {
                        const $el = jQuery(selector);
                        if (!$el.length) return false;
                        const viewportTop = jQuery(window).scrollTop();
                        const viewportBottom = viewportTop + jQuery(window).height();
                        const elTop = $el.offset().top;
                        const elBottom = elTop + $el.outerHeight();
                        // Basic check: element is within viewport bounds.
                        return (elBottom > viewportTop && elTop < viewportBottom + offset);
                    },
                    refreshActiveSteps: function () { console.log("Dummy tour refreshActiveSteps called."); },
                    displayStepMessage: function (idx) { console.log("Dummy displayStepMessage for index:", idx); },
                    generateUniqueTourId: function () { return "dummy_tour_id_instance"; }
                };
            },
            resetTour: function () { console.log("Dummy app.tour.resetTour called (global)."); },
            // Provide a global dummy for methods that might be called directly on `app.tour`.
            isElementVisibleInViewport: function () { return true; }, // Default to true for global dummy.
            generateUniqueTourId: function () { return "dummy_tour_id_global"; }
        };
    }
});