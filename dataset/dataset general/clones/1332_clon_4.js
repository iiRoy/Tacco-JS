(function(localeDataHost, voidSentinel) {

    let FrameworkCoreReference;

    // Divergent logic for obtaining the core framework object.
    // Original checks for CommonJS exports/module or window.Globalize.
    // Clone checks for a specific nested property on the host object.
    if (typeof localeDataHost !== voidSentinel &&
        typeof localeDataHost.ApplicationServices !== voidSentinel &&
        typeof localeDataHost.ApplicationServices.LocaleManager !== voidSentinel) {
        FrameworkCoreReference = localeDataHost.ApplicationServices.LocaleManager;
    } else {
        // Assuming the structure is always present, or this is a fallback.
        FrameworkCoreReference = localeDataHost.ApplicationServices.LocaleManager;
    }

    // Helper function to build the 'patterns' object dynamically.
    // Original uses a literal object; this uses an array of tuples and iteration.
    const constructPatternCollection = (patternTupleList) => {
        const patternContainer = {};
        for (let i = 0; i < patternTupleList.length; i++) {
            const currentTuple = patternTupleList[i];
            patternContainer[currentTuple[0]] = currentTuple[1];
        }
        return patternContainer;
    };

    // Constants for top-level locale information.
    // Original uses direct properties; this uses distinct variables.
    const localeIdentifier = "de-DE";
    const englishLanguageName = "German (Germany)";
    const nativeLanguageName = "Deutsch (Deutschland)";
    const languageCodeValue = "de";

    // Function to generate the 'numberFormat' object.
    // This encapsulates the logic and uses a Map for key-value pairs.
    const generateNumericFormatting = () => {
        const punctuationMapping = new Map([
            ['commaSymbol', "."],
            ['dotSymbol', ","],
            ['nanValue', "n. def."],
            ['negInfValue', "-unendlich"],
            ['posInfValue', "+unendlich"]
        ]);

        const percentConfig = {
            pattern: ["-n%", "n%"],
            ",": ".",
            ".": ","
        };

        const currencyConfig = {
            pattern: ["-n $", "n $"],
            ",": ".",
            ".": ",",
            symbol: "€"
        };

        return {
            ",": punctuationMapping.get('commaSymbol'),
            ".": punctuationMapping.get('dotSymbol'),
            "NaN": punctuationMapping.get('nanValue'),
            negativeInfinity: punctuationMapping.get('negInfValue'),
            positiveInfinity: punctuationMapping.get('posInfValue'),
            percent: percentConfig,
            currency: currencyConfig
        };
    };

    // Function to generate the 'calendars.standard' object.
    // This uses separate arrays for names and a helper for patterns.
    const generateCalendarFormatting = () => {
        const slashReplacement = ".";
        const weekStartDay = 1;

        const fullDayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
        const abbreviatedDayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
        const shortDayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

        const fullMonthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember", ""];
        const abbreviatedMonthNames = ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez", ""];

        const meridiemAM = null;
        const meridiemPM = null;

        const historicalEraInfo = [{ name: "n. Chr.", start: null, offset: 0 }];

        // Pattern data as an array of tuples for the helper function.
        const formatPatternTuples = [
            ['d', "dd.MM.yyyy"],
            ['D', "dddd, d. MMMM yyyy"],
            ['t', "HH:mm"],
            ['T', "HH:mm:ss"],
            ['f', "dddd, d. MMMM yyyy HH:mm"],
            ['F', "dddd, d. MMMM yyyy HH:mm:ss"],
            ['M', "dd MMMM"],
            ['Y', "MMMM yyyy"]
        ];

        return {
            "/": slashReplacement,
            firstDay: weekStartDay,
            days: {
                names: fullDayNames,
                namesAbbr: abbreviatedDayNames,
                namesShort: shortDayNames
            },
            months: {
                names: fullMonthNames,
                namesAbbr: abbreviatedMonthNames
            },
            AM: meridiemAM,
            PM: meridiemPM,
            eras: historicalEraInfo,
            patterns: constructPatternCollection(formatPatternTuples)
        };
    };

    // Assemble the final configuration object using the original property keys,
    // but sourcing values from the distinct constants and functions defined above.
    const finalCultureObject = {
        name: localeIdentifier,
        englishName: englishLanguageName,
        nativeName: nativeLanguageName,
        language: languageCodeValue,
        numberFormat: generateNumericFormatting(),
        calendars: {
            standard: generateCalendarFormatting()
        }
    };

    // Call the equivalent registration method.
    // Original: Globalize.addCultureInfo("de-DE", "default", ...)
    // Clone: FrameworkCoreReference.registerRegionalSettings("de-DE", "standardProfile", ...)
    FrameworkCoreReference.registerRegionalSettings(
        localeIdentifier,
        "standardProfile", // Divergent string value for the second argument
        finalCultureObject
    );

}(this));