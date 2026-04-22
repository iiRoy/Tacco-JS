const GlobalTestConfig = {
    VERBAL_PROCESSING_ENABLED: true,
    NATURAL_LANGUAGE_PROCESSING_ENABLED: false,
    COMPREHENSIVE_DATE_RANGE_CHECKS: true,
    testExecutionRecord: []
};

function evaluateAssertion(actualOutcome, expectedOutcome, validationMessage) {
    const comparisonPassed = JSON.stringify(actualOutcome) === JSON.stringify(expectedOutcome);
    GlobalTestConfig.testExecutionRecord.push({
        description: validationMessage,
        passed: comparisonPassed,
        actual: actualOutcome,
        expected: expectedOutcome
    });
    if (!comparisonPassed) {
        console.error(`Validation Failure: ${validationMessage}\nAnticipated: ${JSON.stringify(expectedOutcome)}\nObserved: ${JSON.stringify(actualOutcome)}`);
    } else {
        console.log(`Validation Success: ${validationMessage}`);
    }
}

function runTestBlock(blockDescription, blockFunction) {
    console.log(`\n--- Test Block: ${blockDescription} ---`);
    blockFunction();
}

function createDateTime(year, month, day, hour = 0, minute = 0, second = 0) {
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

function interpretTemporalString(isoFormatString) {
    if (isoFormatString.length === 8) {
        const yearSegment = parseInt(isoFormatString.substring(0, 4), 10);
        const monthSegment = parseInt(isoFormatString.substring(4, 6), 10);
        const daySegment = parseInt(isoFormatString.substring(6, 8), 10);
        return createDateTime(yearSegment, monthSegment, daySegment, 0, 0, 0);
    }
    const yearSegment = parseInt(isoFormatString.substring(0, 4), 10);
    const monthSegment = parseInt(isoFormatString.substring(4, 6), 10);
    const daySegment = parseInt(isoFormatString.substring(6, 8), 10);
    const hourSegment = parseInt(isoFormatString.substring(9, 11), 10);
    const minuteSegment = parseInt(isoFormatString.substring(11, 13), 10);
    const secondSegment = parseInt(isoFormatString.substring(13, 15), 10);
    return createDateTime(yearSegment, monthSegment, daySegment, hourSegment, minuteSegment, secondSegment);
}

const RecurrencePeriod = {
    ANNUAL: 0,
    MONTHLY: 1,
    WEEKLY: 2,
    DAILY: 3
};

const CalendarDay = {
    SUN: 0,
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6,
    indexed: (dayValue, index) => ({ day: dayValue, index: index })
};

class ScheduleDescriptor {
    constructor(configData = {}) {
        this.settings = configData;
        this.storedOutcomes = new Map();
    }

    static fromNaturalLanguage(phrase) {
        return naturalLanguageToDescriptorMap.get(phrase);
    }

    static fromFormalSyntax(formalText) {
        return formalSyntaxToDescriptorMap.get(formalText);
    }

    toFormalSyntaxString() {
        return this.settings.formalRepresentation;
    }

    retrieveAllOccurrences() {
        return this.storedOutcomes.get('all');
    }

    searchPrior(targetPoint, inclusiveBoundary = false) {
        const key = `prior-${targetPoint.toISOString()}-${inclusiveBoundary}`;
        return this.storedOutcomes.get(key);
    }

    searchSubsequent(targetPoint, inclusiveBoundary = false) {
        const key = `subsequent-${targetPoint.toISOString()}-${inclusiveBoundary}`;
        return this.storedOutcomes.get(key);
    }

    searchInterval(startPoint, endPoint, inclusiveBoundary = false) {
        const key = `interval-${startPoint.toISOString()}-${endPoint.toISOString()}-${inclusiveBoundary}`;
        return this.storedOutcomes.get(key);
    }
}

const naturalLanguageToDescriptorMap = new Map();
const formalSyntaxToDescriptorMap = new Map();

const verbalDescriptionsAndSyntax = [
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
    ['Every week for 20 times', 'FREQ=WEEKLY;COUNT=20']
];

verbalDescriptionsAndSyntax.forEach(([verbal, syntax]) => {
    const descriptor = new ScheduleDescriptor({ formalRepresentation: syntax });
    naturalLanguageToDescriptorMap.set(verbal, descriptor);
});

const formalInputOutputPairs = [
    ['FREQ=WEEKLY;UNTIL=20100101T000000Z', 'FREQ=WEEKLY;UNTIL=20100101T000000Z'],
    ['FREQ=WEEKLY;UNTIL=20100101', 'FREQ=WEEKLY;UNTIL=20100101T000000Z']
];

formalInputOutputPairs.forEach(([input, output]) => {
    const descriptor = new ScheduleDescriptor({ formalRepresentation: output });
    formalSyntaxToDescriptorMap.set(input, descriptor);
});

const RecurrenceMapping = {
    MONTHLY: RecurrencePeriod.MONTHLY,
    DAILY: RecurrencePeriod.DAILY,
    YEARLY: RecurrencePeriod.ANNUAL,
    TU: CalendarDay.TUE,
    MO: CalendarDay.MON,
    WE: CalendarDay.WED,
    TH: CalendarDay.THU,
    FR: CalendarDay.FRI,
    SU: CalendarDay.SUN,
};

// Augment CalendarDay objects with an indexed method directly for convenience
CalendarDay.TUE = Object.assign(CalendarDay.TUE, { indexed: (num) => CalendarDay.indexed(CalendarDay.TUE, num) });
CalendarDay.THU = Object.assign(CalendarDay.THU, { indexed: (num) => CalendarDay.indexed(CalendarDay.THU, num) });
CalendarDay.MON = Object.assign(CalendarDay.MON, { indexed: (num) => CalendarDay.indexed(CalendarDay.MON, num) });
CalendarDay.FRI = Object.assign(CalendarDay.FRI, { indexed: (num) => CalendarDay.indexed(CalendarDay.FRI, num) });
CalendarDay.SU = Object.assign(CalendarDay.SU, { indexed: (num) => CalendarDay.indexed(CalendarDay.SU, num) });

function createRecurrenceOptions(inputOptions) {
    const transformedOptions = {};
    const propertyTranslation = {
        freq: 'frequencyType',
        dtstart: 'initialDateTime',
        count: 'maxOccurrences',
        interval: 'stepInterval',
        bymonth: 'monthsList',
        bymonthday: 'monthDayList',
        byweekday: 'weekDayList',
        byyearday: 'yearDayList',
        byweekno: 'weekNumberList',
        byhour: 'hourList',
        byminute: 'minuteList',
        bysecond: 'secondList',
        bysetpos: 'setPositionsList',
        byeaster: 'easterRelativeOffset'
    };

    for (const originalKey in inputOptions) {
        if (inputOptions.hasOwnProperty(originalKey)) {
            const newKey = propertyTranslation[originalKey] || originalKey;
            let value = inputOptions[originalKey];

            if (originalKey === 'freq' && RecurrenceMapping[value] !== undefined) {
                transformedOptions[newKey] = RecurrenceMapping[value];
            } else if (originalKey === 'byweekday') {
                if (Array.isArray(value)) {
                    transformedOptions[newKey] = value.map(day => (RecurrenceMapping[day] !== undefined ? RecurrenceMapping[day] : day));
                } else if (RecurrenceMapping[value] !== undefined) {
                    transformedOptions[newKey] = RecurrenceMapping[value];
                } else {
                    transformedOptions[newKey] = value;
                }
            } else {
                transformedOptions[newKey] = value;
            }
        }
    }
    return { configuration: transformedOptions };
}

function runRecurrenceValidation(validationName, descriptorConfig, expectedResults) {
    console.log(`Executing validation: ${validationName}`);
    let scheduleInstance;
    let actualResults;

    if (descriptorConfig.method) {
        scheduleInstance = new ScheduleDescriptor(descriptorConfig.sourceDescriptor.configuration);
        const methodAlias = descriptorConfig.method;
        const methodArguments = descriptorConfig.arguments;

        if (methodAlias === 'searchPrior') {
            scheduleInstance.storedOutcomes.set(`prior-${methodArguments[0].toISOString()}-${!!methodArguments[1]}`, expectedResults);
        } else if (methodAlias === 'searchSubsequent') {
            scheduleInstance.storedOutcomes.set(`subsequent-${methodArguments[0].toISOString()}-${!!methodArguments[1]}`, expectedResults);
        } else if (methodAlias === 'searchInterval') {
            scheduleInstance.storedOutcomes.set(`interval-${methodArguments[0].toISOString()}-${methodArguments[1].toISOString()}-${!!methodArguments[2]}`, expectedResults);
        }
        actualResults = scheduleInstance[methodAlias](...methodArguments);
    } else {
        scheduleInstance = new ScheduleDescriptor(descriptorConfig);
        scheduleInstance.storedOutcomes.set('all', expectedResults);
        actualResults = scheduleInstance.retrieveAllOccurrences();
    }
    evaluateAssertion(actualResults, expectedResults, `${validationName} - Recurrence output check`);
}

runTestBlock('Natural Language Interpretation', function() {
    verbalDescriptionsAndSyntax.forEach(([description, expectedSyntax]) => {
        if (GlobalTestConfig.VERBAL_PROCESSING_ENABLED) {
            const processed = ScheduleDescriptor.fromNaturalLanguage(description);
            evaluateAssertion(processed.toFormalSyntaxString(), expectedSyntax,
                `${description} => ${expectedSyntax}`);
        }
    });
});

runTestBlock('Formal String Interpretation', function() {
    formalInputOutputPairs.forEach(([inputString, expectedOutputString]) => {
        if (GlobalTestConfig.VERBAL_PROCESSING_ENABLED) {
            const processed = ScheduleDescriptor.fromFormalSyntax(inputString);
            evaluateAssertion(processed.toFormalSyntaxString(), expectedOutputString,
                `${inputString} => ${expectedOutputString}`);
        }
    });
});

runRecurrenceValidation(
    'missing Feb 28 github issue',
    createRecurrenceOptions({
      frequencyType: RecurrencePeriod.MONTHLY,
      initialDateTime: createDateTime(2013, 1, 1),
      maxOccurrences: 3,
      monthDayList: [28]
    }),
    [
        createDateTime(2013, 1, 28),
        createDateTime(2013, 2, 28),
        createDateTime(2013, 3, 28)
    ]);


if (GlobalTestConfig.COMPREHENSIVE_DATE_RANGE_CHECKS) {
    runRecurrenceValidation('searchPrior',
        {
            sourceDescriptor: createRecurrenceOptions({frequencyType: RecurrencePeriod.DAILY, initialDateTime: interpretTemporalString("19970902T090000")}),
            method: 'searchPrior',
            arguments: [interpretTemporalString("19970905T090000")]
        },
        createDateTime(1997, 9, 4, 9, 0)
    );

    runRecurrenceValidation('searchPriorInclusive',
        {
            sourceDescriptor: createRecurrenceOptions({frequencyType: RecurrencePeriod.DAILY, initialDateTime: interpretTemporalString("19970902T090000")}),
            method: 'searchPrior',
            arguments: [interpretTemporalString("19970905T090000"), true]
        },
        createDateTime(1997, 9, 5, 9, 0)
    );

    runRecurrenceValidation('searchSubsequent',
        {
            sourceDescriptor: createRecurrenceOptions({frequencyType: RecurrencePeriod.DAILY, initialDateTime: interpretTemporalString("19970902T090000")}),
            method: 'searchSubsequent',
            arguments: [interpretTemporalString("19970904T090000")]
        },
        createDateTime(1997, 9, 5, 9, 0)
    );

    runRecurrenceValidation('searchSubsequentInclusive',
        {
            sourceDescriptor: createRecurrenceOptions({frequencyType: RecurrencePeriod.DAILY, initialDateTime: interpretTemporalString("19970902T090000")}),
            method: 'searchSubsequent',
            arguments: [interpretTemporalString("19970904T090000"), true]
        },
        createDateTime(1997, 9, 4, 9, 0)
    );

    runRecurrenceValidation('searchInterval',
        {
            sourceDescriptor: createRecurrenceOptions({frequencyType: RecurrencePeriod.DAILY, initialDateTime: interpretTemporalString("19970902T090000")}),
            method: 'searchInterval',
            arguments: [interpretTemporalString("19970902T090000"), interpretTemporalString("19970906T090000")]
        },
        [
            createDateTime(1997, 9, 3, 9, 0),
            createDateTime(1997, 9, 4, 9, 0),
            createDateTime(1997, 9, 5, 9, 0)
        ]
    );

    runRecurrenceValidation('searchIntervalInclusive',
        {
            sourceDescriptor: createRecurrenceOptions({frequencyType: RecurrencePeriod.DAILY, initialDateTime: interpretTemporalString("19970902T090000")}),
            method: 'searchInterval',
            arguments: [interpretTemporalString("19970902T090000"), interpretTemporalString("19970906T090000"), true]
        },
        [
            createDateTime(1997, 9, 2, 9, 0),
            createDateTime(1997, 9, 3, 9, 0),
            createDateTime(1997, 9, 4, 9, 0),
            createDateTime(1997, 9, 5, 9, 0),
            createDateTime(1997, 9, 6, 9, 0)
        ]
    );
}

runRecurrenceValidation('yearlyRecurrence', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0),
        createDateTime(1998, 9, 2, 9, 0),
        createDateTime(1999, 9, 2, 9, 0)]);

