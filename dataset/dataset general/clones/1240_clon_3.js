testSuiteConfig("ScheduleGenerator", {

    // This block configures the testing environment for the ScheduleGenerator module.
    // It allows for dynamic activation or deactivation of certain test categories.
    contextInitializer: function() {
        // A flag indicating whether tests for string serialization (toString/fromString)
        // should be executed. Setting this to `true` enables these verification steps.
        this.runStringConversionsVerification = true;

        // A flag to control the execution of tests involving Natural Language Processing (NLP) functions.
        // These often involve approximate conversions, so they might be disabled for strict regression suites.
        this.runNaturalLanguageParsingVerification = false;

        // A flag to enable comprehensive tests for boundary conditions such as 'before', 'after', and 'between'.
        // These tests can be computationally intensive, hence the option to toggle them.
        this.runBoundaryConditionTests = true;

        // Adding a warning mechanism for potentially problematic test configurations.
        if (this.runNaturalLanguageParsingVerification && !this.runStringConversionsVerification) {
            console.warn("Warning: Natural language parsing tests might implicitly rely on string conversions. Consider activating 'runStringConversionsVerification' for a complete test coverage.");
        }
    }

});


// A collection of human-readable text descriptions and their corresponding
// canonical recurrence rule (RRule) string definitions.
var naturalLanguageExamples = [
    { phrase: 'Every week on Tuesday', definition: 'FREQ=WEEKLY;BYDAY=TU' },
    { phrase: 'Every week on Monday, Wednesday', definition: 'FREQ=WEEKLY;BYDAY=MO,WE' },
    { phrase: 'Every weekday', definition: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },
    { phrase: 'Every day', definition: 'FREQ=DAILY' },
    { phrase: 'Every week', definition: 'FREQ=WEEKLY' },
    { phrase: 'Every 2 weeks', definition: 'INTERVAL=2;FREQ=WEEKLY' },
    { phrase: 'Every month', definition: 'FREQ=MONTHLY' },
    { phrase: 'Every 6 months', definition: 'INTERVAL=6;FREQ=MONTHLY' },
    { phrase: 'Every year', definition: 'FREQ=YEARLY' },
    { phrase: 'Every month on the 4th', definition: 'FREQ=MONTHLY;BYMONTHDAY=4' },
    { phrase: 'Every month on the 4th last', definition: 'FREQ=MONTHLY;BYMONTHDAY=-4' },
    { phrase: 'Every month on the 3rd Tuesday', definition: 'FREQ=MONTHLY;BYDAY=+3TU' },
    { phrase: 'Every month on the 3rd last Tuesday', definition: 'FREQ=MONTHLY;BYDAY=-3TU' },
    { phrase: 'Every month on the last Monday', definition: 'FREQ=MONTHLY;BYDAY=-1MO' },
    { phrase: 'Every month on the 2nd last Friday', definition: 'FREQ=MONTHLY;BYDAY=-2FR' },
    // A test case that highlights potential inconsistencies due to date handling (e.g., UTC vs local).
    // The original RRule library might convert floating dates to UTC during toString().
    // { phrase: 'Every week until January 1, 2007', definition: 'FREQ=WEEKLY;UNTIL=20070101T000000Z' },
    { phrase: 'Every week for 20 times', definition: 'FREQ=WEEKLY;COUNT=20' }
];

verifyScenario('Parsing human-readable text descriptions into recurrence rules', function() {
    // This test block is conditionally executed based on the context initializer flag.
    if (!this.runNaturalLanguageParsingVerification) {
        // If NLP tests are not enabled, report a skipped status.
        assert.ok(true, "Natural language parsing verification skipped as per current configuration.");
        return;
    }

    naturalLanguageExamples.forEach(exampleItem => {
        const inputPhrase = exampleItem.phrase;
        const expectedDefinition = exampleItem.definition;

        // Implement a basic guard clause for null or empty input phrases.
        if (!inputPhrase || typeof inputPhrase !== 'string' || inputPhrase.trim().length === 0) {
            assert.fail(`Test failed: Invalid or empty input phrase provided: "${inputPhrase}"`);
            return;
        }

        // Attempt to parse the natural language phrase into a ScheduleGenerator rule.
        const generatedRule = ScheduleGenerator.fromText(inputPhrase);
        const actualDefinition = generatedRule.toString(); // Convert back to string for comparison.

        assertDeepEquality(actualDefinition, expectedDefinition,
            `Conversion from text: '${inputPhrase}' should yield: '${expectedDefinition}'`);
    });
});


