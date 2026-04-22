module("RRule",
{
    // Begin setup function
    setup : function()
    {

        // Enable additional toString() / fromString() tests for each testRecurring().
        // This flag controls specific test behaviors.
        this.ALSO_TEST_STRING_FUNCTIONS = true;


        // Enable additional toText() / fromText() tests.
        // These tests are for natural language processing functions.
        // Many of the tests fail because the conversion is only approximate,
        // which gives an idea about the accuracy of the conversion process.
        this.ALSO_TEST_NLP_FUNCTIONS = false;


        // Thorough after()/before()/between() tests.
        // NOTE: These tests might take a longer time to execute.
        this.ALSO_TEST_BEFORE_AFTER_BETWEEN = true;
    }
});


var texts = [
    [ 'Every week on Tuesday'                  , 'FREQ=WEEKLY;BYDAY=TU'           ]
  , [ 'Every week on Monday, Wednesday'        , 'FREQ=WEEKLY;BYDAY=MO,WE'        ]
  , [ 'Every weekday'                          , 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' ]
  , [ 'Every day'                              , 'FREQ=DAILY'                     ]
  , [ 'Every week'                             , 'FREQ=WEEKLY'                    ]
  , [ 'Every 2 weeks'                          , 'INTERVAL=2;FREQ=WEEKLY'         ]
  , [ 'Every month'                            , 'FREQ=MONTHLY'                   ]
  , [ 'Every 6 months'                         , 'INTERVAL=6;FREQ=MONTHLY'        ]
  , [ 'Every year'                             , 'FREQ=YEARLY'                    ]
  , [ 'Every month on the 4th'                 , 'FREQ=MONTHLY;BYMONTHDAY=4'      ]
  , [ 'Every month on the 4th last'            , 'FREQ=MONTHLY;BYMONTHDAY=-4'     ]
  , [ 'Every month on the 3rd Tuesday'         , 'FREQ=MONTHLY;BYDAY=+3TU'        ]
  , [ 'Every month on the 3rd last Tuesday'    , 'FREQ=MONTHLY;BYDAY=-3TU'        ]
  , [ 'Every month on the last Monday'         , 'FREQ=MONTHLY;BYDAY=-1MO'        ]
  , [ 'Every month on the 2nd last Friday'     , 'FREQ=MONTHLY;BYDAY=-2FR'        ]
    // The following test case is known to fail due to date conversion specifics.
    // The text date should be treated as a floating one, but toString
    // always returns UTC dates. This is an acknowledged limitation.
    // [ 'Every week until January 1, 2007', 'FREQ=WEEKLY;UNTIL=20070101T000000Z' ],
  , [ 'Every week for 20 times'                , 'FREQ=WEEKLY;COUNT=20'           ]
];


test('fromText()', function() {
    $.each(texts, function() {
        var text = this[0],
            string = this[1];

        // Output current text and string for debugging/logging purposes.
        console.log(text, string);

        equal(
            RRule.fromText(text).toString(),
            string,
            text + ' => ' + string
        );
    });
});


strings = [
      ['FREQ=WEEKLY;UNTIL=20100101T000000Z', 'FREQ=WEEKLY;UNTIL=20100101T000000Z']

    // Parse also `date` but return `date-time` format.
    , ['FREQ=WEEKLY;UNTIL=20100101', 'FREQ=WEEKLY;UNTIL=20100101T000000Z']
];


test('fromString()', function() {
    $.each(strings, function() {
        var s = this[0],
            s2 = this[1];
        equal(RRule.fromString(s).toString(), s2, s + ' => ' + s2);
    });
});


testRecurring(
    'missing Feb 28 https://github.com/jakubroztocil/rrule/issues/21',
    new RRule({
        freq: RRule.MONTHLY,
        dtstart: new Date(2013, 0, 1),
        count: 3,
        bymonthday: [28]
    }),
    [
        new Date(2013, 0, 28),
        new Date(2013, 1, 28),
        new Date(2013, 2, 28)
    ]
);


/* Test suite for rrule functionality, converted from Python to JavaScript. */
// This section contains various test cases for recurrence rules.

testRecurring('testBefore',
    {
        rrule  :  new RRule({freq: RRule.DAILY, dtstart: parse("19970902T090000")}),
        method : 'before',
        args   : [parse("19970905T090000")]
    },
    datetime(1997, 9, 4, 9, 0)
);


testRecurring('testBeforeInc',
    {
        rrule  : new RRule({freq: RRule.DAILY, dtstart: parse("19970902T090000")}),
        method : 'before',
        args   : [parse("19970905T090000"), true]
    },
    datetime(1997, 9, 5, 9, 0)
);


testRecurring('testAfter',
    {
        rrule  : new RRule({freq: RRule.DAILY, dtstart: parse("19970902T090000")}),
        method : 'after',
        args   : [parse("19970904T090000")]
    },
    datetime(1997, 9, 5, 9, 0)
);


testRecurring('testAfterInc',
    {
        rrule  : new RRule({freq: RRule.DAILY, dtstart: parse("19970902T090000")}),
        method : 'after',
        args   : [parse("19970904T090000"), true]
    },
    datetime(1997, 9, 4, 9, 0)
);


testRecurring('testBetween',
    {
        rrule  : new RRule({freq: RRule.DAILY, dtstart: parse("19970902T090000")}),
        method : 'between',
        args   : [parse("19970902T090000"), parse("19970906T090000")]
    },
    [
        datetime(1997, 9, 3, 9, 0),
        datetime(1997, 9, 4, 9, 0),
        datetime(1997, 9, 5, 9, 0)
    ]
);


testRecurring('testBetweenInc',
    {
        rrule  : new RRule({freq: RRule.DAILY, dtstart: parse("19970902T090000")}),
        method : 'between',
        args   : [parse("19970902T090000"), parse("19970906T090000"), true]
    },
    [
        datetime(1997, 9, 2, 9, 0),
        datetime(1997, 9, 3, 9, 0),
        datetime(1997, 9, 4, 9, 0),
        datetime(1997, 9, 5, 9, 0),
        datetime(1997, 9, 6, 9, 0)
    ]
);


testRecurring('testYearly',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 2, 9, 0),
        datetime(1998, 9, 2, 9, 0),
        datetime(1999, 9, 2, 9, 0)
    ]
);