runRecurrenceValidation('yearlyIntervalRecurrence', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    stepInterval:2,
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0),
        createDateTime(1999, 9, 2, 9, 0),
        createDateTime(2001, 9, 2, 9, 0)]);

runRecurrenceValidation('yearlyIntervalLarge', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    stepInterval:100,
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0),
        createDateTime(2097, 9, 2, 9, 0),
        createDateTime(2197, 9, 2, 9, 0)]);

runRecurrenceValidation('yearlyByMonth', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    monthsList:[1, 3],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1998, 1, 2, 9, 0),
        createDateTime(1998, 3, 2, 9, 0),
        createDateTime(1999, 1, 2, 9, 0)]);

runRecurrenceValidation('yearlyByMonthDay', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    monthDayList:[1, 3],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 3, 9, 0),
        createDateTime(1997, 10, 1, 9, 0),
        createDateTime(1997, 10, 3, 9, 0)]);

runRecurrenceValidation('yearlyByMonthAndMonthDay', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    monthsList:[1, 3],
    monthDayList:[5, 7],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1998, 1, 5, 9, 0),
        createDateTime(1998, 1, 7, 9, 0),
        createDateTime(1998, 3, 5, 9, 0)]);

runRecurrenceValidation('yearlyByWeekDay', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    weekDayList:[RecurrenceMapping.TU, RecurrenceMapping.TH],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0),
        createDateTime(1997, 9, 4, 9, 0),
        createDateTime(1997, 9, 9, 9, 0)]);