// A collection of RRule string inputs and their expected canonical string representations
// after being processed by the ScheduleGenerator's deserialization and serialization methods.
var rruleSerializationCases = [
    // A standard RRule string, expected to remain identical after a round-trip.
    { input: 'FREQ=WEEKLY;UNTIL=20100101T000000Z', output: 'FREQ=WEEKLY;UNTIL=20100101T000000Z' },

    // An RRule string containing only a date, expected to be expanded to a full datetime in UTC.
    { input: 'FREQ=WEEKLY;UNTIL=20100101', output: 'FREQ=WEEKLY;UNTIL=20100101T000000Z' }
];

verifyScenario('Deserializing RRule strings and re-serializing to canonical format', function() {
    // This test block's execution is dependent on the 'runStringConversionsVerification' flag.
    if (!this.runStringConversionsVerification) {
        assert.ok(true, "String serialization/deserialization verification skipped as per current configuration.");
        return;
    }

    rruleSerializationCases.forEach(caseItem => {
        const rawStringInput = caseItem.input;
        const normalizedStringOutput = caseItem.output;

        // Adding a preliminary check for the input string format.
        // This acts as a simple validation step before attempting full parsing.
        if (!rawStringInput || !rawStringInput.includes('FREQ=')) {
            assert.fail(`Test failed: Malformed RRule string input: "${rawStringInput}"`);
            return;
        }

        // Parse the raw RRule string into a ScheduleGenerator instance.
        const parsedRule = ScheduleGenerator.fromString(rawStringInput);
        const actualNormalizedString = parsedRule.toString(); // Convert back to string for verification.

        assertDeepEquality(actualNormalizedString, normalizedStringOutput,
            `String input: '${rawStringInput}' should normalize to: '${normalizedStringOutput}'`);
    });

});

// Helper function to create options objects for the ScheduleGenerator constructor,
// allowing for cleaner and more consistent test case definitions.
function createRecurrenceRuleOptions(customSettings) {
    // Define a set of default options to ensure all necessary parameters are present.
    const baseSettings = {
        frequency: ScheduleGenerator.Frequency.YEARLY, // Default frequency for many tests.
        startDateTime: parseIsoDateTime("19970902T090000"), // A common starting point.
        maxOccurrences: 3 // A default limit for the number of occurrences.
    };
    // Merge custom settings over the base settings.
    return { ...baseSettings, ...customSettings };
}

// Function signature for validating recurrence patterns against expected date sequences.
// This is a renamed and potentially enhanced version of the original 'testRecurring'.
validateRecurrencePattern(
    'Edge case validation: Feb 28th and leap years handling (GitHub Issue #21)',
    new ScheduleGenerator({
      frequency: ScheduleGenerator.Frequency.MONTHLY,
      startDateTime: makeDateFromParts(2013, 1, 1), // Using 1-based month indexing for clarity (January = 1)
      maxOccurrences: 3,
      onMonthDays: [28] // Recur only on the 28th day of the month.
    }),
    [
        makeDateFromParts(2013, 1, 28), // January 28, 2013
        makeDateFromParts(2013, 2, 28), // February 28, 2013
        makeDateFromParts(2013, 3, 28)  // March 28, 2013
    ]);


//=============================================================================
// This section encompasses a comprehensive suite of recurrence rule tests,
// originally derived from the `dateutil.rrule` Python library and adapted for JavaScript.
//=============================================================================

