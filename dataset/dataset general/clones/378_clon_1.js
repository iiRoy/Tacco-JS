/*
 * (c) 2012 Airbnb, Inc.
 *
 * polyglot.js - Internationalization helper library.
 *
 * This code is distributed under the BSD license.
 * For full license details, documentation, and more, please visit:
 * http://airbnb.github.com/polyglot.js
 *
 * Polyglot.js is a lightweight I18n utility for JavaScript applications,
 * designed to work seamlessly in both browser environments and Node.js.
 * It offers a straightforward approach to handling string interpolation
 * and pluralization, drawing inspiration from Airbnb's practical experience
 * integrating I18n functionalities into their Backbone.js and Node-based projects.
 *
 * This library does not perform actual translation. Instead, it serves as an
 * agnostic tool for managing and applying pre-translated phrases within your
 * client-side or server-side JavaScript codebase.
 *
 */

! function(root) {

  'use strict'; // Enforce strict mode for cleaner, safer code execution.

  // --- Polyglot Class Definition ---
  // The primary constructor for creating a new Polyglot instance.
  function Polyglot(options) {
    // Ensure options object exists; default to an empty object if not provided.
    options = options || {};

    // Initialize an empty object to store all translation phrases.
    this.phrases = {};

    // Populate phrases by extending with initial phrases from options.
    // If options.phrases is null/undefined, an empty object is used.
    this.extend(options.phrases || {});

    // Set the current locale, defaulting to 'en' (English) if not specified.
    this.currentLocale = options.locale || 'en';

    // Determine if missing translations should be allowed, converting to boolean.
    this.allowMissing = !!options.allowMissing;

    // Assign the warning function. Uses the provided function or the default `warn`.
    this.warn = options.warn || warn;
  }

  // --- Version Information ---
  // Static property to store the current version of the Polyglot library.
  Polyglot.VERSION = '0.4.2';

  // --- Prototype Methods ---

  // ### Polyglot.prototype.locale([newLocale])
  //
  // Retrieves or sets the current locale for the Polyglot instance.
  // The locale is primarily used internally for pluralization logic.
  Polyglot.prototype.locale = function(newLocale) {
    // If a new locale is provided, update the instance's current locale.
    if (newLocale) this.currentLocale = newLocale;

    // Always return the current locale.
    return this.currentLocale;
  };

  // ### Polyglot.prototype.extend(morePhrases, [prefix])
  //
  // This method is used to add or update translation phrases within Polyglot.
  //
  // Example usage:
  //
  //     polyglot.extend({
  //       "hello": "Hello",
  //       "hello_name": "Hello, %{name}" // Supports interpolation
  //     });
  //
  // Keys can be any string. Calling `extend` multiple times is safe;
  // it will overwrite existing phrases with the same key, but preserve
  // other phrases.
  //
  // Nested phrase objects are also supported and will be flattened
  // into a single level using dot notation for keys.
  //
  // Example with nested objects:
  //
  //     polyglot.extend({
  //       "navigation": {
  //         "greeting": "Hi",
  //         "welcome_message": "Welcome, %{user}",
  //         "sidebar": {
  //           "title": "Menu"
  //         }
  //       }
  //     });
  //
  //     // This would result in phrases like:
  //     // {
  //     //   'navigation.greeting': 'Hi',
  //     //   'navigation.welcome_message': 'Welcome, %{user}',
  //     //   'navigation.sidebar.title': 'Menu'
  //     // }
  //
  // An optional `prefix` argument can be used to prepend a string to all keys
  // in the `morePhrases` object, also using dot notation.
  //
  // Example with prefix:
  //
  //     polyglot.extend({
  //       "home": "Home",
  //       "about": "About Us"
  //     }, "app_menu");
  //
  //     // This would create:
  //     // {
  //     //   'app_menu.home': 'Home',
  //     //   'app_menu.about': 'About Us'
  //     // }
  //
  // This prefixing mechanism is internally utilized to handle nested phrase structures.
  Polyglot.prototype.extend = function(morePhrases, prefix) {
    var phrase; // Declare a variable to hold the current phrase value.

    // Iterate over each key in the provided `morePhrases` object.
    for (var key in morePhrases) {
      // Ensure the key belongs directly to `morePhrases` and not its prototype chain.
      if (morePhrases.hasOwnProperty(key)) {
        phrase = morePhrases[key]; // Get the value associated with the current key.

        // If a prefix is provided, prepend it to the current key with a dot separator.
        if (prefix) {
          key = prefix + '.' + key;
        }

        // If the phrase value is an object, it indicates a nested structure.
        if (typeof phrase === 'object') {
          // Recursively call extend with the nested object and the new prefixed key.
          this.extend(phrase, key);
        } else {
          // Otherwise, it's a simple phrase; store it directly in the phrases object.
          this.phrases[key] = phrase;
        }
      }
    }
  };

  // ### Polyglot.prototype.clear()
  //
  // Resets the Polyglot instance by clearing all stored translation phrases.
  // This can be useful for memory management in scenarios where phrases are no longer needed.
  // It is also used internally by the `replace` method.
  Polyglot.prototype.clear = function() {
    this.phrases = {}; // Reinitialize the phrases object to an empty state.
  };

  // ### Polyglot.prototype.replace(newPhrases)
  //
  // Completely replaces the existing set of translation phrases with a new one.
  // While `extend` is typically used for adding phrases incrementally, `replace`
  // ensures that no old phrases remain from previous configurations.
  Polyglot.prototype.replace = function(newPhrases) {
    this.clear(); // First, remove all currently stored phrases.
    this.extend(newPhrases); // Then, add the new set of phrases.
  };

  // ### Polyglot.prototype.t(key, [options])
  //
  // This is the core translation method. Given a `key`, it returns the
  // corresponding translated phrase.
  //
  // Basic usage:
  //
  //     polyglot.t("greeting");
  //     // => "Hello"
  //
  // Phrases are initially loaded into Polyglot via `polyglot.extend()` or
  // `polyglot.replace()`.
  //
  // Interpolation: Pass an object as the second argument to substitute variables.
  //
  //     polyglot.t("welcome_user", { user: "Alice" });
  //     // => "Welcome, Alice"
  //
  // Default values: If a phrase is missing, a default can be provided using
  // the special `_` key in the options object.
  //
  //     polyglot.t("missing_phrase", {
  //       _: "This is a default message.",
  //       count: 1
  //     });
  //     // => "This is a default message."
  //
  // Pluralization shortcut: If `options` is a number, it's treated as `smart_count`.
  //
  //     polyglot.t("item", 1);
  //     // => "1 item" (assuming appropriate pluralization rules)
  //
  Polyglot.prototype.t = function(key, options) {
    var phrase, result; // Declare variables for the phrase and final result.

    // Ensure options is an object; default to empty object if null or undefined.
    options = options == null ? {} : options;

    // If options is a number, treat it as a shortcut for `smart_count`.
    if (typeof options === 'number') {
      options = {
        smart_count: options
      };
    }

    // Attempt to find the phrase:
    // 1. Check if the key exists directly in `this.phrases`.
    if (typeof this.phrases[key] === 'string') {
      phrase = this.phrases[key];
    }
    // 2. If not found, check for a default phrase provided in `options._`.
    else if (typeof options._ === 'string') {
      phrase = options._;
    }
    // 3. If `allowMissing` is true, use the key itself as the phrase.
    else if (this.allowMissing) {
      phrase = key;
    }
    // 4. Otherwise, warn about the missing translation and set the result to the key.
    else {
      this.warn('Missing translation for key: "' + key + '"');
      result = key; // The untranslated key is returned as the result.
    }

    // If a phrase was successfully identified (either found or defaulted):
    if (typeof phrase === 'string') {
      // Clone the options object to avoid modifying the original.
      options = clone(options);

      // Apply pluralization rules based on the locale and `smart_count` option.
      result = choosePluralForm(phrase, this.currentLocale, options.smart_count);

      // Perform string interpolation using the provided options.
      result = interpolate(result, options);
    }

    // Return the final translated and interpolated string.
    return result;
  };


  // --- Pluralization Logic ---
  // This section defines the mechanisms for handling plural forms.

  // The string used to separate different plural forms within a phrase.
  var delimeter = '||||';

  // Defines pluralization rules for various language groups.
  // Each function takes an integer `n` and returns an index (0, 1, 2...)
  // corresponding to the correct plural form.
  var pluralTypes = {
    chinese: function(n) {
      return 0;
    }, // No plural forms, always use the first.
    german: function(n) {
      return n !== 1 ? 1 : 0;
    }, // 0 for singular (n=1), 1 for plural (n!=1).
    french: function(n) {
      return n > 1 ? 1 : 0;
    }, // 0 for singular (n=0, 1), 1 for plural (n>1).
    russian: function(n) {
      return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
    },
    czech: function(n) {
      return (n === 1) ? 0 : (n >= 2 && n <= 4) ? 1 : 2;
    },
    polish: function(n) {
      return (n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
    },
    icelandic: function(n) {
      return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0;
    }
  };

  // Maps specific locales (language codes) to their corresponding pluralization groups.
  var pluralTypeToLanguages = {
    chinese: ['fa', 'id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'zh'],
    german: ['da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv'],
    french: ['fr', 'tl', 'pt-br'],
    russian: ['hr', 'ru'],
    czech: ['cs'],
    polish: ['pl'],
    icelandic: ['is']
  };

  // Helper function to create a reverse mapping from language code to plural type.
  function langToTypeMap(mapping) {
    var type, langs, l, ret = {}; // Declare variables.

    // Iterate through each plural type in the input mapping.
    for (type in mapping) {
      // Ensure the property is directly on the object.
      if (mapping.hasOwnProperty(type)) {
        langs = mapping[type]; // Get the array of languages for the current type.

        // Iterate through each language in the array.
        for (l in langs) {
          ret[langs[l]] = type; // Map the language to its plural type.
        }
      }
    }
    return ret; // Return the generated language-to-type map.
  }

  // Utility function to remove leading and trailing whitespace from a string.
  function trim(str) {
    var trimRe = /^\s+|\s+$/g; // Regular expression for matching leading/trailing whitespace.
    return str.replace(trimRe, ''); // Replace matched whitespace with an empty string.
  }

  // Selects the correct plural form from a phrase based on locale and count.
  function choosePluralForm(text, locale, count) {
    var ret, texts, chosenText; // Declare variables.

    // Proceed with pluralization only if a count is provided and the text is not empty.
    if (count != null && text) {
      texts = text.split(delimeter); // Split the text into an array of plural forms.

      // Determine the correct plural form index and retrieve the chosen text.
      // Falls back to the first form if the specific plural form is not found.
      chosenText = texts[pluralTypeIndex(locale, count)] || texts[0];

      ret = trim(chosenText); // Trim whitespace from the chosen text.
    } else {
      ret = text; // If no count or no text, return the original text as is.
    }
    return ret; // Return the pluralized (or original) text.
  }

  // Determines the plural type name (e.g., 'german', 'russian') for a given locale.
  function pluralTypeName(locale) {
    var langToPluralType = langToTypeMap(pluralTypeToLanguages); // Get the language-to-type map.
    // Return the plural type for the given locale, or 'en' (English) as a fallback.
    return langToPluralType[locale] || langToPluralType.en;
  }

  // Calculates the plural form index for a given locale and count.
  function pluralTypeIndex(locale, count) {
    // Get the plural function for the locale's plural type and apply it to the count.
    return pluralTypes[pluralTypeName(locale)](count);
  }

  // ### interpolate(phrase, options)
  //
  // Performs string interpolation by replacing placeholders in a `phrase`
  // with values from the `options` object.
  function interpolate(phrase, options) {
    // Iterate over each property in the `options` object.
    for (var arg in options) {
      // Ensure the property is not the special '_' key and is directly on the object.
      if (arg !== '_' && options.hasOwnProperty(arg)) {
        // A new RegExp is created for each replacement to allow multiple occurrences
        // of the same placeholder (e.g., "Hello, %{name} and %{name}!").
        // The placeholder format is `%{key}`.
        phrase = phrase.replace(new RegExp('%\\{' + arg + '\\}', 'g'), options[arg]);
      }
    }
    return phrase; // Return the phrase with all placeholders replaced.
  }

  // ### warn(message)
  //
  // A simple warning utility that logs a message to the console if available.
  // This is typically used when a translation key is missing.
  function warn(message) {
    // Check if `console` and `console.warn` exist in the root object (e.g., `window` or `global`).
    if (root.console && root.console.warn) {
      root.console.warn('WARNING: ' + message); // Log the warning message.
    }
  }

  // ### clone(source)
  //
  // Creates a shallow clone of a given object.
  function clone(source) {
    var ret = {}; // Initialize an empty object for the clone.

    // Iterate over each property in the source object.
    for (var prop in source) {
      ret[prop] = source[prop]; // Copy the property to the new object.
    }
    return ret; // Return the cloned object.
  }


  // --- Export and Global Attachment ---
  // Handles module export for Node.js or attaches Polyglot to the global object (e.g., `window` in browsers).
  if (typeof module !== 'undefined' && module.exports) {
    // For Node.js or other CommonJS environments.
    module.exports = Polyglot;
  } else {
    // For browser environments, attach Polyglot to the global `root` object.
    root.Polyglot = Polyglot;
  }

}(this); // The IIFE (Immediately Invoked Function Expression) is called with `this` as the root context.