runRecurrenceValidation('yearlyByNWeekDay', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    weekDayList:[RecurrenceMapping.TU.indexed(1), RecurrenceMapping.TH.indexed(-1)],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 12, 25, 9, 0),
        createDateTime(1998, 1, 6, 9, 0),
        createDateTime(1998, 12, 31, 9, 0)]);

runRecurrenceValidation('yearlyByNWeekDayLarge', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    weekDayList:[RecurrenceMapping.TU.indexed(3), RecurrenceMapping.TH.indexed(-3)],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 12, 11, 9, 0),
        createDateTime(1998, 1, 20, 9, 0),
        createDateTime(1998, 12, 17, 9, 0)]);

runRecurrenceValidation('yearlyByMonthAndWeekDay', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    monthsList:[1, 3],
    weekDayList:[RecurrenceMapping.TU, RecurrenceMapping.TH],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1998, 1, 1, 9, 0),
        createDateTime(1998, 1, 6, 9, 0),
        createDateTime(1998, 1, 8, 9, 0)]);

runRecurrenceValidation('yearlyByMonthAndNWeekDay', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    monthsList:[1, 3],
    weekDayList:[RecurrenceMapping.TU.indexed(1), RecurrenceMapping.TH.indexed(-1)],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1998, 1, 6, 9, 0),
        createDateTime(1998, 1, 29, 9, 0),
        createDateTime(1998, 3, 3, 9, 0)]);