// This entire block of boundary condition tests is subject to the 'runBoundaryConditionTests' flag.
if (this.runBoundaryConditionTests) {

    validateRecurrencePattern('Boundary check: retrieving the occurrence immediately preceding a given date',
        {
            recurrenceEngineInstance: new ScheduleGenerator({frequency: ScheduleGenerator.Frequency.DAILY, startDateTime: parseIsoDateTime("19970902T090000")}),
            queryMethod: 'getPreviousOccurrence', // Renamed method for improved semantic clarity.
            methodArguments: [parseIsoDateTime("19970905T090000")]
        },
        makeDateFromParts(1997, 9, 4, 9, 0)
    );

    validateRecurrencePattern('Boundary check: retrieving the occurrence preceding or on a given date (inclusive)',
        {
            recurrenceEngineInstance: new ScheduleGenerator({frequency: ScheduleGenerator.Frequency.DAILY, startDateTime: parseIsoDateTime("19970902T090000")}),
            queryMethod: 'getPreviousOccurrence',
            methodArguments: [parseIsoDateTime("19970905T090000"), true] // 'true' for inclusive search.
        },
        makeDateFromParts(1997, 9, 5, 9, 0)
    );

    validateRecurrencePattern('Boundary check: retrieving the occurrence immediately following a given date',
        {
            recurrenceEngineInstance: new ScheduleGenerator({frequency: ScheduleGenerator.Frequency.DAILY, startDateTime: parseIsoDateTime("19970902T090000")}),
            queryMethod: 'getNextOccurrence', // Renamed method.
            methodArguments: [parseIsoDateTime("19970904T090000")]
        },
        makeDateFromParts(1997, 9, 5, 9, 0)
    );


    validateRecurrencePattern('Boundary check: retrieving the occurrence following or on a given date (inclusive)',
        {
            recurrenceEngineInstance: new ScheduleGenerator({frequency: ScheduleGenerator.Frequency.DAILY, startDateTime: parseIsoDateTime("19970902T090000")}),
            queryMethod: 'getNextOccurrence',
            methodArguments: [parseIsoDateTime("19970904T090000"), true] // 'true' for inclusive search.
        },
        makeDateFromParts(1997, 9, 4, 9, 0)
    );

    validateRecurrencePattern('Boundary check: retrieving all occurrences falling strictly between two specified dates',
        {
            recurrenceEngineInstance: new ScheduleGenerator({frequency: ScheduleGenerator.Frequency.DAILY, startDateTime: parseIsoDateTime("19970902T090000")}),
            queryMethod: 'getOccurrencesBetween', // Renamed method.
            methodArguments: [parseIsoDateTime("19970902T090000"), parseIsoDateTime("19970906T090000")]
        },
        [
            makeDateFromParts(1997, 9, 3, 9, 0),
            makeDateFromParts(1997, 9, 4, 9, 0),
            makeDateFromParts(1997, 9, 5, 9, 0)
        ]
    );

    validateRecurrencePattern('Boundary check: retrieving all occurrences falling between or on two specified dates (inclusive)',
        {
            recurrenceEngineInstance: new ScheduleGenerator({frequency: ScheduleGenerator.Frequency.DAILY, startDateTime: parseIsoDateTime("19970902T090000")}),
            queryMethod: 'getOccurrencesBetween',
            methodArguments: [parseIsoDateTime("19970902T090000"), parseIsoDateTime("19970906T090000"), true] // 'true' for inclusive search.
        },
        [
            makeDateFromParts(1997, 9, 2, 9, 0),
            makeDateFromParts(1997, 9, 3, 9, 0),
            makeDateFromParts(1997, 9, 4, 9, 0),
            makeDateFromParts(1997, 9, 5, 9, 0),
            makeDateFromParts(1997, 9, 6, 9, 0)
        ]
    );

} // End of conditional block for boundary condition tests.


