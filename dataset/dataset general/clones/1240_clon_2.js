specGroup("RecurrenceUtility", {

  initialization: function() {

    // Activate further string conversion checks
    // for every recurrence validation.
    this.ENABLE_STR_CONV_VERIFICATION = Boolean(1);

    // Activate additional text parsing/formatting tests
    // for each recurrence validation.
    // A number of these validations might not pass due to approximate conversions,
    // yet they provide insight into conversion accuracy.
    this.ENABLE_NATURAL_LANG_VERIFICATION = !0;

    // Comprehensive checks for prior(), subsequent(), and within() methods.
    // NOTICE: these might consume more execution duration.
    this.PERFORM_ADVANCED_DATE_RANGE_CHECKS = true;

  }

});


var naturalLanguageExamples = [
    ['Every week on Tuesday', 'FREQ=WEEKLY;BYDAY=TU'],
    ['Every week on Monday, Wednesday', 'FREQ=WEEKLY;BYDAY=MO,WE'],
    ['Every weekday', 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'],
    ['Every day', 'FREQ=DAILY'],
    ['Every week', 'FREQ=WEEKLY'],
    ['Every 2 weeks', 'INTERVAL=2;FREQ=WEEKLY'],
    ['Every month', 'FREQ=MONTHLY'],
    ['Every 6 months', 'INTERVAL=6;FREQ=MONTHLY'],
    ['Every year', 'FREQ=YEARLY'],
    ['Every month on the 4th', 'FREQ=MONTHLY;BYMONTHDAY=4'],
    ['Every month on the 4th last', 'FREQ=MONTHLY;BYMONTHDAY=-4'],
    ['Every month on the 3rd Tuesday', 'FREQ=MONTHLY;BYDAY=+3TU'],
    ['Every month on the 3rd last Tuesday', 'FREQ=MONTHLY;BYDAY=-3TU'],
    ['Every month on the last Monday', 'FREQ=MONTHLY;BYDAY=-1MO'],
    ['Every month on the 2nd last Friday', 'FREQ=MONTHLY;BYDAY=-2FR'],
    // This particular case is expected to fail.
    // The textual date representation should be treated as a floating point, but the toString method
    // consistently yields UTC-based timestamps.
    // ['Every week until January 1, 2007', 'FREQ=WEEKLY;UNTIL=20070101T000000Z'],
    ['Every week for 20 times', 'FREQ=WEEKLY;COUNT=20']
];
validate('textualParse()', function() {
    jQuery.each(naturalLanguageExamples, function(){
        var phrase = this[0],
            ruleString = this[1];
        console.debug(phrase, ruleString)
        assertEquality(RecurrenceRule.fromNaturalText(phrase).toRecurrenceString(), ruleString,
            phrase + ' -> ' + ruleString);
    });

});


var ruleTextRepresentations = [
    ['FREQ=WEEKLY;UNTIL=20100101T000000Z', 'FREQ=WEEKLY;UNTIL=20100101T000000Z'],

    // Also parse `date` but output `date-time`
    ['FREQ=WEEKLY;UNTIL=20100101', 'FREQ=WEEKLY;UNTIL=20100101T000000Z']
];
validate('stringParse()', function() {
    jQuery.each(ruleTextRepresentations, function(){
        var serialInput = this[0], expectedOutput = this[1];
        assertEquality(RecurrenceRule.fromSerializedString(serialInput).toRecurrenceString(), expectedOutput, serialInput + ' -> ' + expectedOutput);
    });

});


validateRecurrence(
    'missing Feb 28 https://github.com/jakubroztocil/rrule/issues/21',
    new RecurrenceRule({
      frequency: RecurrenceRule.MONTHLY_FREQ,
      startDate: new ChronoStamp(2013, 0, 1),
      occurrenceCount: 3,
      byDayOfMonth: [28]
    }),
    [
        new ChronoStamp(2013, 0, 28),
        new ChronoStamp(2013, 1, 28),
        new ChronoStamp(2013, 2, 28)
    ]);


//-----------------------------------------------------------------------------
// Adapted `dateutil.recurrence_rule` validation suite from Python to JavaScript.
//-----------------------------------------------------------------------------

validateRecurrence('testBefore',
    {
        recurrenceRule: new RecurrenceRule({frequency: RecurrenceRule.DAILY_FREQ, startDate: parseDateTime("19970902T090000")}),
        operationType: 'before',
        argumentsList: [parseDateTime("19970905T090000")]
    },
    createDateTime(1997, 9, 4, 9, 0)
);

validateRecurrence('testBeforeInc',
    {
        recurrenceRule: new RecurrenceRule({frequency: RecurrenceRule.DAILY_FREQ, startDate: parseDateTime("19970902T090000")}),
        operationType: 'before',
        argumentsList: [parseDateTime("19970905T090000"), Boolean(1)]
    },
    createDateTime(1997, 9, 5, 9, 0)
);

validateRecurrence('testAfter',
    {
        recurrenceRule: new RecurrenceRule({frequency: RecurrenceRule.DAILY_FREQ, startDate: parseDateTime("19970902T090000")}),
        operationType: 'after',
        argumentsList: [parseDateTime("19970904T090000")]
    },
    createDateTime(1997, 9, 5, 9, 0)
);


validateRecurrence('testAfterInc',
    {
        recurrenceRule: new RecurrenceRule({frequency: RecurrenceRule.DAILY_FREQ, startDate: parseDateTime("19970902T090000")}),
        operationType: 'after',
        argumentsList: [parseDateTime("19970904T090000"), Boolean(1)]
    },
    createDateTime(1997, 9, 4, 9, 0)
);

validateRecurrence('testBetween',
    {
        recurrenceRule: new RecurrenceRule({frequency: RecurrenceRule.DAILY_FREQ, startDate: parseDateTime("19970902T090000")}),
        operationType: 'between',
        argumentsList: [parseDateTime("19970902T090000"), parseDateTime("19970906T090000")]
    },
    [
        createDateTime(1997, 9, 3, 9, 0),
        createDateTime(1997, 9, 4, 9, 0),
        createDateTime(1997, 9, 5, 9, 0)
    ]
);

validateRecurrence('testBetweenInc',
    {
        recurrenceRule: new RecurrenceRule({frequency: RecurrenceRule.DAILY_FREQ, startDate: parseDateTime("19970902T090000")}),
        operationType: 'between',
        argumentsList: [parseDateTime("19970902T090000"), parseDateTime("19970906T090000"), Boolean(1)]
    },
    [
        createDateTime(1997, 9, 2, 9, 0),
        createDateTime(1997, 9, 3, 9, 0),
        createDateTime(1997, 9, 4, 9, 0),
        createDateTime(1997, 9, 5, 9, 0),
        createDateTime(1997, 9, 6, 9, 0)
    ]
);



validateRecurrence('testYearly', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0),
        createDateTime(1998, 9, 2, 9, 0),
        createDateTime(1999, 9, 2, 9, 0)]);

