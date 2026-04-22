// A sophisticated framework for automated web interface testing and presentation navigation validation.

// --- Core Web Automation Driver Simulation ---
const webAutomator = {
    // Mimics casper.test.begin
    defineScenario: function(description, expectedAssertions, routine) {
        console.log(`\n--- Initiating Test Scenario: "${description}" (Anticipated Assertions: ${expectedAssertions}) ---`);
        // Internal test runner instance, simulating CasperJS's test object.
        const specRunner = {
            _actualAssertions: 0,
            _requiredAssertions: expectedAssertions,
            // Custom logging for test progress.
            comment: function(message) { console.log(`[SCENARIO LOG]: ${message}`); },
            // Simulates test.assertExists
            checkElementPresence: function(selector, validationMessage) {
                this._actualAssertions++;
                console.log(`[ASSERTION PASSED]: Element "${selector}" exists. Validation: ${validationMessage}`);
                // In a live environment, this would involve actual DOM querying.
            },
            // Simulates test.assertUrlMatch
            validateUrlPattern: function(pattern, validationMessage) {
                this._actualAssertions++;
                console.log(`[ASSERTION PASSED]: URL matches pattern "${pattern}". Validation: ${validationMessage}`);
                // In a live environment, this would involve actual URL comparison.
            },
            // Simulates test.done
            finish: function() {
                if (this._actualAssertions !== this._requiredAssertions) {
                    console.warn(`[WARNING]: Assertion count discrepancy! Expected ${this._requiredAssertions} assertions, but only ${this._actualAssertions} were executed.`);
                }
                console.log(`Scenario "${description}" concluded. Total assertions: ${this._actualAssertions}/${this._requiredAssertions}`);
            }
        };
        routine(specRunner); // Execute the provided test routine.
    },

    // Mimics casper.start
    navigate: function(targetUrl) {
        console.log(`[DRIVER ACTION]: Navigating to URL: ${targetUrl}`);
        this._currentSimulatedUrl = targetUrl; // Internal state for URL simulation.
        return this; // Enables method chaining.
    },

    // Mimics casper.then
    chainStep: function(actionCallback) {
        console.log('[DRIVER STEP]: Advancing to next action in sequence...');
        // Execute the callback, binding 'this' to the webAutomator instance for context.
        actionCallback.call(this);
        return this; // Enables method chaining.
    },

    // Mimics casper.sendKeys
    simulateKeyPress: function(targetSelector, keyCodeValue, modifierOptions) {
        const modifierText = modifierOptions ? ` with modifiers: ${JSON.stringify(modifierOptions.modifiers)}` : '';
        console.log(`[DRIVER ACTION]: Dispatching key event (Code: ${keyCodeValue})${modifierText} to element: ${targetSelector}`);
        // In a live setting, this would trigger a browser keyboard event.
    },

    // Mimics casper.run (simplified)
    executeSequence: function(completionCallback) {
        console('[DRIVER FLOW]: All programmed steps have been processed.');
        completionCallback(); // Invoke the final callback.
        // The original .clear() is omitted here as a Type III structural change,
        // assuming cleanup is implicit or handled by the framework's lifecycle.
    },

    // Mimics casper.page.event.key
    inputHandler: {
        keys: {
            Right: 39, Down: 40, Tab: 9,
            Left: 37, Up: 38, J: 74,
            L: 76, K: 75, H: 72,
            Space: 32, PageDown: 34, PageUp: 33,
            Home: 36, End: 35, F5: 116, Escape: 27
        }
    },

    // Added utility: retrieve the currently simulated URL.
    getCurrentUrl: function() {
        return this._currentSimulatedUrl;
    },

    // Added utility: simulate a waiting period for page rendering or asynchronous operations.
    waitForRender: function(delayMilliseconds = 500) {
        console.log(`[DRIVER ACTION]: Pausing for ${delayMilliseconds}ms to simulate rendering or async operations.`);
        // In a real CasperJS test, this would be an asynchronous wait operation.
        // For this clone, it's a synchronous log for demonstration.
        return this;
    }
};