validateRecurrencePattern('Yearly recurrence: verifying basic annual occurrences',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 2, 9, 0),
        makeDateFromParts(1998, 9, 2, 9, 0),
        makeDateFromParts(1999, 9, 2, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: with a custom interval of two years',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        stepInterval: 2, // Recur every 2 years.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 2, 9, 0),
        makeDateFromParts(1999, 9, 2, 9, 0),
        makeDateFromParts(2001, 9, 2, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: with a significantly large interval (100 years)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        stepInterval: 100, // Recur every 100 years.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 2, 9, 0),
        makeDateFromParts(2097, 9, 2, 9, 0),
        makeDateFromParts(2197, 9, 2, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: restricted to specific months (January and March)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onMonths: [1, 3], // Renamed 'bymonth' to 'onMonths'.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1998, 1, 2, 9, 0),
        makeDateFromParts(1998, 3, 2, 9, 0),
        makeDateFromParts(1999, 1, 2, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: restricted to specific days of the month (1st and 3rd)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onMonthDays: [1, 3], // Renamed 'bymonthday' to 'onMonthDays'.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 3, 9, 0),
        makeDateFromParts(1997, 10, 1, 9, 0),
        makeDateFromParts(1997, 10, 3, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: combination of specific months and month days',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onMonths: [1, 3],
        onMonthDays: [5, 7],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1998, 1, 5, 9, 0),
        makeDateFromParts(1998, 1, 7, 9, 0),
        makeDateFromParts(1998, 3, 5, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: restricted to specific weekdays (Tuesday and Thursday)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onWeekDays: [ScheduleGenerator.Weekday.TUESDAY, ScheduleGenerator.Weekday.THURSDAY], // Renamed RRule.TU/TH.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 2, 9, 0),
        makeDateFromParts(1997, 9, 4, 9, 0),
        makeDateFromParts(1997, 9, 9, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: by Nth weekday (1st Tuesday, last Thursday)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onWeekDays: [ScheduleGenerator.Weekday.TUESDAY.nth(1), ScheduleGenerator.Weekday.THURSDAY.nth(-1)],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 12, 25, 9, 0),
        makeDateFromParts(1998, 1, 6, 9, 0),
        makeDateFromParts(1998, 12, 31, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: by large Nth weekday (3rd Tuesday, 3rd to last Thursday)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onWeekDays: [ScheduleGenerator.Weekday.TUESDAY.nth(3), ScheduleGenerator.Weekday.THURSDAY.nth(-3)],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 12, 11, 9, 0),
        makeDateFromParts(1998, 1, 20, 9, 0),
        makeDateFromParts(1998, 12, 17, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: combination of months and weekdays',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onMonths: [1, 3],
        onWeekDays: [ScheduleGenerator.Weekday.TUESDAY, ScheduleGenerator.Weekday.THURSDAY],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1998, 1, 1, 9, 0),
        makeDateFromParts(1998, 1, 6, 9, 0),
        makeDateFromParts(1998, 1, 8, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: combination of months and Nth weekdays',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onMonths: [1, 3],
        onWeekDays: [ScheduleGenerator.Weekday.TUESDAY.nth(1), ScheduleGenerator.Weekday.THURSDAY.nth(-1)],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1998, 1, 6, 9, 0),
        makeDateFromParts(1998, 1, 29, 9, 0),
        makeDateFromParts(1998, 3, 3, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: combination of months and large Nth weekdays',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onMonths: [1, 3],
        onWeekDays: [ScheduleGenerator.Weekday.TUESDAY.nth(3), ScheduleGenerator.Weekday.THURSDAY.nth(-3)],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1998, 1, 15, 9, 0),
        makeDateFromParts(1998, 1, 20, 9, 0),
        makeDateFromParts(1998, 3, 12, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: combination of month days and weekdays',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onMonthDays: [1, 3],
        onWeekDays: [ScheduleGenerator.Weekday.TUESDAY, ScheduleGenerator.Weekday.THURSDAY],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1998, 1, 1, 9, 0),
        makeDateFromParts(1998, 2, 3, 9, 0),
        makeDateFromParts(1998, 3, 3, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: intricate combination of months, month days, and weekdays',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onMonths: [1, 3],
        onMonthDays: [1, 3],
        onWeekDays: [ScheduleGenerator.Weekday.TUESDAY, ScheduleGenerator.Weekday.THURSDAY],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1998, 1, 1, 9, 0),
        makeDateFromParts(1998, 3, 3, 9, 0),
        makeDateFromParts(2001, 3, 1, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: by specific year days',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 4,
        onYearDays: [1, 100, 200, 365], // Renamed 'byyearday' to 'onYearDays'.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 12, 31, 9, 0), // Adjusted expected dates for clarity if year 365 is last day
        makeDateFromParts(1998, 1, 1, 9, 0),
        makeDateFromParts(1998, 4, 10, 9, 0),
        makeDateFromParts(1998, 7, 19, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: by negative year days (counting from end of year)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 4,
        onYearDays: [-365, -266, -166, -1], // Renamed 'byyearday' to 'onYearDays'.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 12, 31, 9, 0), // Adjusted expected dates
        makeDateFromParts(1998, 1, 1, 9, 0),
        makeDateFromParts(1998, 4, 10, 9, 0),
        makeDateFromParts(1998, 7, 19, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: by combination of months and year days',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 4,
        onMonths: [4, 7],
        onYearDays: [1, 100, 200, 365],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1998, 4, 10, 9, 0),
        makeDateFromParts(1998, 7, 19, 9, 0),
        makeDateFromParts(1999, 4, 10, 9, 0),
        makeDateFromParts(1999, 7, 19, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: by combination of months and negative year days',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 4,
        onMonths: [4, 7],
        onYearDays: [-365, -266, -166, -1],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1998, 4, 10, 9, 0),
        makeDateFromParts(1998, 7, 19, 9, 0),
        makeDateFromParts(1999, 4, 10, 9, 0),
        makeDateFromParts(1999, 7, 19, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: by specific ISO week number (20th week)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onWeekNumbers: [20], // Renamed 'byweekno' to 'onWeekNumbers'.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1998, 5, 11, 9, 0),
        makeDateFromParts(1998, 5, 12, 9, 0),
        makeDateFromParts(1998, 5, 13, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: by week number and weekday (Week 1, Monday - start of year edge case)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onWeekNumbers: [1],
        onWeekDays: ScheduleGenerator.Weekday.MONDAY,
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 12, 29, 9, 0),
        makeDateFromParts(1999, 1, 4, 9, 0),
        makeDateFromParts(2000, 1, 3, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: by week number and weekday (Week 52, Sunday - end of year edge case)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onWeekNumbers: [52],
        onWeekDays: ScheduleGenerator.Weekday.SUNDAY,
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 12, 28, 9, 0),
        makeDateFromParts(1998, 12, 27, 9, 0),
        makeDateFromParts(2000, 1, 2, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: by last week number and weekday (last Sunday of the year)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onWeekNumbers: [-1], // Refers to the last week of the year.
        onWeekDays: ScheduleGenerator.Weekday.SUNDAY,
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 12, 28, 9, 0),
        makeDateFromParts(1999, 1, 3, 9, 0),
        makeDateFromParts(2000, 1, 2, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: based on Easter Sunday (offset 0)',
    new ScheduleGenerator({ // Using direct constructor as helper defaults might not fit here.
        maxOccurrences: 3,
        relativeToEaster: 0, // Renamed 'byeaster' to 'relativeToEaster'.
        startDateTime: parseIsoDateTime("19970902T090000")
    }),
    [makeDateFromParts(1998, 4, 12, 9, 0),
        makeDateFromParts(1999, 4, 4, 9, 0),
        makeDateFromParts(2000, 4, 23, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: based on Easter Sunday (positive offset)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        relativeToEaster: 1, // Day after Easter.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1998, 4, 13, 9, 0),
        makeDateFromParts(1999, 4, 5, 9, 0),
        makeDateFromParts(2000, 4, 24, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: based on Easter Sunday (negative offset)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        relativeToEaster: -1, // Day before Easter.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1998, 4, 11, 9, 0),
        makeDateFromParts(1999, 4, 3, 9, 0),
        makeDateFromParts(2000, 4, 22, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: by week number 53 and weekday (specific Monday)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onWeekNumbers: [53],
        onWeekDays: ScheduleGenerator.Weekday.MONDAY,
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1998, 12, 28, 9, 0),
        makeDateFromParts(2004, 12, 27, 9, 0),
        makeDateFromParts(2009, 12, 28, 9, 0)]);

validateRecurrencePattern('Yearly recurrence: by specific hours of the day (6 AM and 6 PM)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        atHours: [6, 18], // Renamed 'byhour' to 'atHours'.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 2, 18, 0),
        makeDateFromParts(1998, 9, 2, 6, 0),
        makeDateFromParts(1998, 9, 2, 18, 0)]);

validateRecurrencePattern('Yearly recurrence: by specific minutes of the hour (6 and 18 minutes)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        atMinutes: [6, 18], // Renamed 'byminute' to 'atMinutes'.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 2, 9, 6),
        makeDateFromParts(1997, 9, 2, 9, 18),
        makeDateFromParts(1998, 9, 2, 9, 6)]);

validateRecurrencePattern('Yearly recurrence: by specific seconds of the minute (6 and 18 seconds)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        atSeconds: [6, 18], // Renamed 'bysecond' to 'atSeconds'.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 2, 9, 0, 6),
        makeDateFromParts(1997, 9, 2, 9, 0, 18),
        makeDateFromParts(1998, 9, 2, 9, 0, 6)]);

validateRecurrencePattern('Yearly recurrence: by combination of hours and minutes',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        atHours: [6, 18],
        atMinutes: [6, 18],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 2, 18, 6),
        makeDateFromParts(1997, 9, 2, 18, 18),
        makeDateFromParts(1998, 9, 2, 6, 6)]);

validateRecurrencePattern('Yearly recurrence: by combination of hours and seconds',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        atHours: [6, 18],
        atSeconds: [6, 18],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 2, 18, 0, 6),
        makeDateFromParts(1997, 9, 2, 18, 0, 18),
        makeDateFromParts(1998, 9, 2, 6, 0, 6)]);

validateRecurrencePattern('Yearly recurrence: by combination of minutes and seconds',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        atMinutes: [6, 18],
        atSeconds: [6, 18],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 2, 9, 6, 6),
        makeDateFromParts(1997, 9, 2, 9, 6, 18),
        makeDateFromParts(1997, 9, 2, 9, 18, 6)]);

validateRecurrencePattern('Yearly recurrence: by combination of hours, minutes, and seconds',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        atHours: [6, 18],
        atMinutes: [6, 18],
        atSeconds: [6, 18],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 2, 18, 6, 6),
        makeDateFromParts(1997, 9, 2, 18, 6, 18),
        makeDateFromParts(1997, 9, 2, 18, 18, 6)]);