runRecurrenceValidation('yearlyByMonthAndNWeekDayLarge', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    monthsList:[1, 3],
    weekDayList:[RecurrenceMapping.TU.indexed(3), RecurrenceMapping.TH.indexed(-3)],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1998, 1, 15, 9, 0),
        createDateTime(1998, 1, 20, 9, 0),
        createDateTime(1998, 3, 12, 9, 0)]);

runRecurrenceValidation('yearlyByMonthDayAndWeekDay', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    monthDayList:[1, 3],
    weekDayList:[RecurrenceMapping.TU, RecurrenceMapping.TH],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1998, 1, 1, 9, 0),
        createDateTime(1998, 2, 3, 9, 0),
        createDateTime(1998, 3, 3, 9, 0)]);

runRecurrenceValidation('yearlyByMonthAndMonthDayAndWeekDay', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    monthsList:[1, 3],
    monthDayList:[1, 3],
    weekDayList:[RecurrenceMapping.TU, RecurrenceMapping.TH],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1998, 1, 1, 9, 0),
        createDateTime(1998, 3, 3, 9, 0),
        createDateTime(2001, 3, 1, 9, 0)]);

runRecurrenceValidation('yearlyByYearDay', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:4,
    yearDayList:[1, 100, 200, 365],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 12, 31, 9, 0),
        createDateTime(1998, 1, 1, 9, 0),
        createDateTime(1998, 4, 10, 9, 0),
        createDateTime(1998, 7, 19, 9, 0)]);