// --- Global Test Environment Parameters ---
const PRESENTATION_BASE_URL = 'http://127.0.0.1:8080/presentation/';
const TARGET_BODY_ELEMENT = 'body'; // The common target for key events.
const START_SLIDE_ONE_HASH = '#1';
const START_SLIDE_TWO_HASH = '#2';
const ARBITRARY_SLIDE_ID_HASH = '#MyID'; // An example slide ID for specific tests.
const LAST_SLIDE_ID_NUMBER = '6'; // The ID of the expected last slide.

// --- Abstracted Keyboard Action Codes ---
// Renamed and grouped for clarity, mapping to webAutomator's internal key codes.
const KEY_ACTION_MAPPING = {
    NAV_RIGHT_ARROW: webAutomator.inputHandler.keys.Right,
    NAV_DOWN_ARROW: webAutomator.inputHandler.keys.Down,
    NAV_TAB_KEY: webAutomator.inputHandler.keys.Tab,
    NAV_LEFT_ARROW: webAutomator.inputHandler.keys.Left,
    NAV_UP_ARROW: webAutomator.inputHandler.keys.Up,
    NAV_J_KEY: webAutomator.inputHandler.keys.J,
    NAV_L_KEY: webAutomator.inputHandler.keys.L,
    NAV_K_KEY: webAutomator.inputHandler.keys.K,
    NAV_H_KEY: webAutomator.inputHandler.keys.H,
    NAV_SPACEBAR: webAutomator.inputHandler.keys.Space,
    NAV_PAGE_DOWN: webAutomator.inputHandler.keys.PageDown,
    NAV_PAGE_UP: webAutomator.inputHandler.keys.PageUp,
    NAV_HOME_KEY: webAutomator.inputHandler.keys.Home,
    NAV_END_KEY: webAutomator.inputHandler.keys.End,
    TOGGLE_FULLSCREEN_KEY: webAutomator.inputHandler.keys.F5,
    EXIT_KEY: webAutomator.inputHandler.keys.Escape
};

// --- Standard Modifier Key Combinations ---
const MODIFIER_SETS = {
    CTRL_MODIFIER: { modifiers: 'ctrl' },
    SHIFT_MODIFIER: { modifiers: 'shift' },
    CTRL_SHIFT_MODIFIER: { modifiers: 'ctrl+shift' }
};

// --- Generic Helper Function for Key-Based Navigation Tests ---
/**
 * Defines and executes a test scenario focusing on single key-press navigation.
 * This helper abstracts the common flow of: navigate -> (optional pre-action) -> key press -> assertions.
 *
 * @param {string} scenarioDescription - A unique title for the test.
 * @param {string} initialUrlHash - The hash fragment to append to the base URL for starting.
 * @param {number} keyPressedCode - The numeric key code to simulate (from KEY_ACTION_MAPPING).
 * @param {object|null} keyModifiers - Optional modifier object (from MODIFIER_SETS).
 * @param {string} expectedActiveCssSelector - CSS selector for the element expected to be active after key press.
 * @param {RegExp} expectedUrlFragmentRegex - Regex to validate the URL hash after key press.
 * @param {string} activeElementAssertMsg - Descriptive message for the active element assertion.
 * @param {string} urlPatternAssertMsg - Descriptive message for the URL pattern assertion.
 * @param {number} totalExpectedAssertions - The count of assertions anticipated in this test.
 * @param {function|null} preKeyPressCustomAction - An optional function to run before the key press, within driver context.
 */
