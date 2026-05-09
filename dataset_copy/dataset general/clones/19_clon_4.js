const schedulingEngine = require('./opening_hours.js');

const periodVerificationSystem = (() => {
    let verificationCases = [];

    const renderTimePoint = (momentInput) => {
        if (typeof momentInput === 'string') return momentInput;
        const d = momentInput;
        return `${d.getFullYear()}.${('0' + (d.getMonth() + 1)).slice(-2)}.${('0' + d.getDate()).slice(-2)} ${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}`;
    };

    const composePeriodRepresentation = (periodList) => {
        if (periodList.length === 0) return '(none)';
        return periodList.map(p => `[ ${renderTimePoint(p[0])} - ${renderTimePoint(p[1])} ]`).join('\n');
    };

    const processIndividualCheck = (caseDetails) => {
        const [ caseName, specInput, commencement, termination, anticipatedPeriods, expectedSpan, expectedWeeklyStability ] = caseDetails;

        let exclusionFlag = typeof specInput !== 'string';
        let ruleSpecification = exclusionFlag ? specInput[0] : specInput;
        let exclusionRationale = exclusionFlag ? specInput[1] : undefined;

        let engineInstance, currentPeriods, currentSpan, currentWeeklyStability, periodMatch, spanMatch, weeklyStabilityMatch, encounteredError = null;

        try {
            engineInstance = new schedulingEngine(ruleSpecification);
            currentPeriods = engineInstance.getOpenIntervals(new Date(commencement), new Date(termination));
            currentSpan = engineInstance.getOpenDuration(new Date(commencement), new Date(termination));
            currentWeeklyStability = engineInstance.isWeekStable();

            periodMatch = typeof anticipatedPeriods === 'undefined' ||
                          (currentPeriods.length === anticipatedPeriods.length &&
                           anticipatedPeriods.every((expP, idx) =>
                               currentPeriods[idx][0].getTime() === new Date(expP[0]).getTime() &&
                               currentPeriods[idx][1].getTime() === new Date(expP[1]).getTime()
                           ));
            spanMatch = typeof expectedSpan === 'undefined' || currentSpan === expectedSpan;
            weeklyStabilityMatch = typeof expectedWeeklyStability === 'undefined' || currentWeeklyStability === expectedWeeklyStability;

        } catch (err) {
            encounteredError = err;
        }

        let checkOutcome = false;
        let logMessage = `"${caseName}" for "${ruleSpecification}": `;

        if (periodMatch && spanMatch && weeklyStabilityMatch && !encounteredError) {
            logMessage += '[1;32mPASSED[0m';
            if (exclusionFlag) {
                logMessage += ', [1;33malso marked for exclusion, please review as it passes![0m';
            }
            checkOutcome = true;
        } else if (exclusionFlag) {
            logMessage += `[1;33mEXCLUDED[0m, rationale: ${exclusionRationale}`;
            checkOutcome = true;
        } else if (encounteredError) {
            logMessage += `[1;35mCRASHED[0m, rationale: ${encounteredError}`;
        } else {
            logMessage += '[1;31mFAILED[0m';
            if (!spanMatch) {
                logMessage += `, incorrect span: ${currentSpan}, anticipated ${expectedSpan}`;
            }
            if (!periodMatch) {
                logMessage += `,\nincorrect periods: \n${composePeriodRepresentation(currentPeriods)}\nanticipated:\n${composePeriodRepresentation(anticipatedPeriods)}`;
            }
            if (!weeklyStabilityMatch) {
                logMessage += `, incorrect weekly stability flag: ${currentWeeklyStability}, anticipated ${expectedWeeklyStability}`;
            }
        }

        console.log(logMessage);
        return checkOutcome;
    };

    return {
        incorporateCase: (identifier, ruleSpecs, commencement, termination, anticipatedPeriods, expectedSpan, expectedWeeklyStability) => {
            if (typeof ruleSpecs === 'string') {
                verificationCases.push([identifier, ruleSpecs, commencement, termination, anticipatedPeriods, expectedSpan, expectedWeeklyStability]);
            } else {
                ruleSpecs.forEach(spec =>
                    verificationCases.push([identifier, spec, commencement, termination, anticipatedPeriods, expectedSpan, expectedWeeklyStability])
                );
            }
        },
        initiateValidation: () => {
            const successfulChecks = verificationCases.filter(processIndividualCheck).length;
            console.log(`${successfulChecks}/${verificationCases.length} checks completed successfully`);
            return successfulChecks === verificationCases.length;
        }
    };
})();

const markForExclusion = (item, explanation) => {
    if (typeof explanation === 'undefined') {
        explanation = 'feature not yet implemented';
    }
    return [item, explanation];
};

const validator = periodVerificationSystem;

