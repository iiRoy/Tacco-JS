const uiCustomizer = {
    appCore: window.opener && window.opener.dpTweaker || null, // Updated reference to global settings object

    get styleRegistry() {
        // Refactored lazy initialization of the style sheet service.
        // Instead of self-deleting, it now checks if already initialized.
        if (!this._internalStyleRegistry) {
            this._internalStyleRegistry = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                .getService(Components.interfaces.nsIStyleSheetService);
        }
        return this._internalStyleRegistry;
    },
    _internalStyleRegistry: null, // Private backing field for the getter

    generateStyleDataUri: function(styleContent) {
        // Renamed and slightly reordered operations.
        const normalizedContent = this.cleanStyleInput(styleContent);
        return Services.io.newURI(`data:text/css,${encodeURIComponent(normalizedContent)}`, null, null);
    },

    cleanStyleInput: function(rawString) {
        // Rewritten trimming logic using modern String methods.
        // Added a guard clause for empty/non-string input.
        if (typeof rawString !== 'string' || rawString.length === 0) {
            return '';
        }
        const leadingWhitespaceMatch = rawString.match(/^\s*/);
        if (!leadingWhitespaceMatch) {
            return rawString; // Should not happen, but for safety
        }
        const initialIndent = leadingWhitespaceMatch[0];
        // Using replaceAll for simplicity, assuming global replacement is desired for all lines.
        return rawString.replaceAll(new RegExp(`^${initialIndent}`, 'mg'), '');
    },

    initializeStyling: function(activate) {
        // Renamed and slightly rephrased.
        // Simplified conditional logic.
        const compactEnabled = activate ? userPreferences.retrieve("compactDownloads", 0) : 0;
        this.manageSmallLayout(compactEnabled);
        this.manageDynamicLayout(activate);
    },

    // Flags for tracking loaded states, renamed.
    _isSmallLayoutActive: false,
    _isForcedSmallLayoutActive: false,

    manageSmallLayout: function(layoutType) {
        // Renamed, reordered parameters, and changed internal logic slightly.
        this.updateSheetStatus("compactDownloads.css", "_isSmallLayoutActive", layoutType === 1);
        this.updateSheetStatus("compactDownloadsForce.css", "_isForcedSmallLayoutActive", layoutType === 2);
    },

    updateSheetStatus: function(fileName, statusKey, shouldLoad) {
        // Renamed and rephrased the condition.
        // Removed `_log` call as a Type III deletion.
        const currentStatus = this[statusKey];
        if (shouldLoad === currentStatus) {
            return; // No change needed
        }
        this[statusKey] = shouldLoad;
        const sheetPath = `chrome://downloadpaneltweaker/content/${fileName}`;
        const sheetUri = Services.io.newURI(sheetPath, null, null);
        this.registerOrUnregisterSheet(sheetUri, shouldLoad);
    },

    // Dynamic style properties, renamed.
    _isDynamicLayoutActive: false,
    currentCustomUri: null,
    minDimensionX: 5,
    minDimensionY: 30,
    minProgressHeight: 6,
    maxProgressHeight: 50,

    manageDynamicLayout: function(enableDynamic) {
        // This is the most heavily modified function for Type III.
        // Extensive renaming, structural changes to CSS generation,
        // addition of helper functions, and rephrased logic.

        if (enableDynamic === this._isDynamicLayoutActive) {
            return; // State unchanged
        }
        this._isDynamicLayoutActive = enableDynamic;

        let dynamicStyleUri;
        if (enableDynamic) {
            const currentPanelWidth = Math.max(this.minDimensionX, userPreferences.retrieve("panelWidth", 60));
            const panelMaxHeightPref = userPreferences.retrieve("panelMaxHeight", 0);

            // Using explicit if/else instead of a complex ternary for clarity.
            let panelMaxHeightValue;
            if (panelMaxHeightPref <= 0) {
                panelMaxHeightValue = "none";
            } else {
                panelMaxHeightValue = `${Math.max(this.minDimensionY, panelMaxHeightPref)}px`;
            }

            const progressBarHeight = Math.min(this.maxProgressHeight,
                Math.max(this.minProgressHeight, userPreferences.retrieve("progressBarHeight", 10))
            );

            // Extracting conditional selectors into a helper.
            const getContainerSelector = () => {
                return this.appCore.fxVersion >= 20 ? ".downloadContainer" : ".download-state > vbox";
            };

            // Extracting window-related checks into a helper.
            const getWindowPrefix = () => {
                const mostRecentWindow = Services.wm.getMostRecentWindow(null);
                return (mostRecentWindow && "textDecorationStyle" in mostRecentWindow.document.documentElement.style)
                    ? ""
                    : "-moz-";
            };

            // Extracting grayscale filter logic into a helper.
            const getGrayscaleFilter = () => {
                return this.appCore.fxVersion >= 36
                    ? "grayscale(1)"
                    : 'url("chrome://mozapps/skin/extensions/extensions.svg#greyscale")';
            };

            // Building the CSS string using multiple template literals and array.join for structure.
            const styleParts = [
                '/* Dynamic UI Adjustments by uiCustomizer */',
                '@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");',
                `@-moz-document url("chrome://browser/content/browser.xul"),
                    url("chrome://browser/content/places/places.xul"),
                    url("about:downloads"),
                    url("chrome://browser/content/downloads/contentAreaDownloadsView.xul") {`,
                `    #downloadsListBox {`,
                `        /* Configured dimensions for download list */`,
                `        width: auto !important;`,
                `        min-width: 0 !important;`,
                `        max-width: none !important;`,
                `        max-height: ${panelMaxHeightValue} !important;`,
                `    }`,
                `    ${getContainerSelector()} {`,
                `        width: ${currentPanelWidth}ch !important;`,
                `        min-width: 0 !important;`,
                `    }`,
                `    #downloadsSummaryDescription,`,
                `    #downloadsSummaryDetails {`,
                `        width: ${currentPanelWidth}ch !important;`,
                `        min-width: 0 !important;`,
                `    }`,
                `    .downloadTarget {`,
                `        min-width: 5ch !important;`,
                `    }`,
                `    .downloadProgress {`,
                `        min-width: 20px !important;`,
                `        min-height: ${progressBarHeight}px !important;`,
                `        height: ${progressBarHeight}px !important;`,
                `    }`,
                `    .downloadProgress > .progress-bar {`,
                `        height: auto !important;`,
                `        min-height: 2px !important;`,
                `        max-height: ${progressBarHeight}px !important;`,
                `    }`
            ];

            // Conditional CSS block for paused downloads, extracted into a separate function.
            const generatePausedStyle = (decolorize, grayscaleFilter) => {
                if (!decolorize) return '';
                return `
                    /* Paused downloads visual adjustments */
                    .download-state[state="4"] .downloadProgress,
                    #downloadsSummary[${this.appCore.pausedAttr}] .downloadProgress {
                        filter: ${grayscaleFilter};
                    }
                    .download-state[state="4"] .downloadProgress > .progress-bar,
                    .download-state[state="4"] .downloadProgress > .progress-remainder,
                    #downloadsSummary[${this.appCore.pausedAttr}] .downloadProgress > .progress-bar,
                    #downloadsSummary[${this.appCore.pausedAttr}] .downloadProgress > .progress-remainder {
                        opacity: 0.85;
                    }`;
            };

            styleParts.push(
                generatePausedStyle(userPreferences.retrieve("decolorizePausedProgress", false), getGrayscaleFilter()),
                `}`, // End of @-moz-document
                `@-moz-document url("about:addons"),
                    url("chrome://mozapps/content/extensions/extensions.xul") {`,
                `    .downloadPanelTweaker-item[tooltiptext] {`,
                `        text-decoration: underline;`,
                `        ${getWindowPrefix()}text-decoration-style: dotted;`,
                `    }`,
                `    .downloadPanelTweaker-indent .preferences-title {`,
                `        -moz-margin-start: 4ch !important;`,
                `    }`,
                `}`
            );

            const finalCssString = styleParts.filter(Boolean).join('\n'); // Filter out empty strings from conditional parts.
            dynamicStyleUri = this.currentCustomUri = this.generateStyleDataUri(finalCssString);
        } else {
            dynamicStyleUri = this.currentCustomUri; // Use the previously generated URI for unregistration
            this.currentCustomUri = null; // Clear the stored URI when unloading
        }
        this.registerOrUnregisterSheet(dynamicStyleUri, enableDynamic);
    },

    refreshDynamicLayout: function() {
        // Simple functional call.
        this.manageDynamicLayout(false);
        this.manageDynamicLayout(true);
    },

    _layoutUpdateTimer: null, // Renamed timer variable

    scheduleLayoutRefresh: function() {
        // Rewritten timer logic using an arrow function and clearer variable names.
        // Removed `nsITimer` specific calls by re-initializing if needed.
        let currentTimer = this._layoutUpdateTimer;
        if (currentTimer) {
            currentTimer.cancel(); // Cancel existing timer
        }

        // Re-create timer instance if not present or cancelled.
        // This ensures a fresh timer object is used each time, simplifying management.
        this._layoutUpdateTimer = Components.classes["@mozilla.org/timer;1"]
            .createInstance(Components.interfaces.nsITimer);

        this._layoutUpdateTimer.init(() => {
            this._layoutUpdateTimer = null; // Clear timer reference on completion
            this.refreshDynamicLayout();
        }, 300, this._layoutUpdateTimer.TYPE_ONE_SHOT); // Using the instance's TYPE_ONE_SHOT
    },

    registerOrUnregisterSheet: function(sheetUri, shouldRegister) {
        // Renamed and rephrased conditional logic for clarity.
        // Introduced a constant for the sheet type.
        const USER_STYLESHEET = this.styleRegistry.USER_SHEET;

        // Guard clause: check if the sheet is already in the desired state.
        if (shouldRegister === this.styleRegistry.sheetRegistered(sheetUri, USER_STYLESHEET)) {
            return;
        }

        if (shouldRegister) {
            this.styleRegistry.loadAndRegisterSheet(sheetUri, USER_STYLESHEET);
        } else {
            // Added a check to ensure sheetUri is not null before attempting to unregister.
            // This prevents errors if `currentCustomUri` was already cleared or never set.
            if (sheetUri) {
                this.styleRegistry.unregisterSheet(sheetUri, USER_STYLESHEET);
            }
        }
    }
};