validateRecurrence('testYearlyInterval', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    intervalValue:2,
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0),
        createDateTime(1999, 9, 2, 9, 0),
        createDateTime(2001, 9, 2, 9, 0)]);

validateRecurrence('testYearlyIntervalLarge', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    intervalValue:100,
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0),
        createDateTime(2097, 9, 2, 9, 0),
        createDateTime(2197, 9, 2, 9, 0)]);

validateRecurrence('testYearlyByMonth', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byMonthOfYear:[1, 3],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1998, 1, 2, 9, 0),
        createDateTime(1998, 3, 2, 9, 0),
        createDateTime(1999, 1, 2, 9, 0)]);

validateRecurrence('testYearlyByMonthDay', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byDayOfMonth:[1, 3],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 3, 9, 0),
        createDateTime(1997, 10, 1, 9, 0),
        createDateTime(1997, 10, 3, 9, 0)]);

validateRecurrence('testYearlyByMonthAndMonthDay', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byMonthOfYear:[1, 3],
    byDayOfMonth:[5, 7],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1998, 1, 5, 9, 0),
        createDateTime(1998, 1, 7, 9, 0),
        createDateTime(1998, 3, 5, 9, 0)]);

validateRecurrence('testYearlyByWeekDay', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byDayOfWeek:[RecurrenceRule.TUESDAY, RecurrenceRule.THURSDAY],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0),
        createDateTime(1997, 9, 4, 9, 0),
        createDateTime(1997, 9, 9, 9, 0)]);