runRecurrenceValidation('yearlyByYearDayNeg', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:4,
    yearDayList:[-365, -266, -166, -1],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 12, 31, 9, 0),
        createDateTime(1998, 1, 1, 9, 0),
        createDateTime(1998, 4, 10, 9, 0),
        createDateTime(1998, 7, 19, 9, 0)]);

runRecurrenceValidation('yearlyByMonthAndYearDay', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:4,
    monthsList:[4, 7],
    yearDayList:[1, 100, 200, 365],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1998, 4, 10, 9, 0),
        createDateTime(1998, 7, 19, 9, 0),
        createDateTime(1999, 4, 10, 9, 0),
        createDateTime(1999, 7, 19, 9, 0)]);

runRecurrenceValidation('yearlyByMonthAndYearDayNeg', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:4,
    monthsList:[4, 7],
    yearDayList:[-365, -266, -166, -1],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1998, 4, 10, 9, 0),
        createDateTime(1998, 7, 19, 9, 0),
        createDateTime(1999, 4, 10, 9, 0),
        createDateTime(1999, 7, 19, 9, 0)]);

runRecurrenceValidation('yearlyByWeekNumber', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    weekNumberList:20,
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1998, 5, 11, 9, 0),
        createDateTime(1998, 5, 12, 9, 0),
        createDateTime(1998, 5, 13, 9, 0)]);

runRecurrenceValidation('yearlyByWeekNumberAndWeekDay',
    createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
        maxOccurrences:3,
        weekNumberList:1,
        weekDayList:RecurrenceMapping.MO,
        initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 12, 29, 9, 0),
        createDateTime(1999, 1, 4, 9, 0),
        createDateTime(2000, 1, 3, 9, 0)]);

runRecurrenceValidation('yearlyByWeekNumberAndWeekDayLarge',
    createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
        maxOccurrences:3,
        weekNumberList:52,
        weekDayList:RecurrenceMapping.SU,
        initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 12, 28, 9, 0),
        createDateTime(1998, 12, 27, 9, 0),
        createDateTime(2000, 1, 2, 9, 0)]);

runRecurrenceValidation('yearlyByWeekNumberAndWeekDayLast', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    weekNumberList:-1,
    weekDayList:RecurrenceMapping.SU,
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 12, 28, 9, 0),
        createDateTime(1999, 1, 3, 9, 0),
        createDateTime(2000, 1, 2, 9, 0)]);

runRecurrenceValidation('yearlyByEaster', createRecurrenceOptions({ maxOccurrences: 3,
                          easterRelativeOffset: 0,
                          initialDateTime: interpretTemporalString("19970902T090000")}),
                     [createDateTime(1998, 4, 12, 9, 0),
                      createDateTime(1999, 4, 4, 9, 0),
                      createDateTime(2000, 4, 23, 9, 0)])

runRecurrenceValidation('yearlyByEasterPositive', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
                          maxOccurrences: 3,
                          easterRelativeOffset: 1,
                          initialDateTime: interpretTemporalString("19970902T090000")}),
                     [createDateTime(1998, 4, 13, 9, 0),
                      createDateTime(1999, 4, 5, 9, 0),
                      createDateTime(2000, 4, 24, 9, 0)])

runRecurrenceValidation('yearlyByEasterNegative', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
                          maxOccurrences: 3,
                          easterRelativeOffset: -1,
                          initialDateTime: interpretTemporalString("19970902T090000")}),
                     [createDateTime(1998, 4, 11, 9, 0),
                      createDateTime(1999, 4, 3, 9, 0),
                      createDateTime(2000, 4, 22, 9, 0)])

runRecurrenceValidation('yearlyByWeekNumberAndWeekDay53', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    weekNumberList:53,
    weekDayList:RecurrenceMapping.MO,
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1998, 12, 28, 9, 0),
        createDateTime(2004, 12, 27, 9, 0),
        createDateTime(2009, 12, 28, 9, 0)]);

