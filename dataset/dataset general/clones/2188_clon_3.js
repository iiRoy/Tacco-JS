/* Experimentation Toolkit v2.1.0 | (c) 2023 @code_master | code-master.dev/exp-kit | Apache-2.0 License */

/**
 * ExpKit: A lightweight module for conducting client-side A/B/n tests.
 * This tool integrates with common analytics platforms and manages user assignments via cookies.
 * @see code-master.dev/exp-kit
 * @contributor AI Assistant
 * @release 2.1.0-beta
 */
(function(jQuery) {

  // Internal configuration settings for the module
  const moduleSettings = {
    // Regular expression to detect development mode activation in the URL's query string
    DEV_MODE_INDICATOR: /[?&]expkit_dev/,
    // Name of the cookie used to store the user's persistent identifier for tests
    USER_ID_COOKIE_NAME: 'expkit_user_id',
    // Default cookie expiration in days
    DEFAULT_COOKIE_LIFESPAN: 60
  };

  /**
   * Represents the current state of an A/B test.
   * @typedef {Object} TestState
   * @property {number|null} userSeed - A unique identifier for the user's session, used for consistent bucket assignment.
   * @property {string|null} testIdentifier - The unique name of the A/B test being run.
   * @property {string|function|null} chosenVariantHandler - The selected variant's content (string) or function to execute.
   * @property {number|null} assignedBucketIndex - The 0-indexed bucket number assigned to the user.
   * @property {boolean} isInDevMode - Flag indicating if the module is operating in development/debug mode.
   */
  let currentTestState = {
    userSeed: null,
    testIdentifier: null,
    chosenVariantHandler: null,
    assignedBucketIndex: null,
    isInDevMode: false
  };

  /**
   * Generates a pseudo-random integer suitable for seeding.
   * @returns {number} A random integer between 0 (inclusive) and 1000000 (exclusive).
   * @private
   */
  function generateRandomInteger() {
    return Math.floor(Math.random() * 1000000);
  }

  /**
   * Retrieves a value from a browser cookie.
   * @param {string} cookieName - The name of the cookie to retrieve.
   * @returns {string|null} The decoded cookie value, or null if not found.
   * @private
   */
  function getCookieValue(cookieName) {
    if (!document.cookie) {
      return null;
    }
    const namePrefix = encodeURIComponent(cookieName) + "=";
    const allCookies = document.cookie.split(';');
    for(let i = 0; i < allCookies.length; i++) {
      let currentCookie = allCookies[i].trim(); // Remove leading whitespace
      if (currentCookie.startsWith(namePrefix)) {
        return decodeURIComponent(currentCookie.substring(namePrefix.length, currentCookie.length));
      }
    }
    return null;
  }

  /**
   * Stores a key-value pair in a browser cookie.
   * @param {string} cookieName - The name of the cookie.
   * @param {string|number} cookieValue - The value to store.
   * @param {number} [expiryDays=moduleSettings.DEFAULT_COOKIE_LIFESPAN] - Number of days until the cookie expires.
   * @private
   */
  function setCookieValue(cookieName, cookieValue, expiryDays = moduleSettings.DEFAULT_COOKIE_LIFESPAN) {
    if (typeof document === 'undefined' || !navigator.cookieEnabled) {
      // Cannot set cookies in this environment or if disabled
      return;
    }
    let expiry = "";
    if (expiryDays > 0) {
      const expirationDate = new Date();
      expirationDate.setTime(expirationDate.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
      expiry = "; expires=" + expirationDate.toUTCString();
    }
    const safeName = encodeURIComponent(cookieName);
    const safeValue = encodeURIComponent(cookieValue);
    document.cookie = `${safeName}=${safeValue}${expiry}; path=/; SameSite=Lax`;
  }

  /**
   * Determines the user's persistent identifier (seed) for A/B tests.
   * If a seed cookie exists, it's used; otherwise, a new one is generated and set.
   * @returns {number} The user's seed.
   * @private
   */
  function establishUserSeed() {
    let existingSeed = getCookieValue(moduleSettings.USER_ID_COOKIE_NAME);
    let numericSeed;

    if (existingSeed) {
      numericSeed = parseFloat(existingSeed);
      if (isNaN(numericSeed)) { // Handle corrupted cookie value
        numericSeed = generateRandomInteger();
        setCookieValue(moduleSettings.USER_ID_COOKIE_NAME, numericSeed);
      }
    } else {
      numericSeed = generateRandomInteger();
      setCookieValue(moduleSettings.USER_ID_COOKIE_NAME, numericSeed);
    }
    return numericSeed;
  }

  /**
   * Assigns a user to a specific bucket based on their seed and total number of buckets.
   * @param {number} totalBuckets - The total number of available buckets (including the control group).
   * @returns {number} The assigned bucket index (0-indexed).
   * @private
   */
  function assignUserToBucket(totalBuckets) {
    if (totalBuckets <= 0) {
      console.error("ExpKit: Invalid number of buckets provided. Must be greater than 0.");
      return 0; // Default to control group if invalid
    }

    let effectiveSeed;
    if (currentTestState.isInDevMode) {
      // In dev mode, always use a fresh random seed for immediate changes
      effectiveSeed = generateRandomInteger();
      logMessage(`[ExpKit Dev] Using fresh random seed: ${effectiveSeed}`);
    } else {
      // In production, use the persistent user seed
      if (currentTestState.userSeed === null) {
        currentTestState.userSeed = establishUserSeed();
      }
      effectiveSeed = currentTestState.userSeed;
    }
    // Calculate the bucket index (0-indexed)
    return Math.floor(effectiveSeed % totalBuckets);
  }

  /**
   * Outputs a debug message to the console if available.
   * @param {string} message - The message content.
   * @private
   */
  function logMessage(message) {
    if (typeof window !== 'undefined' && window.console && typeof window.console.log === 'function') {
      const timestamp = new Date().toLocaleTimeString();
      window.console.log(`[ExpKit ${timestamp}] ${message}`);
    }
  }

  /**
   * Updates a Google Analytics custom dimension or metric.
   * Assumes Classic GA (`_gaq`) is available.
   * @param {number} dimensionSlot - The custom dimension/metric slot number (1-20).
   * @param {string} dimensionName - The name of the custom dimension/metric.
   * @param {string} dimensionValue - The value to set for the custom dimension/metric.
   * @param {Object} [additionalProps={}] - Additional properties, e.g., `scope`.
   * @private
   */
  function updateAnalyticsCustomVar(dimensionSlot, dimensionName, dimensionValue, additionalProps = {}) {
    if (typeof window === 'undefined' || !Array.isArray(window._gaq)) {
      logMessage("Warning: Google Analytics (_gaq) not found, custom variable not set.");
      return;
    }
    const scope = additionalProps['scope'] || 3; // Default to session-level scope
    window._gaq.push(['_setCustomVar', dimensionSlot, dimensionName, dimensionValue, scope]);
    logMessage(`GA Custom Var: Set slot ${dimensionSlot}, name '${dimensionName}', value '${dimensionValue}'`);
  }

  /**
   * Dispatches a Google Analytics event.
   * Assumes Classic GA (`_gaq`) is available.
   * @param {string} eventCategory - The category of the event.
   * @param {string} eventAction - The action of the event.
   * @param {Object} [eventOptions={}] - Optional parameters for the event.
   * @private
   */
  function dispatchAnalyticsEvent(eventCategory, eventAction, eventOptions = {}) {
    if (typeof window === 'undefined' || !Array.isArray(window._gaq)) {
      logMessage("Warning: Google Analytics (_gaq) not found, event not tracked.");
      return;
    }
    const eventLabel = eventOptions['eventLabel'] || undefined;
    const eventValue = eventOptions['eventValue'] || undefined;
    // A/B tests should generally not affect bounce rate, so non-interaction is true by default.
    const nonInteraction = (eventOptions['nonInteraction'] === false) ? false : true;

    window._gaq.push(['_trackEvent', eventCategory, eventAction, eventLabel, eventValue, nonInteraction]);
    logMessage(`GA Event: Category '${eventCategory}', Action '${eventAction}', Label '${eventLabel || "N/A"}'`);
  }

  /**
   * Handles the tracking of the A/B test results to Google Analytics.
   * @param {Object} options - The configuration options for the A/B test.
   * @private
   */
  function recordTestAnalytics(options) {
    if (typeof window === 'undefined' || !Array.isArray(window._gaq)) {
      if (currentTestState.isInDevMode) {
        logMessage("GA tracking skipped: _gaq object not detected.");
      }
      return;
    }

    const analyticsValue = (currentTestState.assignedBucketIndex !== 0)
      ? (currentTestState.chosenVariantHandler && currentTestState.chosenVariantHandler.trackingLabel) || `variant_${currentTestState.assignedBucketIndex}`
      : options['controlGroupLabel'] || 'control';

    if (currentTestState.isInDevMode) {
      // In dev mode, just log what would have been sent to GA
      const slotInfo = options['customDimensionSlot'] ? ` (Custom Dim ${options['customDimensionSlot']})` : ' (Event)';
      logMessage(`[ExpKit Dev] Analytics would track: Test '${currentTestState.testIdentifier}', Value: '${analyticsValue}'${slotInfo}`);
    } else {
      // In production, actually send data to GA
      if (options['customDimensionSlot']) {
        // Track as a custom variable/dimension
        updateAnalyticsCustomVar(options['customDimensionSlot'], currentTestState.testIdentifier, analyticsValue, { scope: options['customDimensionScope'] });
      } else {
        // Track as an event
        dispatchAnalyticsEvent(currentTestState.testIdentifier, analyticsValue, {
          eventLabel: options['eventLabel'],
          eventValue: options['eventValue'],
          nonInteraction: options['eventNonInteraction']
        });
      }
    }
  }

  /**
   * Applies the chosen variant's content or executes its function on the target element.
   * @param {jQuery} targetElement - The jQuery object representing the element to modify.
   * @private
   */
  function applyVariantToElement(targetElement) {
    const variantPayload = currentTestState.chosenVariantHandler;

    if (!variantPayload) {
      logMessage("Warning: No variant payload found for rendering.");
      return;
    }

    if (typeof variantPayload.content === 'string') {
      // If the variant provides string content, update the element's text
      targetElement.text(variantPayload.content);
      logMessage(`Applied text variant: "${variantPayload.content}" to element.`);
    } else if (typeof variantPayload.action === 'function') {
      // If the variant provides an action function, execute it with the element
      try {
        variantPayload.action(targetElement);
        logMessage("Executed function variant on element.");
      } catch (error) {
        console.error("ExpKit: Error executing variant action function:", error);
      }
    } else {
      logMessage("Warning: Variant payload has no renderable 'content' or 'action'.");
    }
  }

  /**
   * Main plugin function for ExpKit. Initializes and runs an A/B test.
   * @param {Object} config - Configuration object for the A/B test.
   * @param {string} config.name - The unique name of this A/B test.
   * @param {Array<Object>} config.variants - An array of variant objects. The first element (index 0) is implicitly the control group.
   * @param {string|function} config.variants[].content - The text content to display for this variant, or a function to execute.
   * @param {string} [config.variants[].trackingLabel] - Optional label for analytics tracking.
   * @param {string} [config.controlGroupLabel='control'] - Label for the control group in analytics.
   * @param {number} [config.customDimensionSlot] - GA custom dimension slot number (for classic GA).
   * @param {number} [config.customDimensionScope=3] - GA custom dimension scope (1=hit, 2=session, 3=user).
   * @param {string} [config.eventLabel] - Optional event label for GA event tracking.
   * @param {number} [config.eventValue] - Optional event value for GA event tracking.
   * @param {boolean} [config.eventNonInteraction=true] - Whether the GA event is non-interactive.
   * @returns {jQuery} The jQuery object for chaining.
   */
  jQuery.fn.expKit = function(config) {
    // Basic input validation
    if (!config || typeof config !== 'object' || !config.name || !Array.isArray(config.variants) || config.variants.length === 0) {
      console.error("ExpKit: Invalid configuration provided. Requires 'name' and 'variants' array.");
      return this;
    }

    // Initialize module state for this specific test run
    currentTestState = {
      userSeed: establishUserSeed(),
      testIdentifier: config.name,
      chosenVariantHandler: null,
      assignedBucketIndex: null,
      isInDevMode: moduleSettings.DEV_MODE_INDICATOR.test(window.location.search)
    };

    // Determine the total number of buckets (control + all alternatives)
    const totalBuckets = config.variants.length + 1; // +1 for the implicit control group

    // Assign the user to a bucket
    currentTestState.assignedBucketIndex = assignUserToBucket(totalBuckets);

    // Select the appropriate variant handler
    if (currentTestState.assignedBucketIndex !== 0) {
      // If not the control group, pick from the variants array (adjusting for 0-indexed array)
      currentTestState.chosenVariantHandler = config.variants[currentTestState.assignedBucketIndex - 1];
    } else {
      // Control group, no specific variant handler, but we might still track it
      logMessage(`Assigned to control group for test: '${currentTestState.testIdentifier}'`);
    }

    // Record analytics for the test assignment
    recordTestAnalytics(config);

    // Apply the variant to the selected elements (if not control group)
    return this.each(function() {
      const $thisElement = jQuery(this);
      if (currentTestState.assignedBucketIndex !== 0) {
        applyVariantToElement($thisElement);
      }
    });
  };

  /**
   * Provides a way to manually reset the user's A/B test seed cookie.
   * Useful for development and testing purposes.
   * @param {string} [cookieNameToClear=moduleSettings.USER_ID_COOKIE_NAME] - The name of the cookie to clear.
   * @returns {boolean} True if the cookie was attempted to be cleared, false otherwise.
   */
  jQuery.expKitReset = function(cookieNameToClear = moduleSettings.USER_ID_COOKIE_NAME) {
    if (typeof document === 'undefined') {
      logMessage("Cannot reset cookie in this environment.");
      return false;
    }
    // Set cookie with past expiration to delete it
    setCookieValue(cookieNameToClear, '', -1);
    logMessage(`User seed cookie '${cookieNameToClear}' has been reset.`);
    currentTestState.userSeed = null; // Clear in-memory state too
    return true;
  };

// Ensure compatibility with both full jQuery and lighter Zepto libraries
})(window['jQuery'] || window['Zepto']);