testRecurring('testYearlyInterval',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        interval: 2,
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 2, 9, 0),
        datetime(1999, 9, 2, 9, 0),
        datetime(2001, 9, 2, 9, 0)
    ]
);


testRecurring('testYearlyIntervalLarge',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        interval: 100,
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 2, 9, 0),
        datetime(2097, 9, 2, 9, 0),
        datetime(2197, 9, 2, 9, 0)
    ]
);


testRecurring('testYearlyByMonth',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        bymonth: [1, 3],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 1, 2, 9, 0),
        datetime(1998, 3, 2, 9, 0),
        datetime(1999, 1, 2, 9, 0)
    ]
);


testRecurring('testYearlyByMonthDay',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        bymonthday: [1, 3],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 3, 9, 0),
        datetime(1997, 10, 1, 9, 0),
        datetime(1997, 10, 3, 9, 0)
    ]
);


testRecurring('testYearlyByMonthAndMonthDay',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        bymonth: [1, 3],
        bymonthday: [5, 7],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 1, 5, 9, 0),
        datetime(1998, 1, 7, 9, 0),
        datetime(1998, 3, 5, 9, 0)
    ]
);


testRecurring('testYearlyByWeekDay',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byweekday: [RRule.TU, RRule.TH],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 2, 9, 0),
        datetime(1997, 9, 4, 9, 0),
        datetime(1997, 9, 9, 9, 0)
    ]
);


testRecurring('testYearlyByNWeekDay',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byweekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 12, 25, 9, 0),
        datetime(1998, 1, 6, 9, 0),
        datetime(1998, 12, 31, 9, 0)
    ]
);


testRecurring('testYearlyByNWeekDayLarge',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byweekday: [RRule.TU.nth(3), RRule.TH.nth(-3)],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 12, 11, 9, 0),
        datetime(1998, 1, 20, 9, 0),
        datetime(1998, 12, 17, 9, 0)
    ]
);


testRecurring('testYearlyByMonthAndWeekDay',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        bymonth: [1, 3],
        byweekday: [RRule.TU, RRule.TH],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 1, 1, 9, 0),
        datetime(1998, 1, 6, 9, 0),
        datetime(1998, 1, 8, 9, 0)
    ]
);


testRecurring('testYearlyByMonthAndNWeekDay',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        bymonth: [1, 3],
        byweekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 1, 6, 9, 0),
        datetime(1998, 1, 29, 9, 0),
        datetime(1998, 3, 3, 9, 0)
    ]
);