validateRecurrencePattern('Yearly recurrence: by set position (3rd and 3rd to last in set)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.YEARLY,
        maxOccurrences: 3,
        onMonthDays: 15,
        atHours: [6, 18],
        byPositionInSet: [3, -3], // Renamed 'bysetpos' to 'byPositionInSet'.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 11, 15, 18, 0),
        makeDateFromParts(1998, 2, 15, 6, 0),
        makeDateFromParts(1998, 11, 15, 18, 0)]);

validateRecurrencePattern('Monthly recurrence: verifying basic monthly occurrences',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.MONTHLY,
        maxOccurrences: 3,
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 2, 9, 0),
        makeDateFromParts(1997, 10, 2, 9, 0),
        makeDateFromParts(1997, 11, 2, 9, 0)]);

validateRecurrencePattern('Monthly recurrence: with a custom interval of two months',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.MONTHLY,
        maxOccurrences: 3,
        stepInterval: 2, // Recur every 2 months.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 2, 9, 0),
        makeDateFromParts(1997, 11, 2, 9, 0),
        makeDateFromParts(1998, 1, 2, 9, 0)]);

validateRecurrencePattern('Monthly recurrence: with a significantly large interval (18 months)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.MONTHLY,
        maxOccurrences: 3,
        stepInterval: 18, // Recur every 18 months.
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1997, 9, 2, 9, 0),
        makeDateFromParts(1999, 3, 2, 9, 0),
        makeDateFromParts(2000, 9, 2, 9, 0)]);

validateRecurrencePattern('Monthly recurrence: restricted to specific months (January and March)',
    new ScheduleGenerator(createRecurrenceRuleOptions({
        frequency: ScheduleGenerator.Frequency.MONTHLY,
        maxOccurrences: 3,
        onMonths: [1, 3],
        startDateTime: parseIsoDateTime("19970902T090000")
    })),
    [makeDateFromParts(1998, 1, 2, 9, 0),
        makeDateFromParts(1998, 3, 2, 9, 0),
        makeDateFromParts(1999, 1, 2, 9, 0)]);