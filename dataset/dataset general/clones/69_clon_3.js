'use strict';

// This file contains comprehensive end-to-end test scenarios for the main application's user interface.
// It focuses on verifying critical initial page load states and essential branding elements.

// --- Global Configuration and Constants ---
const APPLICATION_ROOT_PATH = '../../static/';
const MAIN_ENTRY_PAGE = 'index.html';
const BRANDING_ELEMENT_CSS = 'a.brand'; // Specific CSS selector for the application's brand logo/text.
const EXPECTED_BRAND_TEXT_CONTENT = 'BaaS (1234)'; // The anticipated text displayed for the brand.
const PAGE_TITLE_MIN_LENGTH = 5; // A minimum length check for the page title.

// --- Test Suite Definition ---
// Declares a functional test suite to group related test cases.
functionalTestSuite('application core features verification', () => {

  // --- Setup Phase ---
  // This block executes before each individual test scenario to prepare the testing environment.
  beforeScenario(() => {
    console.info('DEBUG: Initializing test environment. Navigating the client to the application\'s home page.');

    const fullApplicationUrl = `${APPLICATION_ROOT_PATH}${MAIN_ENTRY_PAGE}`;
    webClientNavigator().visitUrl(fullApplicationUrl); // Utilizes a custom navigation wrapper.

    // Optional: Add a brief pause or wait condition to ensure the page is fully rendered.
    // In a real-world scenario, this might involve waiting for a specific element to be visible.
    // webClientNavigator().awaitElementPresence(BRANDING_ELEMENT_CSS, 5000);
    console.log(`DEBUG: Successfully navigated to: ${fullApplicationUrl}`);
  });

  // --- Teardown Phase ---
  // This block executes after each test scenario, intended for cleanup operations.
  afterScenario(() => {
    console.debug('DEBUG: Test scenario concluded. Performing any necessary post-test cleanup actions.');
    // For this simple test, no explicit cleanup is required, but the structure is demonstrated.
  });

  // --- Test Case 1: Brand Element Verification ---
  // This scenario validates that the main application page loads correctly and displays the expected brand identifier.
  scenario('confirms successful initial page load and correct brand identification', () => {
    console.log('INFO: Executing test case: Validating application brand text.');

    // Retrieve the UI element using its defined CSS selector.
    const brandLogoElement = uiElementQuery(BRANDING_ELEMENT_CSS);
    const retrievedBrandText = brandLogoElement.getTextContent(); // Extracts the textual content.

    // Introduce a basic validation check before proceeding with the assertion.
    if (!retrievedBrandText || retrievedBrandText.length === 0) {
      console.error('ERROR: Brand text content was not found or is empty! This indicates a potential UI rendering issue.');
      // Optionally, throw an error to fail the test immediately if this is a critical check.
      // throw new Error('Critical UI element (brand text) missing.');
    }

    // Assert that the retrieved text matches the predefined expected value.
    verifyAssertion(retrievedBrandText).isStrictlyEqualTo(EXPECTED_BRAND_TEXT_CONTENT);

    console.log(`INFO: Assertion successful. Detected brand text: '${retrievedBrandText}'. Expected: '${EXPECTED_BRAND_TEXT_CONTENT}'.`);
  });

  // --- Test Case 2: Basic Page Title Presence ---
  // This scenario confirms that the loaded page has a non-empty title.
  scenario('validates that a page title is present upon loading', () => {
    console.log('INFO: Executing test case: Checking for page title presence.');

    const currentPageTitle = webClientNavigator().retrievePageTitle();

    // Ensure the page title is not null, undefined, or an empty string.
    verifyAssertion(currentPageTitle).isNotFalsy();
    verifyAssertion(currentPageTitle.length).isGreaterThan(PAGE_TITLE_MIN_LENGTH); // Additional check.

    console.debug(`INFO: Page title successfully retrieved: "${currentPageTitle}" (Length: ${currentPageTitle.length})`);
  });

  // --- Test Case 3: (Optional) Adding another simple test for structural variety ---
  scenario('checks for the presence of a specific header element', () => {
    console.log('INFO: Executing test case: Verifying header element existence.');
    const headerElementSelector = 'header.app-header'; // Example selector for a common header.
    const mainHeader = uiElementQuery(headerElementSelector);

    verifyAssertion(mainHeader.exists()).isTrue(); // Custom assertion for element existence.
    console.log(`INFO: Main application header ('${headerElementSelector}') was found on the page.`);
  });

});

// --- Custom Testing Framework Wrappers/Stubs ---
// These functions simulate a custom testing framework API by wrapping standard Protractor/Jasmine globals.
// This provides a layer of abstraction and allows for custom naming conventions.

/**
 * Defines a test suite.
 * @param {string} suiteDescription - Description of the test suite.
 * @param {Function} suiteCallback - The function containing test scenarios.
 */
function functionalTestSuite(suiteDescription, suiteCallback) {
  global.describe(suiteDescription, suiteCallback);
}

/**
 * Hook to run code before each scenario in a suite.
 * @param {Function} setupCallback - The function to execute before each test.
 */
function beforeScenario(setupCallback) {
  global.beforeEach(setupCallback);
}

/**
 * Hook to run code after each scenario in a suite.
 * @param {Function} teardownCallback - The function to execute after each test.
 */
function afterScenario(teardownCallback) {
  global.afterEach(teardownCallback);
}

/**
 * Defines an individual test scenario.
 * @param {string} scenarioDescription - Description of the test scenario.
 * @param {Function} scenarioCallback - The function containing the test logic.
 */
function scenario(scenarioDescription, scenarioCallback) {
  global.it(scenarioDescription, scenarioCallback);
}

/**
 * Provides an interface for browser navigation and interactions.
 * @returns {object} An object with navigation methods.
 */
function webClientNavigator() {
  const browserInstance = global.browser(); // Access the global browser object.
  return {
    visitUrl: (urlPath) => browserInstance.navigateTo(urlPath),
    retrievePageTitle: () => browserInstance.getTitle(),
    awaitElementPresence: (selector, timeoutMs) => browserInstance.wait(
      global.protractor.ExpectedConditions.presenceOf(global.element(selector)),
      timeoutMs,
      `Element '${selector}' not present after ${timeoutMs}ms.`
    )
  };
}

/**
 * Provides an interface for querying and interacting with UI elements.
 * @param {string} cssSelector - The CSS selector for the desired element.
 * @returns {object} An object with element interaction methods.
 */
function uiElementQuery(cssSelector) {
  const targetElement = global.element(by.css(cssSelector)); // Use `by.css` for clarity.
  return {
    getTextContent: () => targetElement.getText(),
    exists: () => targetElement.isPresent(),
    clickElement: () => targetElement.click()
  };
}

/**
 * Provides a fluent interface for making assertions.
 * @param {*} actualValue - The actual value obtained from the application.
 * @returns {object} An object with assertion methods.
 */
function verifyAssertion(actualValue) {
  const jasmineExpect = global.expect(actualValue);
  return {
    isStrictlyEqualTo: (expectedValue) => jasmineExpect.toBe(expectedValue),
    isNotFalsy: () => jasmineExpect.not.toBeFalsy(),
    isTrue: () => jasmineExpect.toBe(true),
    isGreaterThan: (threshold) => jasmineExpect.toBeGreaterThan(threshold)
  };
}