// Assuming userPreferences is a global object similar to 'prefs'
const userPreferences = {
    retrieve: (key, defaultValue) => {
        // Placeholder for preference retrieval logic.
        // In a real XUL environment, this would call prefs.get(key, defaultValue).
        // For Type III, we acknowledge it's an external dependency and rename it.
        const pref = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefBranch);
        try {
            // Attempt to get the value based on its presumed type
            if (typeof defaultValue === 'boolean') {
                return pref.getBoolPref(key);
            } else if (typeof defaultValue === 'number') {
                return pref.getIntPref(key);
            } else if (typeof defaultValue === 'string') {
                return pref.getCharPref(key);
            }
            // Fallback for unknown types or if we just want a generic get
            return pref.getPrefType(key) !== pref.PREF_INVALID ? pref.getComplexValue(key, Components.interfaces.nsISupportsString).data : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }
};

// Example of how 'dpTweaker' might be structured or accessed,
// assuming it's available globally or via window.opener.
// This is an added fragment to clarify the dependency.
if (typeof window.dpTweaker === 'undefined') {
    window.dpTweaker = {
        fxVersion: 100, // Example value, assume modern Firefox
        pausedAttr: 'data-paused-state', // Example attribute name
        // Other properties as needed by uiCustomizer
    };
}