// This module facilitates internationalization (i18n) within jQuery-powered applications.
// It allows for dynamic string translation based on a provided locale dictionary.
//
// Original project inspiration: recurser/jquery-i18n (MIT License)
// Version: 1.2.3 (2024-07-30)

(function(jQ) {
  // A utility reference for array slicing operations.
  // This helps us convert 'arguments' objects into true arrays.
  const arraySliceRef = Array.prototype.slice;

  /**
   * The core localization engine.
   * Manages translation data and provides methods for string lookup and formatting.
   * @namespace languageProcessor
   */
  const languageProcessor = {
    /**
     * Stores the collection of translated phrases, organized by their message keys.
     * @type {Object|null}
     * @private
     */
    phraseRepository: null,

    /**
     * A flag indicating whether the localization engine has been initialized with translation data.
     * @type {boolean}
     * @private
     */
    isEngineReady: false,

    /**
     * Initializes or updates the internal phrase repository with new locale data.
     * If data already exists, new entries will be merged.
     *
     * @param {Object} localeData - An object containing key-value pairs for translations.
     *                               Keys are message identifiers, values are translated strings.
     * @returns {void}
     */
    configureLocale: function(localeData) {
      // Input validation: ensure the provided data is a valid object.
      if (!localeData || typeof localeData !== 'object' || Array.isArray(localeData)) {
        console.warn("Localization Engine: Invalid locale data provided. Expected an object.");
        return;
      }

      // If no repository exists, create a new one. Otherwise, extend the existing one.
      if (this.phraseRepository === null) {
        this.phraseRepository = jQ.extend(true, {}, localeData); // Deep clone for safety
      } else {
        jQ.extend(this.phraseRepository, localeData); // Merge new data into existing
      }
      this.isEngineReady = true; // Mark as ready after configuration
      console.info("Localization Engine: Locale data successfully configured.");
    },

    /**
     * Retrieves a translated message for a given key, optionally formatting it with provided values.
     * If a translation is not found, the original message key is returned, and a warning is logged.
     *
     * @param {string} messageKey - The identifier for the message to be translated.
     * @param {...*} interpolationValues - Optional values to substitute into the translated string (e.g., for placeholders like %s).
     * @returns {string} The translated and formatted string, or the original key if no translation exists.
     */
    retrieveMessage: function(messageKey) {
      if (!this.isEngineReady || !this.phraseRepository) {
        console.warn("Localization Engine: Attempted to retrieve message before configuration. Key: " + messageKey);
        return messageKey;
      }

      // Ensure the message key is a string for proper lookup.
      if (typeof messageKey !== 'string' || messageKey.trim() === '') {
        console.warn("Localization Engine: Invalid message key provided. Expected a non-empty string. Got: ", messageKey);
        return String(messageKey); // Return string representation of invalid key
      }

      let localizedText = messageKey; // Default to the original key

      // Check if the translation exists in the repository.
      if (Object.prototype.hasOwnProperty.call(this.phraseRepository, messageKey)) {
        localizedText = this.phraseRepository[messageKey];
      } else {
        // Log a warning if the translation is missing.
        console.warn("Localization Engine: No translation found for key '" + messageKey + "'. Returning original key.");
      }

      // Extract all arguments passed after the messageKey for interpolation.
      const formattingArgs = arraySliceRef.call(arguments, 1);

      // If there are arguments for interpolation, apply them.
      if (formattingArgs.length > 0) {
        // The first argument to substituteTokens is the string itself, followed by the values.
        return this.substituteTokens.apply(this, [localizedText].concat(formattingArgs));
      }

      return localizedText;
    },

    /**
     * Replaces placeholders (like %s, %N$s) in a string with provided arguments.
     * This method mimics a simplified `sprintf`-like functionality.
     *
     * @param {string} inputString - The string containing placeholders to be replaced.
     * @param {...*} valuesForSubstitution - Values to substitute into the placeholders.
     * @returns {string} The string with all placeholders replaced.
     * @private
     */
    substituteTokens: function(inputString) {
      if (typeof inputString !== 'string') {
        console.warn("Localization Engine: Attempted to format a non-string value. Got: ", inputString);
        return String(inputString);
      }

      // Collect all arguments passed for substitution, excluding the initial string.
      const valuesForSubstitution = arraySliceRef.call(arguments, 1);

      // Helper to keep track of positional arguments for %s.
      let currentGenericPlaceholderIndex = 0;

      // The regex handles two types of placeholders:
      // 1. `%(N$)s`: Positional placeholders, where N refers to the N-th argument (1-indexed).
      // 2. `%s`: Generic placeholders, which consume arguments sequentially.
      // 3. `%%s`: An escaped %s, which should result in a literal %s.
      const processedString = inputString.replace(/([^%]|^)%(?:(\d+)\$)?s/g, function(fullMatchText, leadingChar, numericIndex) {
        let replacementValue;

        // If a numeric index is provided (e.g., %1$s, %2$s)
        if (numericIndex) {
          const argPosition = parseInt(numericIndex, 10) - 1; // Convert to 0-indexed array position
          // Check if the argument exists for the given position.
          if (argPosition >= 0 && argPosition < valuesForSubstitution.length) {
            replacementValue = valuesForSubstitution[argPosition];
          } else {
            console.warn(`Localization Engine: Positional argument %${numericIndex}$s not found for string: "${inputString}"`);
            replacementValue = fullMatchText; // Fallback to original match if argument is missing
          }
        } else {
          // For generic %s, use the next available argument.
          if (currentGenericPlaceholderIndex < valuesForSubstitution.length) {
            replacementValue = valuesForSubstitution[currentGenericPlaceholderIndex++];
          } else {
            console.warn(`Localization Engine: Generic argument %s not found for string: "${inputString}"`);
            replacementValue = fullMatchText; // Fallback to original match if argument is missing
          }
        }
        // Ensure the replacement value is a string.
        return leadingChar + String(replacementValue);
      });

      // Finally, unescape any '%%s' sequences back to '%s'.
      return processedString.replace(/%%s/g, '%s');
    }
  };

  /**
   * jQuery plugin: Allows direct localization of an element's HTML content.
   *
   * Example: `jQ('h1').applyLocalization('greeting_key', 'User Name')`
   *
   * @param {string} messageKey - The key for the translation.
   * @param {...*} interpolationValues - Values for string interpolation.
   * @returns {jQ} The jQuery object, allowing for method chaining.
   */
  jQ.fn.applyLocalization = function(messageKey) {
    if (!messageKey) {
      console.warn("jQuery Localization Plugin: No message key provided for element.");
      return this; // Return original element for chaining
    }

    // Pass all arguments directly to the core translation function.
    // The 'arguments' object here contains (messageKey, arg1, arg2, ...).
    const translatedContent = languageProcessor.retrieveMessage.apply(languageProcessor, arguments);

    // Update the HTML content of the selected elements.
    return jQ(this).html(translatedContent);
  };

  // Expose the localization engine globally via jQuery's namespace.
  jQ.localization = languageProcessor;

  // Initial check: if no locale data is loaded, issue a warning.
  if (!languageProcessor.isEngineReady) {
      console.info("Localization Engine: Not configured yet. Call jQ.localization.configureLocale(data) to load translations.");
  }

})(jQuery); // Pass jQuery as 'jQ' to the IIFE