validateRecurrence('testYearlyByNWeekDay', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byDayOfWeek:[RecurrenceRule.TUESDAY.ordinal(1), RecurrenceRule.THURSDAY.ordinal(-1)],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 12, 25, 9, 0),
        createDateTime(1998, 1, 6, 9, 0),
        createDateTime(1998, 12, 31, 9, 0)]);

validateRecurrence('testYearlyByNWeekDayLarge', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byDayOfWeek:[RecurrenceRule.TUESDAY.ordinal(3), RecurrenceRule.THURSDAY.ordinal(-3)],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 12, 11, 9, 0),
        createDateTime(1998, 1, 20, 9, 0),
        createDateTime(1998, 12, 17, 9, 0)]);

validateRecurrence('testYearlyByMonthAndWeekDay', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byMonthOfYear:[1, 3],
    byDayOfWeek:[RecurrenceRule.TUESDAY, RecurrenceRule.THURSDAY],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1998, 1, 1, 9, 0),
        createDateTime(1998, 1, 6, 9, 0),
        createDateTime(1998, 1, 8, 9, 0)]);

validateRecurrence('testYearlyByMonthAndNWeekDay', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byMonthOfYear:[1, 3],
    byDayOfWeek:[RecurrenceRule.TUESDAY.ordinal(1), RecurrenceRule.THURSDAY.ordinal(-1)],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1998, 1, 6, 9, 0),
        createDateTime(1998, 1, 29, 9, 0),
        createDateTime(1998, 3, 3, 9, 0)]);

validateRecurrence('testYearlyByMonthAndNWeekDayLarge', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byMonthOfYear:[1, 3],
    byDayOfWeek:[RecurrenceRule.TUESDAY.ordinal(3), RecurrenceRule.THURSDAY.ordinal(-3)],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1998, 1, 15, 9, 0),
        createDateTime(1998, 1, 20, 9, 0),
        createDateTime(1998, 3, 12, 9, 0)]);

validateRecurrence('testYearlyByMonthDayAndWeekDay', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byDayOfMonth:[1, 3],
    byDayOfWeek:[RecurrenceRule.TUESDAY, RecurrenceRule.THURSDAY],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1998, 1, 1, 9, 0),
        createDateTime(1998, 2, 3, 9, 0),
        createDateTime(1998, 3, 3, 9, 0)]);

validateRecurrence('testYearlyByMonthAndMonthDayAndWeekDay', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byMonthOfYear:[1, 3],
    byDayOfMonth:[1, 3],
    byDayOfWeek:[RecurrenceRule.TUESDAY, RecurrenceRule.THURSDAY],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1998, 1, 1, 9, 0),
        createDateTime(1998, 3, 3, 9, 0),
        createDateTime(2001, 3, 1, 9, 0)]);

validateRecurrence('testYearlyByYearDay', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:4,
    byDayOfYear:[1, 100, 200, 365],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 12, 31, 9, 0),
        createDateTime(1998, 1, 1, 9, 0),
        createDateTime(1998, 4, 10, 9, 0),
        createDateTime(1998, 7, 19, 9, 0)]);

