/**
 * Dynamic Style Manager for Web Applications
 * https://github.com/your-repo/your-plugin
 *
 * Copyright (c) 2024 Your Name
 * Licensed under a custom license (e.g., BSD-3-Clause)
 */
;(function (jq, globalObj, domRoot, undefVal) {

    "use strict";

    // Store a reference to any previously defined plugin under this name
    const previousPluginRef = jq.fn.styleTogglePlugin;

    // A simple internal logging utility
    const internalLogger = {
        enabled: true, // Set to false to disable all logs
        log: function(msg, ...args) {
            if (this.enabled && globalObj.console && typeof globalObj.console.log === 'function') {
                globalObj.console.log(`[StyleToggle] ${msg}`, ...args);
            }
        },
        warn: function(msg, ...args) {
            if (this.enabled && globalObj.console && typeof globalObj.console.warn === 'function') {
                globalObj.console.warn(`[StyleToggle Warning] ${msg}`, ...args);
            }
        },
        error: function(msg, ...args) {
            if (this.enabled && globalObj.console && typeof globalObj.console.error === 'function') {
                globalObj.console.error(`[StyleToggle Error] ${msg}`, ...args);
            }
        }
    };

    /**
     * Helper function to manage cookie operations.
     * @param {string} key - The cookie key.
     * @param {string} value - The cookie value.
     * @param {object} options - Cookie options.
     * @returns {void}
     */
    function setCookieValue(key, value, options) {
        if (!jq.cookie) {
            internalLogger.warn("Attempted to set cookie, but jQuery.cookie plugin is not available.");
            return;
        }
        jq.cookie(key, value, options);
    }

    /**
     * Main class for managing dynamic stylesheets.
     * @class StyleToggleManager
     * @param {HTMLElement} element - The DOM element to associate with the plugin.
     * @param {object} initOptions - Configuration options for the manager.
     */
    const StyleToggleManager = function (element, initOptions) {

        // Reference to the jQuery wrapped DOM element
        this.targetElement = jq(element);

        // Merge default options with user-provided options
        this.config = Object.assign({}, jq.fn.styleTogglePlugin.defaultOptions, initOptions);

        // Initialize the collection of available themes
        this.availableThemes = [];

        // Fetch the theme data from configured sources
        this.fetchThemeSources();
    };

    /**
     * Prototype methods for StyleToggleManager.
     * @memberof StyleToggleManager
     */
    StyleToggleManager.prototype = {

        /**
         * Clears the content of the managed DOM element(s).
         * @returns {jQuery} The managed jQuery element(s).
         */
        resetDisplay: function () {
            internalLogger.log('Resetting plugin display for target elements.');
            const selfInstance = this;
            return selfInstance.targetElement.each(function () {
                jq(this).empty(); // Clear content for each matched element
            });
        },

        /**
         * Refreshes the list of themes and repopulates the control element.
         * @returns {void}
         */
        refreshSources: function () {
            internalLogger.log('Refreshing theme sources.');
            this.fetchThemeSources();
        },

        /**
         * Applies a specified CSS theme to the document.
         * @param {string} themeLabel - The display name of the theme.
         * @param {string} cssFilePath - The URL to the CSS file for the theme.
         * @returns {void}
         */
        applyThemeStyle: function (themeLabel, cssFilePath) {
            internalLogger.log(`Attempting to apply theme: "${themeLabel}", using CSS path: "${cssFilePath}"`);

            const currentConfig = Object.assign({}, jq.fn.styleTogglePlugin.defaultOptions, this.targetElement.data('styleTogglePlugin'));
            const styleLinkIdentifier = currentConfig.styleLinkIdentifier;

            // Ensure we have a valid CSS file path
            const finalCssPath = cssFilePath || this.config.defaultCssPath;
            const finalThemeLabel = themeLabel || finalCssPath;

            if (typeof finalCssPath !== 'string' || !finalCssPath.trim()) {
                internalLogger.error("Invalid CSS file path provided for theme application.");
                return;
            }

            // Remove any existing non-plugin Bootstrap stylesheets
            jq(`head link[href*="bootstrap.min.css"][id!="${styleLinkIdentifier}"]`).remove();

            // Locate or create the theme stylesheet link element
            const selectorString = `#${styleLinkIdentifier}`;
            let activeStyleLink = jq(selectorString);

            if (activeStyleLink.length === 0) {
                // If the link doesn't exist, create it
                const newLinkHtml = `<link rel="stylesheet" id="${styleLinkIdentifier}" href="${finalCssPath}" type="text/css" />`;
                const firstStylesheet = jq('head link[rel="stylesheet"]:first');

                if (firstStylesheet.length === 0) {
                    // If no stylesheets exist, append to head
                    jq('head').append(newLinkHtml);
                } else {
                    // Otherwise, insert before the first stylesheet
                    firstStylesheet.before(newLinkHtml);
                }
                // Re-select the newly created link
                activeStyleLink = jq(selectorString);
            }

            // Update the href attribute of the theme link
            activeStyleLink.attr('href', finalCssPath);

            // Check if the theme selection should be persisted
            if (currentConfig.persistSelection) {
                const cookieOptions = {
                    expires: currentConfig.cookieDurationDays,
                    path: currentConfig.cookiePath
                };
                setCookieValue(currentConfig.cookieThemeKey, finalThemeLabel, cookieOptions);
                setCookieValue(currentConfig.cookieCssKey, finalCssPath, cookieOptions);
            }
        },

        /**
         * Restores a previously saved theme from browser cookies.
         * @param {object} [options] - Optional configuration overrides.
         * @returns {void}
         */
        restoreThemeFromStorage: function (options) {
            if (!jq.cookie) {
                internalLogger.warn('Cannot restore theme from cookie: jQuery.cookie plugin is missing.');
                return;
            }

            const currentOptions = Object.assign({}, jq.fn.styleTogglePlugin.defaultOptions, options);
            const storedThemeName = jq.cookie(currentOptions.cookieThemeKey);
            const storedThemePath = jq.cookie(currentOptions.cookieCssKey);

            if (storedThemeName && storedThemePath) {
                internalLogger.log(`Restoring theme from cookie: ${storedThemeName} (${storedThemePath})`);
                this.applyThemeStyle(storedThemeName, storedThemePath);
            } else {
                internalLogger.log('No theme data found in cookies to restore.');
            }
        },

        /**
         * Inserts a new theme option into the available themes list.
         * @param {string} themeLabel - The name of the theme.
         * @param {string} stylePath - The CSS URL for the theme.
         * @param {number} [idx=0] - The starting index for insertion.
         * @param {number} [removeCount=0] - The number of elements to remove.
         * @returns {void}
         */
        insertThemeOption: function (themeLabel, stylePath, idx, removeCount) {
            const startIndex = idx === undefVal ? 0 : idx;
            const deleteCount = removeCount === undefVal ? 0 : removeCount;

            this.availableThemes.splice(startIndex, deleteCount, { label: themeLabel, styleUrl: stylePath });
            this.populateControlElement(); // Update the UI control
        },

        /**
         * Populates the plugin's control element (UL or SELECT) with theme options.
         * @returns {void}
         */
        populateControlElement: function () {
            const selfInstance = this;

            // Pre-validation for essential properties
            if (!selfInstance.targetElement || selfInstance.targetElement.length === 0) {
                internalLogger.error('Target element is not defined or does not exist. Cannot populate control.');
                return;
            }
            if (!selfInstance.availableThemes || selfInstance.availableThemes.length === 0) {
                internalLogger.warn('No themes available to populate the control element.');
                return;
            }

            let filteredThemes = [...selfInstance.availableThemes]; // Create a mutable copy

            // Handle Bootswatch exclusions if configured
            const excludedNamesStr = selfInstance.config.excludedBootswatchThemes || '';
            if (excludedNamesStr) {
                const excludedNames = excludedNamesStr.split(',')
                                                      .map(s => s.trim())
                                                      .filter(s => s); // Clean and filter empty strings

                if (excludedNames.length > 0) {
                    filteredThemes = filteredThemes.filter(themeEntry =>
                        themeEntry && themeEntry.label && !excludedNames.includes(themeEntry.label)
                    );
                    internalLogger.log(`Applied Bootswatch exclusions. Remaining themes: ${filteredThemes.length}`);
                }
            }

            // Clear existing options in the control
            selfInstance.targetElement.empty();

            // Determine if the target element is a UL or SELECT
            if (selfInstance.targetElement.is('ul')) {
                internalLogger.log('Populating UL element with theme options.');
                const currentActiveTheme = jq.cookie && jq.cookie(selfInstance.config.cookieThemeKey);

                filteredThemes.forEach(themeEntry => {
                    const isActive = (themeEntry.label === currentActiveTheme);
                    const listItem = jq('<li/>')
                        .addClass(isActive ? 'active' : '')
                        .append(jq('<a/>', { href: '#', text: themeEntry.label }))
                        .on('click', function (event) {
                            event.preventDefault(); // Prevent default link behavior
                            selfInstance.applyThemeStyle(themeEntry.label, themeEntry.styleUrl);

                            // Update active class on click
                            jq(this).closest('ul').children('li').removeClass('active');
                            jq(this).parent().addClass('active');
                        });
                    selfInstance.targetElement.append(listItem);
                });

            } else if (selfInstance.targetElement.is('select')) {
                internalLogger.log('Populating SELECT element with theme options.');
                const currentActiveTheme = jq.cookie && jq.cookie(selfInstance.config.cookieThemeKey);

                filteredThemes.forEach(themeEntry => {
                    const isSelected = (themeEntry.label === currentActiveTheme);
                    const optionElement = jq('<option/>', {
                        value: themeEntry.styleUrl,
                        text: themeEntry.label,
                        selected: isSelected
                    });
                    selfInstance.targetElement.append(optionElement);
                });

                // Attach change event handler for SELECT element
                selfInstance.targetElement.on('change', function () {
                    const selectedOption = jq('option:selected', this);
                    selfInstance.applyThemeStyle(selectedOption.text(), selectedOption.val());
                });

            } else {
                internalLogger.warn('StyleToggleManager only supports "ul" or "select" elements for control display.');
            }
        },

        /**
         * Fetches theme data from either a local feed or the Bootswatch API.
         * @returns {void}
         */
        fetchThemeSources: function () {
            const selfInstance = this;

            // Prioritize local feed if configured
            if (selfInstance.config.localThemeFeedUrl && selfInstance.config.localThemeFeedUrl.trim()) {
                internalLogger.log(`Fetching themes from local feed: ${selfInstance.config.localThemeFeedUrl}`);
                jq.ajax({
                    url: selfInstance.config.localThemeFeedUrl,
                    async: false, // Synchronous request to ensure themes are loaded before further operations
                    dataType: 'json',
                    success: function (response) {
                        if (response && Array.isArray(response.themes)) {
                            selfInstance.availableThemes = response.themes;
                            selfInstance.populateControlElement();
                        } else {
                            internalLogger.error(`Local feed "${selfInstance.config.localThemeFeedUrl}" did not return a valid 'themes' array.`);
                        }
                    },
                    error: function (xhr, status, error) {
                        internalLogger.error(`Failed to retrieve local theme feed from "${selfInstance.config.localThemeFeedUrl}": ${status} - ${error}`);
                    }
                });
                return; // Exit after attempting local feed
            }

            // If no local feed, attempt to load from Bootswatch API (if enabled)
            if (selfInstance.config.useBootswatchApi) {
                internalLogger.log(`Fetching themes from Bootswatch API: ${selfInstance.config.bootswatchApiBase}/${selfInstance.config.bootswatchApiVer}`);
                jq.ajax({
                    url: `${selfInstance.config.bootswatchApiBase}/${selfInstance.config.bootswatchApiVer}`,
                    async: false, // Synchronous request
                    dataType: 'json',
                    success: function (response) {
                        if (!response || !Array.isArray(response.themes)) {
                            internalLogger.warn('Bootswatch API response did not contain a valid themes array.');
                            return;
                        }
                        selfInstance.availableThemes = response.themes;
                        // Add a 'Default' theme option at the beginning
                        selfInstance.availableThemes.unshift({ label: 'Default Bootstrap', styleUrl: selfInstance.config.defaultCssPath });

                        selfInstance.populateControlElement();
                    },
                    error: function (xhr, status, error) {
                        internalLogger.error(`Failed to retrieve themes from Bootswatch API: ${status} - ${error}`);
                    }
                });
            } else {
                internalLogger.log('Neither local feed nor Bootswatch API enabled or configured.');
            }
        },

        /**
         * Manages the collection of themes.
         * If no argument is provided, returns the current theme list.
         * If a new list is provided, updates the theme list and repopulates the control.
         * @param {Array<object>} [newCollection] - An optional array of new theme objects.
         * @returns {Array<object>|void} The current theme list or nothing if updated.
         */
        manageThemeCollection: function (newCollection) {
            if (newCollection === undefVal) {
                return this.availableThemes;
            } else if (Array.isArray(newCollection)) {
                internalLogger.log('Updating theme collection with new data.');
                this.availableThemes = newCollection;
                this.populateControlElement(); // Refresh the display
            } else {
                internalLogger.warn('Attempted to set theme collection with an invalid data type. Must be an array.');
            }
        }
    };


    // jQuery plugin definition
    jq.fn.styleTogglePlugin = function (actionOrOptions) {
        const methodArgs = Array.from(arguments).slice(1);
        let returnedValue;

        // Iterate over each selected element
        this.each(function () {
            const currentElement = jq(this);
            let instanceData = currentElement.data('styleTogglePlugin');

            // Initialize the plugin if not already done
            if (!instanceData) {
                const initOptions = (typeof actionOrOptions === 'object' && actionOrOptions) || {};
                instanceData = new StyleToggleManager(this, initOptions);
                currentElement.data('styleTogglePlugin', instanceData);
            }

            // If the first argument is a string, attempt to call a prototype method
            if (typeof actionOrOptions === 'string') {
                if (typeof instanceData[actionOrOptions] === 'function') {
                    returnedValue = instanceData[actionOrOptions].apply(instanceData, methodArgs);
                } else {
                    internalLogger.error(`Method "${actionOrOptions}" does not exist on StyleToggleManager.`);
                }
            }
        });

        // Return the jQuery object for chaining, or the method's return value
        return (returnedValue === undefVal) ? this : returnedValue;
    };

    /**
     * Default configuration options for the StyleToggleManager plugin.
     * @memberof jQuery.fn.styleTogglePlugin
     * @property {string} styleLinkIdentifier - The ID for the dynamic CSS link element.
     * @property {boolean} persistSelection - Whether to save selected theme to cookies.
     * @property {string} cookieThemeKey - Cookie key for storing theme name.
     * @property {string} cookieCssKey - Cookie key for storing theme CSS path.
     * @property {number} cookieDurationDays - Duration (in days) for theme cookies.
     * @property {string} cookiePath - Path for theme cookies.
     * @property {string} defaultCssPath - Default CSS file path if none specified.
     * @property {string} bootswatchApiBase - Base URL for the Bootswatch API.
     * @property {string} bootswatchApiVer - Version of the Bootswatch API to use.
     * @property {boolean} useBootswatchApi - Whether to fetch themes from Bootswatch API.
     * @property {string} localThemeFeedUrl - URL for a local JSON theme feed.
     * @property {string} excludedBootswatchThemes - Comma-separated list of Bootswatch themes to exclude.
     */
    jq.fn.styleTogglePlugin.defaultOptions = {
        styleLinkIdentifier: 'dynamicStyleLink',
        persistSelection: true,
        cookieThemeKey: 'activeTheme.label',
        cookieCssKey: 'activeTheme.css',
        cookieDurationDays: 14,
        cookiePath: '/',
        defaultCssPath: '//cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css',
        bootswatchApiBase: 'https://api.bootswatch.com',
        bootswatchApiVer: '3',
        useBootswatchApi: true,
        localThemeFeedUrl: '',
        excludedBootswatchThemes: ''
    };

    // Expose the constructor for advanced usage
    jq.fn.styleTogglePlugin.ManagerClass = StyleToggleManager;

    /**
     * Restores the previous jQuery plugin definition if one existed, and returns this plugin.
     * @memberof jQuery.fn.styleTogglePlugin
     * @returns {jQuery.fn.styleTogglePlugin} The current plugin definition.
     */
    jq.fn.styleTogglePlugin.noConflictHandler = function () {
        jq.fn.styleTogglePlugin = previousPluginRef;
        return this; // Return the current plugin for potential re-assignment
    };

})(jQuery, window, document);