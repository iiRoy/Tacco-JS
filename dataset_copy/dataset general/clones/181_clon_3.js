const driverContext = require('../env/session'); // Manages the WebDriver instance for browser interactions
const formatter     = require('util');            // Standard Node.js utility for string formatting
const seleniumCore  = require('selenium-webdriver'); // Core Selenium WebDriver objects and functionalities

/**
 * @module PageInteractionUtilities
 * @description Provides a collection of utility functions for interacting with web page elements
 *              and managing the WebDriver instance, designed for test automation frameworks.
 */
const PageInteractionUtilities = {

  /**
   * Asynchronously finds and returns a single web element on the page.
   * This method uses a specified locator strategy and selector value.
   *
   * @param {string} selectorText - The value used by the locator strategy (e.g., "myElementId", ".myClass").
   * @param {string} [locatorStrategy] - The strategy key (e.g., 'id', 'css', 'xpath'). Defaults to 'css' if not provided.
   * @returns {Promise<seleniumCore.WebElement>} A promise that resolves to the located WebElement.
   * @throws {Error} If the WebDriver instance is not available or an invalid locator strategy is used.
   */
  async findElementOnPage: function (selectorText, locatorStrategy) {
    const currentDriverInstance = driverContext.getDriver(); // Retrieve the active WebDriver instance
    if (!currentDriverInstance) {
      throw new Error("No active WebDriver session found. Cannot find element.");
    }
    // Resolve the appropriate Selenium 'By' object using an internal helper
    const elementIdentifier = this.determineElementLocator(selectorText, locatorStrategy);
    // Asynchronously find the element
    return await currentDriverInstance.findElement(elementIdentifier);
  },

  /**
   * Finds and returns an array of web elements matching the specified locator strategy and selector.
   *
   * @param {string} selectorText - The value for the locator (e.g., CSS selector, ID).
   * @param {string} [locatorStrategy] - The method for locating elements (e.g., 'css', 'id', 'xpath'). Defaults to 'css'.
   * @returns {Promise<seleniumCore.WebElement[]>} A promise that resolves to an array of WebElements.
   * @throws {Error} If the WebDriver instance is not available or an invalid locator strategy is used.
   */
  findAllElementsOnPage: function (selectorText, locatorStrategy) {
    const driverReference = driverContext.getDriver(); // Get the WebDriver instance
    if (!driverReference) {
      throw new Error("WebDriver is not initialized. Cannot find multiple elements.");
    }
    const elementSearchCriterion = this.determineElementLocator(selectorText, locatorStrategy);
    return driverReference.findElements(elementSearchCriterion);
  },

  /**
   * Augments a given WebDriver element (expected to be a <select> dropdown)
   * with a new method to select an option by its 'value' attribute.
   *
   * @param {seleniumCore.WebElement} targetDropdownElement - The WebDriver element representing the <select> tag.
   * @returns {seleniumCore.WebElement} The original element, now enhanced with the `selectOptionByValue` method.
   */
  enhanceSelectWithOptionSelector: function (targetDropdownElement) {
    // Basic validation for the input element
    if (!targetDropdownElement || typeof targetDropdownElement.click !== 'function') {
      console.warn("Attempted to enhance an invalid or non-clickable element. Ensure it's a WebElement.");
      return targetDropdownElement;
    }

    /**
     * @method selectOptionByValue
     * @memberOf seleniumCore.WebElement
     * @description Custom method added to a <select> WebElement to choose an option by its 'value' attribute.
     * @param {string|number} optionValueToSelect - The 'value' attribute of the <option> to be selected.
     * @returns {Promise<void>} A promise that resolves after the option has been clicked.
     */
    targetDropdownElement.selectOptionByValue = async function (optionValueToSelect) {
      // Click the select element first to ensure its options are visible (important for some browsers/frameworks)
      await this.click(); // 'this' refers to targetDropdownElement

      // Construct a CSS selector to find the option with the matching 'value' attribute
      const optionCssSelector = formatter.format("option[value='%s']", String(optionValueToSelect));

      // Find the specific option within the context of the select element
      const desiredOptionElement = await this.findElement(seleniumCore.By.css(optionCssSelector));

      // Click the found option to select it
      return await desiredOptionElement.click();
    };

    return targetDropdownElement; // Return the enhanced element
  },

  /**
   * Waits for a given function (condition) to return a truthy value within a specified timeout.
   *
   * @param {Function} conditionEvaluator - A function that returns a Promise or a truthy/falsy value.
   * @param {number} [maxWaitMs=7000] - The maximum duration in milliseconds to wait for the condition.
   * @returns {Promise<any>} A promise that resolves with the condition's return value when met, or rejects on timeout.
   * @throws {TypeError} If the conditionEvaluator is not a function.
   */
  awaitBrowserCondition: function (conditionEvaluator, maxWaitMs) {
    const activeWebDriver = driverContext.getDriver();
    if (typeof conditionEvaluator !== 'function') {
      throw new TypeError("The condition to await must be provided as a function.");
    }
    // Use a default wait duration if none is explicitly provided
    const effectiveWaitDuration = maxWaitMs || 7000; // Default to 7 seconds

    return activeWebDriver.wait(conditionEvaluator, effectiveWaitDuration);
  },

  /**
   * Switches the WebDriver's focus to the currently active browser alert (e.g., `alert()`, `confirm()`, `prompt()`).
   *
   * @returns {Promise<seleniumCore.Alert>} A promise that resolves to the Alert object, allowing interaction with the alert.
   */
  retrieveBrowserAlert: function () {
    const currentWebDriver = driverContext.getDriver();
    // Access the 'switchTo' interface of the driver
    const driverSwitcher = currentWebDriver.switchTo();
    return driverSwitcher.alert(); // Return the Alert object
  },

  /**
   * Internal helper function to convert a selector string and strategy key into a Selenium `By` object.
   * This centralizes locator resolution and error handling.
   *
   * @param {string} selectorString - The string value for the locator (e.g., "uniqueId", "div.some-class").
   * @param {string} [strategyKey] - The string key for the locator method (e.g., 'id', 'css', 'xpath').
   *                                 Defaults to 'css' if omitted or falsy.
   * @returns {seleniumCore.By} A Selenium 'By' object.
   * @throws {Error} If an unsupported or invalid locator strategy is provided.
   */
  determineElementLocator: function (selectorString, strategyKey) {
    // Ensure the selector is always a string for safety
    const processedSelectorValue = String(selectorString);
    const availableByMethods = seleniumCore.By; // Shortcut to the Selenium By methods

    // If no strategy is specified, default to CSS selector, which is versatile
    if (!strategyKey) {
      console.debug(`Locator strategy not provided for '${processedSelectorValue}'. Defaulting to CSS selector.`);
      return availableByMethods.css(processedSelectorValue);
    }

    // Normalize the strategy key to lowercase for case-insensitive matching
    const normalizedStrategy = String(strategyKey).toLowerCase();

    // Check if the normalized strategy corresponds to a valid method in seleniumCore.By
    if (typeof availableByMethods[normalizedStrategy] === 'function') {
      // Dynamically invoke the corresponding 'By' method with the selector value
      return availableByMethods[normalizedStrategy](processedSelectorValue);
    } else {
      // Collect all valid 'By' methods for a helpful error message
      const validStrategies = Object.keys(availableByMethods)
        .filter(key => typeof availableByMethods[key] === 'function')
        .join(', ');

      const errorDetail = formatter.format(
        "Unsupported locator strategy: '%s'. Selector: '%s'. Valid strategies include: %s",
        normalizedStrategy,
        processedSelectorValue,
        validStrategies
      );
      throw new Error(errorDetail);
    }
  }

};

module.exports = PageInteractionUtilities;