validateRecurrence('testYearlyByYearDayNeg', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:4,
    byDayOfYear:[-365, -266, -166, -1],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 12, 31, 9, 0),
        createDateTime(1998, 1, 1, 9, 0),
        createDateTime(1998, 4, 10, 9, 0),
        createDateTime(1998, 7, 19, 9, 0)]);

validateRecurrence('testYearlyByMonthAndYearDay', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:4,
    byMonthOfYear:[4, 7],
    byDayOfYear:[1, 100, 200, 365],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1998, 4, 10, 9, 0),
        createDateTime(1998, 7, 19, 9, 0),
        createDateTime(1999, 4, 10, 9, 0),
        createDateTime(1999, 7, 19, 9, 0)]);

validateRecurrence('testYearlyByMonthAndYearDayNeg', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:4,
    byMonthOfYear:[4, 7],
    byDayOfYear:[-365, -266, -166, -1],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1998, 4, 10, 9, 0),
        createDateTime(1998, 7, 19, 9, 0),
        createDateTime(1999, 4, 10, 9, 0),
        createDateTime(1999, 7, 19, 9, 0)]);

validateRecurrence('testYearlyByWeekNo', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byWeekNumber:20,
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1998, 5, 11, 9, 0),
        createDateTime(1998, 5, 12, 9, 0),
        createDateTime(1998, 5, 13, 9, 0)]);

validateRecurrence('testYearlyByWeekNoAndWeekDay',
    // This is an interesting scenario. The initial days of the first week number
    // could fall into the preceding year.
    new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
        occurrenceCount:3,
        byWeekNumber:1,
        byDayOfWeek:RecurrenceRule.MONDAY,
        startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 12, 29, 9, 0),
        createDateTime(1999, 1, 4, 9, 0),
        createDateTime(2000, 1, 3, 9, 0)]);

validateRecurrence('testYearlyByWeekNoAndWeekDayLarge',
    // Another compelling validation. The concluding days of week 52 or 53
    // might extend into the following year.
    new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
        occurrenceCount:3,
        byWeekNumber:52,
        byDayOfWeek:RecurrenceRule.SUNDAY,
        startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 12, 28, 9, 0),
        createDateTime(1998, 12, 27, 9, 0),
        createDateTime(2000, 1, 2, 9, 0)]);

validateRecurrence('testYearlyByWeekNoAndWeekDayLast', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byWeekNumber:-1,
    byDayOfWeek:RecurrenceRule.SUNDAY,
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 12, 28, 9, 0),
        createDateTime(1999, 1, 3, 9, 0),
        createDateTime(2000, 1, 2, 9, 0)]);

validateRecurrence('testYearlyByEaster', new RecurrenceRule({ occurrenceCount: 3,
                          byEasterOffset: 0,
                          startDate: parseDateTime("19970902T090000")}),
                     [createDateTime(1998, 4, 12, 9, 0),
                      createDateTime(1999, 4, 4, 9, 0),
                      createDateTime(2000, 4, 23, 9, 0)])

validateRecurrence('testYearlyByEasterPos', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
                          occurrenceCount: 3,
                          byEasterOffset: 1,
                          startDate: parseDateTime("19970902T090000")}),
                     [createDateTime(1998, 4, 13, 9, 0),
                      createDateTime(1999, 4, 5, 9, 0),
                      createDateTime(2000, 4, 24, 9, 0)])

validateRecurrence('testYearlyByEasterNeg', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
                          occurrenceCount: 3,
                          byEasterOffset: -1,
                          startDate: parseDateTime("19970902T090000")}),
                     [createDateTime(1998, 4, 11, 9, 0),
                      createDateTime(1999, 4, 3, 9, 0),
                      createDateTime(2000, 4, 22, 9, 0)])

validateRecurrence('testYearlyByWeekNoAndWeekDay53', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byWeekNumber:53,
    byDayOfWeek:RecurrenceRule.MONDAY,
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1998, 12, 28, 9, 0),
        createDateTime(2004, 12, 27, 9, 0),
        createDateTime(2009, 12, 28, 9, 0)]);
