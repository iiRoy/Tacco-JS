(function(globalScope) {
  'use strict';

  // --- Core Localization Engine ---

  /**
   * Initializes a new localization engine instance.
   * This module provides string management for internationalization (I18n).
   * It handles interpolation and pluralization based on provided text maps.
   *
   * @param {object} [setupConfig] - Configuration options for the engine.
   * @param {object} [setupConfig.initialTexts] - An object containing initial translation keys and values.
   * @param {string} [setupConfig.defaultLang] - The default language tag to use (e.g., 'en-US'). Defaults to 'en'.
   * @param {boolean} [setupConfig.allowFallbackKey] - If true, returns the key itself when a translation is missing. Defaults to false.
   * @param {function} [setupConfig.warningCallback] - A custom function to handle missing translation warnings.
   */
  function LocalizationEngine(setupConfig) {
    const config = setupConfig || {};

    // Internal storage for all translation entries. Using Object.create(null) for a cleaner map.
    this.translationStore = Object.create(null);
    // Initialize with provided text map
    this.ingestTexts(config.initialTexts || {});
    // Set the current active language, defaulting to 'en'
    this.activeLanguageTag = config.defaultLang || 'en';
    // Determines if the lookup key should be returned when a translation is absent
    this.permitFallbackToKey = Boolean(config.allowFallbackKey);
    // Custom warning handler or a default console logger
    this.issueWarning = config.warningCallback || logIssue;

    // A counter for issues encountered (e.g., missing translations)
    this.issueCount = 0;
  }

  // --- Engine Metadata ---
  LocalizationEngine.MODULE_VERSION = '1.0.0-alpha';

  // --- Prototype Methods ---

  /**
   * Retrieves or sets the current active language tag.
   * @param {string} [newLangTag] - Optional: The new language tag to set.
   * @returns {string} The current active language tag.
   */
  LocalizationEngine.prototype.getSetLanguage = function(newLangTag) {
    if (typeof newLangTag === 'string' && newLangTag.trim().length > 0) {
      this.activeLanguageTag = newLangTag.trim();
    }
    return this.activeLanguageTag;
  };

  /**
   * Adds new translation entries to the engine. Existing keys will be overwritten.
   * Nested objects are flattened into dot-separated keys.
   * @param {object} newEntries - An object containing translation keys and values.
   * @param {string} [currentKeyPrefix] - Internal parameter for recursive flattening.
   */
  LocalizationEngine.prototype.ingestTexts = function(newEntries, currentKeyPrefix) {
    if (typeof newEntries !== 'object' || newEntries === null) {
      // Guard clause: ensure newEntries is a valid object
      this.issueWarning('Attempted to ingest non-object entries: ' + typeof newEntries);
      return;
    }

    for (const entryKey in newEntries) {
      if (Object.prototype.hasOwnProperty.call(newEntries, entryKey)) {
        const entryValue = newEntries[entryKey];
        const fullKeyPath = currentKeyPrefix ? `${currentKeyPrefix}.${entryKey}` : entryKey;

        if (typeof entryValue === 'object' && entryValue !== null && !Array.isArray(entryValue)) {
          // Recursively process nested objects
          this.ingestTexts(entryValue, fullKeyPath);
        } else {
          // Store the flat key-value pair
          this.translationStore[fullKeyPath] = entryValue;
        }
      }
    }
  };

  /**
   * Resets all stored translation entries, clearing the internal cache.
   */
  LocalizationEngine.prototype.purgeTexts = function() {
    this.translationStore = Object.create(null); // Re-initialize as an empty object
  };

  /**
   * Replaces all existing translation entries with a completely new set.
   * This is equivalent to purging and then ingesting new entries.
   * @param {object} replacementEntries - The new set of translation entries.
   */
  LocalizationEngine.prototype.reconcileStore = function(replacementEntries) {
    this.purgeTexts();
    this.ingestTexts(replacementEntries);
  };

  /**
   * The primary method for retrieving and processing translated text.
   * Performs placeholder interpolation and pluralization if applicable.
   * @param {string} keyIdentifier - The unique key for the desired translation.
   * @param {object|number} [processingOptions] - Options for interpolation and pluralization.
   *   If a number, it's used as the plural count.
   *   If an object:
   *     `_` or `defaultText`: A fallback string if `keyIdentifier` is not found.
   *     `count`: A number for pluralization logic.
   *     Other properties are used for interpolation.
   * @returns {string} The processed translated string.
   */
  LocalizationEngine.prototype.lookupTranslation = function(keyIdentifier, processingOptions) {
    if (typeof keyIdentifier !== 'string' || keyIdentifier.length === 0) {
      this.issueWarning('Invalid keyIdentifier provided: ' + keyIdentifier);
      return ''; // Return empty string for invalid keys
    }

    let rawTextCandidate;
    let finalProcessedOutput;
    const interpData = processingOptions ?? {}; // Use nullish coalescing for default empty object

    // If a number is provided directly, treat it as the plural count
    if (typeof interpData === 'number') {
      interpData.count = interpData;
    }

    // Attempt to find the translation in the store
    if (Object.prototype.hasOwnProperty.call(this.translationStore, keyIdentifier)) {
      rawTextCandidate = this.translationStore[keyIdentifier];
    } else if (typeof interpData.defaultText === 'string') {
      rawTextCandidate = interpData.defaultText;
    } else if (typeof interpData._ === 'string') { // Support legacy '_' default
      rawTextCandidate = interpData._;
    } else if (this.permitFallbackToKey) {
      rawTextCandidate = keyIdentifier;
      this.issueCount++; // Increment issue counter
    } else {
      this.issueWarning(`Missing translation for key: "${keyIdentifier}"`);
      this.issueCount++; // Increment issue counter
      return keyIdentifier; // Return the key as a last resort if no fallback is allowed
    }

    // Ensure rawTextCandidate is a string before processing
    if (typeof rawTextCandidate === 'string') {
      // Create a shallow copy of interpolation data to avoid modifying the original
      const dataForProcessing = Object.assign({}, interpData);

      // Apply pluralization logic
      finalProcessedOutput = selectPluralForm(rawTextCandidate, this.activeLanguageTag, dataForProcessing.count);
      // Apply placeholder interpolation
      finalProcessedOutput = replacePlaceholders(finalProcessedOutput, dataForProcessing);
    } else {
      // If rawTextCandidate is not a string (e.g., null, undefined, or an object if mistakenly stored)
      this.issueWarning(`Translation for "${keyIdentifier}" is not a string type.`);
      finalProcessedOutput = keyIdentifier; // Fallback to key
    }

    return finalProcessedOutput;
  };

  // --- Pluralization Logic Helpers ---

  // Separator for multiple plural forms within a single translation string.
  const PLURAL_FORM_SEPARATOR = '|||'; // Changed from '||||'

  // Defines pluralization rules based on the count 'n'.
  // Each function returns an index for the plural form array.
  const pluralizationRules = {
    eastAsian:   (n) => 0, // e.g., Chinese, Japanese, Korean
    germanic:    (n) => (n !== 1 ? 1 : 0), // e.g., English, German, Spanish
    romance:     (n) => (n > 1 ? 1 : 0), // e.g., French, Portuguese (Brazil)
    slavic:      (n) => {
      if (n % 10 === 1 && n % 100 !== 11) return 0;
      if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 1;
      return 2;
    }, // e.g., Russian, Croatian
    westSlavic:  (n) => (n === 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2), // e.g., Czech, Slovak
    polishRule:  (n) => (n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2), // specific for Polish
    nordic:      (n) => (n % 10 !== 1 || n % 100 === 11) ? 1 : 0 // e.g., Icelandic
  };

  // Maps pluralization rule categories to specific language tags.
  const languageToRuleMapping = {
    eastAsian:   ['fa', 'id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'zh', 'vi'], // Added 'vi'
    germanic:    ['da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv', 'bg'], // Added 'bg'
    romance:     ['fr', 'tl', 'pt-br', 'ca'], // Added 'ca'
    slavic:      ['hr', 'ru', 'sr'], // Added 'sr'
    westSlavic:  ['cs', 'sk'], // Added 'sk'
    polishRule:  ['pl'],
    nordic:      ['is']
  };

  /**
   * Builds a reverse map from individual language tags to their pluralization rule types.
   * @param {object} mappingDefinition - The languageToRuleMapping object.
   * @returns {object} A map where keys are language tags and values are rule types.
   */
  function createLangRuleLookup(mappingDefinition) {
    const lookupTable = {};
    for (const ruleType in mappingDefinition) {
      if (Object.prototype.hasOwnProperty.call(mappingDefinition, ruleType)) {
        const languages = mappingDefinition[ruleType];
        for (const langCode of languages) {
          lookupTable[langCode] = ruleType;
        }
      }
    }
    return lookupTable;
  }

  // Memoized lookup table for faster access
  let memoizedLangRuleMap = null;
  function getLanguageRuleType(languageTag) {
    if (!memoizedLangRuleMap) {
      memoizedLangRuleMap = createLangRuleLookup(languageToRuleMapping);
    }
    // Fallback to 'germanic' (English) rule if specific language not found
    return memoizedLangRuleMap[languageTag.split('-')[0]] || memoizedLangRuleMap.en || 'germanic';
  }

  /**
   * Determines the correct plural form index based on language and count.
   * @param {string} langTag - The language tag.
   * @param {number} currentCount - The number used for pluralization.
   * @returns {number} The index of the correct plural form.
   */
  function getPluralIndex(langTag, currentCount) {
    const ruleType = getLanguageRuleType(langTag);
    const ruleFunction = pluralizationRules[ruleType];
    if (ruleFunction) {
      return ruleFunction(currentCount);
    }
    // Fallback to default rule (e.g., for English/Germanic) if ruleType is somehow invalid
    return pluralizationRules.germanic(currentCount);
  }

  /**
   * Selects the appropriate plural form from a string containing multiple forms.
   * @param {string} sourceText - The string possibly containing multiple plural forms separated by PLURAL_FORM_SEPARATOR.
   * @param {string} langTag - The language tag for pluralization logic.
   * @param {number} [count] - The number used to determine the plural form. If null/undefined, no pluralization occurs.
   * @returns {string} The selected plural form.
   */
  function selectPluralForm(sourceText, langTag, count) {
    if (count == null || typeof sourceText !== 'string') {
      return sourceText; // No pluralization needed or invalid input
    }

    const textVariants = sourceText.split(PLURAL_FORM_SEPARATOR);
    const chosenIndex = getPluralIndex(langTag, count);

    // Return the specific form if available, otherwise the first form, trimmed.
    const selectedText = textVariants[chosenIndex] || textVariants[0];
    return selectedText ? selectedText.trim() : '';
  }

  // --- Interpolation Helper ---

  /**
   * Replaces placeholders in a string with corresponding values from an object.
   * Placeholders are in the format `%{key}`.
   * @param {string} inputString - The string with placeholders.
   * @param {object} replacementValues - An object mapping placeholder keys to their values.
   * @returns {string} The string with placeholders replaced.
   */
  function replacePlaceholders(inputString, replacementValues) {
    let modifiedString = inputString;
    for (const placeholderKey in replacementValues) {
      // Exclude special keys and ensure property belongs to the object itself
      if (placeholderKey !== '_' && placeholderKey !== 'defaultText' && placeholderKey !== 'count' &&
          Object.prototype.hasOwnProperty.call(replacementValues, placeholderKey)) {
        // Create a new RegExp each time to allow multiple replacements of the same key
        const regex = new RegExp(`%\\{${placeholderKey}\\}`, 'g');
        modifiedString = modifiedString.replace(regex, replacementValues[placeholderKey]);
      }
    }
    return modifiedString;
  }

  // --- Utility Functions ---

  /**
   * Default warning handler, logs to console if available.
   * @param {string} msg - The warning message.
   */
  function logIssue(msg) {
    if (globalScope.console && typeof globalScope.console.warn === 'function') {
      globalScope.console.warn('I18nEngine WARNING: ' + msg);
    }
  }

  // --- Module Export ---

  // Export for Node.js (CommonJS) or attach to the global object (browser).
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalizationEngine;
  } else {
    globalScope.LocalizationEngine = LocalizationEngine;
  }

}(this));