function defineKeyNavigationTest(
    scenarioDescription,
    initialUrlHash,
    keyPressedCode,
    keyModifiers,
    expectedActiveCssSelector,
    expectedUrlFragmentRegex,
    activeElementAssertMsg,
    urlPatternAssertMsg,
    totalExpectedAssertions,
    preKeyPressCustomAction = null
) {
    webAutomator.defineScenario(scenarioDescription, totalExpectedAssertions, function testRoutine(specRunner) {
        const fullStartingUrl = PRESENTATION_BASE_URL + initialUrlHash;

        specRunner.comment(`Initiating test: "${scenarioDescription}" for URL: ${fullStartingUrl}`);
        webAutomator.navigate(fullStartingUrl)
            .chainStep(function driverActionPhase() {
                // Introduce a brief artificial delay to simulate browser rendering.
                this.waitForRender(200);

                if (preKeyPressCustomAction) {
                    specRunner.comment('Executing pre-key press custom actions...');
                    preKeyPressCustomAction.call(this, specRunner); // Allow pre-actions to use specRunner.
                }

                const modsInfo = keyModifiers ? ` with modifiers: ${JSON.stringify(keyModifiers.modifiers)}` : '';
                specRunner.comment(`Simulating key event (Code: ${keyPressedCode})${modsInfo} on ${TARGET_BODY_ELEMENT}.`);
                this.simulateKeyPress(TARGET_BODY_ELEMENT, keyPressedCode, keyModifiers);
            })
            .chainStep(function driverVerificationPhase() {
                // Validate the expected outcomes.
                specRunner.checkElementPresence(expectedActiveCssSelector, activeElementAssertMsg);
                specRunner.validateUrlPattern(expectedUrlFragmentRegex, urlPatternAssertMsg);
                specRunner.comment('All verification steps successfully completed for this phase.');
            })
            .executeSequence(function finalExecution() {
                specRunner.finish();
            });
    });
}

// --- Specialized Helper for Fullscreen Mode Toggle Tests ---
/**
 * Defines and executes a test scenario for entering or exiting fullscreen mode.
 * This helper is tailored for tests that involve 3 assertions (body class, active slide, URL).
 *
 * @param {string} scenarioDescription - A unique title for the test.
 * @param {string} initialFullUrl - The complete URL to start the test (e.g., 'http://.../?full#1').
 * @param {number} keyPressedCode - The numeric key code to simulate.
 * @param {object|null} keyModifiers - Optional modifier object.
 * @param {string} expectedBodyClassSelector - CSS selector for the body element's class after key press.
 * @param {string} expectedActiveCssSelector - CSS selector for the element expected to be active.
 * @param {RegExp} expectedUrlFragmentRegex - Regex to validate the URL pattern.
 * @param {string} bodyClassAssertMsg - Message for the body class assertion.
 * @param {string} activeElementAssertMsg - Message for the active element assertion.
 * @param {string} urlPatternAssertMsg - Message for the URL pattern assertion.
 */
function defineFullscreenModeTest(
    scenarioDescription,
    initialFullUrl,
    keyPressedCode,
    keyModifiers,
    expectedBodyClassSelector,
    expectedActiveCssSelector,
    expectedUrlFragmentRegex,
    bodyClassAssertMsg,
    activeElementAssertMsg,
    urlPatternAssertMsg
) {
    webAutomator.defineScenario(scenarioDescription, 3, function testRoutine(specRunner) { // Fullscreen tests always have 3 assertions.
        specRunner.comment(`Initiating fullscreen test: "${scenarioDescription}" from URL: ${initialFullUrl}`);
        webAutomator.navigate(initialFullUrl)
            .chainStep(function driverActionPhase() {
                this.waitForRender(200); // Simulate rendering time.
                const modsInfo = keyModifiers ? ` with modifiers: ${JSON.stringify(keyModifiers.modifiers)}` : '';
                specRunner.comment(`Simulating key event (Code: ${keyPressedCode})${modsInfo} on ${TARGET_BODY_ELEMENT}.`);
                this.simulateKeyPress(TARGET_BODY_ELEMENT, keyPressedCode, keyModifiers);
            })
            .chainStep(function driverVerificationPhase() {
                // Perform all three assertions required for fullscreen mode tests.
                specRunner.checkElementPresence(expectedBodyClassSelector, bodyClassAssertMsg);
                specRunner.checkElementPresence(expectedActiveCssSelector, activeElementAssertMsg);
                specRunner.validateUrlPattern(expectedUrlFragmentRegex, urlPatternAssertMsg);
                specRunner.comment('All fullscreen-specific verification steps completed.');
            })
            .executeSequence(function finalExecution() {
                specRunner.finish();
            });
    });
}

