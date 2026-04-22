/*
 * Internationalization Module: German (Germany) Locale Data
 *
 * This JavaScript file provides comprehensive cultural settings for the 'de-DE' locale.
 * It integrates with a broader globalization framework, typically referred to as 'CultureEngine'.
 * The data covers number, currency, percentage, calendar, and date/time formatting conventions.
 *
 * (c) 2024 Global Data Solutions GmbH. All rights reserved.
 * Distributed under the terms of the BSD 3-Clause License.
 *
 * For updates or corrections to this localization data, please refer to the primary
 * source repository and the automated data generation processes.
 */

(function( globalContext ) {
    "use strict"; // Enforce stricter parsing and error handling for this script.

    let CultureEngineCore; // The central object responsible for managing and applying culture data.
    const COMMON_NUMERIC_SEPARATORS = {
        grouping: ".",      // Separator for thousands (e.g., 1.000.000)
        decimal: ","        // Separator for decimal places (e.g., 1,23)
    };

    // Determine the runtime environment to correctly acquire the CultureEngineCore.
    // This supports CommonJS (Node.js), AMD (RequireJS), and global script inclusion.
    if ( typeof globalContext.process === "object" && typeof globalContext.process.versions === "object" && typeof globalContext.process.versions.node !== "undefined" ) {
        // Detected Node.js environment; attempt to load via CommonJS 'require'.
        try {
            CultureEngineCore = require( "culture-engine-core" );
        } catch ( loadingError ) {
            console.error("Critical Error: Failed to load 'culture-engine-core' module. Localization cannot be initialized.", loadingError);
            return; // Abort if the core engine is unavailable.
        }
    } else if ( typeof globalContext.define === "function" && globalContext.define.amd ) {
        // Detected Asynchronous Module Definition (AMD) loader, e.g., RequireJS.
        globalContext.define( ["culture-engine-core"], function( loadedEngine ) {
            CultureEngineCore = loadedEngine;
            // Once the engine is loaded asynchronously, proceed with data registration.
            processLocaleConfiguration( CultureEngineCore );
        });
        return; // AMD handles execution flow after dependency resolution.
    } else if ( typeof globalContext.CultureEngine !== "undefined" ) {
        // Fallback: Assume CultureEngine is available as a global variable.
        CultureEngineCore = globalContext.CultureEngine;
    } else {
        // If no known environment/engine found, issue a warning and exit.
        console.warn("CultureEngine not detected in any supported environment (Node.js, AMD, or global scope). 'de-DE' locale data cannot be registered.");
        return; // Exit as the engine is prerequisite.
    }

    /**
     * Encapsulates the logic for registering the 'de-DE' locale data with the CultureEngine.
     * @param {object} engineRef - A reference to the initialized CultureEngineCore.
     */
    function processLocaleConfiguration( engineRef ) {
        // Perform a sanity check on the engine reference and its registration method.
        if ( !engineRef || typeof engineRef.defineCultureSet !== "function" ) {
            console.error("CultureEngine reference is invalid or 'defineCultureSet' method is missing. Cannot register 'de-DE' locale.");
            return;
        }

        const currentLocaleKey = "de-DE";
        const defaultCategory = "primary"; // Renamed from "default" to "primary" for clarity.

        // Comprehensive culture settings for German (Germany).
        const germanCultureProfile = {
            localeKey: currentLocaleKey,
            standardEnglishName: "German (Germany)",
            nativeLanguageName: "Deutsch (Deutschland)",
            isoLanguageCode: "de", // ISO 639-1 language identifier.

            // Detailed configuration for numeric values.
            numericFormatting: {
                groupSeparator: COMMON_NUMERIC_SEPARATORS.grouping,
                decimalSeparator: COMMON_NUMERIC_SEPARATORS.decimal,
                nanRepresentation: "n.v.", // Updated "n. def." to "n.v." (nicht vorhanden - not available)
                negativeInfinityLabel: "minus unendlich", // More descriptive key and value.
                positiveInfinityLabel: "plus unendlich",  // More descriptive key and value.

                // Specific settings for percentage display.
                percentageDisplay: {
                    formatTemplates: { // Using an object for explicit positive/negative templates.
                        negative: "-n %",
                        positive: "n %"
                    },
                    groupSeparator: COMMON_NUMERIC_SEPARATORS.grouping,
                    decimalSeparator: COMMON_NUMERIC_SEPARATORS.decimal
                },

                // Specific settings for currency display.
                currencyDisplay: {
                    formatTemplates: { // Using an object for explicit positive/negative templates.
                        negative: "-n $",
                        positive: "n $"
                    },
                    groupSeparator: COMMON_NUMERIC_SEPARATORS.grouping,
                    decimalSeparator: COMMON_NUMERIC_SEPARATORS.decimal,
                    currencySymbol: "€" // Euro symbol.
                }
            },

            // Detailed configuration for calendar and date/time values.
            calendarAndDateSettings: {
                // The Gregorian calendar, designated as the primary calendar.
                primaryCalendar: {
                    dateComponentSeparator: ".", // Renamed from "/" to be more explicit.
                    weekBeginsOn: 1, // 1 = Monday (0 = Sunday in some systems).

                    // Definitions for days of the week.
                    weekDayNames: {
                        full: ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],
                        abbreviated: ["So","Mo","Di","Mi","Do","Fr","Sa"]
                        // 'short' names are omitted as they are identical to 'abbreviated' for 'de-DE'.
                    },

                    // Definitions for months of the year.
                    monthOfYearNames: {
                        full: ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
                        abbreviated: ["Jan","Feb","Mrz","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"]
                        // Trailing empty string removed from month arrays, assuming engine handles 1-based indexing or similar.
                    },

                    // Indicators for AM/PM (not typically used in German).
                    dayPeriodDesignators: {
                        morningIndicator: null, // Explicitly named AM/PM as morning/evening.
                        eveningIndicator: null
                    },

                    // Era definitions (e.g., AD/BC).
                    historicalEras: [
                        { eraIdentifier: "n. Chr.", eraStartPoint: null, eraOffsetFromEpoch: 0 } // Renamed keys for clarity.
                    ],

                    // Standard date and time formatting patterns.
                    dateTimeFormatPatterns: {
                        shortDatePattern: "dd.MM.yyyy",
                        longDatePattern: "dddd, d. MMMM yyyy",
                        shortTimePattern: "HH:mm",
                        longTimePattern: "HH:mm:ss",
                        fullDateShortTimePattern: "dddd, d. MMMM yyyy HH:mm", // Renamed from 'f'.
                        fullDateLongTimePattern: "dddd, d. MMMM yyyy HH:mm:ss", // Renamed from 'F'.
                        monthDayPattern: "dd MMMM", // Renamed from 'M'.
                        yearMonthPattern: "MMMM yyyy" // Renamed from 'Y'.
                    }
                }
            }
        };

        // Register the compiled locale data with the CultureEngine.
        engineRef.defineCultureSet( currentLocaleKey, defaultCategory, germanCultureProfile );
    }

    // If CultureEngineCore was immediately available (e.g., global script, not AMD),
    // proceed with the data registration. AMD calls processLocaleConfiguration via its callback.
    if ( CultureEngineCore && typeof CultureEngineCore.defineCultureSet === "function" ) {
        processLocaleConfiguration( CultureEngineCore );
    }

}( this )); // Using 'this' as the global context (window in browsers, global in Node.js).