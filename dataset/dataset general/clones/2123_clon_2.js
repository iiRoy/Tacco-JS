/*
 ***********************************************************************************
 * Automation Script for Presentation Navigation and View Modes
 * This file contains a series of tests verifying keyboard interactions
 * within a web-based presentation application.
 ***********************************************************************************
 */


// ----------------------------------------------------------------------------------------------------
// Test 1: Navigation forward using the Right Arrow key
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Advance slide with Right Arrow input',
  2,
  function processTestSteps(assertionHandler) {
    // Initiate browser navigation to the starting presentation slide.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-one')
      .andThenPerform(function() {
        // Send a 'Right' key press event to the primary document element.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.arrowRight);
      })
      .andThenPerform(function() {
        // Confirm that the element representing slide #2 is now the active one.
        assertionHandler.checkElementPresence('[data-slide="2"].is-current', 'Slide #2 should be the focused slide.');
        // Validate that the browser URL reflects the current slide #2.
        assertionHandler.validateUrlPattern(/\/#2\b/, 'URL should indicate slide #2.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun(); // Mark the test as finished.
      })
      .resetContext(); // Clear the browser state for the next test.
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 2: Navigation forward using the Down Arrow key
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Move to next slide via Down Arrow',
  2,
  function processTestSteps(assertionHandler) {
    // Begin by loading the first slide of the presentation.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-one')
      .andThenPerform(function() {
        // Simulate a 'Down' arrow key press on the main content area.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.arrowDown);
      })
      .andThenPerform(function() {
        // Verify the presence of the active indicator on the second slide.
        assertionHandler.checkElementPresence('[data-slide="2"].is-current', 'Expected slide #2 to be active.');
        // Ensure the URL matches the pattern for slide #2.
        assertionHandler.validateUrlPattern(/\/#2\b/, 'URL fragment must be for slide #2.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 3: Navigation forward using the Tab key
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Advance slide with Tab key',
  2,
  function processTestSteps(assertionHandler) {
    // Start the test at the initial slide.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-one')
      .andThenPerform(function() {
        // Dispatch a standard 'Tab' key input.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.keyboardTab);
      })
      .andThenPerform(function() {
        // Confirm slide #2 is now displayed.
        assertionHandler.checkElementPresence('[data-slide="2"].is-current', 'Slide #2 should be active after Tab.');
        // Check the URL for the correct slide identifier.
        assertionHandler.validateUrlPattern(/\/#2\b/, 'URL should reflect slide #2.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 4: Verify no navigation with Ctrl + Tab
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'No slide change with Ctrl + Tab',
  2,
  function processTestSteps(assertionHandler) {
    // Load the first slide for the test.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-one')
      .andThenPerform(function() {
        // Send a 'Tab' key press combined with the 'Ctrl' modifier.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.keyboardTab, { keyModifiers: 'controlKey' });
      })
      .andThenPerform(function() {
        // Assert that the first slide remains the active one.
        assertionHandler.checkElementPresence('[data-slide="1"].is-current', 'Slide #1 must remain active.');
        // Confirm the URL still points to slide #1.
        assertionHandler.validateUrlPattern(/\/#1\b/, 'URL should still be for slide #1.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 5: Navigation forward using the 'J' key
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Advance slide using "J" key',
  2,
  function processTestSteps(assertionHandler) {
    // Navigate to the initial presentation view.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-one')
      .andThenPerform(function() {
        // Trigger a 'J' key press.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.charJ);
      })
      .andThenPerform(function() {
        // Check if slide #2 is now the current one.
        assertionHandler.checkElementPresence('[data-slide="2"].is-current', 'Slide #2 should be the current view.');
        // Verify the URL correctly shows slide #2.
        assertionHandler.validateUrlPattern(/\/#2\b/, 'URL must reflect slide #2.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 6: Navigation forward using the 'L' key
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Advance slide using "L" key',
  2,
  function processTestSteps(assertionHandler) {
    // Load the first slide to begin the test sequence.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-one')
      .andThenPerform(function() {
        // Send the 'L' key input.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.charL);
      })
      .andThenPerform(function() {
        // Confirm the second slide is active.
        assertionHandler.checkElementPresence('[data-slide="2"].is-current', 'Slide #2 needs to be active.');
        // Ensure the URL matches the expected pattern for slide #2.
        assertionHandler.validateUrlPattern(/\/#2\b/, 'URL should show slide #2.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 7: Navigation forward using the Spacebar
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Advance slide with Spacebar',
  2,
  function processTestSteps(assertionHandler) {
    // Start the presentation at the first slide.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-one')
      .andThenPerform(function() {
        // Simulate pressing the 'Space' key.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.spacebar);
      })
      .andThenPerform(function() {
        // Verify that slide #2 is now the active one.
        assertionHandler.checkElementPresence('[data-slide="2"].is-current', 'Slide #2 should be active after Spacebar.');
        // Check the browser's URL for slide #2.
        assertionHandler.validateUrlPattern(/\/#2\b/, 'URL should reflect slide #2.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 8: Navigation forward using the PageDown key
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Advance slide with PageDown key',
  2,
  function processTestSteps(assertionHandler) {
    // Begin the test by loading the first slide.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-one')
      .andThenPerform(function() {
        // Send a 'PageDown' key input.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.pageDownKey);
      })
      .andThenPerform(function() {
        // Confirm slide #2 is now the active slide.
        assertionHandler.checkElementPresence('[data-slide="2"].is-current', 'Slide #2 must be active.');
        // Validate the URL matches the second slide.
        assertionHandler.validateUrlPattern(/\/#2\b/, 'URL should be for slide #2.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 9: Navigation backward using the Left Arrow key
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Go back to previous slide with Left Arrow',
  2,
  function processTestSteps(assertionHandler) {
    // Start from the second slide to test backward navigation.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-two')
      .andThenPerform(function() {
        // Trigger a 'Left' arrow key press.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.arrowLeft);
      })
      .andThenPerform(function() {
        // Verify that slide #1 is now the current one.
        assertionHandler.checkElementPresence('[data-slide="1"].is-current', 'Slide #1 should be the active one.');
        // Check if the URL reflects slide #1.
        assertionHandler.validateUrlPattern(/\/#1\b/, 'URL should show slide #1.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 10: Navigation backward using the Up Arrow key
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Go back to previous slide with Up Arrow',
  2,
  function processTestSteps(assertionHandler) {
    // Start the test on the second slide.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-two')
      .andThenPerform(function() {
        // Simulate an 'Up' arrow key press.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.arrowUp);
      })
      .andThenPerform(function() {
        // Confirm that slide #1 is now the active slide.
        assertionHandler.checkElementPresence('[data-slide="1"].is-current', 'Slide #1 should be active.');
        // Validate the URL is for slide #1.
        assertionHandler.validateUrlPattern(/\/#1\b/, 'URL must be for slide #1.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 11: Navigation backward using Shift + Tab
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Go back to previous slide with Shift + Tab',
  2,
  function processTestSteps(assertionHandler) {
    // Load the second slide for the test.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-two')
      .andThenPerform(function() {
        // Send a 'Tab' key press with the 'Shift' modifier.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.keyboardTab, { keyModifiers: 'shiftKey' });
      })
      .andThenPerform(function() {
        // Assert that slide #1 is now active.
        assertionHandler.checkElementPresence('[data-slide="1"].is-current', 'Slide #1 should be active after Shift+Tab.');
        // Verify the URL shows slide #1.
        assertionHandler.validateUrlPattern(/\/#1\b/, 'URL should indicate slide #1.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 12: Verify no backward navigation with Ctrl + Shift + Tab
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'No backward movement with Ctrl + Shift + Tab',
  2,
  function processTestSteps(assertionHandler) {
    // Start the test on the second slide.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-two')
      .andThenPerform(function() {
        // Simulate a 'Tab' key press with 'Ctrl' and 'Shift' modifiers.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.keyboardTab, { keyModifiers: 'controlAndShiftKeys' });
      })
      .andThenPerform(function() {
        // Confirm that slide #2 remains the active one.
        assertionHandler.checkElementPresence('[data-slide="2"].is-current', 'Slide #2 should remain active.');
        // Verify the URL still points to slide #2.
        assertionHandler.validateUrlPattern(/\/#2\b/, 'URL should still be for slide #2.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 13: Navigation backward using the 'K' key
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Go back to previous slide with "K" key',
  2,
  function processTestSteps(assertionHandler) {
    // Begin the test from the second slide.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-two')
      .andThenPerform(function() {
        // Send a 'K' key press.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.charK);
      })
      .andThenPerform(function() {
        // Assert that slide #1 is now active.
        assertionHandler.checkElementPresence('[data-slide="1"].is-current', 'Slide #1 should be the active slide.');
        // Check the URL for slide #1.
        assertionHandler.validateUrlPattern(/\/#1\b/, 'URL must reflect slide #1.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 14: Navigation backward using the 'H' key
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Go back to previous slide with "H" key',
  2,
  function processTestSteps(assertionHandler) {
    // Start the test by loading the second slide.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-two')
      .andThenPerform(function() {
        // Simulate pressing the 'H' key.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.charH);
      })
      .andThenPerform(function() {
        // Confirm slide #1 is now displayed.
        assertionHandler.checkElementPresence('[data-slide="1"].is-current', 'Slide #1 should be active.');
        // Validate the URL matches slide #1.
        assertionHandler.validateUrlPattern(/\/#1\b/, 'URL should be for slide #1.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 15: Navigation backward using Shift + Space
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Go back to previous slide with Shift + Space',
  2,
  function processTestSteps(assertionHandler) {
    // Navigate to the second slide for the test.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-two')
      .andThenPerform(function() {
        // Send a 'Space' key press with the 'Shift' modifier.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.spacebar, { keyModifiers: 'shiftKey' });
      })
      .andThenPerform(function() {
        // Verify slide #1 is the active slide.
        assertionHandler.checkElementPresence('[data-slide="1"].is-current', 'Slide #1 should be active after Shift+Space.');
        // Check the URL for slide #1.
        assertionHandler.validateUrlPattern(/\/#1\b/, 'URL should indicate slide #1.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 16: Navigation backward using the PageUp key
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Go back to previous slide with PageUp key',
  2,
  function processTestSteps(assertionHandler) {
    // Start the test at the second slide.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#slide-two')
      .andThenPerform(function() {
        // Trigger a 'PageUp' key press.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.pageUpKey);
      })
      .andThenPerform(function() {
        // Confirm slide #1 is now active.
        assertionHandler.checkElementPresence('[data-slide="1"].is-current', 'Slide #1 must be active.');
        // Validate the URL matches slide #1.
        assertionHandler.validateUrlPattern(/\/#1\b/, 'URL should be for slide #1.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 17: Jump to the first slide using the Home key
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Navigate to first slide with Home key',
  2,
  function processTestSteps(assertionHandler) {
    // Start the browser on a specific slide (e.g., one with a custom ID).
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#custom-start-id')
      .andThenPerform(function() {
        // Send a 'Home' key press input.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.homeKey);
      })
      .andThenPerform(function() {
        // Verify that slide #1 is now the active slide.
        assertionHandler.checkElementPresence('[data-slide="1"].is-current', 'First slide #1 should be the active one.');
        // Check the URL for slide #1.
        assertionHandler.validateUrlPattern(/\/#1\b/, 'URL must indicate slide #1.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 18: Jump to the last slide using the End key
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Navigate to last slide with End key',
  2,
  function processTestSteps(assertionHandler) {
    // Begin the test on a custom-ID slide.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#custom-start-id')
      .andThenPerform(function() {
        // Trigger an 'End' key press.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.endKey);
      })
      .andThenPerform(function() {
        // Confirm that slide #6 is now the active slide.
        assertionHandler.checkElementPresence('[data-slide="6"].is-current', 'Last slide #6 should be active.');
        // Validate the URL shows slide #6.
        assertionHandler.validateUrlPattern(/\/#6\b/, 'URL should be for slide #6.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 19: Entering Fullscreen mode with F5
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Enter Fullscreen mode using F5 key',
  3,
  function processTestSteps(assertionHandler) {
    // Start the browser on a custom-ID slide.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#custom-start-id')
      .andThenPerform(function() {
        // Send an 'F5' key press.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.functionKey5);
      })
      .andThenPerform(function() {
        // Verify the body element has the 'fullscreenMode' class.
        assertionHandler.checkElementPresence('htmlBody.fullscreenMode', 'Body element should be in fullscreen mode.');
        // Assert that the first slide is active.
        assertionHandler.checkElementPresence('[data-slide="1"].is-current', 'First slide #1 should be active in fullscreen.');
        // Check the URL for fullscreen mode and slide #1.
        assertionHandler.validateUrlPattern(/\/\?fullscreen#1\b/, 'URL should reflect fullscreen mode for slide #1.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 20: Entering Fullscreen mode with Shift + F5
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Enter Fullscreen mode from current slide with Shift + F5',
  3,
  function processTestSteps(assertionHandler) {
    // Navigate to a specific slide with a custom ID.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/#custom-start-id')
      .andThenPerform(function() {
        // Send an 'F5' key press with the 'Shift' modifier.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.functionKey5, { keyModifiers: 'shiftKey' });
      })
      .andThenPerform(function() {
        // Confirm the body is in fullscreen mode.
        assertionHandler.checkElementPresence('htmlBody.fullscreenMode', 'Body element must be in fullscreen mode.');
        // Verify the custom-ID slide remains active.
        assertionHandler.checkElementPresence('[data-slide="custom-start-id"].is-current', 'Custom ID slide should be active.');
        // Check the URL for fullscreen mode and the custom ID slide.
        assertionHandler.validateUrlPattern(/\/\?fullscreen#custom-start-id\b/, 'URL should reflect fullscreen for custom ID slide.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 21: Exiting Fullscreen mode with F5
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Exit Fullscreen mode using F5 key',
  3,
  function processTestSteps(assertionHandler) {
    // Start the browser in fullscreen mode at slide #1.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/?fullscreen#1')
      .andThenPerform(function() {
        // Send an 'F5' key press.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.functionKey5);
      })
      .andThenPerform(function() {
        // Verify the body is now in list mode.
        assertionHandler.checkElementPresence('htmlBody.listView', 'Body element should be in list view mode.');
        // Confirm slide #1 is still active.
        assertionHandler.checkElementPresence('[data-slide="1"].is-current', 'Slide #1 should be active.');
        // Check the URL for list mode and slide #1.
        assertionHandler.validateUrlPattern(/\/#1\b/, 'URL must reflect list mode for slide #1.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);


// ----------------------------------------------------------------------------------------------------
// Test 22: Exiting Fullscreen mode with Escape
// ----------------------------------------------------------------------------------------------------
automationEngine.verification.launchScenario(
  'Exit Fullscreen mode using Escape key',
  3,
  function processTestSteps(assertionHandler) {
    // Load the presentation in fullscreen mode at slide #1.
    automationEngine.navigator.navigateToUrl('http://127.0.0.1:8080/presentation-suite/?fullscreen#1')
      .andThenPerform(function() {
        // Simulate an 'Escape' key press.
        this.inputManager.dispatchKeyboardInput('documentRoot', automationEngine.browserContext.inputController.keyIdentifier.escapeKey);
      })
      .andThenPerform(function() {
        // Verify the body is now in list view.
        assertionHandler.checkElementPresence('htmlBody.listView', 'Body element should be in list view.');
        // Confirm slide #1 is still the active slide.
        assertionHandler.checkElementPresence('[data-slide="1"].is-current', 'Slide #1 should be active.');
        // Check the URL for list mode and slide #1.
        assertionHandler.validateUrlPattern(/\/#1\b/, 'URL must reflect list mode for slide #1.');
      })
      .executeAll(function() {
        assertionHandler.completeTestRun();
      })
      .resetContext();
  }
);