testRecurring('testYearlyByMonthAndNWeekDayLarge',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        bymonth: [1, 3],
        byweekday: [RRule.TU.nth(3), RRule.TH.nth(-3)],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 1, 15, 9, 0),
        datetime(1998, 1, 20, 9, 0),
        datetime(1998, 3, 12, 9, 0)
    ]
);


testRecurring('testYearlyByMonthDayAndWeekDay',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        bymonthday: [1, 3],
        byweekday: [RRule.TU, RRule.TH],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 1, 1, 9, 0),
        datetime(1998, 2, 3, 9, 0),
        datetime(1998, 3, 3, 9, 0)
    ]
);


testRecurring('testYearlyByMonthAndMonthDayAndWeekDay',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        bymonth: [1, 3],
        bymonthday: [1, 3],
        byweekday: [RRule.TU, RRule.TH],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 1, 1, 9, 0),
        datetime(1998, 3, 3, 9, 0),
        datetime(2001, 3, 1, 9, 0)
    ]
);


testRecurring('testYearlyByYearDay',
    new RRule({
        freq: RRule.YEARLY,
        count: 4,
        byyearday: [1, 100, 200, 365],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 12, 31, 9, 0),
        datetime(1998, 1, 1, 9, 0),
        datetime(1998, 4, 10, 9, 0),
        datetime(1998, 7, 19, 9, 0)
    ]
);


testRecurring('testYearlyByYearDayNeg',
    new RRule({
        freq: RRule.YEARLY,
        count: 4,
        byyearday: [-365, -266, -166, -1],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 12, 31, 9, 0),
        datetime(1998, 1, 1, 9, 0),
        datetime(1998, 4, 10, 9, 0),
        datetime(1998, 7, 19, 9, 0)
    ]
);


testRecurring('testYearlyByMonthAndYearDay',
    new RRule({
        freq: RRule.YEARLY,
        count: 4,
        bymonth: [4, 7],
        byyearday: [1, 100, 200, 365],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 4, 10, 9, 0),
        datetime(1998, 7, 19, 9, 0),
        datetime(1999, 4, 10, 9, 0),
        datetime(1999, 7, 19, 9, 0)
    ]
);


testRecurring('testYearlyByMonthAndYearDayNeg',
    new RRule({
        freq: RRule.YEARLY,
        count: 4,
        bymonth: [4, 7],
        byyearday: [-365, -266, -166, -1],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 4, 10, 9, 0),
        datetime(1998, 7, 19, 9, 0),
        datetime(1999, 4, 10, 9, 0),
        datetime(1999, 7, 19, 9, 0)
    ]
);


testRecurring('testYearlyByWeekNo',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byweekno: 20,
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 5, 11, 9, 0),
        datetime(1998, 5, 12, 9, 0),
        datetime(1998, 5, 13, 9, 0)
    ]
);


testRecurring('testYearlyByWeekNoAndWeekDay',
    // This test case demonstrates how the first days of week number one
    // might actually fall into the previous year, depending on the week numbering system.
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byweekno: 1,
        byweekday: RRule.MO,
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 12, 29, 9, 0),
        datetime(1999, 1, 4, 9, 0),
        datetime(2000, 1, 3, 9, 0)
    ]
);


testRecurring('testYearlyByWeekNoAndWeekDayLarge',
    // Another interesting test case: the last days of week 52/53
    // might extend into the following year.
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byweekno: 52,
        byweekday: RRule.SU,
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 12, 28, 9, 0),
        datetime(1998, 12, 27, 9, 0),
        datetime(2000, 1, 2, 9, 0)
    ]
);


testRecurring('testYearlyByWeekNoAndWeekDayLast',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byweekno: -1,
        byweekday: RRule.SU,
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 12, 28, 9, 0),
        datetime(1999, 1, 3, 9, 0),
        datetime(2000, 1, 2, 9, 0)
    ]
);


testRecurring('testYearlyByEaster',
    new RRule({
        count: 3,
        byeaster: 0,
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 4, 12, 9, 0),
        datetime(1999, 4, 4, 9, 0),
        datetime(2000, 4, 23, 9, 0)
    ]
);


testRecurring('testYearlyByEasterPos',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byeaster: 1,
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 4, 13, 9, 0),
        datetime(1999, 4, 5, 9, 0),
        datetime(2000, 4, 24, 9, 0)
    ]
);