validator.incorporateCase('Temporal Segments', [
		'10:00-12:00',
		'10:00-11:00,11:00-12:00',
		'10:00-11:00;11:00-12:00',
		'10:00-14:00;12:00-14:00 off',
		'10:00-12:00;10:30-11:30',
	], '2012.10.01 0:00', '2012.10.08 0:00', [
		[ '2012.10.01 10:00', '2012.10.01 12:00' ],
		[ '2012.10.02 10:00', '2012.10.02 12:00' ],
		[ '2012.10.03 10:00', '2012.10.03 12:00' ],
		[ '2012.10.04 10:00', '2012.10.04 12:00' ],
		[ '2012.10.05 10:00', '2012.10.05 12:00' ],
		[ '2012.10.06 10:00', '2012.10.06 12:00' ],
		[ '2012.10.07 10:00', '2012.10.07 12:00' ],
	], 1000 * 60 * 60 * 2 * 7, true);

validator.incorporateCase('Periods Spanning Midnight', [
		'22:00-02:00',
		'22:00-26:00',
	], '2012.10.01 0:00', '2012.10.08 0:00', [
		[ '2012.10.01 00:00', '2012.10.01 02:00' ],
		[ '2012.10.01 22:00', '2012.10.02 02:00' ],
		[ '2012.10.02 22:00', '2012.10.03 02:00' ],
		[ '2012.10.03 22:00', '2012.10.04 02:00' ],
		[ '2012.10.04 22:00', '2012.10.05 02:00' ],
		[ '2012.10.05 22:00', '2012.10.06 02:00' ],
		[ '2012.10.06 22:00', '2012.10.07 02:00' ],
		[ '2012.10.07 22:00', '2012.10.08 00:00' ],
	], 1000 * 60 * 60 * 4 * 7, true);

validator.incorporateCase('Weekdays Specific', [
		'Mo,Th,Sa,Su 10:00-12:00',
		'Mo,Th,Sa-Su 10:00-12:00',
		'Th,Sa-Mo 10:00-12:00',
		'10:00-12:00; Tu-We 00:00-24:00 off; Fr 00:00-24:00 off',
		'10:00-12:00; Tu-We off; Fr off',
	], '2012.10.01 0:00', '2012.10.08 0:00', [
		[ '2012.10.01 10:00', '2012.10.01 12:00' ],
		[ '2012.10.04 10:00', '2012.10.04 12:00' ],
		[ '2012.10.06 10:00', '2012.10.06 12:00' ],
		[ '2012.10.07 10:00', '2012.10.07 12:00' ],
	], 1000 * 60 * 60 * 2 * 4, true);

validator.incorporateCase('Absent Time Designation', [
		'Mo,We',
		'Mo-We; Tu off',
	], '2012.10.01 0:00', '2012.10.08 0:00', [
		[ '2012.10.01 0:00', '2012.10.02 0:00' ],
		[ '2012.10.03 0:00', '2012.10.04 0:00' ],
	], 1000 * 60 * 60 * 24 * 2, true);

validator.incorporateCase('Midnight Spanning Weekday Periods', [
		'We 22:00-02:00',
		'We 22:00-26:00',
	], '2012.10.01 0:00', '2012.10.08 0:00', [
		[ '2012.10.03 22:00', '2012.10.04 02:00' ],
	], 1000 * 60 * 60 * 4, true);

validator.incorporateCase('Complete Coverage', [
		'00:00-24:00',
		'Mo-Su 00:00-24:00',
		'Tu-Mo 00:00-24:00',
		'We-Tu 00:00-24:00',
		'Th-We 00:00-24:00',
		'Fr-Th 00:00-24:00',
		'Sa-Fr 00:00-24:00',
		'Su-Sa 00:00-24:00',
		'24/7',
		'Jan-Dec',
		'Feb-Jan',
		'Jan 01-Dec 31',
		'week 1-54',
	], '2012.10.01 0:00', '2012.10.08 0:00', [
		[ '2012.10.01 0:00', '2012.10.08 0:00' ],
	], 1000 * 60 * 60 * 24 * 7, undefined);

validator.incorporateCase('All Day Alias', [
		'Mo,We 24/7',
	], '2012.10.01 0:00', '2012.10.08 0:00', [
		[ '2012.10.01 0:00', '2012.10.02 0:00' ],
		[ '2012.10.03 0:00', '2012.10.04 0:00' ],
	], 1000 * 60 * 60 * 24 * 2, true);

validator.incorporateCase('Restricted Weekdays', [
		'We[4,5] 10:00-12:00',
		'We[4-5] 10:00-12:00',
		'We[4],We[5] 10:00-12:00',
		'We[4] 10:00-12:00; We[-1] 10:00-12:00',
		'We[-1,-2] 10:00-12:00',
	], '2012.10.01 0:00', '2012.11.01 0:00', [
		[ '2012.10.24 10:00', '2012.10.24 12:00' ],
		[ '2012.10.31 10:00', '2012.10.31 12:00' ],
	], 1000 * 60 * 60 * 2 * 2, false);