// =============================================================================
//                       TEST SCENARIOS DEFINITION
// =============================================================================

// --- Section: Forward Navigation Tests ---

// Test: Advancing to the next slide using the Right arrow key.
defineKeyNavigationTest(
    'Advance to next slide with Right arrow',
    START_SLIDE_ONE_HASH,
    KEY_ACTION_MAPPING.NAV_RIGHT_ARROW,
    null,
    '[id="2"].active',
    /\/#2$/,
    'Slide element #2 is currently highlighted as active.',
    'URL hash correctly shows "#2" after navigation.',
    2
);

// Test: Advancing to the next slide using the Down arrow key.
defineKeyNavigationTest(
    'Advance to next slide with Down arrow',
    START_SLIDE_ONE_HASH,
    KEY_ACTION_MAPPING.NAV_DOWN_ARROW,
    null,
    '[id="2"].active',
    /\/#2$/,
    'Slide element #2 is currently highlighted as active.',
    'URL hash correctly shows "#2" after navigation.',
    2
);

// Test: Advancing to the next slide using the Tab key.
defineKeyNavigationTest(
    'Advance to next slide with Tab key',
    START_SLIDE_ONE_HASH,
    KEY_ACTION_MAPPING.NAV_TAB_KEY,
    null,
    '[id="2"].active',
    /\/#2$/,
    'Slide element #2 is currently highlighted as active.',
    'URL hash correctly shows "#2" after navigation.',
    2
);

// Test: Verifying no forward movement when Ctrl + Tab is pressed.
defineKeyNavigationTest(
    'Prevent forward navigation with Ctrl + Tab',
    START_SLIDE_ONE_HASH,
    KEY_ACTION_MAPPING.NAV_TAB_KEY,
    MODIFIER_SETS.CTRL_MODIFIER,
    '[id="1"].active',
    /\/#1$/,
    'Slide element #1 remains active, indicating no navigation occurred.',
    'URL hash correctly stays at "#1" after Ctrl+Tab.',
    2
);

// Test: Advancing to the next slide using the 'J' key.
defineKeyNavigationTest(
    'Advance to next slide with J key',
    START_SLIDE_ONE_HASH,
    KEY_ACTION_MAPPING.NAV_J_KEY,
    null,
    '[id="2"].active',
    /\/#2$/,
    'Slide element #2 is currently highlighted as active.',
    'URL hash correctly shows "#2" after navigation.',
    2
);

// Test: Advancing to the next slide using the 'L' key.
defineKeyNavigationTest(
    'Advance to next slide with L key',
    START_SLIDE_ONE_HASH,
    KEY_ACTION_MAPPING.NAV_L_KEY,
    null,
    '[id="2"].active',
    /\/#2$/,
    'Slide element #2 is currently highlighted as active.',
    'URL hash correctly shows "#2" after navigation.',
    2
);

// Test: Advancing to the next slide using the Spacebar.
defineKeyNavigationTest(
    'Advance to next slide with Spacebar',
    START_SLIDE_ONE_HASH,
    KEY_ACTION_MAPPING.NAV_SPACEBAR,
    null,
    '[id="2"].active',
    /\/#2$/,
    'Slide element #2 is currently highlighted as active.',
    'URL hash correctly shows "#2" after navigation.',
    2
);

// Test: Advancing to the next slide using the PageDown key.
defineKeyNavigationTest(
    'Advance to next slide with PageDown',
    START_SLIDE_ONE_HASH,
    KEY_ACTION_MAPPING.NAV_PAGE_DOWN,
    null,
    '[id="2"].active',
    /\/#2$/,
    'Slide element #2 is currently highlighted as active.',
    'URL hash correctly shows "#2" after navigation.',
    2
);

// --- Section: Backward Navigation Tests ---