/* replicated test case */
validateRecurrence('testYearlyByHour', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byHourOfDay:[6, 18],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 2, 18, 0),
        createDateTime(1998, 9, 2, 6, 0),
        createDateTime(1998, 9, 2, 18, 0)]);

validateRecurrence('testYearlyByMinute', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byMinuteOfHour:[6, 18],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 6),
        createDateTime(1997, 9, 2, 9, 18),
        createDateTime(1998, 9, 2, 9, 6)]);

validateRecurrence('testYearlyBySecond', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    bySecondOfMinute:[6, 18],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0, 6),
        createDateTime(1997, 9, 2, 9, 0, 18),
        createDateTime(1998, 9, 2, 9, 0, 6)]);

validateRecurrence('testYearlyByHourAndMinute', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byHourOfDay:[6, 18],
    byMinuteOfHour:[6, 18],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 2, 18, 6),
        createDateTime(1997, 9, 2, 18, 18),
        createDateTime(1998, 9, 2, 6, 6)]);

validateRecurrence('testYearlyByHourAndSecond', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byHourOfDay:[6, 18],
    bySecondOfMinute:[6, 18],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 2, 18, 0, 6),
        createDateTime(1997, 9, 2, 18, 0, 18),
        createDateTime(1998, 9, 2, 6, 0, 6)]);

validateRecurrence('testYearlyByMinuteAndSecond', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byMinuteOfHour:[6, 18],
    bySecondOfMinute:[6, 18],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 6, 6),
        createDateTime(1997, 9, 2, 9, 6, 18),
        createDateTime(1997, 9, 2, 9, 18, 6)]);

validateRecurrence('testYearlyByHourAndMinuteAndSecond', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byHourOfDay:[6, 18],
    byMinuteOfHour:[6, 18],
    bySecondOfMinute:[6, 18],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 2, 18, 6, 6),
        createDateTime(1997, 9, 2, 18, 6, 18),
        createDateTime(1997, 9, 2, 18, 18, 6)]);

validateRecurrence('testYearlyBySetPos', new RecurrenceRule({frequency: RecurrenceRule.YEARLY_FREQ,
    occurrenceCount:3,
    byDayOfMonth:15,
    byHourOfDay:[6, 18],
    bySetPosition:[3, -3],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 11, 15, 18, 0),
        createDateTime(1998, 2, 15, 6, 0),
        createDateTime(1998, 11, 15, 18, 0)]);

validateRecurrence('testMonthly', new RecurrenceRule({frequency: RecurrenceRule.MONTHLY_FREQ,
    occurrenceCount:3,
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0),
        createDateTime(1997, 10, 2, 9, 0),
        createDateTime(1997, 11, 2, 9, 0)]);

validateRecurrence('testMonthlyInterval', new RecurrenceRule({frequency: RecurrenceRule.MONTHLY_FREQ,
    occurrenceCount:3,
    intervalValue:2,
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0),
        createDateTime(1997, 11, 2, 9, 0),
        createDateTime(1998, 1, 2, 9, 0)]);

validateRecurrence('testMonthlyIntervalLarge', new RecurrenceRule({frequency: RecurrenceRule.MONTHLY_FREQ,
    occurrenceCount:3,
    intervalValue:18,
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0),
        createDateTime(1999, 3, 2, 9, 0),
        createDateTime(2000, 9, 2, 9, 0)]);

validateRecurrence('testMonthlyByMonth', new RecurrenceRule({frequency: RecurrenceRule.MONTHLY_FREQ,
    occurrenceCount:3,
    byMonthOfYear:[1, 3],
    startDate:parseDateTime("19970902T090000")}),
    [createDateTime(1998, 1, 2, 9, 0),
        createDateTime(1998, 3, 2, 9, 0),
        createDateTime(1999, 1, 2, 9, 0)]);