validator.incorporateCase('Exclusion Rules', [
		'Mo-Fr 10:00-16:00; We 12:00-18:00'
	], '2012.10.01 0:00', '2012.10.08 0:00', [
		[ '2012.10.01 10:00', '2012.10.01 16:00' ],
		[ '2012.10.02 10:00', '2012.10.02 16:00' ],
		[ '2012.10.03 12:00', '2012.10.03 18:00' ],
		[ '2012.10.04 10:00', '2012.10.04 16:00' ],
		[ '2012.10.05 10:00', '2012.10.05 16:00' ],
	], 1000 * 60 * 60 * 6 * 5, true);

validator.incorporateCase('Month Intervals', [
		'Nov-Feb 00:00-24:00',
		'Jan,Feb,Nov,Dec 00:00-24:00',
		'00:00-24:00; Mar-Oct off',
	], '2012.01.01 0:00', '2013.01.01 0:00', [
		[ '2012.01.01 00:00', '2012.03.01 00:00' ],
		[ '2012.11.01 00:00', '2013.01.01 00:00' ],
	], 1000 * 60 * 60 * 24 * (31 + 29 + 30 + 31), false);

validator.incorporateCase('Week Intervals', [
		'week 1,3 00:00-24:00',
		'week 1-3/2 00:00-24:00',
	], '2012.01.01 0:00', '2013.01.01 0:00', [
		[ '2012.01.01 00:00', '2012.01.02 00:00' ],
		[ '2012.01.09 00:00', '2012.01.16 00:00' ],
	], 1000 * 60 * 60 * 24 * (1 + 7), false);

validator.incorporateCase('Further Week Intervals', [
		'week 2,4 00:00-24:00',
		'week 2-4/2 00:00-24:00',
	], '2012.01.01 0:00', '2013.01.01 0:00', [
		[ '2012.01.02 00:00', '2012.01.09 00:00' ],
		[ '2012.01.16 00:00', '2012.01.23 00:00' ],
	], 1000 * 60 * 60 * 24 * (7 + 7), false);

validator.incorporateCase('Week Range Boundary', [
		'week 2-54 00:00-24:00',
		'week 2-57',
	], '2012.01.01 0:00', '2014.01.01 0:00', [
		[ '2012.01.02 00:00', '2013.01.01 00:00' ],
		[ '2013.01.07 00:00', '2014.01.01 00:00' ],
	], 1000 * 60 * 60 * 24 * 724, false);

validator.incorporateCase('Monthday Intervals', [
		'Jan 23-31 00:00-24:00; Feb 1-12 00:00-24:00',
		'Jan 23-Feb 12 00:00-24:00',
	], '2012.01.01 0:00', '2013.01.01 0:00', [
		[ '2012.01.23 0:00', '2012.02.13 00:00' ],
	], 1000 * 60 * 60 * 24 * 21, false);

validator.incorporateCase('Monthday Intervals Spanning Year', [
		'Dec 31-Jan 01',
	], '2012.01.01 0:00', '2014.01.01 0:00', [
		[ '2012.01.01 0:00', '2012.01.02 00:00' ],
		[ '2012.12.31 0:00', '2013.01.02 00:00' ],
		[ '2013.12.31 0:00', '2014.01.01 00:00' ],
	], 1000 * 60 * 60 * 24 * 4, false);

validator.incorporateCase('Recurring Monthdays', [
		'Jan 01-31/8 00:00-24:00',
	], '2012.01.01 0:00', '2013.01.01 0:00', [
		[ '2012.01.01 0:00', '2012.01.02 00:00' ],
		[ '2012.01.09 0:00', '2012.01.10 00:00' ],
		[ '2012.01.17 0:00', '2012.01.18 00:00' ],
		[ '2012.01.25 0:00', '2012.01.26 00:00' ],
	], 1000 * 60 * 60 * 24 * 4, false);

validator.incorporateCase('Further Recurring Monthdays', [
		'Jan 10-31/7',
	], '2012.01.01 0:00', '2013.01.01 0:00', [
		[ '2012.01.10 0:00', '2012.01.11 00:00' ],
		[ '2012.01.17 0:00', '2012.01.18 00:00' ],
		[ '2012.01.24 0:00', '2012.01.25 00:00' ],
		[ '2012.01.31 0:00', '2012.02.01 00:00' ],
	], 1000 * 60 * 60 * 24 * 4, false);

validator.incorporateCase('Selector Sequence', [
		'Feb week 6',
		'week 6 Feb',
	], '2012.01.01 0:00', '2013.01.01 0:00', [
		[ '2012.02.01 0:00', '2012.02.06 00:00' ],
	], 1000 * 60 * 60 * 24 * 5, false);