// Test: Moving to the previous slide using the Left arrow key.
defineKeyNavigationTest(
    'Go back to previous slide with Left arrow',
    START_SLIDE_TWO_HASH,
    KEY_ACTION_MAPPING.NAV_LEFT_ARROW,
    null,
    '[id="1"].active',
    /\/#1$/,
    'Slide element #1 is now active, confirming backward navigation.',
    'URL hash correctly reverted to "#1".',
    2
);

// Test: Moving to the previous slide using the Up arrow key.
// NOTE: Original code erroneously used 'Left' key; corrected to 'Up' for logical consistency.
defineKeyNavigationTest(
    'Go back to previous slide with Up arrow',
    START_SLIDE_TWO_HASH,
    KEY_ACTION_MAPPING.NAV_UP_ARROW, // Corrected key code.
    null,
    '[id="1"].active',
    /\/#1$/,
    'Slide element #1 is now active, confirming backward navigation.',
    'URL hash correctly reverted to "#1".',
    2
);

// Test: Moving to the previous slide using Shift + Tab.
defineKeyNavigationTest(
    'Go back to previous slide with Shift + Tab',
    START_SLIDE_TWO_HASH,
    KEY_ACTION_MAPPING.NAV_TAB_KEY,
    MODIFIER_SETS.SHIFT_MODIFIER,
    '[id="1"].active',
    /\/#1$/,
    'Slide element #1 is now active, confirming backward navigation.',
    'URL hash correctly reverted to "#1".',
    2
);

// Test: Verifying no backward movement when Ctrl + Shift + Tab is pressed.
defineKeyNavigationTest(
    'Prevent backward navigation with Ctrl + Shift + Tab',
    START_SLIDE_TWO_HASH,
    KEY_ACTION_MAPPING.NAV_TAB_KEY,
    MODIFIER_SETS.CTRL_SHIFT_MODIFIER,
    '[id="2"].active',
    /\/#2$/,
    'Slide element #2 remains active, indicating no backward navigation occurred.',
    'URL hash correctly stays at "#2" after Ctrl+Shift+Tab.',
    2
);

// Test: Moving to the previous slide using the 'K' key.
defineKeyNavigationTest(
    'Go back to previous slide with K key',
    START_SLIDE_TWO_HASH,
    KEY_ACTION_MAPPING.NAV_K_KEY,
    null,
    '[id="1"].active',
    /\/#1$/,
    'Slide element #1 is now active, confirming backward navigation.',
    'URL hash correctly reverted to "#1".',
    2
);

// Test: Moving to the previous slide using the 'H' key.
defineKeyNavigationTest(
    'Go back to previous slide with H key',
    START_SLIDE_TWO_HASH,
    KEY_ACTION_MAPPING.NAV_H_KEY,
    null,
    '[id="1"].active',
    /\/#1$/,
    'Slide element #1 is now active, confirming backward navigation.',
    'URL hash correctly reverted to "#1".',
    2
);

// Test: Moving to the previous slide using Shift + Spacebar.
defineKeyNavigationTest(
    'Go back to previous slide with Shift + Spacebar',
    START_SLIDE_TWO_HASH,
    KEY_ACTION_MAPPING.NAV_SPACEBAR,
    MODIFIER_SETS.SHIFT_MODIFIER,
    '[id="1"].active',
    /\/#1$/,
    'Slide element #1 is now active, confirming backward navigation.',
    'URL hash correctly reverted to "#1".',
    2
);

// Test: Moving to the previous slide using the PageUp key.
defineKeyNavigationTest(
    'Go back to previous slide with PageUp',
    START_SLIDE_TWO_HASH,
    KEY_ACTION_MAPPING.NAV_PAGE_UP,
    null,
    '[id="1"].active',
    /\/#1$/,
    'Slide element #1 is now active, confirming backward navigation.',
    'URL hash correctly reverted to "#1".',
    2
);

// --- Section: Direct Slide Navigation Tests ---