testRecurring('testYearlyByEasterNeg',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byeaster: -1,
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 4, 11, 9, 0),
        datetime(1999, 4, 3, 9, 0),
        datetime(2000, 4, 22, 9, 0)
    ]
);


testRecurring('testYearlyByWeekNoAndWeekDay53',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byweekno: 53,
        byweekday: RRule.MO,
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 12, 28, 9, 0),
        datetime(2004, 12, 27, 9, 0),
        datetime(2009, 12, 28, 9, 0)
    ]
);

/*
 This is a duplicated test case.
 The original code had a commented-out section with the same test.
 assertRecurring('testYearlyByWeekNoAndWeekDay53', new RRule({freq: RRule.YEARLY,
 count: 3,
 byweekno: 53,
 byweekday: RRule.MO,
 dtstart: parse("19970902T090000")}),
 [datetime(1998, 12, 28, 9, 0),
 datetime(2004, 12, 27, 9, 0),
 datetime(2009, 12, 28, 9, 0)])
 */


testRecurring('testYearlyByHour',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byhour: [6, 18],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 2, 18, 0),
        datetime(1998, 9, 2, 6, 0),
        datetime(1998, 9, 2, 18, 0)
    ]
);


testRecurring('testYearlyByMinute',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byminute: [6, 18],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 2, 9, 6),
        datetime(1997, 9, 2, 9, 18),
        datetime(1998, 9, 2, 9, 6)
    ]
);


testRecurring('testYearlyBySecond',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        bysecond: [6, 18],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 2, 9, 0, 6),
        datetime(1997, 9, 2, 9, 0, 18),
        datetime(1998, 9, 2, 9, 0, 6)
    ]
);


testRecurring('testYearlyByHourAndMinute',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byhour: [6, 18],
        byminute: [6, 18],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 2, 18, 6),
        datetime(1997, 9, 2, 18, 18),
        datetime(1998, 9, 2, 6, 6)
    ]
);


testRecurring('testYearlyByHourAndSecond',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byhour: [6, 18],
        bysecond: [6, 18],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 2, 18, 0, 6),
        datetime(1997, 9, 2, 18, 0, 18),
        datetime(1998, 9, 2, 6, 0, 6)
    ]
);


testRecurring('testYearlyByMinuteAndSecond',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byminute: [6, 18],
        bysecond: [6, 18],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 2, 9, 6, 6),
        datetime(1997, 9, 2, 9, 6, 18),
        datetime(1997, 9, 2, 9, 18, 6)
    ]
);


testRecurring('testYearlyByHourAndMinuteAndSecond',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        byhour: [6, 18],
        byminute: [6, 18],
        bysecond: [6, 18],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 2, 18, 6, 6),
        datetime(1997, 9, 2, 18, 6, 18),
        datetime(1997, 9, 2, 18, 18, 6)
    ]
);


testRecurring('testYearlyBySetPos',
    new RRule({
        freq: RRule.YEARLY,
        count: 3,
        bymonthday: 15,
        byhour: [6, 18],
        bysetpos: [3, -3],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 11, 15, 18, 0),
        datetime(1998, 2, 15, 6, 0),
        datetime(1998, 11, 15, 18, 0)
    ]
);


testRecurring('testMonthly',
    new RRule({
        freq: RRule.MONTHLY,
        count: 3,
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 2, 9, 0),
        datetime(1997, 10, 2, 9, 0),
        datetime(1997, 11, 2, 9, 0)
    ]
);


testRecurring('testMonthlyInterval',
    new RRule({
        freq: RRule.MONTHLY,
        count: 3,
        interval: 2,
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 2, 9, 0),
        datetime(1997, 11, 2, 9, 0),
        datetime(1998, 1, 2, 9, 0)
    ]
);


testRecurring('testMonthlyIntervalLarge',
    new RRule({
        freq: RRule.MONTHLY,
        count: 3,
        interval: 18,
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1997, 9, 2, 9, 0),
        datetime(1999, 3, 2, 9, 0),
        datetime(2000, 9, 2, 9, 0)
    ]
);


testRecurring('testMonthlyByMonth',
    new RRule({
        freq: RRule.MONTHLY,
        count: 3,
        bymonth: [1, 3],
        dtstart: parse("19970902T090000")
    }),
    [
        datetime(1998, 1, 2, 9, 0),
        datetime(1998, 3, 2, 9, 0),
        datetime(1999, 1, 2, 9, 0)
    ]
);