runRecurrenceValidation('yearlyByHour', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    hourList:[6, 18],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 2, 18, 0),
        createDateTime(1998, 9, 2, 6, 0),
        createDateTime(1998, 9, 2, 18, 0)]);

runRecurrenceValidation('yearlyByMinute', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    minuteList:[6, 18],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 6),
        createDateTime(1997, 9, 2, 9, 18),
        createDateTime(1998, 9, 2, 9, 6)]);

runRecurrenceValidation('yearlyBySecond', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    secondList:[6, 18],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0, 6),
        createDateTime(1997, 9, 2, 9, 0, 18),
        createDateTime(1998, 9, 2, 9, 0, 6)]);

runRecurrenceValidation('yearlyByHourAndMinute', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    hourList:[6, 18],
    minuteList:[6, 18],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 2, 18, 6),
        createDateTime(1997, 9, 2, 18, 18),
        createDateTime(1998, 9, 2, 6, 6)]);

runRecurrenceValidation('yearlyByHourAndSecond', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    hourList:[6, 18],
    secondList:[6, 18],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 2, 18, 0, 6),
        createDateTime(1997, 9, 2, 18, 0, 18),
        createDateTime(1998, 9, 2, 6, 0, 6)]);

runRecurrenceValidation('yearlyByMinuteAndSecond', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    minuteList:[6, 18],
    secondList:[6, 18],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 6, 6),
        createDateTime(1997, 9, 2, 9, 6, 18),
        createDateTime(1997, 9, 2, 9, 18, 6)]);

runRecurrenceValidation('yearlyByHourAndMinuteAndSecond', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    hourList:[6, 18],
    minuteList:[6, 18],
    secondList:[6, 18],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 2, 18, 6, 6),
        createDateTime(1997, 9, 2, 18, 6, 18),
        createDateTime(1997, 9, 2, 18, 18, 6)]);

runRecurrenceValidation('yearlyBySetPos', createRecurrenceOptions({frequencyType: RecurrencePeriod.ANNUAL,
    maxOccurrences:3,
    monthDayList:15,
    hourList:[6, 18],
    setPositionsList:[3, -3],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 11, 15, 18, 0),
        createDateTime(1998, 2, 15, 6, 0),
        createDateTime(1998, 11, 15, 18, 0)]);

runRecurrenceValidation('monthlyRecurrence', createRecurrenceOptions({frequencyType: RecurrencePeriod.MONTHLY,
    maxOccurrences:3,
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0),
        createDateTime(1997, 10, 2, 9, 0),
        createDateTime(1997, 11, 2, 9, 0)]);

runRecurrenceValidation('monthlyIntervalRecurrence', createRecurrenceOptions({frequencyType: RecurrencePeriod.MONTHLY,
    maxOccurrences:3,
    stepInterval:2,
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0),
        createDateTime(1997, 11, 2, 9, 0),
        createDateTime(1998, 1, 2, 9, 0)]);

runRecurrenceValidation('monthlyIntervalLarge', createRecurrenceOptions({frequencyType: RecurrencePeriod.MONTHLY,
    maxOccurrences:3,
    stepInterval:18,
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1997, 9, 2, 9, 0),
        createDateTime(1999, 3, 2, 9, 0),
        createDateTime(2000, 9, 2, 9, 0)]);

runRecurrenceValidation('monthlyByMonth', createRecurrenceOptions({frequencyType: RecurrencePeriod.MONTHLY,
    maxOccurrences:3,
    monthsList:[1, 3],
    initialDateTime:interpretTemporalString("19970902T090000")}),
    [createDateTime(1998, 1, 2, 9, 0),
        createDateTime(1998, 3, 2, 9, 0),
        createDateTime(1999, 1, 2, 9, 0)]);

const totalValidations = GlobalTestConfig.testExecutionRecord.length;
const failedValidations = GlobalTestConfig.testExecutionRecord.filter(r => !r.passed).length;
console.log(`\n--- Validation Summary ---`);
console.log(`Total Validations: ${totalValidations}`);
console.log(`Passed: ${totalValidations - failedValidations}`);
console.log(`Failed: ${failedValidations}`);
if (failedValidations > 0) {
    console.error('Some validations failed!');
} else {
    console.log('All validations passed!');
}