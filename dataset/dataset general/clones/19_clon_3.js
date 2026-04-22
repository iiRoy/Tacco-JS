const time_parser_module = require('./opening_hours.js'); // Import the core parsing utility.

// --- Helper Functions for Test Suite Operations ---

/**
 * Creates a normalized array of arguments for a validation case.
 * If rule_definitions is a single string, it's wrapped into an array.
 * This ensures consistent processing for single and multiple rules per test label.
 */
const createValidationArguments = (
    case_label,
    rule_definitions,
    start_point,
    end_point,
    expected_periods,
    anticipated_duration,
    expected_weekly_consistency
) => {
    const normalized_rules = Array.isArray(rule_definitions) ? rule_definitions : [rule_definitions];
    return normalized_rules.map(rule_str => [
        case_label,
        rule_str, // Individual rule string
        start_point,
        end_point,
        expected_periods,
        anticipated_duration,
        expected_weekly_consistency
    ]);
};

/**
 * Formats a Date object into a 'YYYY.MM.DD HH:MM' string.
 * Provides a consistent output format for dates in test results.
 */
const serializeDateTime = (input_date_obj) => {
    // Robustly check if the input is a valid Date object.
    if (!(input_date_obj instanceof Date) || isNaN(input_date_obj.getTime())) {
        return 'Invalid Date Object';
    }

    const year = input_date_obj.getFullYear();
    // Months are 0-indexed, so add 1. Use padStart for two digits.
    const month = String(input_date_obj.getMonth() + 1).padStart(2, '0');
    const day = String(input_date_obj.getDate()).padStart(2, '0');
    const hours = String(input_date_obj.getHours()).padStart(2, '0');
    const minutes = String(input_date_obj.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}`;
};

/**
 * Converts an array of [start_date, end_date] period arrays into a human-readable string.
 * Useful for displaying expected vs. actual intervals in failure messages.
 */
const formatPeriodOutput = (period_array) => {
    if (!Array.isArray(period_array) || period_array.length === 0) {
        return '(no periods found)';
    }

    // Map each period tuple to its formatted string representation.
    return period_array.map((period_item) => {
        // Basic validation for each period item structure.
        if (!Array.isArray(period_item) || period_item.length !== 2) {
            return '[ Malformed Period Data ]';
        }
        const start_time = serializeDateTime(new Date(period_item[0]));
        const end_time = serializeDateTime(new Date(period_item[1]));
        return `[ ${start_time} - ${end_time} ]`;
    }).join('\n'); // Join with newlines for better readability.
};

// Console output color codes for enhanced readability of test results.
const colorizeOutput = (text, color_code) => `\x1b[${color_code}m${text}\x1b[0m`;
const GREEN_COLOR = '1;32';   // Bold Green
const YELLOW_COLOR = '1;33';  // Bold Yellow
const RED_COLOR = '1;31';     // Bold Red
const MAGENTA_COLOR = '1;35'; // Bold Magenta

/**
 * Marks a test case as skipped, providing a reason.
 * This allows certain known-failing or unimplemented tests to be excluded from failure counts.
 */
const markAsSkipped = (rule_value, skip_reason = 'feature not yet implemented or known issue') => {
    return [rule_value, skip_reason]; // Return an array indicating it's skipped.
};

// --- Main Validation Suite Class ---

/**
 * The `rule_validation_suite` class orchestrates the execution of various
 * test cases against the `time_parser_module`. It manages test registration,
 * execution, and result reporting.
 */
class rule_validation_suite {
    constructor() {
        this.validation_cases = []; // Stores all registered test definitions.
        this.registered_count = 0;  // Counter for total registered individual test rules.
    }

    /**
     * Registers one or more validation scenarios.
     * @param {string} case_label - A descriptive name for the test group.
     * @param {string|string[]} rule_definitions - The opening hours rule string(s) to test.
     * @param {string} start_point - The start date string for interval calculation.
     * @param {string} end_point - The end date string for interval calculation.
     * @param {Array<Array<string>>} expected_periods - Expected open intervals as an array of [start_string, end_string] tuples.
     * @param {number|undefined} anticipated_duration - Expected total open duration in milliseconds.
     * @param {boolean|undefined} expected_weekly_consistency - Expected value for `isWeekStable()`.
     */
    registerValidation(
        case_label,
        rule_definitions,
        start_point,
        end_point,
        expected_periods,
        anticipated_duration,
        expected_weekly_consistency
    ) {
        // Basic input validation for critical parameters.
        if (typeof case_label !== 'string' || typeof start_point !== 'string' || typeof end_point !== 'string') {
            console.error(colorizeOutput(`Error: Invalid input types for registering validation '${case_label}'. Skipping registration.`, RED_COLOR));
            return;
        }

        // Use the helper to standardize the test argument structure.
        const cases_to_add = createValidationArguments(
            case_label,
            rule_definitions,
            start_point,
            end_point,
            expected_periods,
            anticipated_duration,
            expected_weekly_consistency
        );

        this.validation_cases.push(...cases_to_add); // Add cases to the suite.
        this.registered_count += cases_to_add.length;
        // Optional: console.log(`Registered ${cases_to_add.length} validation(s) for '${case_label}'. Total: ${this.registered_count}`);
    }

    /**
     * Executes a single validation test case.
     * @returns {boolean} True if the validation passed or was intentionally skipped, false otherwise.
     */
    performIndividualValidation(
        case_label,
        rule_string_initial, // Renamed to distinguish from potentially modified rule_string
        start_point,
        end_point,
        expected_periods,
        anticipated_duration,
        expected_weekly_consistency
    ) {
        let is_skipped = false;
        let skip_reason = '';
        let rule_string = rule_string_initial; // Use a mutable variable for the rule string.

        // Check if the rule was marked as skipped using `markAsSkipped`.
        if (Array.isArray(rule_string_initial) && rule_string_initial.length === 2) {
            is_skipped = true;
            skip_reason = rule_string_initial[1];
            rule_string = rule_string_initial[0]; // Extract the actual rule string.
        }

        let parser_object;
        let calculated_periods;
        let actual_duration;
        let weekly_consistent_flag;
        let execution_error = null;
        let validation_passed = false;

        const validation_start_date = new Date(start_point);
        const validation_end_date = new Date(end_point);

        // Guard clause: Ensure date objects are valid before proceeding.
        if (isNaN(validation_start_date.getTime()) || isNaN(validation_end_date.getTime())) {
            execution_error = new Error('Invalid start or end date strings provided for validation range.');
        } else {
            try {
                // Instantiate the opening hours parser with the rule string.
                parser_object = new time_parser_module(rule_string);

                // Perform calculations using the parser.
                calculated_periods = parser_object.getOpenIntervals(validation_start_date, validation_end_date);
                actual_duration = parser_object.getOpenDuration(validation_start_date, validation_end_date);
                weekly_consistent_flag = parser_object.isWeekStable();

                // 1. Compare calculated open periods with expected periods.
                let periods_match = (expected_periods === undefined) ||
                                    (calculated_periods.length === expected_periods.length &&
                                     calculated_periods.every((calc_period, idx) => {
                                         const exp_period = expected_periods[idx];
                                         // Compare timestamps for exact match.
                                         return new Date(calc_period[0]).getTime() === new Date(exp_period[0]).getTime() &&
                                                new Date(calc_period[1]).getTime() === new Date(exp_period[1]).getTime();
                                     }));

                // 2. Compare actual total duration with anticipated duration.
                let duration_matches = (anticipated_duration === undefined) || (actual_duration === anticipated_duration);

                // 3. Compare weekly consistency flag.
                let consistency_matches = (expected_weekly_consistency === undefined) || (weekly_consistent_flag === expected_weekly_consistency);

                validation_passed = periods_match && duration_matches && consistency_matches;

                // Add a detailed debug log for non-skipped failures.
                if (!validation_passed && !is_skipped) {
                    console.log(colorizeOutput(`  DEBUG INFO for FAILED test: "${rule_string}"`, YELLOW_COLOR));
                    if (!periods_match) {
                        console.log(colorizeOutput(`    Period mismatch:`, YELLOW_COLOR));
                        console.log(colorizeOutput(`      Calculated: \n${formatPeriodOutput(calculated_periods)}`, YELLOW_COLOR));
                        console.log(colorizeOutput(`      Expected:   \n${formatPeriodOutput(expected_periods)}`, YELLOW_COLOR));
                    }
                    if (!duration_matches) {
                        console.log(colorizeOutput(`    Duration mismatch: Actual ${actual_duration}ms, Expected ${anticipated_duration}ms`, YELLOW_COLOR));
                    }
                    if (!consistency_matches) {
                        console.log(colorizeOutput(`    Weekly consistency flag mismatch: Actual ${weekly_consistent_flag}, Expected ${expected_weekly_consistency}`, YELLOW_COLOR));
                    }
                }

            } catch (error_object) {
                // Catch any errors during parser instantiation or method calls.
                execution_error = error_object;
            }
        }

        // Construct the output message based on validation results.
        let output_message = `Validation "${case_label}" for rule "${rule_string}": `;
        if (validation_passed) {
            output_message += colorizeOutput('PASSED', GREEN_COLOR);
        } else if (is_skipped) {
            output_message += colorizeOutput(`SKIPPED`, YELLOW_COLOR) + `, reason: ${skip_reason}`;
            validation_passed = true; // Mark skipped tests as 'passed' for overall suite result.
        } else if (execution_error) {
            output_message += colorizeOutput('CRASHED', MAGENTA_COLOR) + `, reason: ${execution_error.message || String(execution_error)}`;
        } else {
            output_message += colorizeOutput('FAILED', RED_COLOR);
            if (!duration_matches) {
                output_message += `, duration is incorrect (actual: ${actual_duration}, expected: ${anticipated_duration})`;
            }
            if (!periods_match) {
                output_message += `,\n  periods are incorrect. Refer to DEBUG INFO above.`;
            }
            if (!consistency_matches) {
                output_message += `, weekly consistency flag is incorrect (actual: ${weekly_consistent_flag}, expected: ${expected_weekly_consistency})`;
            }
        }

        console.log(output_message);
        return validation_passed;
    }

    /**
     * Executes all registered validation cases and prints a summary.
     * @returns {boolean} True if all validations (including skipped ones) passed, false otherwise.
     */
    executeAllValidations() {
        let successful_validations = 0;
        let failed_validations = 0; // Tracks actual failures, excluding skips.

        console.log(colorizeOutput('\n--- Initiating All Validation Tests ---', YELLOW_COLOR));
        console.log(`Total individual validation rules registered: ${this.validation_cases.length}\n`);

        // Iterate through each validation case using a modern for...of loop.
        for (const [
            case_label,
            rule_string,
            start_point,
            end_point,
            expected_periods,
            anticipated_duration,
            expected_weekly_consistency
        ] of this.validation_cases) {
            const current_case_result = this.performIndividualValidation(
                case_label,
                rule_string,
                start_point,
                end_point,
                expected_periods,
                anticipated_duration,
                expected_weekly_consistency
            );

            if (current_case_result) {
                successful_validations++;
            } else {
                failed_validations++;
            }
        }

        console.log(colorizeOutput('\n--- Validation Summary Report ---', YELLOW_COLOR));
        console.log(`Total validations processed: ${this.validation_cases.length}`);
        console.log(`Successful validations: ${successful_validations}`);
        if (failed_validations > 0) {
            console.log(colorizeOutput(`Failed validations: ${failed_validations}`, RED_COLOR));
        } else {
            console.log(colorizeOutput('All validations completed successfully!', GREEN_COLOR));
        }

        // Return true if there were no actual failures (skipped tests are considered successful for this count).
        return failed_validations === 0;
    }
}

// --- Test Case Definitions ---

// Instantiate the validation suite.
const validator_instance = new rule_validation_suite();

// Register various test cases for different time interval scenarios.
validator_instance.registerValidation('Time Intervals Basic', [
    '10:00-12:00',
    '10:00-11:00,11:00-12:00',
    '10:00-11:00;11:00-12:00',
    '10:00-14:00;12:00-14:00 off',
    '10:00-12:00;10:30-11:30',
], '2012.10.01 0:00', '2012.10.08 0:00', [
    ['2012.10.01 10:00', '2012.10.01 12:00'],
    ['2012.10.02 10:00', '2012.10.02 12:00'],
    ['2012.10.03 10:00', '2012.10.03 12:00'],
    ['2012.10.04 10:00', '2012.10.04 12:00'],
    ['2012.10.05 10:00', '2012.10.05 12:00'],
    ['2012.10.06 10:00', '2012.10.06 12:00'],
    ['2012.10.07 10:00', '2012.10.07 12:00'],
], 1000 * 60 * 60 * 2 * 7, true);

validator_instance.registerValidation('Midnight Spanning Ranges', [
    '22:00-02:00',
    '22:00-26:00', // 26:00 is equivalent to 02:00 the next day.
], '2012.10.01 0:00', '2012.10.08 0:00', [
    ['2012.10.01 00:00', '2012.10.01 02:00'], // Covers the initial 00:00-02:00 of the first day
    ['2012.10.01 22:00', '2012.10.02 02:00'],
    ['2012.10.02 22:00', '2012.10.03 02:00'],
    ['2012.10.03 22:00', '2012.10.04 02:00'],
    ['2012.10.04 22:00', '2012.10.05 02:00'],
    ['2012.10.05 22:00', '2012.10.06 02:00'],
    ['2012.10.06 22:00', '2012.10.07 02:00'],
    ['2012.10.07 22:00', '2012.10.08 00:00'], // Ends at 00:00 of the last day.
], 1000 * 60 * 60 * 4 * 7, true); // (4 hours per day) * 7 days.

validator_instance.registerValidation('Weekday Specifics', [
    'Mo,Th,Sa,Su 10:00-12:00',
    'Mo,Th,Sa-Su 10:00-12:00',
    'Th,Sa-Mo 10:00-12:00',
    '10:00-12:00; Tu-We 00:00-24:00 off; Fr 00:00-24:00 off',
    '10:00-12:00; Tu-We off; Fr off',
], '2012.10.01 0:00', '2012.10.08 0:00', [
    ['2012.10.01 10:00', '2012.10.01 12:00'], // Monday
    ['2012.10.04 10:00', '2012.10.04 12:00'], // Thursday
    ['2012.10.06 10:00', '2012.10.06 12:00'], // Saturday
    ['2012.10.07 10:00', '2012.10.07 12:00'], // Sunday
], 1000 * 60 * 60 * 2 * 4, true); // (2 hours per day) * 4 days.

validator_instance.registerValidation('Omitted Time Defaults', [
    'Mo,We', // Defaults to 00:00-24:00 if time is omitted.
    'Mo-We; Tu off',
], '2012.10.01 0:00', '2012.10.08 0:00', [
    ['2012.10.01 0:00', '2012.10.02 0:00'], // Monday (00:00-24:00)
    ['2012.10.03 0:00', '2012.10.04 0:00'], // Wednesday (00:00-24:00)
], 1000 * 60 * 60 * 24 * 2, true); // (24 hours per day) * 2 days.

validator_instance.registerValidation('Midnight Ranges with Weekdays', [
    'We 22:00-02:00',
    'We 22:00-26:00',
], '2012.10.01 0:00', '2012.10.08 0:00', [
    ['2012.10.03 22:00', '2012.10.04 02:00'], // Wednesday 22:00 to Thursday 02:00
], 1000 * 60 * 60 * 4, true); // 4 hours total.

validator_instance.registerValidation('Full Coverage Rules', [
    '00:00-24:00',
    'Mo-Su 00:00-24:00',
    'Tu-Mo 00:00-24:00', // Spans across week boundaries, effectively full week.
    'We-Tu 00:00-24:00',
    'Th-We 00:00-24:00',
    'Fr-Th 00:00-24:00',
    'Sa-Fr 00:00-24:00',
    'Su-Sa 00:00-24:00',
    '24/7',
    'Jan-Dec',         // Year-round.
    'Feb-Jan',         // Year-round, crossing year end.
    'Jan 01-Dec 31',   // Year-round.
    'week 1-54',       // Covers all weeks in a year (52/53/54 depends on year).
], '2012.10.01 0:00', '2012.10.08 0:00', [
    ['2012.10.01 0:00', '2012.10.08 0:00'], // Full 7 days.
], 1000 * 60 * 60 * 24 * 7, undefined); // Duration is 7 days, weekly consistency is undefined.

validator_instance.registerValidation('TwentyFourSeven Alias', [
    'Mo,We 24/7', // "24/7" acts as an alias for 00:00-24:00.
], '2012.10.01 0:00', '2012.10.08 0:00', [
    ['2012.10.01 0:00', '2012.10.02 0:00'], // Monday
    ['2012.10.03 0:00', '2012.10.04 0:00'], // Wednesday
], 1000 * 60 * 60 * 24 * 2, true); // (24 hours per day) * 2 days.

validator_instance.registerValidation('Constrained Weekdays', [
    'We[4,5] 10:00-12:00', // 4th and 5th Wednesday of the month.
    'We[4-5] 10:00-12:00',
    'We[4],We[5] 10:00-12:00',
    'We[4] 10:00-12:00; We[-1] 10:00-12:00', // 4th Wednesday and last Wednesday.
    'We[-1,-2] 10:00-12:00', // Last and second-to-last Wednesday.
], '2012.10.01 0:00', '2012.11.01 0:00', [
    ['2012.10.24 10:00', '2012.10.24 12:00'], // 4th Wednesday of Oct 2012.
    ['2012.10.31 10:00', '2012.10.31 12:00'], // 5th (and last) Wednesday of Oct 2012.
], 1000 * 60 * 60 * 2 * 2, false); // (2 hours per day) * 2 days. Not weekly consistent.

validator_instance.registerValidation('Exception Rules', [
    'Mo-Fr 10:00-16:00; We 12:00-18:00' // Wednesday rule overrides general Mo-Fr rule.
], '2012.10.01 0:00', '2012.10.08 0:00', [
    ['2012.10.01 10:00', '2012.10.01 16:00'], // Monday
    ['2012.10.02 10:00', '2012.10.02 16:00'], // Tuesday
    ['2012.10.03 12:00', '2012.10.03 18:00'], // Wednesday (overridden)
    ['2012.10.04 10:00', '2012.10.04 16:00'], // Thursday
    ['2012.10.05 10:00', '2012.10.05 16:00'], // Friday
], 1000 * 60 * 60 * 6 * 5, true); // (6 hours per day) * 5 days.

validator_instance.registerValidation('Month Ranges', [
    'Nov-Feb 00:00-24:00',
    'Jan,Feb,Nov,Dec 00:00-24:00',
    '00:00-24:00; Mar-Oct off',
], '2012.01.01 0:00', '2013.01.01 0:00', [
    ['2012.01.01 00:00', '2012.03.01 00:00'], // Jan & Feb (2012 is a leap year, so Feb has 29 days).
    ['2012.11.01 00:00', '2013.01.01 00:00'], // Nov & Dec.
], 1000 * 60 * 60 * 24 * (31 + 29 + 30 + 31), false); // Total days: Jan(31) + Feb(29) + Nov(30) + Dec(31) = 121 days.

validator_instance.registerValidation('Week Ranges Set 1', [
    'week 1,3 00:00-24:00',
    'week 1-3/2 00:00-24:00', // Every second week from week 1 to 3, i.e., week 1 and week 3.
], '2012.01.01 0:00', '2013.01.01 0:00', [
    ['2012.01.01 00:00', '2012.01.02 00:00'], // Week 1 (ISO 8601) starts Dec 26, 2011. Jan 1, 2012 is the last day of Week 1. So 1 day.
    ['2012.01.09 00:00', '2012.01.16 00:00'], // Week 3 (ISO 8601) starts Jan 9, 2012. So 7 days.
], 1000 * 60 * 60 * 24 * (1 + 7), false);

validator_instance.registerValidation('Week Ranges Set 2', [
    'week 2,4 00:00-24:00',
    'week 2-4/2 00:00-24:00', // Every second week from week 2 to 4, i.e., week 2 and week 4.
], '2012.01.01 0:00', '2013.01.01 0:00', [
    ['2012.01.02 00:00', '2012.01.09 00:00'], // Week 2 (ISO 8601) starts Jan 2, 2012. So 7 days.
    ['2012.01.16 00:00', '2012.01.23 00:00'], // Week 4 (ISO 8601) starts Jan 16, 2012. So 7 days.
], 1000 * 60 * 60 * 24 * (7 + 7), false);

validator_instance.registerValidation('Week Range Limits', [
    'week 2-54 00:00-24:00', // Covers week 2 to end of year (52/53/54).
    'week 2-57',             // Should effectively be same as 2-54, as 57 is out of range.
], '2012.01.01 0:00', '2014.01.01 0:00', [
    ['2012.01.02 00:00', '2013.01.01 00:00'], // From start of week 2, 2012 to end of 2012. (365 days)
    ['2013.01.07 00:00', '2014.01.01 00:00'], // From start of week 2, 2013 to end of 2013. (359 days)
], 1000 * 60 * 60 * 24 * 724, false); // Total duration: 365 + 359 = 724 days.

validator_instance.registerValidation('Monthday Ranges', [
    'Jan 23-31 00:00-24:00; Feb 1-12 00:00-24:00',
    'Jan 23-Feb 12 00:00-24:00',
], '2012.01.01 0:00', '2013.01.01 0:00', [
    ['2012.01.23 0:00', '2012.02.13 00:00'], // Jan 23rd to Feb 12th (inclusive).
], 1000 * 60 * 60 * 24 * 21, false); // (31-23+1) days in Jan + 12 days in Feb = 9 + 12 = 21 days.

validator_instance.registerValidation('Monthday Ranges Spanning Year Boundary', [
    'Dec 31-Jan 01', // Should cover Dec 31st of the current year and Jan 1st of the next.
], '2012.01.01 0:00', '2014.01.01 0:00', [
    ['2012.01.01 0:00', '2012.01.02 00:00'], // Jan 1st, 2012
    ['2012.12.31 0:00', '2013.01.02 00:00'], // Dec 31st, 2012 and Jan 1st, 2013 (2 days)
    ['2013.12.31 0:00', '2014.01.01 00:00'], // Dec 31st, 2013
], 1000 * 60 * 60 * 24 * 4, false); // Total duration: 1 + 2 + 1 = 4 days.

validator_instance.registerValidation('Periodical Monthdays Set 1', [
    'Jan 01-31/8 00:00-24:00', // Every 8th day starting from Jan 1st within Jan.
], '2012.01.01 0:00', '2013.01.01 0:00', [
    ['2012.01.01 0:00', '2012.01.02 00:00'],
    ['2012.01.09 0:00', '2012.01.10 00:00'],
    ['2012.01.17 0:00', '2012.01.18 00:00'],
    ['2012.01.25 0:00', '2012.01.26 00:00'],
], 1000 * 60 * 60 * 24 * 4, false); // 4 individual days.

validator_instance.registerValidation('Periodical Monthdays Set 2', [
    'Jan 10-31/7', // Every 7th day starting from Jan 10th within Jan.
], '2012.01.01 0:00', '2013.01.01 0:00', [
    ['2012.01.10 0:00', '2012.01.11 00:00'],
    ['2012.01.17 0:00', '2012.01.18 00:00'],
    ['2012.01.24 0:00', '2012.01.25 00:00'],
    ['2012.01.31 0:00', '2012.02.01 00:00'],
], 1000 * 60 * 60 * 24 * 4, false); // 4 individual days.

validator_instance.registerValidation('Selector Order (Week/Month)', [ // Order of selectors should not matter.
    'Feb week 6',
    'week 6 Feb',
], '2012.01.01 0:00', '2013.01.01 0:00', [
    ['2012.02.01 0:00', '2012.02.06 00:00'], // This expected output seems to be Jan 31st to Feb 6th. (6 days)
                                            // The interval length is 5 days, indicating Feb 1st 0:00 to Feb 6th 0:00.
                                            // ISO week 6 of 2012 starts on Feb 6th. The original test data has a mismatch.
                                            // We maintain the original expected output for clone fidelity.
], 1000 * 60 * 60 * 24 * 5, false);

validator_instance.registerValidation('Selector Order (Week/Month - Another Example)', [
    'Feb week 7',
    'week 7 Feb',
], '2012.01.01 0:00', '2013.01.01 0:00', [
    ['2012.02.06 0:00', '2012.02.13 00:00'], // This expected output means Feb 6th to Feb 13th.
                                            // ISO week 7 of 2012 starts on Feb 13th. Again, a discrepancy in original test.
                                            // clone maintains original expectations.
], 1000 * 60 * 60 * 24 * 7, false);

validator_instance.registerValidation('Input Tolerance: Case and Whitespace', [
    '   mo,    Tu, wE,   TH    12:00 - 20:00  ; 14:00-16:00    Off  ',
], '2012.10.01 0:00', '2012.10.08 0:00', [
    ['2012.10.01 12:00', '2012.10.01 14:00'],
    ['2012.10.01 16:00', '2012.10.01 20:00'],
    ['2012.10.02 12:00', '2012.10.02 14:00'],
    ['2012.10.02 16:00', '2012.10.02 20:00'],
    ['2012.10.03 12:00', '2012.10.03 14:00'],
    ['2012.10.03 16:00', '2012.10.03 20:00'],
    ['2012.10.04 12:00', '2012.10.04 14:00'],
    ['2012.10.04 16:00', '2012.10.04 20:00'],
], 1000 * 60 * 60 * 6 * 4, true); // (6 hours per day) * 4 days (Mo, Tu, We, Th).

validator_instance.registerValidation('Input Tolerance: Dot as Time Separator', [
    '10.00-12.00',
    '10.00-11.00,11.00-12.00',
    '10.00-11.00;11.00-12.00',
    '10.00-14.00;12.00-14.00 off',
    '10.00-12.00;10.30-11.30',
], '2012.10.01 0:00', '2012.10.08 0:00', [
    ['2012.10.01 10:00', '2012.10.01 12:00'],
    ['2012.10.02 10:00', '2012.10.02 12:00'],
    ['2012.10.03 10:00', '2012.10.03 12:00'],
    ['2012.10.04 10:00', '2012.10.04 12:00'],
    ['2012.10.05 10:00', '2012.10.05 12:00'],
    ['2012.10.06 10:00', '2012.10.06 12:00'],
    ['2012.10.07 10:00', '2012.10.07 12:00'],
], 1000 * 60 * 60 * 2 * 7, true); // (2 hours per day) * 7 days.

validator_instance.registerValidation('Extensions: Complex Monthday Ranges', [
    'Jan 23-31,Feb 1-12 00:00-24:00',
    'Jan 23-Feb 11,Feb 12 00:00-24:00',
    markAsSkipped('Jan 23-30,31-Feb 1-2,3-12 12 00:00-24:00', 'Complex nested ranges might not be fully supported yet'),
], '2012.01.01 0:00', '2013.01.01 0:00', [
    ['2012.01.23 0:00', '2012.02.13 00:00'],
], 1000 * 60 * 60 * 24 * 21, false);

validator_instance.registerValidation('Extensions: Missing Time Range Separators', [
    'Mo 12:00-14:00 16:00-18:00 20:00-22:00', // Assumes comma separation.
], '2012.10.01 0:00', '2012.10.08 0:00', [
    ['2012.10.01 12:00', '2012.10.01 14:00'],
    ['2012.10.01 16:00', '2012.10.01 18:00'],
    ['2012.10.01 20:00', '2012.10.01 22:00'],
], 1000 * 60 * 60 * 6, true); // 2+2+2 = 6 hours.

validator_instance.registerValidation('Selector Combination: Week and Day/Monthday', [
    'week 3 We',           // Week 3 and Wednesday.
    'week 3 Jan 11-Jan 11', // Week 3 and Jan 11 (which is Wednesday in week 3).
    'week 3 Jan 11',
], '2012.01.01 0:00', '2013.01.01 0:00', [
    ['2012.01.11 0:00', '2012.01.12 00:00'], // Jan 11, 2012 was a Wednesday, falling in week 3.
], 1000 * 60 * 60 * 24, false); // 1 day.

validator_instance.registerValidation('Selector Combination: Week and Month/Monthday Range', [
    'week 3 Jan',             // Week 3 within January.
    'Jan-Feb Jan 9-Jan 15',   // Jan 9-15 within Jan-Feb.
    'Jan-Feb Jan 9-15',
], '2012.01.01 0:00', '2013.01.01 0:00', [
    ['2012.01.09 0:00', '2012.01.16 00:00'], // Jan 9-15, 2012.
], 1000 * 60 * 60 * 24 * 7, false); // 7 days.

validator_instance.registerValidation('Selector Combination: Month and Weekday/Monthday', [
    'Jan We',             // All Wednesdays in January.
    'Jan 2-27 We',        // Wednesdays between Jan 2nd and 27th.
    'Dec 30-Jan 27 We',   // Wednesdays between Dec 30th (previous year) and Jan 27th.
], '2012.01.01 0:00', '2013.01.01 0:00', [
    ['2012.01.04 0:00', '2012.01.05 00:00'], // 1st Wednesday of Jan 2012.
    ['2012.01.11 0:00', '2012.01.12 00:00'], // 2nd Wednesday.
    ['2012.01.18 0:00', '2012.01.19 00:00'], // 3rd Wednesday.
    ['2012.01.25 0:00', '2012.01.26 00:00'], // 4th Wednesday.
], 1000 * 60 * 60 * 24 * 4, false); // 4 individual days.

// --- Execution and Exit ---

// Execute all registered validations and determine the process exit code.
const all_validations_successful = validator_instance.executeAllValidations();
process.exit(all_validations_successful ? 0 : 1); // Exit with 0 for success, 1 for failure.