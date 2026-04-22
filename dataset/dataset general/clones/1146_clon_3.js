(function(rootScopeContext) {

  /**
   * Defines a collection of standard event verification terms directly from the underlying testing library (e.g., Sinon.js).
   * These terms typically describe various states or patterns related to function invocation.
   * @type {string[]}
   */
  const standardEventTerms = [
    "called", "calledOnce", "calledTwice", "calledThrice",
    "calledBefore", "calledAfter", "calledOn", "alwaysCalledOn",
    "calledWith", "alwaysCalledWith", "calledWithExactly",
    "alwaysCalledWithExactly", "calledWithMatch", "alwaysCalledWithMatch"
  ];

  /**
   * Specifies a mapping of special event terms from the underlying library to their desired
   * Jasmine assertion names. These often involve distinct states like return values or exceptions.
   * @type {Object.<string, string>}
   */
  const customEventTermMappings = {
    "returned": "toHaveReturned",
    "alwaysReturned": "toHaveAlwaysReturned",
    "threw": "toHaveThrown",
    "alwaysThrew": "toHaveAlwaysThrown"
  };

  /**
   * The central repository for all dynamically generated Jasmine assertion handler functions.
   * This object will be populated with key-value pairs where keys are Jasmine matcher names
   * and values are the corresponding handler functions.
   * @type {Object.<string, Function>}
   */
  const assertionCollection = {};

  /**
   * A small internal utility function to determine if a given object is a Jasmine spy.
   * It performs a more direct check on the object's structure rather than relying solely
   * on `jasmine.isSpy`, which might not always be available or behave as expected across versions.
   * @param {*} targetObject - The object to check.
   * @returns {boolean} True if the object appears to be a Jasmine spy, false otherwise.
   */
  const isJasmineSpy = (targetObject) => {
    // A typical Jasmine spy has a 'calls' object with an 'any' method.
    return targetObject && typeof targetObject.calls === 'object' && typeof targetObject.calls.any === 'function';
  };

  /**
   * Helper function to convert the first character of a string to uppercase.
   * Essential for constructing consistent Jasmine matcher names.
   * @param {string} inputString - The string to capitalize.
   * @returns {string} The string with its first character capitalized, or an empty string if input is invalid.
   */
  const capitalizeFirstChar = (inputString) => {
    if (!inputString || typeof inputString !== 'string') {
      return '';
    }
    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
  };

  /**
   * This core function dynamically constructs and returns a Jasmine matcher function.
   * It acts as a bridge, allowing Sinon-like spy properties/methods to be used
   * within Jasmine's `expect()` syntax.
   * @param {string} underlyingLibKey - The name of the property or method on the spy
   *                                    (e.g., 'called', 'returned') from the underlying library.
   * @param {string} jasmineMatcherKey - The intended name of the Jasmine matcher
   *                                     (e.g., 'toHaveBeenCalled', 'toHaveReturned').
   * @returns {Function} A Jasmine matcher handler function.
   */
  const createAssertionHandler = (underlyingLibKey, jasmineMatcherKey) => {
    // Attempt to retrieve an existing Jasmine matcher with the same name.
    // This allows our custom matcher to potentially delegate to a native Jasmine one,
    // or provides a fallback if a more specific behavior is needed.
    const baseJasmineMatcher = jasmine.Matchers.prototype[jasmineMatcherKey];

    return function (...args) {
      const currentSubject = this.actual; // The actual value being asserted against.

      // --- Guard Clause: Validate the subject ---
      if (!currentSubject) {
        console.warn(`Test Toolkit Warning: No subject ('this.actual') provided for matcher '${jasmineMatcherKey}'. Assertion skipped.`);
        // Returning `false` indicates a failed assertion if no subject is present.
        return false;
      }

      // --- Delegation to Native Jasmine Matcher ---
      // If the subject is recognized as a Jasmine spy AND an original Jasmine matcher exists
      // for this key, we delegate the call to the original matcher. This ensures compatibility
      // and leverages existing Jasmine functionality when appropriate.
      if (isJasmineSpy(currentSubject) && baseJasmineMatcher) {
        // Apply the original matcher in the correct context with its arguments.
        return baseJasmineMatcher.apply(this, args);
      }

      // --- Accessing Underlying Library Property/Method ---
      // Attempt to access the property or method on the subject using the underlying library's key.
      const subjectPropertyOrMethod = currentSubject[underlyingLibKey];

      // If the property is a function, invoke it with the provided arguments.
      // This handles cases like `spy.calledWith(arg1, arg2)`.
      if (typeof subjectPropertyOrMethod === 'function') {
        try {
          return subjectPropertyOrMethod.apply(currentSubject, args);
        } catch (error) {
          // Log any errors that occur during the invocation of the underlying method.
          console.error(`Test Toolkit Error: Failed to invoke underlying method '${underlyingLibKey}' on subject for matcher '${jasmineMatcherKey}'. Details:`, error);
          // Return `false` to indicate an assertion failure due to an error.
          return false;
        }
      } else if (subjectPropertyOrMethod !== undefined) {
        // If it's a property (not a function) and it exists, return its value directly.
        // This handles cases like `spy.calledOnce` which is a boolean property.
        return subjectPropertyOrMethod;
      } else {
        // --- Fallback: Property/Method Not Found ---
        // If neither a function nor an existing property was found, it implies an assertion failure.
        console.warn(`Test Toolkit Warning: Subject does not expose property or method '${underlyingLibKey}' required for matcher '${jasmineMatcherKey}'. Assertion returns false.`);
        return false;
      }
    };
  };

  // --- Population of the assertion registry ---

  // Constant prefix used for generating standard Jasmine assertion names.
  const ASSERTION_NAME_PREFIX = "toHaveBeen";

  // Process all standard event terms to create their corresponding Jasmine matchers.
  standardEventTerms.forEach(sinonTerm => {
    // Construct the full Jasmine matcher name (e.g., "called" -> "toHaveBeenCalled").
    const jasmineAssertionName = ASSERTION_NAME_PREFIX + capitalizeFirstChar(sinonTerm);
    // Add the newly created handler function to our central registry.
    assertionCollection[jasmineAssertionName] = createAssertionHandler(sinonTerm, jasmineAssertionName);
  });

  // Process the custom event term mappings to create their specific Jasmine matchers.
  for (const sinonTermKey in customEventTermMappings) {
    // Ensure that the property belongs to the object itself and not its prototype chain.
    if (Object.prototype.hasOwnProperty.call(customEventTermMappings, sinonTermKey)) {
      const jasmineAssertionName = customEventTermMappings[sinonTermKey];
      // Add the custom handler to the registry.
      assertionCollection[jasmineAssertionName] = createAssertionHandler(sinonTermKey, jasmineAssertionName);
    }
  }

  /**
   * Defines the public interface for our testing utility module.
   * This object encapsulates all functionalities to be exposed globally.
   */
  const testingUtilitiesModule = {
    /**
     * Retrieves all registered assertion handler functions.
     * This method is designed to be called by Jasmine's `addMatchers` function
     * during test setup. The returned object is frozen to prevent accidental external modifications.
     * @returns {Object.<string, Function>} A frozen object containing all generated Jasmine matchers.
     */
    retrieveAssertionHandlers: function() {
      // Return a frozen copy to ensure the internal collection remains immutable.
      return Object.freeze({ ...assertionCollection });
    },

    /**
     * Allows for dynamic registration of additional custom matchers after initial setup.
     * This enhances flexibility for specialized testing scenarios.
     * @param {string} underlyingLibKey - The key from the underlying library (e.g., 'myCustomState').
     * @param {string} jasmineKey - The desired Jasmine matcher name (e.g., 'toHaveMyCustomState').
     */
    registerCustomMatcher: function(underlyingLibKey, jasmineKey) {
        if (typeof underlyingLibKey !== 'string' || typeof jasmineKey !== 'string' || !underlyingLibKey || !jasmineKey) {
            console.error("Test Toolkit Error: Invalid keys provided for custom matcher registration. Both keys must be non-empty strings.");
            return;
        }
        assertionCollection[jasmineKey] = createAssertionHandler(underlyingLibKey, jasmineKey);
        console.info(`Test Toolkit: Custom matcher '${jasmineKey}' successfully registered.`);
    }
  };

  // Expose the entire utility module to the global scope under a specific, unique namespace.
  // This makes the toolkit accessible for test environment configuration.
  rootScopeContext.testToolkit = testingUtilitiesModule;

})(window); // The 'window' object is passed as the global context for browser environments.

// --- Jasmine setup for automatically adding matchers before each test ---

/**
 * This 'beforeEach' block is a standard Jasmine lifecycle hook.
 * It ensures that our custom matchers are loaded and available in the Jasmine environment
 * before every single test specification is executed.
 */
beforeEach(function() {
  // Defensive check to ensure the 'testToolkit' module has been properly initialized
  // and its 'retrieveAssertionHandlers' method is available.
  if (typeof window.testToolkit === 'object' && typeof window.testToolkit.retrieveAssertionHandlers === 'function') {
    // Utilize Jasmine's built-in 'this.addMatchers' method to extend its assertion capabilities.
    // We pass the object containing all our generated matcher functions.
    this.addMatchers(window.testToolkit.retrieveAssertionHandlers());
  } else {
    // Log a critical error if the test toolkit is not properly configured,
    // indicating a potential problem in the test environment setup.
    console.error("Test Toolkit Critical Error: The 'testToolkit' module or its 'retrieveAssertionHandlers' method is not accessible. Custom matchers will not be available.");
  }
});