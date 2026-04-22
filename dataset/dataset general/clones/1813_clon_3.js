(function() {
    "use strict";

    // Application module for internationalization features.
    var localizationModule = angular.module("app.localization", []);

    localizationModule.provider("localizationService", function() {
        var configurator = this;

        // Default character used to denote nested object paths in translation keys.
        configurator.pathSeparator = ".";

        // Optional default language code if none is explicitly set.
        configurator.defaultLanguageCode = "en";

        /**
         * Configure the character used for separating nested object paths in translation keys.
         * @param {string} separatorChar - The single character to use as a path separator.
         */
        configurator.configurePathSeparator = function(separatorChar) {
            if (typeof separatorChar !== "string" || separatorChar.length !== 1) {
                console.error("LocalizationService: Invalid path separator provided. Must be a single character string.");
                return;
            }
            configurator.pathSeparator = separatorChar;
        };

        /**
         * Sets the default language to be used if no specific language is initialized.
         * @param {string} langCode - The ISO language code (e.g., 'en', 'fr').
         */
        configurator.setDefaultLanguage = function(langCode) {
            if (typeof langCode === "string" && langCode.length > 0) {
                configurator.defaultLanguageCode = langCode;
            } else {
                console.warn("LocalizationService: Attempted to set an invalid default language code.");
            }
        };

        /**
         * The core localization service that manages translation data and provides translation functions.
         * @param {object} $rootScope - Angular's root scope for broadcasting events.
         * @param {object} $http - Angular's service for making HTTP requests.
         * @param {object} $q - Angular's promise service.
         * @returns {translationManagerFactory} An instance of the translation manager.
         */
        configurator.$get = ["$rootScope", "$http", "$q", function($rootScope, $http, $q) {
            /**
             * Internal factory function for creating the translation manager instance.
             */
            var translationManagerFactory = function() {
                var self = this; // Capture 'this' for use in callbacks.

                // A deferred object to track the completion of the most recent language loading request.
                this._languageLoadPromiseContainer = $q.defer();

                // A queue to hold promises for concurrent language loading requests, ensuring all are resolved.
                this._pendingLocaleRequests = [];

                // Boolean flag indicating if the current language's translations have been loaded.
                this.isReady = false;

                // The currently active language code (e.g., "en", "de").
                this.activeLanguage = null;

                // Set initial language from provider's default if not already set.
                if (!this.activeLanguage) {
                    this.activeLanguage = configurator.defaultLanguageCode;
                }

                /**
                 * Initializes the localization service with a specified language.
                 * If the language is new, it fetches translation data and updates the application.
                 * @param {string} desiredLanguage - The language code to initialize (e.g., "en", "fr").
                 * @returns {Promise} A promise that resolves when the language data is loaded.
                 */
                this.initializeLanguage = function(desiredLanguage) {
                    if (typeof desiredLanguage !== "string" || desiredLanguage.trim() === "") {
                        console.warn("LocalizationService: Attempted to initialize with an invalid or empty language code.");
                        // Resolve immediately with current state if input is invalid.
                        return this._languageLoadPromiseContainer.promise;
                    }

                    const trimmedLanguage = desiredLanguage.trim();

                    // Only proceed if the desired language is different from the active one.
                    if (this.activeLanguage !== trimmedLanguage) {
                        console.info(`LocalizationService: Switching language from '${this.activeLanguage || "none"}' to '${trimmedLanguage}'.`);

                        // If there's an ongoing load, push its promise to the stack.
                        if (this._languageLoadPromiseContainer) {
                            this._pendingLocaleRequests.push(this._languageLoadPromiseContainer);
                        }

                        // Create a new deferred for the current request.
                        this._languageLoadPromiseContainer = $q.defer();
                        this.isReady = false;
                        this.activeLanguage = trimmedLanguage;

                        // Fetch translation data from the backend.
                        $http({
                            method: "GET",
                            url: `/assets/locales/${trimmedLanguage}.json`, // Changed URL path
                            cache: true,
                            params: { cacheBuster: Date.now() } // Added cache buster
                        })
                        .then(function(response) {
                            $rootScope.currentTranslations = response.data; // Renamed $rootScope property
                            self.isReady = true;
                            self._languageLoadPromiseContainer.resolve($rootScope.currentTranslations);

                            // Resolve all pending promises that were waiting for a language load.
                            while (self._pendingLocaleRequests.length > 0) {
                                const previousDeferred = self._pendingLocaleRequests.shift();
                                if (previousDeferred && previousDeferred.resolve) {
                                    previousDeferred.resolve($rootScope.currentTranslations);
                                }
                            }

                            $rootScope.$emit("LANGUAGE_REFRESHED"); // Renamed event
                            console.log(`LocalizationService: Language '${trimmedLanguage}' loaded and applied.`);
                        })
                        .catch(function(error) {
                            console.error(`LocalizationService: Failed to load language '${trimmedLanguage}'.`, error);
                            self._languageLoadPromiseContainer.reject(error); // Reject on failure
                            // Also reject pending requests if this is a critical failure.
                            while (self._pendingLocaleRequests.length > 0) {
                                const previousDeferred = self._pendingLocaleRequests.shift();
                                if (previousDeferred && previousDeferred.reject) {
                                    previousDeferred.reject(error);
                                }
                            }
                            $rootScope.$emit("LANGUAGE_LOAD_FAILED", trimmedLanguage); // New error event
                        });
                    }

                    return this._languageLoadPromiseContainer.promise;
                };

                /**
                 * Provides a promise that resolves with the translation manager instance once translations are loaded.
                 * @returns {Promise<translationManagerFactory>} A promise resolving to this service instance.
                 */
                this.getManagerInstance = function() {
                    const instancePromise = $q.defer();
                    this.awaitLanguageReady().then(function() {
                        instancePromise.resolve(self);
                    }).catch(function(error) {
                        instancePromise.reject(error);
                    });
                    return instancePromise.promise;
                };

                /**
                 * Returns a promise that resolves when the current language's translation map is successfully loaded.
                 * @returns {Promise<object>} A promise resolving to the translation map.
                 */
                this.awaitLanguageReady = function() {
                    return this._languageLoadPromiseContainer.promise;
                };

                /**
                 * Retrieves a nested translation object from the current catalog using object notation.
                 * @param {string} keyPath - The dot-separated path to the translation object (e.g., "messages.errors.generic").
                 * @returns {*} The found object or null if not found.
                 */
                this.retrieveNestedTranslation = function(keyPath) {
                    if (!$rootScope.currentTranslations || typeof keyPath !== "string" || keyPath.trim() === "") {
                        return null; // Return null if no translations or invalid path.
                    }

                    const pathSegments = keyPath.split(configurator.pathSeparator);
                    let currentObject = $rootScope.currentTranslations;

                    for (const segment of pathSegments) {
                        if (currentObject === null || typeof currentObject !== "object" || !currentObject.hasOwnProperty(segment)) {
                            return null; // Path segment not found or currentObject is not an object.
                        }
                        currentObject = currentObject[segment];
                    }
                    return currentObject;
                };

                /**
                 * Translates a given key using the currently loaded translation map.
                 * Supports `vsprintf` for parameter substitution if available.
                 * @param {string} translationKey - The key to look up (e.g., "greeting", "messages.welcome").
                 * @param {...any} substitutionArgs - Optional arguments for `vsprintf` substitution.
                 * @returns {string} The translated string, or the original key if no translation is found.
                 */
                this.translateString = function(translationKey, ...substitutionArgs) {
                    if (typeof translationKey !== "string" || translationKey.trim() === "") {
                        console.warn("LocalizationService: Attempted to translate an invalid or empty key.");
                        return ""; // Return empty string for invalid input.
                    }

                    if (!$rootScope.currentTranslations) {
                        return translationKey; // Return original key if translations aren't loaded.
                    }

                    let foundText = $rootScope.currentTranslations[translationKey] || this.retrieveNestedTranslation(translationKey);

                    if (!foundText) {
                        foundText = translationKey; // Default to original key if no translation found.

                        // Temporarily store the original string to prevent immediate re-requests for the same term.
                        $rootScope.currentTranslations[translationKey] = foundText;

                        // Notify backend about missing translation for potential future addition.
                        $http.get(`/api/localize/${self.activeLanguage}/${encodeURIComponent(translationKey)}`) // Changed endpoint
                            .then(function(response) {
                                // Update with actual translation from backend if available.
                                $rootScope.currentTranslations[translationKey] = response.data;
                            })
                            .catch(function(error) {
                                console.warn(`LocalizationService: Backend could not provide translation for '${translationKey}' in '${self.activeLanguage}'.`, error);
                            });
                    }

                    // Perform string substitution if `vsprintf` is available and arguments are provided.
                    if (substitutionArgs.length > 0 && typeof window.vsprintf === "function") {
                        try {
                            foundText = window.vsprintf(foundText, substitutionArgs);
                        } catch (e) {
                            console.error(`LocalizationService: Error during vsprintf for key '${translationKey}'.`, e);
                        }
                    } else if (substitutionArgs.length > 0 && typeof window.vsprintf !== "function") {
                        console.warn("LocalizationService: vsprintf function not found, cannot perform string substitution.");
                    }

                    return foundText;
                };

                /**
                 * Translates a given term, choosing between singular or plural versions based on a count.
                 * Supports `vsprintf` for parameter substitution.
                 * @param {number} itemQuantity - The numerical count determining singular/plural.
                 * @param {string} singularKey - The key for the singular form.
                 * @param {string} pluralKey - The key for the plural form (optional, defaults to singularKey if not provided).
                 * @param {...any} additionalArgs - Optional additional arguments for `vsprintf` substitution.
                 * @returns {string} The translated phrase, adjusted for count.
                 */
                this.translatePlural = function(itemQuantity, singularKey, pluralKey, ...additionalArgs) {
                    if (typeof itemQuantity !== "number" || isNaN(itemQuantity)) {
                        console.warn("LocalizationService: Pluralization requires a valid number for count.");
                        return this.translateString(singularKey, itemQuantity, ...additionalArgs); // Fallback to singular translation
                    }
                    if (typeof singularKey !== "string" || singularKey.trim() === "") {
                        console.warn("LocalizationService: Pluralization requires a valid singular key.");
                        return "";
                    }

                    if (!$rootScope.currentTranslations) {
                        return singularKey;
                    }

                    let pluralForms = $rootScope.currentTranslations[singularKey] || this.retrieveNestedTranslation(singularKey);

                    if (!pluralForms || typeof pluralForms.one === "undefined") { // Check for expected plural object structure
                        const effectivePluralKey = pluralKey || singularKey;
                        pluralForms = { one: singularKey, other: effectivePluralKey }; // Default if not found

                        // Temporarily store the default forms.
                        $rootScope.currentTranslations[singularKey] = pluralForms;

                        // Invoke backend to potentially add/fetch plural forms.
                        const pluralRequestUrl = `/api/localize/plural/${self.activeLanguage}/${encodeURIComponent(singularKey)}`; // Changed endpoint
                        $http.get(pluralRequestUrl, {
                            params: {
                                pluralForm: encodeURIComponent(effectivePluralKey), // Renamed param
                                quantity: encodeURIComponent(itemQuantity) // Renamed param
                            }
                        })
                        .then(function(response) {
                            if (response.data && (response.data.one || response.data.other)) {
                                $rootScope.currentTranslations[singularKey] = response.data;
                            }
                        })
                        .catch(function(error) {
                            console.warn(`LocalizationService: Backend could not provide plural translation for '${singularKey}' in '${self.activeLanguage}'.`, error);
                        });
                    }

                    let chosenTranslation = (itemQuantity === 1) ? pluralForms.one : pluralForms.other;

                    // Prepend the count to the substitution arguments for common pluralization patterns.
                    const finalSubstitutionArgs = [itemQuantity, ...additionalArgs];

                    // Perform string substitution if `vsprintf` is available.
                    if (typeof window.vsprintf === "function") {
                        try {
                            chosenTranslation = window.vsprintf(chosenTranslation, finalSubstitutionArgs);
                        } catch (e) {
                            console.error(`LocalizationService: Error during vsprintf for plural key '${singularKey}'.`, e);
                        }
                    } else if (finalSubstitutionArgs.length > 0 && typeof window.vsprintf !== "function") {
                        console.warn("LocalizationService: vsprintf function not found, cannot perform string substitution for plural form.");
                    }

                    return chosenTranslation;
                };
            };

            return new translationManagerFactory();
        }];
    });

    /**
     * Directive for localizing text content of an HTML element.
     * Usage: `<span localize-text="greeting.hello" item-count="userCount"></span>`
     */
    localizationModule.directive("localizeText", ["localizationService", "$rootScope", function(localizationService, $rootScope) {
        return {
            restrict: "A",
            link: function linkingLogic(scope, element, attributes) {
                console.log("localizeText directive linked.");

                /**
                 * Updates the element's text content with the translated string.
                 * @param {string} [textKey] - The translation key. Defaults to the value of 'localizeText' attribute.
                 * @param {number} [quantity] - The count for pluralization. Defaults to the value of 'itemCount' attribute.
                 */
                function refreshElementContent(textKey, quantity) {
                    const currentTextKey = (textKey || attributes.localizeText || "").trim();
                    const currentQuantity = quantity || getNumericAttributeValue();

                    if (!currentTextKey) {
                        element.text(""); // Clear if no key is provided.
                        return;
                    }

                    if (typeof currentQuantity === "number" && !isNaN(currentQuantity)) {
                        // If 'item-count' is provided, use pluralization.
                        element.text(localizationService.translatePlural(currentQuantity, currentTextKey));
                    } else {
                        // Otherwise, use singular translation.
                        element.text(localizationService.translateString(currentTextKey));
                    }
                }

                /**
                 * Retrieves the numeric value from the 'item-count' attribute.
                 * @returns {number|undefined} The parsed integer count or undefined if not present/invalid.
                 */
                function getNumericAttributeValue() {
                    const countAttr = attributes.itemCount;
                    if (countAttr) {
                        const parsed = parseInt(countAttr, 10);
                        return isNaN(parsed) ? undefined : parsed;
                    }
                    return undefined;
                }

                // Watch for changes in the 'localizeText' attribute and update.
                attributes.$observe("localizeText", function(newKey) {
                    refreshElementContent(newKey);
                });

                // Watch for changes in the 'itemCount' attribute and update.
                attributes.$observe("itemCount", function(newCount) {
                    refreshElementContent(attributes.localizeText, getNumericAttributeValue());
                });

                // Listen for language refresh events and update the text.
                $rootScope.$on("LANGUAGE_REFRESHED", function() {
                    refreshElementContent();
                });

                // Initial content update.
                refreshElementContent();
            }
        };
    }]);

    /**
     * Directive to explicitly set the application's language.
     * Usage: `<html ng-app="yourApp" set-application-language="de">`
     * Also watches `$rootScope.appLanguageCode` for dynamic changes.
     */
    localizationModule.directive("setApplicationLanguage", ["localizationService", "$rootScope", function(localizationService, $rootScope) {
        return {
            restrict: "A",
            link: function languageControlLink(scope, element, attributes) {
                console.log("setApplicationLanguage directive linked.");

                // Observe the attribute value and initialize the language.
                attributes.$observe("setApplicationLanguage", function(languageCode) {
                    if (languageCode && languageCode.trim() !== "") {
                        localizationService.initializeLanguage(languageCode);
                    } else {
                        console.warn("setApplicationLanguage: Empty or invalid language code provided in attribute.");
                    }
                });

                // Also watch for changes in a root scope variable to allow dynamic language switching.
                $rootScope.$watch("appLanguageCode", function(newCode, oldCode) {
                    if (newCode && newCode.trim() !== "" && newCode !== oldCode) {
                        console.log(`setApplicationLanguage: RootScope variable 'appLanguageCode' changed to '${newCode}'.`);
                        localizationService.initializeLanguage(newCode);
                    }
                });

                // Ensure initial language is set if attribute is present on link.
                if (attributes.setApplicationLanguage) {
                    localizationService.initializeLanguage(attributes.setApplicationLanguage);
                }
            }
        };
    }]);

    /**
     * Angular filter for convenient localization in templates.
     * Single phrase: `{{ "My phrase" | localize }}`
     * Pluralization: `{{ 2 | localize:"singular phrase":"plural phrase" }}`
     * With vsprintf args: `{{ "Hello %s" | localize:"World" }}`
     * Plural with vsprintf: `{{ 5 | localize:"%s item":"%s items": "more info" }}`
     */
    localizationModule.filter("localize", [
        "localizationService",
        function(localizationService) {
            /**
             * Checks if a given value is a number.
             * @param {*} value - The value to check.
             * @returns {boolean} True if the value is a number, false otherwise.
             */
            function isNumericValue(value) {
                return !isNaN(parseFloat(value)) && isFinite(value);
            }

            var localizationFilter = function(inputValue, ...filterArgs) {
                // If the input value is null or undefined, return it directly.
                if (inputValue === null || typeof inputValue === "undefined") {
                    return inputValue;
                }

                // If the input value is a number, assume pluralization is intended.
                if (isNumericValue(inputValue)) {
                    // The first argument after the count is the singular key, then plural, then vsprintf args.
                    const singularKey = filterArgs[0];
                    const pluralKey = filterArgs[1];
                    const vsprintfArgs = filterArgs.slice(2);
                    return localizationService.translatePlural(inputValue, singularKey, pluralKey, ...vsprintfArgs);
                }

                // Otherwise, assume it's a single translation key.
                // The input value itself is the key, and filterArgs are vsprintf arguments.
                return localizationService.translateString(inputValue, ...filterArgs);
            };

            // Mark the filter as stateful so it re-executes on language changes.
            localizationFilter.$stateful = true;
            return localizationFilter;
        }
    ]);
}());