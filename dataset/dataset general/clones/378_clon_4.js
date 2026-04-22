(function(globalHandle) {
  'use strict';

  // --- Internal Pluralization Logic ---
  // A distinct separator for plural forms
  const textVariantSeparator = '---';

  // Mapping of language code to a specific grammar rule ID
  const langToRuleId = new Map([
    ['fa', 'singleForm'], ['id', 'singleForm'], ['ja', 'singleForm'], ['ko', 'singleForm'], ['lo', 'singleForm'], ['ms', 'singleForm'], ['th', 'singleForm'], ['tr', 'singleForm'], ['zh', 'singleForm'],
    ['da', 'twoForms'], ['de', 'twoForms'], ['en', 'twoForms'], ['es', 'twoForms'], ['fi', 'twoForms'], ['el', 'twoForms'], ['he', 'twoForms'], ['hu', 'twoForms'], ['it', 'twoForms'], ['nl', 'twoForms'], ['no', 'twoForms'], ['pt', 'twoForms'], ['sv', 'twoForms'],
    ['fr', 'frenchTwoForms'], ['tl', 'frenchTwoForms'], ['pt-br', 'frenchTwoForms'],
    ['hr', 'slavicThreeForms'], ['ru', 'slavicThreeForms'],
    ['cs', 'czechThreeForms'],
    ['pl', 'polishThreeForms'],
    ['is', 'icelandicTwoForms']
  ]);

  // Definitions of the grammar rules, mapping rule ID to a function that determines the index
  const ruleDefinitions = {
    singleForm:      (n) => 0, // e.g., Chinese
    twoForms:        (n) => (n !== 1 ? 1 : 0), // e.g., German, English (0 for 1, 1 for others)
    frenchTwoForms:  (n) => (n > 1 ? 1 : 0), // e.g., French (0 for 0, 1; 1 for others)
    slavicThreeForms: (n) => (n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2), // e.g., Russian
    czechThreeForms: (n) => (n === 1) ? 0 : (n >= 2 && n <= 4) ? 1 : 2, // e.g., Czech
    polishThreeForms: (n) => (n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2), // e.g., Polish
    icelandicTwoForms: (n) => (n % 10 !== 1 || n % 100 === 11) ? 1 : 0 // e.g., Icelandic
  };

  // Default rule if a specific locale isn't found
  const defaultRule = langToRuleId.get('en'); // Fallback to English rule

  // Helper to retrieve the pluralization function for a given locale
  function acquirePluralRule(localeIdentifier) {
    const ruleId = langToRuleId.get(localeIdentifier) || defaultRule;
    return ruleDefinitions[ruleId];
  }

  // --- Utility Functions ---

  // Shallow object duplication
  function duplicateContext(sourceObject) {
    return { ...sourceObject };
  }

  // Default notification handler for issues
  function defaultIssueNotifier(messageText) {
    globalHandle.console && globalHandle.console.warn && globalHandle.console.warn('NOTICE: ' + messageText);
  }

  // Interpolation pattern: [[variableName]]
  const placeholderRegex = /\[\[(\w+)\]\]/g;

  // --- SpeechCraft Class Definition ---
  class SpeechCraft {
    // Private fields for internal state
    #expressions = new Map(); // Stores key-value pairs of linguistic entries
    #activeLanguage = 'en';
    #permitAbsent = false; // Whether to return key if translation is missing
    #issueNotifier = defaultIssueNotifier; // Function to call for warnings

    static RELEASE_MARK = '0.4.2-divergent'; // Distinct version identifier

    constructor(config = {}) {
      this.#activeLanguage = config.language || 'en';
      this.#permitAbsent = !!config.permitAbsent;
      this.#issueNotifier = config.issueNotifier || defaultIssueNotifier;

      if (config.expressions) {
        this.addExpressions(config.expressions);
      }
    }

    // --- Public Methods ---

    // Get or set the active language
    setLanguage(newLang) {
      if (newLang) this.#activeLanguage = newLang;
      return this.#activeLanguage;
    }

    // Add or update linguistic entries
    // Iterative flattening for nested objects
    addExpressions(newExpressionSet, baseKey = '') {
      const workStack = [{ set: newExpressionSet, currentPath: baseKey }];

      while (workStack.length > 0) {
        const { set, currentPath } = workStack.pop();

        for (const currentId in set) {
          if (Object.prototype.hasOwnProperty.call(set, currentId)) {
            const content = set[currentId];
            const fullPath = currentPath ? `${currentPath}.${currentId}` : currentId;

            // If the content is an object (but not an array or null), push it onto the stack for further flattening
            if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
              workStack.push({ set: content, currentPath: fullPath });
            } else {
              this.#expressions.set(fullPath, content);
            }
          }
        }
      }
    }

    // Clear all stored linguistic entries
    eraseAll() {
      this.#expressions.clear();
    }

    // Replace all existing entries with a new set
    reloadExpressions(freshExpressionSet) {
      this.eraseAll();
      this.addExpressions(freshExpressionSet);
    }

    // Translate a given identifier
    translate(identifier, parameters = {}) {
      let utteranceContent;
      let finalOutput;

      // Handle numerical shortcut for quantity
      if (typeof parameters === 'number') {
        parameters = { quantityAspect: parameters };
      }

      // Look up the linguistic entry
      if (this.#expressions.has(identifier)) {
        utteranceContent = this.#expressions.get(identifier);
      } else if (typeof parameters.fallbackText === 'string') { // Custom fallback key
        utteranceContent = parameters.fallbackText;
      } else if (this.#permitAbsent) {
        utteranceContent = identifier;
      } else {
        this.#issueNotifier(`Missing linguistic entry for: "${identifier}"`);
        return identifier; // Return the key if no translation and not allowed to be missing
      }

      // Create a shallow copy of parameters to avoid side effects
      const safeParameters = duplicateContext(parameters);

      // Perform pluralization if a quantity is provided and content is a string
      if (typeof utteranceContent === 'string' && safeParameters.quantityAspect != null) {
        const variantForms = utteranceContent.split(textVariantSeparator);
        const pluralRuleFunction = acquirePluralRule(this.#activeLanguage);
        const selectedIndex = pluralRuleFunction(safeParameters.quantityAspect);
        const chosenForm = variantForms[selectedIndex] || variantForms[0]; // Fallback to first form

        utteranceContent = chosenForm ? chosenForm.trim() : '';
      }

      // Perform interpolation if content is a string
      if (typeof utteranceContent === 'string') {
        finalOutput = utteranceContent.replace(placeholderRegex, (match, paramName) => {
          // Check if the parameter exists and is not a special internal key
          if (Object.prototype.hasOwnProperty.call(safeParameters, paramName) &&
              paramName !== 'quantityAspect' && paramName !== 'fallbackText') {
            return safeParameters[paramName];
          }
          return match; // If not found or special, return the original placeholder
        });
      } else {
        finalOutput = utteranceContent; // If it was never a string (e.g., object, null), just return it as is.
      }

      return finalOutput;
    }
  }

  // --- Module Export ---
  // Export for Node.js or attach to the global object (window/self)
  if (typeof globalHandle.commonJsModule !== 'undefined' && globalHandle.commonJsModule.exports) {
    globalHandle.commonJsModule.exports = SpeechCraft;
  } else {
    globalHandle.SpeechCraft = SpeechCraft;
  }

})(typeof self !== 'undefined' ? self : this);