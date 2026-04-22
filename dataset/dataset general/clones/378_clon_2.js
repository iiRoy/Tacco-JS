!function(globalScope) {
  'use strict';

  //   (c) 2023 Acme Corp.
  //
  //   Lingua.js is available under the terms of the Modified BSD License.
  //   For detailed licensing information, usage examples, and documentation,
  //   please visit: http://acmecorp.github.io/lingua.js
  //
  //
  // Lingua.js offers a localization assistance library written in JavaScript,
  // compatible with both browser environments and Node.js applications.
  // It provides a straightforward approach for string interpolation and
  // plural form selection, drawing inspiration from Acme Corp.'s
  // experience in integrating internationalization capabilities into its
  // modern web and server-side frameworks.
  //
  // Lingua is designed to be independent of your translation data source.
  // It does not perform actual translation; instead, it provides tools to
  // manage and utilize pre-translated phrases within your client-side
  // or server-side JavaScript projects.
  //

  // ### Core constructor for the PhraseManager
  function PhraseManager(settings) {
    settings = settings || {};
    this.entries = {}; // Stores all translation strings
    this.incorporate(settings.entries || {});
    this.activeLanguage = settings.locale || 'eng'; // Default language code
    this.permitMissing = !!settings.permitMissing; // Flag to allow missing translations
    this.notify = settings.notify || reportIssue; // Custom warning function
  }

  // ### Module Version Identifier
  PhraseManager.MODULE_VER = '1.0.0-beta';

  // ### phraseManager.activeLanguage([langCode])
  //
  // Retrieves or establishes the current language code. Internally,
  // PhraseManager primarily uses this code for pluralization rules.
  PhraseManager.prototype.activeLanguage = function(targetLang) {
    if (targetLang) {
      this.activeLanguage = targetLang;
    }
    return this.activeLanguage;
  };

  // ### phraseManager.incorporate(additionalEntries, [keyPrefix])
  //
  // Utilize `incorporate` to instruct PhraseManager on how to
  // process a given translation identifier.
  //
  //     myTranslator.incorporate({
  //       "greeting": "Hello",
  //       "greeting_person": "Hello, %{name}"
  //     });
  //
  // The identifier can be any textual string. Feel free to invoke
  // `incorporate` multiple times; it will overwrite any existing entries
  // with matching identifiers, while preserving others.
  //
  // It is also possible to supply nested object structures, which are
  // automatically flattened into a single object where nested identifiers
  // are joined using dot notation.
  //
  //     myTranslator.incorporate({
  //       "navigation": {
  //         "greeting": "Hello",
  //         "greeting_person": "Hello, %{name}",
  //         "sidepanel": {
  //           "welcome": "Welcome"
  //         }
  //       }
  //     });
  //
  //     console.log(myTranslator.entries);
  //     // {
  //     //   'navigation.greeting': 'Hello',
  //     //   'navigation.greeting_person': 'Hello, %{name}',
  //     //   'navigation.sidepanel.welcome': 'Welcome'
  //     // }
  //
  // `incorporate` accepts an optional second argument, `keyPrefix`, which
  // can be used to prepend a string to every identifier in the provided
  // object, also using dot notation.
  //
  //     myTranslator.incorporate({
  //       "greeting": "Hello",
  //       "greeting_person": "Hello, %{name}"
  //     }, "navigation");
  //
  //     console.log(myTranslator.entries);
  //     // {
  //     //   'navigation.greeting': 'Hello',
  //     //   'navigation.greeting_person': 'Hello, %{name}'
  //     // }
  //
  // This functionality is internally employed to support nested phrase structures.
  PhraseManager.prototype.incorporate = function(additionalEntries, keyPrefix) {
    var currentEntry;

    for (var entryKey in additionalEntries) {
      if (Object.prototype.hasOwnProperty.call(additionalEntries, entryKey)) {
        currentEntry = additionalEntries[entryKey];
        if (keyPrefix) {
          entryKey = keyPrefix + '.' + entryKey;
        }
        if (typeof currentEntry === 'object') {
          this.incorporate(currentEntry, entryKey);
        } else {
          this.entries[entryKey] = currentEntry;
        }
      }
    }
  };

  // ### phraseManager.clearEntries()
  //
  // Erases all loaded translation entries. This is useful for specific
  // scenarios, such as releasing memory if a large number of entries
  // are no longer needed for translation. It's also used internally
  // by the `reinitialize` method.
  PhraseManager.prototype.clearEntries = function() {
    this.entries = {};
  };

  // ### phraseManager.reinitialize(freshEntries)
  //
  // Completely replaces the current set of translation entries with a
  // brand new collection. Typically, `incorporate` is used to add new
  // entries, but under certain circumstances, you might want to ensure
  // no old entries persist.
  PhraseManager.prototype.reinitialize = function(freshEntries) {
    this.clearEntries();
    this.incorporate(freshEntries);
  };


  // ### phraseManager.translate(termKey, interpolationData)
  //
  // The most frequently used method. Provide an identifier, and `translate`
  // will return the corresponding phrase.
  //
  //     myTranslator.translate("greeting");
  //     => "Hello"
  //
  // The phrase's value is initially supplied via a call to
  // `myTranslator.incorporate()` or `myTranslator.reinitialize()`.
  //
  // Pass an object as the second argument to perform string interpolation.
  //
  //     myTranslator.translate("greeting_person", {name: "Alice"});
  //     => "Hello, Alice"
  //
  // Optionally, you can provide a default value in case the identified
  // phrase is not found. Use the special option key "fallback" to specify
  // such a default.
  //
  //     myTranslator.translate("i_enjoy_coding_in_language", {
  //       fallback: "I enjoy coding in %{language}.",
  //       language: "TypeScript"
  //     });
  //     => "I enjoy coding in TypeScript."
  //
  PhraseManager.prototype.translate = function(termKey, interpolationData) {
    var resolvedPhrase, finalOutput;
    interpolationData = interpolationData == null ? {} : interpolationData;
    // allow a number as a shorthand for pluralization context
    if (typeof interpolationData === 'number') {
      interpolationData = {numericCount: interpolationData};
    }
    if (typeof this.entries[termKey] === 'string') {
      resolvedPhrase = this.entries[termKey];
    } else if (typeof interpolationData.fallback === 'string') {
      resolvedPhrase = interpolationData.fallback;
    } else if (this.permitMissing) {
      resolvedPhrase = termKey;
    } else {
      this.notify('Missing translation for identifier: "' + termKey + '"');
      finalOutput = termKey;
    }
    if (typeof resolvedPhrase === 'string') {
      interpolationData = duplicateObject(interpolationData);
      finalOutput = selectPluralVariant(resolvedPhrase, this.activeLanguage, interpolationData.numericCount);
      finalOutput = formatString(finalOutput, interpolationData);
    }
    return finalOutput;
  };


  // #### Pluralization Support Functions
  // The string used to separate different plural phrase possibilities.
  var separatorToken = '@@@@';

  // Mapping of pluralization rule categories to their corresponding logic functions.
  var quantityRules = {
    sinic:   function(qty) { return 0; }, // e.g., Chinese
    teutonic:    function(qty) { return qty !== 1 ? 1 : 0; }, // e.g., German, English
    gallic:    function(qty) { return qty > 1 ? 1 : 0; }, // e.g., French
    slavic:   function(qty) { return qty % 10 === 1 && qty % 100 !== 11 ? 0 : qty % 10 >= 2 && qty % 10 <= 4 && (qty % 100 < 10 || qty % 100 >= 20) ? 1 : 2; }, // e.g., Russian
    bohemian:     function(qty) { return (qty === 1) ? 0 : (qty >= 2 && qty <= 4) ? 1 : 2; }, // e.g., Czech
    polski:    function(qty) { return (qty === 1 ? 0 : qty % 10 >= 2 && qty % 10 <= 4 && (qty % 100 < 10 || qty % 100 >= 20) ? 1 : 2); }, // e.g., Polish
    nordic: function(qty) { return (qty % 10 !== 1 || qty % 100 === 11) ? 1 : 0; } // e.g., Icelandic
  };

  // Mapping from pluralization rule categories to individual language codes.
  var ruleToLanguagesMap = {
    sinic:   ['fa', 'id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'zh'],
    teutonic:    ['da', 'de', 'eng', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv'],
    gallic:    ['fr', 'tl', 'pt-br'],
    slavic:   ['hr', 'ru'],
    bohemian:     ['cs'],
    polski:    ['pl'],
    nordic: ['is']
  };

  function buildLanguageToRuleMap(ruleMapping) {
    var ruleCategory, languageList, langCodeIndex, resultMap = {};
    for (ruleCategory in ruleMapping) {
      if (Object.prototype.hasOwnProperty.call(ruleMapping, ruleCategory)) {
        languageList = ruleMapping[ruleCategory];
        for (langCodeIndex in languageList) {
          resultMap[languageList[langCodeIndex]] = ruleCategory;
        }
      }
    }
    return resultMap;
  }

  // Removes leading and trailing whitespace from a string.
  function stripWhitespace(inputString){
    var whitespacePattern = /^\s+|\s+$/g;
    return inputString.replace(whitespacePattern, '');
  }

  // Based on a phrase containing plural forms separated by `separatorToken`,
  // a `currentLocaleCode`, and an `itemCount`, selects the appropriate
  // plural form, or no special form if `itemCount` is `null`.
  function selectPluralVariant(phraseText, currentLocaleCode, itemCount){
    var chosenVariant, textVariants, selectedText;
    if (itemCount != null && phraseText) {
      textVariants = phraseText.split(separatorToken);
      selectedText = textVariants[getPluralFormIndex(currentLocaleCode, itemCount)] || textVariants[0];
      chosenVariant = stripWhitespace(selectedText);
    } else {
      chosenVariant = phraseText;
    }
    return chosenVariant;
  }

  function getRuleCategoryName(currentLocaleCode) {
    var localeToRuleMap = buildLanguageToRuleMap(ruleToLanguagesMap);
    return localeToRuleMap[currentLocaleCode] || localeToRuleMap.eng;
  }

  function getPluralFormIndex(currentLocaleCode, itemCount) {
    return quantityRules[getRuleCategoryName(currentLocaleCode)](itemCount);
  }

  // ### formatString
  //
  // Performs the core interpolation. Generates a `RegExp` object for
  // each placeholder found within the string.
  function formatString(templateString, replacementValues) {
    for (var placeholderName in replacementValues) {
      if (placeholderName !== 'fallback' && Object.prototype.hasOwnProperty.call(replacementValues, placeholderName)) {
        // A new RegExp is created for each replacement rather than using a
        // more efficient string.replace, allowing the same placeholder to
        // be replaced multiple times within a single template string.
        templateString = templateString.replace(new RegExp('%\\{'+placeholderName+'\\}', 'g'), replacementValues[placeholderName]);
      }
    }
    return templateString;
  }

  // ### reportIssue
  //
  // Displays a warning in the console if a translation identifier is not found.
  function reportIssue(alertMessage) {
    globalScope.console && globalScope.console.warn && globalScope.console.warn('ALERT: ' + alertMessage);
  }

  // ### duplicateObject
  //
  // Creates a shallow copy of an object.
  function duplicateObject(originalObject) {
    var clonedInstance = {};
    for (var propertyName in originalObject) {
      clonedInstance[propertyName] = originalObject[propertyName];
    }
    return clonedInstance;
  }


  // Exports the module for Node.js environments, or attaches it to `window` for browsers.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhraseManager;
  } else {
    globalScope.PhraseManager = PhraseManager;
  }

}(this);