validator.incorporateCase('Another Selector Sequence', [
		'Feb week 7',
		'week 7 Feb',
	], '2012.01.01 0:00', '2013.01.01 0:00', [
		[ '2012.02.06 0:00', '2012.02.13 00:00' ],
	], 1000 * 60 * 60 * 24 * 7, false);

validator.incorporateCase('Input Formatting: Case and Whitespace', [
		'   mo,    Tu, wE,   TH    12:00 - 20:00  ; 14:00-16:00    Off  ',
	], '2012.10.01 0:00', '2012.10.08 0:00', [
		[ '2012.10.01 12:00', '2012.10.01 14:00' ],
		[ '2012.10.01 16:00', '2012.10.01 20:00' ],
		[ '2012.10.02 12:00', '2012.10.02 14:00' ],
		[ '2012.10.02 16:00', '2012.10.02 20:00' ],
		[ '2012.10.03 12:00', '2012.10.03 14:00' ],
		[ '2012.10.03 16:00', '2012.10.03 20:00' ],
		[ '2012.10.04 12:00', '2012.10.04 14:00' ],
		[ '2012.10.04 16:00', '2012.10.04 20:00' ],
	], 1000 * 60 * 60 * 6 * 4, true);

validator.incorporateCase('Input Formatting: Dot Time Separator', [
		'10.00-12.00',
		'10.00-11.00,11.00-12.00',
		'10.00-11.00;11.00-12.00',
		'10.00-14.00;12.00-14.00 off',
		'10.00-12.00;10.30-11.30',
	], '2012.10.01 0:00', '2012.10.08 0:00', [
		[ '2012.10.01 10:00', '2012.10.01 12:00' ],
		[ '2012.10.02 10:00', '2012.10.02 12:00' ],
		[ '2012.10.03 10:00', '2012.10.03 12:00' ],
		[ '2012.10.04 10:00', '2012.10.04 12:00' ],
		[ '2012.10.05 10:00', '2012.10.05 12:00' ],
		[ '2012.10.06 10:00', '2012.10.06 12:00' ],
		[ '2012.10.07 10:00', '2012.10.07 12:00' ],
	], 1000 * 60 * 60 * 2 * 7, true);

validator.incorporateCase('Advanced Monthday Ranges', [
		'Jan 23-31,Feb 1-12 00:00-24:00',
		'Jan 23-Feb 11,Feb 12 00:00-24:00',
		markForExclusion('Jan 23-30,31-Feb 1-2,3-12 12 00:00-24:00'),
	], '2012.01.01 0:00', '2013.01.01 0:00', [
		[ '2012.01.23 0:00', '2012.02.13 00:00' ],
	], 1000 * 60 * 60 * 24 * 21, false);

validator.incorporateCase('Missing Time Range Delimiters', [
		'Mo 12:00-14:00 16:00-18:00 20:00-22:00',
	], '2012.10.01 0:00', '2012.10.08 0:00', [
		[ '2012.10.01 12:00', '2012.10.01 14:00' ],
		[ '2012.10.01 16:00', '2012.10.01 18:00' ],
		[ '2012.10.01 20:00', '2012.10.01 22:00' ],
	], 1000 * 60 * 60 * 6, true);

validator.incorporateCase('Combined Selectors: Week & Weekday/Monthday', [
		'week 3 We',
		'week 3 Jan 11-Jan 11',
		'week 3 Jan 11',
	], '2012.01.01 0:00', '2013.01.01 0:00', [
		[ '2012.01.11 0:00', '2012.01.12 00:00' ],
	], 1000 * 60 * 60 * 24, false);

validator.incorporateCase('Combined Selectors: Week & Month / Month & Monthday', [
		'week 3 Jan',
		'Jan-Feb Jan 9-Jan 15',
		'Jan-Feb Jan 9-15',
	], '2012.01.01 0:00', '2013.01.01 0:00', [
		[ '2012.01.09 0:00', '2012.01.16 00:00' ],
	], 1000 * 60 * 60 * 24 * 7, false);

validator.incorporateCase('Combined Selectors: Month & Weekday / Weekday & Monthday', [
		'Jan We',
		'Jan 2-27 We',
		'Dec 30-Jan 27 We',
	], '2012.01.01 0:00', '2013.01.01 0:00', [
		[ '2012.01.04 0:00', '2012.01.05 00:00' ],
		[ '2012.01.11 0:00', '2012.01.12 00:00' ],
		[ '2012.01.18 0:00', '2012.01.19 00:00' ],
		[ '2012.01.25 0:00', '2012.01.26 00:00' ],
	], 1000 * 60 * 60 * 24 * 4, false);

process.exit(validator.initiateValidation() ? 0 : 1);