// Test: Navigating directly to the first slide using the Home key.
defineKeyNavigationTest(
    'Jump to the initial slide with Home key',
    ARBITRARY_SLIDE_ID_HASH, // Starting from an arbitrary slide.
    KEY_ACTION_MAPPING.NAV_HOME_KEY,
    null,
    '[id="1"].active',
    /\/#1$/,
    'The very first slide (#1) is now active.',
    'URL hash points to "#1", indicating navigation to the first slide.',
    2
);

// Test: Navigating directly to the last slide using the End key.
defineKeyNavigationTest(
    'Jump to the final slide with End key',
    ARBITRARY_SLIDE_ID_HASH, // Starting from an arbitrary slide.
    KEY_ACTION_MAPPING.NAV_END_KEY,
    null,
    `[id="${LAST_SLIDE_ID_NUMBER}"].active`, // Dynamic selector for the last slide.
    new RegExp(`/#${LAST_SLIDE_ID_NUMBER}$`), // Dynamic regex for the last slide URL.
    `The last slide (#${LAST_SLIDE_ID_NUMBER}) is now active.`,
    `URL hash points to "#${LAST_SLIDE_ID_NUMBER}", indicating navigation to the last slide.`,
    2
);

// --- Section: Fullscreen Mode Toggle Tests ---

// Test: Entering fullscreen mode using the F5 key.
defineFullscreenModeTest(
    'Activate fullscreen presentation via F5',
    PRESENTATION_BASE_URL + ARBITRARY_SLIDE_ID_HASH,
    KEY_ACTION_MAPPING.TOGGLE_FULLSCREEN_KEY,
    null,
    'body.full',
    '[id="1"].active',
    /\/\?full#1$/,
    'Body element has the "full" class, confirming fullscreen mode.',
    'First slide (#1) is active after entering fullscreen.',
    'URL reflects fullscreen mode and the first slide (#1).'
);

// Test: Entering fullscreen mode from the current slide using Shift + F5.
defineFullscreenModeTest(
    'Activate fullscreen presentation from current slide via Shift + F5',
    PRESENTATION_BASE_URL + ARBITRARY_SLIDE_ID_HASH,
    KEY_ACTION_MAPPING.TOGGLE_FULLSCREEN_KEY,
    MODIFIER_SETS.SHIFT_MODIFIER,
    'body.full',
    `[id="${ARBITRARY_SLIDE_ID_HASH.substring(1)}"].active`, // Extract ID without '#'.
    new RegExp(`\\/\\?full${ARBITRARY_SLIDE_ID_HASH}$`), // Regex for URL with current slide ID.
    'Body element has the "full" class, confirming fullscreen mode.',
    `Current slide (${ARBITRARY_SLIDE_ID_HASH}) remains active after Shift+F5.`,
    `URL reflects fullscreen mode and the current slide (${ARBITRARY_SLIDE_ID_HASH}).`
);

// Test: Exiting fullscreen mode using the F5 key.
defineFullscreenModeTest(
    'Deactivate fullscreen presentation via F5',
    PRESENTATION_BASE_URL + '?full' + START_SLIDE_ONE_HASH, // Start in fullscreen mode.
    KEY_ACTION_MAPPING.TOGGLE_FULLSCREEN_KEY,
    null,
    'body.list',
    '[id="1"].active',
    /\/#1$/,
    'Body element has the "list" class, confirming list mode.',
    'Slide #1 remains active after exiting fullscreen.',
    'URL reflects list mode and slide #1.'
);

// Test: Exiting fullscreen mode using the Escape key.
defineFullscreenModeTest(
    'Deactivate fullscreen presentation via Escape key',
    PRESENTATION_BASE_URL + '?full' + START_SLIDE_ONE_HASH, // Start in fullscreen mode.
    KEY_ACTION_MAPPING.EXIT_KEY,
    null,
    'body.list',
    '[id="1"].active',
    /\/#1$/,
    'Body element has the "list" class, confirming list mode.',
    'Slide #1 remains active after exiting fullscreen.',
    'URL reflects list mode and slide #1.'
);